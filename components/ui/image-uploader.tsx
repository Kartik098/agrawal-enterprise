'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, Star, GripVertical } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/states'

interface UploadedImage {
  id?: number
  url: string
  file?: File
  isPrimary: boolean
  sortOrder: number
  colorId?: number | null
  isExisting?: boolean
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
  label?: string
}

export function ImageUploader({ images = [], onChange, maxImages = 10, label = 'Product images' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const remaining = maxImages - images.length
    const newImages: UploadedImage[] = Array.from(files).slice(0, remaining).map((file, i) => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: images.length === 0 && i === 0,
      sortOrder: images.length + i,
    }))
    onChange([...images, ...newImages])
  }

  function setPrimary(idx: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  function remove(idx: number) {
    const next = images.filter((_, i) => i !== idx)
    // If we removed primary, make first primary
    if (images[idx].isPrimary && next.length > 0) next[0].isPrimary = true
    onChange(next.map((img, i) => ({ ...img, sortOrder: i })))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [images])

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-blue-900">{label}</p>

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 text-sm transition ${dragging ? 'border-orange-500 bg-orange-50' : 'border-blue-200 bg-blue-50/60 hover:border-orange-400 hover:bg-orange-50/40'}`}
        >
          <Upload size={28} className="text-blue-400" />
          <div className="text-center">
            <p className="font-bold text-blue-700">Click or drag to upload</p>
            <p className="mt-1 text-xs text-blue-400">PNG, JPG, WEBP up to 10MB · {images.length}/{maxImages} uploaded</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img, idx) => (
            <div key={idx} className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${img.isPrimary ? 'border-orange-500 ring-2 ring-orange-100' : 'border-blue-200'}`}>
              <img src={img.url} alt={`Image ${idx + 1}`} className="h-full w-full object-cover" />
              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute left-1 top-1 flex items-center gap-1 rounded-md bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  <Star size={8} fill="currentColor" /> Primary
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {!img.isPrimary && (
                  <button onClick={() => setPrimary(idx)} className="rounded-lg bg-orange-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-orange-600">
                    Set primary
                  </button>
                )}
                <button onClick={() => remove(idx)} className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600">
                  <X size={10} className="inline" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Single image uploader (for brand logos)
interface SingleImageUploaderProps {
  currentUrl?: string | null
  onChange: (file: File | null, preview: string | null) => void
  label?: string
  shape?: 'square' | 'wide'
}

export function SingleImageUploader({ currentUrl, onChange, label = 'Image', shape = 'square' }: SingleImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(files: FileList | null) {
    if (!files?.length) return
    const file = files[0]
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file, url)
  }

  function remove() {
    setPreview(null)
    onChange(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const aspectClass = shape === 'wide' ? 'aspect-[3/1]' : 'aspect-square'

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-blue-900">{label}</p>
      {preview ? (
        <div className={`group relative ${aspectClass} w-48 overflow-hidden rounded-2xl border-2 border-blue-200`}>
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition group-hover:opacity-100">
            <button onClick={() => inputRef.current?.click()} className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white">Replace</button>
            <button onClick={remove} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white">Remove</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`flex ${aspectClass} w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 hover:border-orange-400 hover:bg-orange-50`}
        >
          <Upload size={24} className="text-blue-400" />
          <p className="text-xs font-semibold text-blue-500">Upload {label}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files)} />
    </div>
  )
}
