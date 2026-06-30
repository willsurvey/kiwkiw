-- SQL Schema for IPTV Channels Table

-- Create channels table
create table if not exists channels (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,
  stream_url text not null,
  stream_type text not null, -- 'hls', 'iframe', 'mp4', 'youtube'
  logo_url text,
  status text default 'active', -- 'active', 'inactive'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable row-level security (RLS)
alter table channels enable row level security;

-- Policy: Allow read access to everyone
create policy "Allow public read access" on channels
  for select using (true);

-- Policy: Allow write/update/delete access to authenticated users (admin)
create policy "Allow write access to authenticated users" on channels
  for all using (auth.role() = 'authenticated');
