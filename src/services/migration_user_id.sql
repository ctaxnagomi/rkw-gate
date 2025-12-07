-- Add user_id to portfolio_config
alter table portfolio_config 
add column if not exists user_id uuid references auth.users(id);

-- Update RLS policies
drop policy if exists "Enable all access for portfolio_config" on portfolio_config;

-- READ: Public can read all (for Visitor View)
create policy "Public Read Access" on portfolio_config 
for select using (true);

-- INSERT: Authenticated users can insert their OWN rows
create policy "User Insert Own" on portfolio_config 
for insert with check (auth.uid() = user_id);

-- UPDATE: Authenticated users can update their OWN rows
create policy "User Update Own" on portfolio_config 
for update using (auth.uid() = user_id);
