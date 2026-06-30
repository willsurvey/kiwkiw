import { supabase, isSupabaseConfigured } from './supabase';
import { detectStreamType } from './utils';

export interface Channel {
  id: string;
  name: string;
  category: string;
  stream_url: string;
  stream_type: 'hls' | 'iframe' | 'mp4' | 'youtube';
  logo_url?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

// Default seed channels for initial display and fallback
export const SEED_CHANNELS: Channel[] = [
  {
    id: 'seed-sintel',
    name: 'Sintel Live Stream (HLS)',
    category: 'Movies',
    stream_url: 'https://multiplatform-f.akamaihd.net/i/multi/will/sintel/pc-sintel_,1,2,3,10,00k.mp4.csmil/master.m3u8',
    stream_type: 'hls',
    logo_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-bbb',
    name: 'Big Buck Bunny (HLS)',
    category: 'Cartoons',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    stream_type: 'hls',
    logo_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-tos',
    name: 'Tears of Steel (HLS)',
    category: 'Sci-Fi',
    stream_url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    stream_type: 'hls',
    logo_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-ed',
    name: 'Elephant Dream (MP4 Direct)',
    category: 'Movies',
    stream_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    stream_type: 'mp4',
    logo_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-lofi',
    name: 'Lofi Girl (YouTube)',
    category: 'Music',
    stream_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    stream_type: 'youtube',
    logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'seed-iframe',
    name: 'Giphy Sandbox (Iframe Embed)',
    category: 'Web',
    stream_url: 'https://giphy.com/embed/3o72F8tGPvK4QQMtmM',
    stream_type: 'iframe',
    logo_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=120&fit=crop',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'iptv_channels';

// Helper to get client-side local storage channels
function getLocalStorageChannels(): Channel[] {
  if (typeof window === 'undefined') return SEED_CHANNELS;
  
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_CHANNELS));
    return SEED_CHANNELS;
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse localStorage channels:', e);
    return SEED_CHANNELS;
  }
}

// Helper to save client-side local storage channels
function saveLocalStorageChannels(channels: Channel[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(channels));
}

export async function getChannels(): Promise<Channel[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) {
        console.error('Supabase getChannels error, falling back to localStorage:', error);
        return getLocalStorageChannels();
      }
      return data || [];
    } catch (e) {
      console.error('Supabase fetch failed, falling back to localStorage:', e);
      return getLocalStorageChannels();
    }
  }
  
  return getLocalStorageChannels();
}

export async function addChannel(channelData: Omit<Channel, 'id' | 'created_at'>): Promise<Channel> {
  const streamType = detectStreamType(channelData.stream_url);
  
  const newChannel: Channel = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    name: channelData.name,
    category: channelData.category,
    stream_url: channelData.stream_url,
    stream_type: streamType,
    logo_url: channelData.logo_url || `https://images.unsplash.com/photo-1542204172-e7052809a86e?w=120&h=120&fit=crop`,
    status: channelData.status,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // Omit id if Supabase uses auto-generated UUID
      const { data, error } = await supabase
        .from('channels')
        .insert([{
          name: newChannel.name,
          category: newChannel.category,
          stream_url: newChannel.stream_url,
          stream_type: newChannel.stream_type,
          logo_url: newChannel.logo_url,
          status: newChannel.status
        }])
        .select();

      if (error) {
        console.error('Supabase addChannel error, saving to localStorage:', error);
      } else if (data && data[0]) {
        return data[0] as Channel;
      }
    } catch (e) {
      console.error('Supabase insert failed, saving to localStorage:', e);
    }
  }

  // Fallback to localStorage
  const channels = getLocalStorageChannels();
  channels.push(newChannel);
  saveLocalStorageChannels(channels);
  return newChannel;
}

export async function updateChannel(id: string, channelData: Partial<Channel>): Promise<Channel> {
  if (channelData.stream_url) {
    channelData.stream_type = detectStreamType(channelData.stream_url);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('channels')
        .update(channelData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase updateChannel error, updating in localStorage:', error);
      } else if (data && data[0]) {
        return data[0] as Channel;
      }
    } catch (e) {
      console.error('Supabase update failed, updating in localStorage:', e);
    }
  }

  // Fallback to localStorage
  const channels = getLocalStorageChannels();
  const index = channels.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Channel not found');
  }

  const updatedChannel = {
    ...channels[index],
    ...channelData,
  } as Channel;

  channels[index] = updatedChannel;
  saveLocalStorageChannels(channels);
  return updatedChannel;
}

export async function deleteChannel(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase deleteChannel error, deleting from localStorage:', error);
      } else {
        return true;
      }
    } catch (e) {
      console.error('Supabase delete failed, deleting from localStorage:', e);
    }
  }

  // Fallback to localStorage
  const channels = getLocalStorageChannels();
  const filtered = channels.filter(c => c.id !== id);
  if (channels.length === filtered.length) {
    return false;
  }
  saveLocalStorageChannels(filtered);
  return true;
}
