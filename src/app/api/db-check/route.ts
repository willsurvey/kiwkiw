import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const envs = {
    SUPABASE_URL_EXIST: !!supabaseUrl,
    SUPABASE_URL_VALUE: supabaseUrl ? `${supabaseUrl.substring(0, 25)}...` : 'not set',
    SUPABASE_ANON_KEY_EXIST: !!supabaseAnonKey,
    SUPABASE_ANON_KEY_LENGTH: supabaseAnonKey ? supabaseAnonKey.length : 0,
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Environment variables are missing on the Vercel server. Make sure SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel Settings -> Environment Variables.',
      details: envs
    }, { status: 200 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // minimal query to test connection to 'channels' table
    const { data, error } = await supabase
      .from('channels')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist, Supabase returns error code 'PGRST116' or relation error
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          status: 'PARTIAL_SUCCESS',
          message: 'Koneksi ke Supabase BERHASIL, tetapi tabel "channels" belum dibuat di database Anda.',
          remedy: 'Silakan buka Dashboard Supabase -> SQL Editor, buat query baru, lalu salin dan jalankan seluruh isi file "supabase/schema.sql" Anda untuk membuat tabel dan kebijakan keamanannya.',
          details: {
            error_code: error.code,
            error_message: error.message,
            envs
          }
        }, { status: 200 });
      }
      
      return NextResponse.json({
        status: 'CONNECTION_ERROR',
        message: 'Koneksi ke host Supabase terhubung, tetapi query gagal dijalankan.',
        details: {
          error_code: error.code,
          error_message: error.message,
          envs
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Koneksi ke Supabase BERHASIL dan tabel "channels" siap digunakan!',
      details: {
        message: 'Database is working properly.',
        envs
      }
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({
      status: 'CRASH',
      message: 'Gagal melakukan inisialisasi client Supabase.',
      details: {
        error: e?.message || String(e),
        envs
      }
    }, { status: 200 });
  }
}
