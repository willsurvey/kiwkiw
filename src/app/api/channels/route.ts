import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { detectStreamType } from '@/lib/utils';

// Initialize Supabase on the server-side (where process.env.SUPABASE_URL is accessible)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.trim() !== '');

const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null;


// GET: Fetch all channels
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on the server', fallback: true }, { status: 200 });
  }

  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message, fallback: true }, { status: 200 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (e: unknown) {
    console.error('Database connection failed:', e);
    return NextResponse.json({ error: 'Database connection failed', fallback: true }, { status: 200 });
  }
}

// POST: Add new channel
export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on the server' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, category, stream_url, logo_url, status } = body;

    if (!name || !category || !stream_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const streamType = detectStreamType(stream_url);

    const { data, error } = await supabase
      .from('channels')
      .insert([{
        name,
        category,
        stream_url,
        stream_type: streamType,
        logo_url: logo_url || `https://images.unsplash.com/photo-1542204172-e7052809a86e?w=120&h=120&fit=crop`,
        status: status || 'active'
      }])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data?.[0] });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PUT: Update channel
export async function PUT(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on the server' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, name, category, stream_url, logo_url, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing channel ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (stream_url !== undefined) {
      updateData.stream_url = stream_url;
      updateData.stream_type = detectStreamType(stream_url);
    }
    if (logo_url !== undefined) updateData.logo_url = logo_url;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('channels')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data?.[0] });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Delete channel
export async function DELETE(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured on the server' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing channel ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
