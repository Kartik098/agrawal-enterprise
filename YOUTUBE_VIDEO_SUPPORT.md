# YouTube Video Support - Implementation & Testing Guide

## What Was Implemented

### 1. **Video URL Detection & Parsing** (`lib/video-utils.ts`)
- Extracts YouTube video IDs from multiple URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/shorts/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - YouTube URLs with additional query parameters
- Detects direct video URLs (.mp4, .webm, .ogg, .mov, .avi, .mkv, .flv, .wmv, .m4v)
- Converts any YouTube format to embed format automatically
- Gracefully handles invalid URLs

### 2. **VideoPlayer Component** (`components/video-player.tsx`)
- Unified player that renders the correct element based on source:
  - **YouTube URLs**: Renders responsive `<iframe>` with YouTube embed
  - **Direct Video URLs**: Renders native HTML5 `<video>` element
  - **Invalid URLs**: Shows error message with AlertCircle icon
- Features:
  - Responsive design (maintains aspect ratio)
  - Play/pause controls (configurable)
  - Optional play button overlay with Pause icon during playback
  - Proper iframe permissions for YouTube playback
  - No layout overflow on any screen size

### 3. **Admin Panel Updates** (`app/admin/videos/page.tsx`)
- Integrated VideoPlayer for live preview
- Admin can paste any YouTube URL format, system converts it automatically
- Preview updates in real-time as admin types
- Shows video source type (upload/url) and metadata
- Works with YouTube Shorts, watch URLs, shortened URLs, embed URLs

### 4. **Storefront Display** (`components/storefront/video-section.tsx`)
- Uses VideoPlayer for all video rendering
- Displays exactly 3 video slots responsively
- YouTube videos maintain aspect ratio without overflow
- Mobile-friendly layout
- Loads data dynamically from Supabase

### 5. **Service Layer** (`services/videos.ts`)
- Fixed table references from `videos` to `videos`
- Stores YouTube URLs as-is; frontend handles conversion
- No schema changes needed

## Testing Instructions

### Prerequisites
1. Create Supabase storage bucket: `storefront-videos` (public)
2. Run SQL schema from `supabase-schema.sql` to create table and RLS

### Test Cases

#### **Test 1: Upload Video (MP4)**
1. Go to `/admin/videos`
2. Click "Upload video" in any slot
3. Select a `.mp4` file from your computer
4. Verify preview renders with video controls
5. Check storefront - video should play

**Expected**: Native video player with full controls

#### **Test 2: Direct Video URL (MP4/WebM)**
1. In admin, use URL input field
2. Paste: `https://example.com/video.mp4`
3. Verify preview works
4. Check storefront

**Expected**: Native video player with full controls

#### **Test 3: YouTube Watch URL**
1. Go to any YouTube video
2. Copy the URL from address bar (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Paste into admin URL field
4. Verify preview shows YouTube player
5. Check storefront

**Expected**: YouTube iframe player, no need to convert to embed format

#### **Test 4: YouTube Short URL (youtu.be)**
1. Copy shortened YouTube URL (e.g., `https://youtu.be/dQw4w9WgXcQ`)
2. Paste into admin URL field
3. Verify preview works
4. Check storefront

**Expected**: YouTube iframe player

#### **Test 5: YouTube Shorts**
1. Go to YouTube Shorts
2. Copy URL (e.g., `https://www.youtube.com/shorts/dQw4w9WgXcQ`)
3. Paste into admin URL field
4. Verify preview works
5. Check storefront

**Expected**: YouTube iframe player

#### **Test 6: YouTube Embed URL**
1. Paste already-embed URL (e.g., `https://www.youtube.com/embed/dQw4w9WgXcQ`)
2. Admin should detect it's already in embed format
3. Verify preview works
4. Check storefront

**Expected**: YouTube iframe player

#### **Test 7: YouTube URL with Parameters**
1. Paste URL with time/playlist parameters: `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s`
2. Verify extraction works
3. Check storefront

**Expected**: YouTube iframe player starts at timestamp

#### **Test 8: Responsive Layout**
1. Load storefront with 3 active videos
2. On desktop: 3 videos side-by-side
3. On tablet (768px): 2-3 columns depending on container
4. On mobile (375px): Stacked vertically
5. All videos maintain aspect ratio, no overflow

**Expected**: Grid layout adapts correctly

#### **Test 9: Mixed Video Types**
1. Set slot 1: Upload MP4
2. Set slot 2: YouTube URL
3. Set slot 3: Direct video URL
4. Load storefront

**Expected**: All 3 play with correct player type

#### **Test 10: Invalid URL**
1. Paste invalid URL: `https://example.com/notavideo`
2. Try to save

**Expected**: Error message in toast notification

#### **Test 11: Active/Inactive Toggle**
1. Upload or add video
2. Click "Inactive" button in admin
3. Refresh storefront

**Expected**: Video disappears from storefront

#### **Test 12: Replace Video**
1. Add video to slot 1
2. Upload different video to same slot
3. Verify old file deleted from storage (if upload type)
4. Verify new video plays

**Expected**: Smooth replacement without errors

#### **Test 13: Delete Video**
1. Add video to a slot
2. Click delete button
3. Confirm deletion
4. Verify storage cleaned up (if upload type)

**Expected**: Slot cleared, ready for new video

## URL Patterns Supported

✅ `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Standard watch)
✅ `https://youtu.be/dQw4w9WgXcQ` (Shortened)
✅ `https://www.youtube.com/shorts/dQw4w9WgXcQ` (YouTube Shorts)
✅ `https://www.youtube.com/embed/dQw4w9WgXcQ` (Already embed)
✅ `https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s` (With parameters)
✅ `https://example.com/video.mp4` (Direct MP4)
✅ `https://example.com/video.webm` (Direct WebM)
✅ Local uploaded files (Supabase Storage URLs)

## Video Type Detection Logic

```
URL Input
  ├─ Is YouTube URL? 
  │  ├─ YES → Extract ID → Convert to embed → Render iframe
  │  └─ NO → Continue
  ├─ Is direct video file?
  │  ├─ YES → Render <video> element
  │  └─ NO → Continue
  └─ ELSE → Show error message
```

## Key Features

✅ **No manual /embed/ conversion needed** - Admin pastes any YouTube URL
✅ **Responsive YouTube embeds** - Maintains aspect ratio on all devices
✅ **Multiple URL formats supported** - watch, youtu.be, shorts, embed
✅ **Graceful error handling** - Invalid URLs show friendly error
✅ **Works with direct video URLs** - MP4, WebM, Ogg, etc.
✅ **Admin preview works** - YouTube preview in admin panel
✅ **Storefront preview works** - Matches YouTube player appearance
✅ **No database schema changes** - Uses existing `videos` table
✅ **No hardcoded URLs** - All from Supabase

## File Structure

```
lib/video-utils.ts ..................... URL detection & parsing utilities
components/video-player.tsx ............ Unified video/iframe player
components/storefront/video-section.tsx ... Storefront display (3 videos)
app/admin/videos/page.tsx .............. Admin management UI
services/videos.ts ..................... Database & storage operations
```

## Troubleshooting

**YouTube player not showing?**
- Verify URL is valid YouTube format
- Check browser console for errors
- Ensure iframe has proper permissions: `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`

**Video not playing on storefront?**
- Check Supabase RLS policies for `videos` table
- Ensure `is_active = true` for the video
- Verify storage bucket permissions if uploaded video

**Admin preview blank?**
- Clear browser cache
- Verify VideoPlayer component is imported
- Check network tab for URL fetch errors

**Responsive layout broken?**
- Check Tailwind grid classes are applied
- Verify aspect-video class is present
- Test on different screen sizes

## Build Status

✅ Project builds successfully
✅ No TypeScript errors
✅ All routes compile
✅ No import errors
✅ Ready for production
