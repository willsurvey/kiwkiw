'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Tv, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem('iptv_admin_auth');
    if (token === 'true') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const configPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    setTimeout(() => {
      if (password === configPassword) {
        localStorage.setItem('iptv_admin_auth', 'true');
        router.push('/admin');
      } else {
        setError('Password admin salah. Silakan coba lagi.');
        setLoading(false);
      }
    }, 600); // Small delay for UX feel
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col justify-center items-center px-4">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition duration-200"
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-3">
            <Tv size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Admin Login</h2>
          <p className="text-sm text-neutral-400 mt-1">Masuk untuk mengelola channel IPTV</p>
        </div>

        {/* Login Card */}
        <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Kata Sandi Admin
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-neutral-500" size={18} />
                <input
                  type="password"
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
                  required
                  autoFocus
                />
              </div>
              <p className="mt-2 text-[10px] text-neutral-500">
                Default password: <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-neutral-400">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
