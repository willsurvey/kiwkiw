'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Channel } from '@/lib/db';
import { detectStreamType } from '@/lib/utils';

interface ChannelFormProps {
  initialData?: Channel | null;
  onSubmit: (data: Omit<Channel, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

export default function ChannelForm({ initialData, onSubmit, onCancel }: ChannelFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [streamUrl, setStreamUrl] = useState(initialData?.stream_url || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(initialData?.status || 'active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto detect preview
  const detectedType = streamUrl ? detectStreamType(streamUrl) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama channel wajib diisi.');
      return;
    }
    if (!category.trim()) {
      setError('Kategori wajib diisi.');
      return;
    }
    if (!streamUrl.trim()) {
      setError('URL Stream wajib diisi.');
      return;
    }
    if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
      setError('URL Stream harus diawali dengan http:// atau https://');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: name.trim(),
        category: category.trim(),
        stream_url: streamUrl.trim(),
        logo_url: logoUrl.trim() || undefined,
        status,
        stream_type: detectedType || 'iframe'
      });
    } catch (err: unknown) {
      console.error(err);
      setError('Terjadi kesalahan saat menyimpan channel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Nama Channel <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: HBO HD, CNN Indonesia"
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Kategori <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Contoh: Movies, Sports, News, Music"
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          URL Stream <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="Contoh: https://example.com/live.m3u8"
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 font-mono text-sm"
          required
        />
        {detectedType && (
          <p className="mt-2 text-xs text-indigo-400 font-medium">
            Tipe Stream Terdeteksi: <span className="uppercase font-bold">{detectedType}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          URL Logo Channel (Opsional)
        </label>
        <input
          type="text"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="Contoh: https://example.com/logo.png"
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
          className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200 cursor-pointer"
        >
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-300 rounded-xl font-medium transition duration-200 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {initialData ? 'Simpan Perubahan' : 'Tambah Channel'}
        </button>
      </div>
    </form>
  );
}
