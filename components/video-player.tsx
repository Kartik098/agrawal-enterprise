'use client'

import { useEffect, useState } from 'react'
import { Play, Pause, AlertCircle } from 'lucide-react'
import { isYouTubeUrl, getYouTubeEmbedUrl, isDirectVideoUrl, getVideoSourceType } from '@/lib/video-utils'

interface VideoPlayerProps {
  url: string
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  showPlayIcon?: boolean
  controls?: boolean
}

export function VideoPlayer({
  url,
  isPlaying = false,
  onPlay,
  onPause,
  showPlayIcon = false,
  controls = true,
}: VideoPlayerProps) {
  const [sourceType, setSourceType] = useState<'youtube' | 'direct' | 'error'>('error')
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setSourceType('error')
      return
    }

    if (isYouTubeUrl(url)) {
      const embed = getYouTubeEmbedUrl(url)
      if (embed) {
        setEmbedUrl(embed)
        setSourceType('youtube')
      } else {
        setSourceType('error')
      }
    } else if (isDirectVideoUrl(url) || url.startsWith('http')) {
      // For direct URLs or any http(s) URL that's not YouTube
      setSourceType('direct')
    } else {
      setSourceType('error')
    }
  }, [url])

  if (sourceType === 'error') {
    return (
      <div className="aspect-video w-full rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center gap-2">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm font-semibold text-red-600">Invalid or unsupported video URL</p>
      </div>
    )
  }

  if (sourceType === 'youtube') {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedUrl || ''}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  // Direct video URL
  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        src={url}
        className="h-full w-full object-cover"
        muted
        playsInline
        controls={controls}
        onPlay={onPlay}
        onPause={onPause}
      />

      {showPlayIcon && (
        <div className="absolute inset-0 hidden items-center justify-center bg-black/20 group-hover:flex transition">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur-sm">
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white fill-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
