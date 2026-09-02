'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X } from 'lucide-react'

interface VideoUploaderProps {
  onFileSelect: (file: File) => void
  label?: string
}

export function VideoUploader({ onFileSelect, label = 'Upload video' }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const file = files[0]
    // Validate video file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, WebM, Ogg, etc.)')
      return
    }
    onFileSelect(file)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-blue-900">{label}</p>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-sm transition ${dragging ? 'border-orange-500 bg-orange-50' : 'border-blue-200 bg-blue-50/60 hover:border-orange-400'}`}
      >
        <Upload size={20} className="text-blue-400" />
        <div className="text-center">
          <p className="font-bold text-blue-700">Click or drag to upload video</p>
          <p className="mt-0.5 text-xs text-blue-400">MP4, WebM, Ogg up to 100MB</p>
        </div>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
    </div>
  )
}
