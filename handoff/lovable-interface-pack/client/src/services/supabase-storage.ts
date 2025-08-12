import { supabase } from '@shared/supabase-client';

export class SupabaseStorageService {
  private buckets = {
    captures: 'captures',
    briefs: 'briefs',
    avatars: 'avatars',
    exports: 'exports',
  };

  // Initialize storage buckets (run once on setup)
  async initializeBuckets() {
    try {
      for (const [key, bucketName] of Object.entries(this.buckets)) {
        const { data: bucket } = await supabase.storage.getBucket(bucketName);
        
        if (!bucket) {
          await supabase.storage.createBucket(bucketName, {
            public: key === 'avatars', // Only avatars are public
            fileSizeLimit: key === 'captures' ? 10485760 : 52428800, // 10MB for captures, 50MB for others
            allowedMimeTypes: this.getAllowedMimeTypes(key),
          });
        }
      }
    } catch (error) {
      console.error('Error initializing storage buckets:', error);
    }
  }

  private getAllowedMimeTypes(bucketKey: string): string[] | undefined {
    switch (bucketKey) {
      case 'captures':
        return ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      case 'briefs':
        return ['application/pdf', 'application/vnd.google-apps.presentation', 'text/markdown'];
      case 'avatars':
        return ['image/jpeg', 'image/png', 'image/webp'];
      case 'exports':
        return undefined; // Allow all types for exports
      default:
        return undefined;
    }
  }

  // Upload capture media (screenshots, videos from Chrome extension)
  async uploadCaptureMedia(
    file: File,
    captureId: string,
    userId: string
  ): Promise<{ url: string; path: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${captureId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.buckets.captures)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(this.buckets.captures)
        .getPublicUrl(data.path);

      return { url: publicUrl, path: data.path };
    } catch (error) {
      console.error('Error uploading capture media:', error);
      return null;
    }
  }

  // Upload DSD brief document
  async uploadBriefDocument(
    file: File,
    briefId: string,
    userId: string
  ): Promise<{ url: string; path: string } | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${briefId}/brief_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.buckets.briefs)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Allow overwriting briefs
        });

      if (error) throw error;

      // Generate signed URL for private brief access
      const { data: signedUrl } = await supabase.storage
        .from(this.buckets.briefs)
        .createSignedUrl(data.path, 3600); // 1 hour expiry

      return { url: signedUrl?.signedUrl || '', path: data.path };
    } catch (error) {
      console.error('Error uploading brief document:', error);
      return null;
    }
  }

  // Upload user avatar
  async uploadUserAvatar(
    file: File,
    userId: string
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.buckets.avatars)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Replace existing avatar
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(this.buckets.avatars)
        .getPublicUrl(data.path);

      // Update user profile with avatar URL
      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  }

  // Generate thumbnail for media
  async generateThumbnail(
    bucketName: string,
    filePath: string,
    width: number = 200,
    height: number = 200
  ): Promise<string> {
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath, {
        transform: {
          width,
          height,
          resize: 'cover',
          quality: 80,
        },
      });

    return publicUrl;
  }

  // Batch upload for Chrome extension captures
  async batchUploadCaptures(
    files: File[],
    captureId: string,
    userId: string
  ): Promise<Array<{ url: string; path: string; thumbnail: string }>> {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const result = await this.uploadCaptureMedia(file, captureId, userId);
        if (result) {
          const thumbnail = await this.generateThumbnail(
            this.buckets.captures,
            result.path,
            300,
            200
          );
          return { ...result, thumbnail };
        }
        return null;
      })
    );

    return uploads.filter((u): u is { url: string; path: string; thumbnail: string } => u !== null);
  }

  // Delete file from storage
  async deleteFile(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // List files in a folder
  async listFiles(
    bucketName: string,
    folder: string
  ): Promise<Array<{ name: string; size: number; created_at: string }>> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      return (data || []).map((f: any) => ({
      name: f.name,
      size: (f.metadata && f.metadata.size) ? Number(f.metadata.size) : 0,
      created_at: f.created_at,
    }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Export data as file
  async exportData(
    data: any,
    fileName: string,
    userId: string
  ): Promise<string | null> {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const file = new File([blob], fileName, { type: 'application/json' });

      const { data: upload, error } = await supabase.storage
        .from(this.buckets.exports)
        .upload(`${userId}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;

      // Generate download URL
      const { data: signedUrl } = await supabase.storage
        .from(this.buckets.exports)
        .createSignedUrl(upload.path, 7200); // 2 hour expiry

      return signedUrl?.signedUrl || null;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Get storage usage for user
  async getUserStorageUsage(userId: string): Promise<{
    captures: number;
    briefs: number;
    exports: number;
    total: number;
  }> {
    const usage = {
      captures: 0,
      briefs: 0,
      exports: 0,
      total: 0,
    };

    try {
      for (const [key, bucketName] of Object.entries(this.buckets)) {
        if (key === 'avatars') continue; // Skip avatars in usage calculation

        const { data } = await supabase.storage
          .from(bucketName)
          .list(userId, { limit: 1000 });

        if (data) {
          const bucketUsage = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
          usage[key as keyof typeof usage] = bucketUsage;
          usage.total += bucketUsage;
        }
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }

    return usage;
  }
}

// Export singleton instance
export const storageService = new SupabaseStorageService();