import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwmldtxvwjitducihlbk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxkdHh2d2ppdGR1Y2lobGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwOTMyMTEsImV4cCI6MjA4OTY2OTIxMX0.dTaLIg8jMTe-357HWRKzxe7sInCtuNSg4jqg0qOqOqQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Supabase SQL Schema ──────────────────────────────────────────────────────
// Run these in your Supabase SQL editor to set up the database:
//
// -- Gallery images (public portfolio)
// create table gallery (
//   id uuid primary key default gen_random_uuid(),
//   title text,
//   category text,       -- e.g. 'wedding', 'portrait', 'event'
//   image_url text not null,
//   featured boolean default false,
//   created_at timestamptz default now()
// );
//
// -- Services offered
// create table services (
//   id uuid primary key default gen_random_uuid(),
//   title text not null,
//   description text,
//   price_from numeric,
//   duration text,
//   image_url text,
//   features text[],
//   created_at timestamptz default now()
// );
//
// -- Client gallery access (password-protected per client)
// create table client_galleries (
//   id uuid primary key default gen_random_uuid(),
//   client_name text not null,
//   event_name text,
//   event_date date,
//   access_code text not null unique,
//   cover_image text,
//   created_at timestamptz default now()
// );
//
// -- Photos inside client galleries
// create table client_photos (
//   id uuid primary key default gen_random_uuid(),
//   gallery_id uuid references client_galleries(id) on delete cascade,
//   image_url text not null,
//   caption text,
//   created_at timestamptz default now()
// );
//
// -- Contact / booking inquiries
// create table inquiries (
//   id uuid primary key default gen_random_uuid(),
//   name text not null,
//   email text not null,
//   phone text,
//   event_type text,
//   event_date date,
//   message text,
//   created_at timestamptz default now()
// );
//
// -- Enable RLS and add policies as needed for production.
