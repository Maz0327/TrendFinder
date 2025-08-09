import { supabase } from '@shared/supabase-client';
import type { Database } from '@shared/database.types';

type Capture = Database['public']['Tables']['captures']['Row'];
type CulturalMoment = Database['public']['Tables']['cultural_moments']['Row'];
type DSDBrief = Database['public']['Tables']['dsd_briefs']['Row'];

export class SupabaseRealtimeService {
  private channels: Map<string, any> = new Map();

  // Subscribe to capture updates
  subscribeToCaptureUpdates(
    onInsert?: (capture: Capture) => void,
    onUpdate?: (capture: Capture) => void,
    onDelete?: (id: string) => void
  ) {
    const channel = supabase
      .channel('captures-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'captures' },
        (payload) => {
          if (onInsert) onInsert(payload.new as Capture);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'captures' },
        (payload) => {
          if (onUpdate) onUpdate(payload.new as Capture);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'captures' },
        (payload) => {
          if (onDelete) onDelete(payload.old.id);
        }
      )
      .subscribe();

    this.channels.set('captures', channel);
    return channel;
  }

  // Subscribe to cultural moments for viral detection
  subscribeToCulturalMoments(
    onViralAlert: (moment: CulturalMoment) => void
  ) {
    const channel = supabase
      .channel('cultural-moments-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cultural_moments',
          filter: 'intensity=gte.8.0', // High intensity moments only
        },
        (payload) => {
          onViralAlert(payload.new as CulturalMoment);
        }
      )
      .subscribe();

    this.channels.set('cultural-moments', channel);
    return channel;
  }

  // Subscribe to DSD brief updates
  subscribeToBriefUpdates(
    userId: string,
    onBriefUpdate: (brief: DSDBrief) => void
  ) {
    const channel = supabase
      .channel(`briefs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dsd_briefs',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onBriefUpdate(payload.new as DSDBrief);
        }
      )
      .subscribe();

    this.channels.set(`briefs-${userId}`, channel);
    return channel;
  }

  // Collaborative presence for team features
  subscribeToPresence(
    room: string,
    userId: string,
    userInfo: any,
    onSync: (users: any[]) => void
  ) {
    const channel = supabase.channel(room, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        onSync(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(userInfo);
        }
      });

    this.channels.set(`presence-${room}`, channel);
    return channel;
  }

  // Broadcast custom events (for real-time notifications)
  broadcastEvent(
    channel: string,
    event: string,
    payload: any
  ) {
    return supabase.channel(channel).send({
      type: 'broadcast',
      event,
      payload,
    });
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

// Export singleton instance
export const realtimeService = new SupabaseRealtimeService();