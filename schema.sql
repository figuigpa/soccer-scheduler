-- Run in Supabase SQL editor (project ulokpqtouottaflqjwcp)
create extension if not exists pgcrypto;

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);
alter table players add column if not exists category text default 'adult' check (category in ('adult','kid'));
create table if not exists practices (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  location text,
  field_address text,
  field_map_url text,
  notes text,
  created_at timestamptz default now()
);
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid references practices(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  status text not null default 'maybe' check (status in ('maybe','available','unavailable','injured')),
  created_at timestamptz default now(),
  unique (practice_id, player_id)
);
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  time time,
  venue_name text,
  venue_address text,
  venue_map_url text,
  notes text,
  created_at timestamptz default now()
);
create table if not exists volunteer_items (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid references practices(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  item text not null,
  quantity text,
  volunteer_name text,
  created_at timestamptz default now()
);
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  task text not null,
  assignee text,
  done boolean default false,
  created_at timestamptz default now()
);
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  body text not null,
  created_at timestamptz default now()
);
create table if not exists lineup_positions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade unique,
  x float not null,
  y float not null,
  updated_at timestamptz default now()
);

do $$
declare t text;
begin
  foreach t in array array['players','practices','availability','events','volunteer_items','assignments','chat_messages','lineup_positions'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "open" on %I', t);
    execute format('create policy "open" on %I for all using (true) with check (true)', t);
  end loop;
end $$;

alter publication supabase_realtime add table chat_messages;

-- Polls
create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  created_at timestamptz default now()
);
create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  text text not null,
  position int default 0
);
create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  option_id uuid references poll_options(id) on delete cascade,
  voter text not null,
  created_at timestamptz default now(),
  unique(poll_id, voter)
);
do $$
declare t text;
begin
  foreach t in array array['polls','poll_options','poll_votes'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "open" on %I', t);
    execute format('create policy "open" on %I for all using (true) with check (true)', t);
  end loop;
end $$;

create table if not exists team_settings (
  id int primary key check (id = 1),
  name text not null
);
insert into team_settings (id, name) values (1, 'Figuig PA') on conflict (id) do nothing;
alter table team_settings enable row level security;
drop policy if exists "open" on team_settings;
create policy "open" on team_settings for all using (true) with check (true);
alter publication supabase_realtime add table team_settings;

-- Chat admins (WhatsApp-style): any number of admins
create table if not exists chat_admins (
  name text primary key,
  created_at timestamptz default now()
);
alter table chat_admins enable row level security;
drop policy if exists "open" on chat_admins;
create policy "open" on chat_admins for all using (true) with check (true);
alter publication supabase_realtime add table chat_admins;

-- Team picture
alter table team_settings add column if not exists picture_url text;
insert into storage.buckets (id, name, public) values ('team-assets', 'team-assets', true) on conflict (id) do update set public = true;
drop policy if exists "team-assets read" on storage.objects;
drop policy if exists "team-assets upload" on storage.objects;
create policy "team-assets read" on storage.objects for select using (bucket_id = 'team-assets');
create policy "team-assets upload" on storage.objects for insert with check (bucket_id = 'team-assets');

-- Photo album (image bytes live in Backblaze B2; url/thumb_url hold the B2 object key)
create table if not exists photos (
  id uuid primary key,
  url text not null,
  thumb_url text,
  uploader text,
  caption text,
  created_at timestamptz default now()
);
alter table photos enable row level security;
drop policy if exists "open" on photos;
create policy "open" on photos for all using (true) with check (true);
alter publication supabase_realtime add table photos;
-- Chat images/voice are stored in chat_messages.body as "[img]<key>" / "[voice]<key>|<seconds>": no ALTER TABLE needed.

-- Photo albums (event-based). Photos with NULL album_id show in an "Unsorted" album.
create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  game_id uuid references practices(id) on delete set null,
  created_at timestamptz default now()
);
alter table photos add column if not exists album_id uuid references albums(id) on delete set null;
alter table albums enable row level security;
drop policy if exists "open" on albums;
create policy "open" on albums for all using (true) with check (true);
alter publication supabase_realtime add table albums;
