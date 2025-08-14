import { useCallback, useEffect, useRef } from 'react';
import { updateBrief } from '@/services/briefs';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  briefId: string;
  blocks: any;
  notes?: string;
  delay?: number; // milliseconds
  enabled?: boolean;
}

interface DraftData {
  briefId: string;
  blocks: any;
  notes?: string;
  timestamp: number;
}

// Local draft storage utilities
export const draftStorage = {
  save: (briefId: string, data: Omit<DraftData, 'briefId' | 'timestamp'>) => {
    const draft: DraftData = {
      briefId,
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(`brief-draft:${briefId}`, JSON.stringify(draft));
  },
  
  load: (briefId: string): DraftData | null => {
    try {
      const stored = localStorage.getItem(`brief-draft:${briefId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  
  clear: (briefId: string) => {
    localStorage.removeItem(`brief-draft:${briefId}`);
  },
  
  hasNewer: (briefId: string, serverTimestamp: string | Date): boolean => {
    const draft = draftStorage.load(briefId);
    if (!draft) return false;
    
    const serverTime = new Date(serverTimestamp).getTime();
    return draft.timestamp > serverTime;
  }
};

// Debounced autosave hook
export function useDebouncedAutoSave({
  briefId,
  blocks,
  notes,
  delay = 1200,
  enabled = true
}: AutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');
  const savingRef = useRef(false);
  
  // Generate a hash of current content for change detection
  const contentHash = JSON.stringify({ blocks, notes });
  
  const performSave = useCallback(async () => {
    if (!enabled || !briefId || savingRef.current) return;
    
    // Skip if content hasn't changed
    if (contentHash === lastSavedRef.current) return;
    
    savingRef.current = true;
    
    try {
      await updateBrief(briefId, {
        define_section: blocks?.define || {},
        shift_section: blocks?.shift || {},
        deliver_section: blocks?.deliver || {}
      });
      
      lastSavedRef.current = contentHash;
      
      // Clear local draft after successful save
      draftStorage.clear(briefId);
      
      // Show subtle success toast
      toast({
        description: "Changes saved",
        duration: 2000,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Autosave failed:', error);
      
      // Save to local storage as backup
      draftStorage.save(briefId, { blocks, notes });
      
      toast({
        title: "Save failed",
        description: "Changes saved locally. Will retry automatically.",
        variant: "destructive"
      });
    } finally {
      savingRef.current = false;
    }
  }, [briefId, blocks, notes, contentHash, enabled, toast]);
  
  // Debounced save effect
  useEffect(() => {
    if (!enabled || !briefId) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Save to local storage immediately (throttled)
    draftStorage.save(briefId, { blocks, notes });
    
    // Set up debounced server save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [briefId, blocks, notes, delay, enabled, performSave]);
  
  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return performSave();
  }, [performSave]);
  
  return {
    saveNow,
    isSaving: savingRef.current
  };
}

// Draft restoration hook
export function useDraftRestore(briefId: string, serverTimestamp?: string | Date) {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!briefId || !serverTimestamp) return;
    
    const draft = draftStorage.load(briefId);
    if (!draft) return;
    
    const hasNewerDraft = draftStorage.hasNewer(briefId, serverTimestamp);
    
    if (hasNewerDraft) {
      // Show draft notification and trigger events for UI to handle
      toast({
        title: "Local draft found",
        description: "Check browser console for draft restoration options",
        duration: 10000
      });
      
      // Log draft info for debugging
      console.log("Local draft available:", { briefId, draft });
      
      // Trigger custom event for components to listen to
      window.dispatchEvent(new CustomEvent('draftAvailable', { 
        detail: { briefId, draft } 
      }));
    }
  }, [briefId, serverTimestamp, toast]);
}