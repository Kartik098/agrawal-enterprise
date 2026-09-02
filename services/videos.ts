import { supabase, uploadFile, deleteFile, pathFromUrl, STORAGE_BUCKETS } from '@/lib/supabase'
import type { Video } from '@/types/database'

export const videosService = {
  // Get all videos (admin only)
  async getAll(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('slot')
    if (error) throw error
    return data
  },

  // Get only active videos (public - for storefront)
  async getActive(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('slot')
    if (error) throw error
    return data
  },

  // Get a specific video by slot
  async getBySlot(slot: number): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('slot', slot)
      .single()
    if (error) return null
    return data
  },

  // Create or update a video slot
  async upsertVideo(
    slot: number,
    videoFile?: File,
    videoUrl?: string,
    isActive: boolean = true
  ): Promise<Video> {
    if (!videoFile && !videoUrl) {
      throw new Error('Either videoFile or videoUrl must be provided')
    }

    let finalUrl: string | null = null
    let sourceType: 'upload' | 'url' = 'url'

    if (videoFile) {
      // Upload file to Supabase Storage
      const path = `${slot}-${Date.now()}-${videoFile.name.replace(/\s+/g, '-')}`
      finalUrl = await uploadFile(STORAGE_BUCKETS.VIDEOS, path, videoFile)
      sourceType = 'upload'
    } else if (videoUrl) {
      // Validate URL
      try {
        new URL(videoUrl)
        finalUrl = videoUrl
        sourceType = 'url'
      } catch {
        throw new Error('Invalid video URL')
      }
    }

    // Check if video exists for this slot
    const existing = await this.getBySlot(slot)

    if (existing) {
      // Delete old uploaded video if replacing with new upload
      if (videoFile && existing.source_type === 'upload' && existing.video_url) {
        try {
          await deleteFile(STORAGE_BUCKETS.VIDEOS, pathFromUrl(existing.video_url, STORAGE_BUCKETS.VIDEOS))
        } catch {}
      }

      // Update existing
      const { data, error } = await supabase
        .from('videos')
        .update({
          video_url: finalUrl,
          source_type: sourceType,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('slot', slot)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('videos')
        .insert({
          slot,
          video_url: finalUrl,
          source_type: sourceType,
          is_active: isActive,
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Toggle active status
  async toggleActive(slot: number): Promise<Video> {
    const video = await this.getBySlot(slot)
    if (!video) throw new Error('Video not found')

    const { data, error } = await supabase
      .from('videos')
      .update({
        is_active: !video.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('slot', slot)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a video (clear the slot)
  async deleteVideo(slot: number): Promise<void> {
    const video = await this.getBySlot(slot)
    if (!video) throw new Error('Video not found')

    // Delete uploaded file from storage if it's an upload
    if (video.source_type === 'upload' && video.video_url) {
      try {
        await deleteFile(STORAGE_BUCKETS.VIDEOS, pathFromUrl(video.video_url, STORAGE_BUCKETS.VIDEOS))
      } catch {}
    }

    // Delete database record
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('slot', slot)

    if (error) throw error
  },
}
