-- RKW Gatekeeper Database Schema

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Clean up existing tables (Optional, for development)
drop table if exists audit_logs;
drop table if exists visitor_stats;
drop table if exists portfolio_config;
drop table if exists admin_config;

-- 3. Portfolio Configuration Table
create table portfolio_config (
  id uuid primary key default uuid_generate_v4(),
  active boolean default true,
  config_json jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. Admin Configuration Table
create table admin_config (
  id uuid primary key default uuid_generate_v4(),
  active boolean default true,
  config_json jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Audit Logs (Interviews)
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  timestamp timestamp with time zone default now(),
  question text,
  answer text,
  outcome text, -- 'GRANT', 'REJECT', 'PENDING'
  screenshot_url text, -- Base64 or URL
  session_id text,
  visitor_ip text
);

-- 6. Visitor Statistics
create table visitor_stats (
  id text primary key default 'main',
  browsers int default 0,
  recruiters int default 0,
  bots int default 0,
  last_updated timestamp with time zone default now()
);

-- 7. Row Level Security (RLS) - PUBLIC ACCESS FOR DEMO
-- In production, you would restrict Write access. 
-- For this "Gatekeeper" demo where the frontend logic drives it, we allow Anon inserts/updates.

alter table portfolio_config enable row level security;
alter table admin_config enable row level security;
alter table audit_logs enable row level security;
alter table visitor_stats enable row level security;

-- Allow anyone to READ config
create policy "Enable all access for portfolio_config" on portfolio_config for all using (true) with check (true);
create policy "Enable all access for admin_config" on admin_config for all using (true) with check (true);

-- Allow anyone to INSERT logs
create policy "Enable insert for audit_logs" on audit_logs for insert with check (true);
create policy "Enable read for audit_logs" on audit_logs for select using (true);

-- Allow anyone to UPDATE stats
create policy "Enable all access for visitor_stats" on visitor_stats for all using (true) with check (true);

-- 8. Seed Initial Data (Empty/Default)
insert into visitor_stats (id, browsers, recruiters, bots) values ('main', 0, 0, 0) on conflict (id) do nothing;
