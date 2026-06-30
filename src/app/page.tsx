'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Tv, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { getChannels, Channel } from '@/lib/db';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelCard from '@/components/ChannelCard';

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChannels();
      
      // Filter out inactive channels for guests
      const activeChannels = data.filter(c => c.status === 'active');
      setChannels(activeChannels);
      
      // Set the first channel as active if none is selected
      if (activeChannels.length > 0 && !activeChannel) {
        setActiveChannel(activeChannels[0]);
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Gagal memuat daftar channel. Silakan segarkan halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Extract unique categories
  const categories = ['Semua', ...new Set(channels.map(c => c.category))];

  // Filter channels based on search and category
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
              <Tv size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
                IPTV Stream
              </h1>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Live Broadcast</p>
            </div>
          </Link>

          {/* Search bar on desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md relative mx-8">
            <Search className="absolute left-4 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="Cari channel atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 focus:bg-neutral-900 transition duration-300"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-sm font-semibold rounded-xl text-neutral-300 transition duration-300 cursor-pointer"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Mobile Search */}
        <div className="flex md:hidden items-center relative mb-6">
          <Search className="absolute left-4 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Cari channel atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-300"
          />
        </div>

        {error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-between gap-4 max-w-2xl mx-auto my-12">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                <h4 className="font-bold">Gagal Memuat Data</h4>
                <p className="text-sm text-neutral-400 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchChannels}
              className="p-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-xl transition duration-200"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        ) : loading ? (
          /* Sleek Skeleton Loading */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="w-full aspect-video bg-neutral-900 border border-neutral-800 rounded-2xl animate-pulse flex items-center justify-center">
                <Tv className="text-neutral-800" size={48} />
              </div>
              <div className="h-6 w-48 bg-neutral-900 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              <div className="h-8 w-32 bg-neutral-900 rounded animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-neutral-900 border border-neutral-800/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Player Column */}
            <div className="lg:col-span-2 space-y-6">
              <VideoPlayer channel={activeChannel} />
              
              {activeChannel && (
                <div className="p-6 bg-neutral-900/40 border border-neutral-900 rounded-2xl backdrop-blur-md">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2 uppercase tracking-wide">
                        {activeChannel.category}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{activeChannel.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ONLINE / LIVE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List Column */}
            <div className="space-y-6">
              {/* Category Tabs */}
              <div>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">Kategori</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channels List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Daftar Channel</h3>
                  <span className="text-xs text-neutral-500 font-medium">{filteredChannels.length} channel ditemukan</span>
                </div>

                {filteredChannels.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                    {filteredChannels.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        isSelected={activeChannel?.id === channel.id}
                        onSelect={setActiveChannel}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 border border-dashed border-neutral-800 rounded-2xl text-center text-neutral-500">
                    <p className="text-sm font-medium">Tidak ada channel yang ditemukan</p>
                    <p className="text-xs text-neutral-600 mt-1">Coba gunakan kata kunci pencarian atau kategori lain</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 mt-20 py-8 text-center text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} IPTV Streaming Hub. Built with Next.js & Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
