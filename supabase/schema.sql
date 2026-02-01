-- Run this in Supabase Dashboard → SQL Editor to create the users table and RLS.
-- The table stores subscription state synced from Stripe webhooks.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  subscription_status text default 'inactive' check (subscription_status in ('inactive', 'active', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Service role (e.g. webhooks) needs to insert/update by user id; use a policy that allows
-- updates from the service role or from the user. For webhooks we'll use the service role key
-- in API route, so we need allow insert and update for the anon/authenticated role when
-- the row is being updated by a trusted server. Supabase RLS: service role bypasses RLS.
-- So from the Next.js API we use the anon key with the user's JWT for user operations,
-- and for webhooks we need to update by user id. Option: create a database function
-- invoked with SECURITY DEFINER that updates users by id, and call it from the webhook with
-- the service role key. Simpler: allow insert for authenticated users (so signup can insert),
-- and allow update where auth.uid() = id OR we use a server-side client with service role.
-- Plan says: "use a trigger or Edge Function to insert row on auth.users signup".
-- So we insert the row on signup via trigger; then only the user and the webhook (service role) need update.
-- Trigger to create a row in public.users when a new auth.users row is created:
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, updated_at)
  values (new.id, new.email, now())
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Allow service role to update any user (for webhooks). With default RLS, only the user can update their row.
-- Webhook runs in Next.js with Supabase client. If we use anon key + user JWT we can't update another user.
-- So we need either: 1) use service role key in Next.js for webhook only, or 2) add a policy that allows
-- updates when the request has a special header/secret. Best practice: use Supabase service role key
-- only in the webhook route (server-side, never exposed). Then in Next.js we need a second client
-- with service role for the webhook. Add policy: allow update if true for service role (service role
-- bypasses RLS in Supabase). So we just need to use the service key in the webhook route.
-- No extra policy needed for service role.
-- For insert: the trigger runs as security definer so it inserts as the function owner (superuser).
-- Done.
comment on table public.users is 'User profiles and subscription state; synced from Stripe webhooks.';
