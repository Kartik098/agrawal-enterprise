'use client'

import { useEffect, useState } from 'react'
import { videosService } from '@/services/videos'
import { VideoPlayer } from '@/components/video-player'
import type { Video } from '@/types/database'

export function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [playingSlot, setPlayingSlot] = useState<number | null>(null)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await videosService.getActive()
        setVideos(data)
      } catch (err) {
        console.error('Failed to load videos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadVideos()
  }, [])

  if (loading) {
    return (
      <section className="section-shell py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl bg-blue-100 aspect-video" />
          ))}
        </div>
      </section>
    )
  }

  // Only show section if there's at least one active video
  if (videos.length === 0) {
    return null
  }

  return (
    <section className="section-shell py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-blue-950">Featured Videos</h2>
        <p className="mt-1 text-sm text-blue-500">Check out our latest content</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map(video => (
          <div
            key={video.id}
            className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <VideoPlayer
              url={video.video_url}
              isPlaying={playingSlot === video.slot}
              onPlay={() => setPlayingSlot(video.slot)}
              onPause={() => setPlayingSlot(null)}
              showPlayIcon={true}
              controls={true}
            />
          </div>
        ))}

        {/* Show placeholder cards for unused slots */}
        {videos.length < 3 && (
          <>
            {[...Array(3 - videos.length)].map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-video rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center"
              >
                <p className="text-sm font-semibold text-blue-400">No video</p>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}
