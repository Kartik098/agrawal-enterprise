/**
 * Utility functions for handling different video sources
 */

// Extract YouTube video ID from various YouTube URL formats
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
  const match1 = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/)
  if (match1?.[1]) return match1[1]

  // Pattern 2: https://youtu.be/VIDEO_ID
  const match2 = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (match2?.[1]) return match2[1]

  // Pattern 3: https://www.youtube.com/shorts/VIDEO_ID
  const match3 = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (match3?.[1]) return match3[1]

  // Pattern 4: https://www.youtube.com/embed/VIDEO_ID (already in embed format)
  const match4 = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  if (match4?.[1]) return match4[1]

  // Pattern 5: Handle URLs with additional parameters
  const match5 = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (match5?.[1]) return match5[1]

  return null
}

// Check if URL is a YouTube URL
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

// Check if URL is a direct video file (mp4, webm, ogg, etc.)
export function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i
  return videoExtensions.test(url)
}

// Get the YouTube embed URL
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
}

// Determine the type of video source
export type VideoSourceType = 'youtube' | 'direct' | 'unknown'

export function getVideoSourceType(url: string): VideoSourceType {
  if (isYouTubeUrl(url)) return 'youtube'
  if (isDirectVideoUrl(url)) return 'direct'
  return 'unknown'
}
