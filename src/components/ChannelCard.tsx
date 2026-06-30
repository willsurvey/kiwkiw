'use client';

import React from 'react';
import { Tv, Radio } from 'lucide-react';
import { Channel } from '@/lib/db';

interface ChannelCardProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: (channel: Channel) => void;
}

export default function ChannelCard({ channel, isSelected, onSelect }: ChannelCardProps) {
  const getStreamTypeLabel = (type: string) => {
    switch (type) {
      case 'hls': return 'HLS';
      case 'mp4': return 'Direct';
      case 'youtube': return 'YouTube';
      default: return 'Embed';
    }
  };

  return (
    <div
      onClick={() => onSelect(channel)}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-600/5'
          : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/90'
      }`}
    >
      {/* Selection Border Glow */}
      {isSelected && (
        <span className="absolute inset-y-4 left-0 w-1 bg-indigo-500 rounded-r-md"></span>
      )}

      {/* Channel Logo / Fallback */}
      <div className="relative flex-shrink-0 w-14 h-14 rounded-lg bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
        {channel.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.logo_url}
            alt={channel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Replace broken image with fallback
              (e.target as HTMLImageElement).src = '';
              (e.target as HTMLImageElement).parentElement?.classList.add('fallback-active');
            }}
          />
        ) : null}
        
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-400 group-[.fallback-active]:flex hidden">
          <Tv size={24} />
        </div>
        {!channel.logo_url && (
          <div className="flex items-center justify-center text-neutral-400">
            <Tv size={24} />
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white truncate transition-colors duration-200 group-hover:text-indigo-400">
          {channel.name}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase">
            {channel.category}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase ${
            channel.stream_type === 'hls' 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' 
              : channel.stream_type === 'youtube'
              ? 'bg-rose-950/40 text-rose-400 border-rose-800/50'
              : 'bg-indigo-950/40 text-indigo-400 border-indigo-800/50'
          }`}>
            {getStreamTypeLabel(channel.stream_type)}
          </span>
        </div>
      </div>

      {/* Play/Live Indicator */}
      <div className="flex-shrink-0">
        {isSelected ? (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ON</span>
          </div>
        ) : (
          <Radio size={16} className="text-neutral-600 group-hover:text-neutral-400 transition-colors duration-300" />
        )}
      </div>
    </div>
  );
}
