import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCTS: 'product-images',
  BRANDS: 'brand-logos',
  VIDEOS: 'storefront-videos',
  CAROUSEL: 'carousel-images',
}

// Helper: get public URL for a storage path
export function getStorageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Helper: upload a file to Supabase Storage, return public URL
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { data, error } = await supabase.storage
  .from(bucket)
  .upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) throw error
  return getStorageUrl(bucket, path)
}

// Helper: delete a file from Supabase Storage
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

// Extract storage path from a public URL
export function pathFromUrl(url: string, bucket: string): string {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : url
}

