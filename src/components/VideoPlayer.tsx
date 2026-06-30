'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Channel } from '@/lib/db';
import { getYoutubeEmbedUrl } from '@/lib/utils';

interface VideoPlayerProps {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // Used to force reload the player

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!channel) return;

    // Reset player state on channel change
    setError(null);
    setLoading(true);

    const video = videoRef.current;
    
    // Clean up existing Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!video) {
      // If it's iframe or youtube, we're not using HTML5 video ref
      setLoading(false);
      return;
    }

    const streamUrl = channel.stream_url;
    const type = channel.stream_type;

    if (type === 'mp4') {
      video.src = streamUrl;
      
      const handleCanPlay = () => {
        setLoading(false);
        video.play().catch(e => {
          console.log('Autoplay blocked or failed:', e);
        });
      };

      const handleVideoError = () => {
        setLoading(false);
        setError('Gagal memuat video MP4. Pastikan URL valid dan codec didukung.');
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleVideoError);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
      };
    }

    if (type === 'hls') {
      // Check for native HLS support (like Safari)
      if (video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        
        const handleCanPlay = () => {
          setLoading(false);
          video.play().catch(e => {
            console.log('Autoplay HLS blocked or failed:', e);
          });
        };

        const handleVideoError = () => {
          setLoading(false);
          setError('Gagal memuat HLS stream via native player.');
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleVideoError);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleVideoError);
        };
      } 
      // Fallback to Hls.js
      else if (Hls.isSupported()) {
        const hls = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(e => {
            console.log('Autoplay Hls.js blocked or failed:', e);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('Hls.js error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Fatal network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                setLoading(false);
                setError('Gagal memuat streaming HLS. Stream tidak dapat diakses.');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });

        return () => {
          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }
        };
      } else {
        setLoading(false);
        setError('Browser Anda tidak mendukung pemutaran video HLS (.m3u8).');
      }
    }
  }, [channel, key]);

  // If no channel is selected
  if (!channel) {
    return (
      <div className="w-full aspect-video bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-6 shadow-2xl">
        <div className="p-4 rounded-full bg-neutral-800 mb-4 animate-pulse">
          <Play size={40} className="text-neutral-500 fill-neutral-500 ml-1" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Pilih Channel</h3>
        <p className="text-sm text-neutral-500 text-center max-w-xs">
          Silakan pilih channel dari daftar untuk mulai menonton siaran langsung.
        </p>
      </div>
    );
  }

  const renderPlayer = () => {
    if (error) {
      return (
        <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="text-rose-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-white mb-2">Gagal Memutar Siaran</h3>
          <p className="text-sm text-neutral-400 max-w-md mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-medium transition duration-200 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      );
    }

    switch (channel.stream_type) {
      case 'youtube': {
        const embedUrl = getYoutubeEmbedUrl(channel.stream_url);
        return (
          <iframe
            key={key}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }
      
      case 'iframe':
        return (
          <iframe
            key={key}
            src={channel.stream_url}
            className="w-full h-full border-0 bg-black"
            allowFullScreen
          />
        );

      case 'hls':
      case 'mp4':
        return (
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              key={key}
              className="w-full h-full object-contain"
              controls
              playsInline
              autoPlay
              muted={false}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={36} className="text-indigo-500 animate-spin" />
                  <span className="text-sm text-neutral-300 font-medium">Memuat siaran...</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-400">
            Tipe stream tidak dikenali.
          </div>
        );
    }
  };

  return (
    <div className="w-full aspect-video bg-black border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group">
      {renderPlayer()}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-neutral-700 text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          LIVE: {channel.name}
        </div>
      </div>
    </div>
  );
}
