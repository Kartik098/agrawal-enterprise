'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { AdminNav, AdminTopbar } from '@/app/admin/page'
import { videosService } from '@/services/videos'
import { VideoUploader } from '@/components/ui/video-uploader'
import { VideoPlayer } from '@/components/video-player'
import { Toast, PageLoader } from '@/components/ui/states'
import type { Video } from '@/types/database'

const SLOTS = [1, 2, 3]

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Map<number, Video>>(new Map())
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  
  // Modal state for URL input
  const [urlModalSlot, setUrlModalSlot] = useState<number | null>(null)
  const [urlInput, setUrlInput] = useState('')

  const loadVideos = async () => {
    setLoading(true)
    try {
      const data = await videosService.getAll()
      const map = new Map()
      data.forEach(v => map.set(v.slot, v))
      setVideos(map)
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to load videos', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  async function handleVideoUpload(slot: number, file: File) {
    setUploadingSlot(slot)
    try {
      await videosService.upsertVideo(slot, file, undefined, true)
      setToast({ msg: `Video ${slot} uploaded successfully`, type: 'success' })
      loadVideos()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to upload video', type: 'error' })
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleVideoUrl(slot: number) {
    if (!urlInput.trim()) {
      setToast({ msg: 'Please enter a valid URL', type: 'error' })
      return
    }
    setUploadingSlot(slot)
    try {
      await videosService.upsertVideo(slot, undefined, urlInput.trim(), true)
      setToast({ msg: `Video ${slot} URL saved successfully`, type: 'success' })
      setUrlModalSlot(null)
      setUrlInput('')
      loadVideos()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to save video URL', type: 'error' })
    } finally {
      setUploadingSlot(null)
    }
  }

  async function toggleActive(slot: number) {
    try {
      await videosService.toggleActive(slot)
      const video = videos.get(slot)
      setToast({ msg: `Video ${slot} ${video?.is_active ? 'deactivated' : 'activated'}`, type: 'success' })
      loadVideos()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to toggle video', type: 'error' })
    }
  }

  async function deleteVideo(slot: number) {
    if (!confirm(`Delete video in slot ${slot}?`)) return
    try {
      await videosService.deleteVideo(slot)
      setToast({ msg: `Video ${slot} deleted`, type: 'success' })
      loadVideos()
    } catch (err: any) {
      setToast({ msg: err.message || 'Failed to delete video', type: 'error' })
    }
  }

  if (loading) return <PageLoader />

  return (
    <main className="min-h-screen bg-blue-50">
      <AdminNav active="/admin/videos" />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="lg:pl-72">
        <AdminTopbar onMenuClick={() => {}} />
        <div className="section-shell py-8">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-blue-950">Storefront Videos</h1>
            <p className="mt-2 text-sm text-blue-500">Manage the 3 video slots that appear on your storefront</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SLOTS.map(slot => {
              const video = videos.get(slot)
              return (
                <div key={slot} className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-black text-blue-950">Video {slot}</h2>
                    {video && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${video.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {video.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  {/* Video preview */}
                  {video ? (
                    <div className="mb-4">
                      <VideoPlayer
                        url={video.video_url}
                        controls={false}
                        showPlayIcon={true}
                      />
                      <div className="mt-3 space-y-1 text-xs">
                        <p><span className="font-bold text-blue-700">Source:</span> <span className="text-blue-500 capitalize">{video.source_type}</span></p>
                        {video.source_type === 'url' && (
                          <p className="text-blue-400 truncate" title={video.video_url}>{video.video_url}</p>
                        )}
                        <p className="text-blue-400">{new Date(video.updated_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 aspect-video w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 flex items-center justify-center">
                      <p className="text-sm text-blue-400 font-semibold">No video</p>
                    </div>
                  )}

                  {/* Upload or URL form */}
                  {!video || uploadingSlot !== slot ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold text-blue-700 mb-2">Upload or use URL:</p>
                        <VideoUploader 
                          onFileSelect={(file) => handleVideoUpload(slot, file)}
                          label={video ? 'Replace video' : 'Upload video'}
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Or paste video URL..."
                          value={urlModalSlot === slot ? urlInput : ''}
                          onChange={(e) => urlModalSlot === slot && setUrlInput(e.target.value)}
                          onFocus={() => setUrlModalSlot(slot)}
                          className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-xs outline-none focus:border-orange-400"
                        />
                        {urlModalSlot === slot && (
                          <button
                            onClick={() => handleVideoUrl(slot)}
                            disabled={uploadingSlot !== null}
                            className="px-3 py-2 text-xs font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-70"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-orange-500" />
                        <p className="mt-2 text-xs font-bold text-blue-600">Uploading...</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {video && uploadingSlot !== slot && (
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <button
                        onClick={() => toggleActive(slot)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
                        title={video.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {video.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        {video.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteVideo(slot)}
                        className="rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
                        title="Delete video"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
