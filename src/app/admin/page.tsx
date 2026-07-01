'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, Tv, LogOut, Edit2, Trash2, Home, Search, 
  ExternalLink, CheckCircle, AlertTriangle, AlertCircle, 
  Check, X, RefreshCw
} from 'lucide-react';
import { getChannels, addChannel, updateChannel, deleteChannel, Channel } from '@/lib/db';
import ChannelForm from '@/components/ChannelForm';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Basic Auth Check
    const token = localStorage.getItem('iptv_admin_auth');
    if (token !== 'true') {
      router.push('/admin/login');
    } else {
      setAuthorized(true);
      fetchChannels();
    }
  }, [router]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data = await getChannels();
      setChannels(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Gagal memuat channel.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iptv_admin_auth');
    router.push('/admin/login');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleFormSubmit = async (formData: Omit<Channel, 'id' | 'created_at'>) => {
    try {
      if (editingChannel) {
        const updated = await updateChannel(editingChannel.id, formData);
        setChannels(prev => prev.map(c => c.id === editingChannel.id ? updated : c));
        showNotification('success', `Channel "${formData.name}" berhasil diperbarui.`);
      } else {
        const newChan = await addChannel(formData);
        setChannels(prev => [...prev, newChan]);
        showNotification('success', `Channel "${formData.name}" berhasil ditambahkan.`);
      }
      setIsModalOpen(false);
      setEditingChannel(null);
    } catch (err: unknown) {
      console.error(err);
      showNotification('error', 'Gagal menyimpan channel. Silakan coba lagi.');
    }
  };

  const handleDelete = async (channel: Channel) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus channel "${channel.name}"?`)) {
      return;
    }

    try {
      const success = await deleteChannel(channel.id);
      if (success) {
        setChannels(prev => prev.filter(c => c.id !== channel.id));
        showNotification('success', `Channel "${channel.name}" berhasil dihapus.`);
      } else {
        showNotification('error', 'Gagal menghapus channel. Channel tidak ditemukan.');
      }
    } catch (err: unknown) {
      console.error(err);
      showNotification('error', 'Terjadi kesalahan saat menghapus channel.');
    }
  };

  const handleToggleStatus = async (channel: Channel) => {
    const newStatus = channel.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await updateChannel(channel.id, { status: newStatus });
      setChannels(prev => prev.map(c => c.id === channel.id ? updated : c));
      showNotification('success', `Status channel "${channel.name}" diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`);
    } catch (err: unknown) {
      console.error(err);
      showNotification('error', 'Gagal mengubah status channel.');
    }
  };

  // Filter channels
  const categories = ['Semua', ...new Set(channels.map(c => c.category))];
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          channel.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <RefreshCw className="text-indigo-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Tv size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Channel Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-sm font-semibold rounded-xl text-neutral-300 transition duration-200"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Lihat Beranda</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/40 text-sm font-semibold rounded-xl text-rose-400 transition duration-200 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Toast Notification */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-800/80 text-emerald-400'
              : 'bg-rose-950/90 border-rose-800/80 text-rose-400'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Dashboard Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Search and Filters */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <div className="relative flex items-center flex-1">
              <Search className="absolute left-4 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="Cari channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition duration-200 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>Kategori: {c}</option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              setEditingChannel(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus size={18} />
            Tambah Channel
          </button>
        </div>

        {/* Content Section */}
        {error ? (
          <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 max-w-md mx-auto my-12">
            <AlertCircle size={24} />
            <div>
              <h4 className="font-bold">Gagal memuat data</h4>
              <p className="text-sm text-neutral-400 mt-1">{error}</p>
            </div>
          </div>
        ) : loading ? (
          /* Table Skeleton */
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-2xl overflow-hidden animate-pulse">
            <div className="h-14 bg-neutral-900 border-b border-neutral-800"></div>
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-neutral-900/60 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-850 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Logo & Nama</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Tipe Stream</th>
                    <th className="px-6 py-4">URL Stream</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-sm">
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map((channel) => (
                      <tr key={channel.id} className="hover:bg-neutral-900/20 transition duration-150">
                        {/* Name & Logo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {channel.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={channel.logo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Tv size={18} className="text-neutral-500" />
                              )}
                            </div>
                            <span className="font-semibold text-white">{channel.name}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-neutral-950 text-neutral-400 border border-neutral-800 uppercase">
                            {channel.category}
                          </span>
                        </td>

                        {/* Stream Type */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                            channel.stream_type === 'hls'
                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                              : channel.stream_type === 'dash'
                              ? 'bg-cyan-950/30 text-cyan-400 border-cyan-900/50'
                              : channel.stream_type === 'youtube'
                              ? 'bg-rose-950/30 text-rose-400 border-rose-900/50'
                              : 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50'
                          }`}>
                            {channel.stream_type}
                          </span>
                        </td>

                        {/* Stream URL */}
                        <td className="px-6 py-4 max-w-xs truncate font-mono text-xs text-neutral-500">
                          <a 
                            href={channel.stream_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1 inline-flex hover:text-neutral-300"
                          >
                            {channel.stream_url}
                            <ExternalLink size={10} />
                          </a>
                        </td>

                        {/* Status Toggle */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(channel)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition duration-200 cursor-pointer border ${
                              channel.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:bg-neutral-700'
                            }`}
                          >
                            {channel.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingChannel(channel);
                                setIsModalOpen(true);
                              }}
                              className="p-2 hover:bg-indigo-500/10 text-neutral-400 hover:text-indigo-400 rounded-lg transition duration-150 cursor-pointer"
                              title="Edit Channel"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(channel)}
                              className="p-2 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 rounded-lg transition duration-150 cursor-pointer"
                              title="Hapus Channel"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-neutral-500 border-dashed border-2 border-neutral-900 rounded-b-2xl">
                        Tidak ada channel ditemukan. Silakan tambahkan channel baru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-850 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingChannel ? 'Edit Channel IPTV' : 'Tambah Channel IPTV Baru'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingChannel(null);
                }}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition duration-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <ChannelForm
                initialData={editingChannel}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingChannel(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
