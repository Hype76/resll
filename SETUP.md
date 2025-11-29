# Resll - Supabase Setup Guide

## 1. Create Project
Go to [Supabase.com](https://supabase.com), create a new project, and get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

## 2. SQL Setup
Run the following SQL in the Supabase **SQL Editor** to create the tables and security policies.

```sql
-- Enable Row Level Security (RLS)
-- This ensures users can ONLY see their own data.

-- 1. PROFILES TABLE
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  plan text default 'free', -- 'free', 'pro', 'enterprise'
  scans_used int default 0,
  scans_limit int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Trigger to create profile on Signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SCANS (HISTORY) TABLE
create table scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  title text,
  brand text,
  estimated_price_high numeric,
  thumbnail_url text,
  full_result jsonb, -- Stores the entire Gemini JSON output
  profit_potential text
);
alter table scans enable row level security;
create policy "Users can view own scans" on scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on scans for insert with check (auth.uid() = user_id);
create policy "Users can delete own scans" on scans for delete using (auth.uid() = user_id);

-- 3. USER SETTINGS TABLE
create table user_settings (
  user_id uuid references auth.users not null primary key,
  default_condition text default 'Good',
  default_shipping_cost numeric default 3.50,
  default_fee_rate numeric default 12.8,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table user_settings enable row level security;
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings update" on user_settings for update using (auth.uid() = user_id);

-- 4. STORAGE BUCKET
-- You must create a new Bucket named 'scan_images' in the Storage menu.
-- Then run this policy to allow users to upload/view their images.
insert into storage.buckets (id, name, public) values ('scan_images', 'scan_images', true);

create policy "Users can upload scan images" on storage.objects
  for insert with check (bucket_id = 'scan_images' and auth.role() = 'authenticated');

create policy "Users can view scan images" on storage.objects
  for select using (bucket_id = 'scan_images');
```

## 3. Environment Variables
Create a `.env` file in your project root (or configure via your hosting provider):

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
API_KEY=your_google_gemini_key
```

## 4. Auth Configuration
In Supabase > Authentication > Providers:
- Enable "Email/Password".
- Disable "Confirm Email" if you want users to log in immediately (easier for testing).
