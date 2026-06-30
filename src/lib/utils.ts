/**
 * Detects the stream type based on the URL.
 * Rules:
 * - youtube -> youtube
 * - .m3u8 -> hls
 * - .mp4 (and other common formats) -> mp4
 * - default -> iframe
 */
export function detectStreamType(url: string): 'youtube' | 'hls' | 'mp4' | 'iframe' {
  if (!url) return 'iframe';
  
  const cleanUrl = url.trim().toLowerCase();
  
  // YouTube detection
  if (
    cleanUrl.includes('youtube.com') || 
    cleanUrl.includes('youtu.be') || 
    cleanUrl.includes('youtube-nocookie.com')
  ) {
    return 'youtube';
  }
  
  // HLS detection
  if (cleanUrl.includes('.m3u8')) {
    return 'hls';
  }
  
  // MP4/Direct Video detection
  if (
    cleanUrl.includes('.mp4') || 
    cleanUrl.includes('.webm') || 
    cleanUrl.includes('.ogg') ||
    cleanUrl.includes('.mov')
  ) {
    return 'mp4';
  }
  
  // Default fallback
  return 'iframe';
}

/**
 * Normalizes YouTube URLs to embeddable formats.
 * e.g., https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
 */
export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  try {
    const cleanUrl = url.trim();
    
    // If it's already an embed URL, return as is
    if (cleanUrl.includes('/embed/')) {
      return cleanUrl;
    }
    
    let videoId = '';
    
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else if (cleanUrl.includes('watch?v=')) {
      const urlParams = new URLSearchParams(cleanUrl.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (cleanUrl.includes('youtube.com/v/')) {
      videoId = cleanUrl.split('youtube.com/v/')[1]?.split(/[?#]/)[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
  }
  
  return url;
}
