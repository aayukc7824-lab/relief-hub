create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.is_relief_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_relief_admin() from public, anon;
grant execute on function public.is_relief_admin() to authenticated;

create table public.missing_reports (
  id uuid primary key default gen_random_uuid(),
  person_name text not null check (char_length(person_name) between 2 and 100),
  approximate_age smallint check (approximate_age between 0 and 120),
  district text not null check (district in ('Rasuwa', 'Nuwakot', 'Dhading')),
  last_seen_location text not null check (char_length(last_seen_location) between 2 and 160),
  last_seen_at timestamptz not null,
  description text not null check (char_length(description) between 10 and 1200),
  reporter_name text not null check (char_length(reporter_name) between 2 and 100),
  reporter_phone text not null check (char_length(reporter_phone) between 7 and 30),
  reporter_email text check (reporter_email is null or char_length(reporter_email) <= 254),
  consent_to_store boolean not null check (consent_to_store),
  publication_consent boolean not null default false,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'reviewed', 'verified', 'resolved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index missing_reports_review_idx
  on public.missing_reports (status, created_at desc);

create table public.missing_public_notices (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.missing_reports (id) on delete cascade,
  public_name text not null check (char_length(public_name) between 2 and 80),
  district text not null check (district in ('Rasuwa', 'Nuwakot', 'Dhading')),
  approximate_area text not null check (char_length(approximate_area) between 2 and 100),
  last_seen_on date not null,
  last_verified_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.volunteer_offers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 30),
  email text check (email is null or char_length(email) <= 254),
  offer_type text not null
    check (offer_type in ('volunteer', 'supplies', 'medical', 'transport', 'other')),
  district text not null check (district in ('Rasuwa', 'Nuwakot', 'Dhading')),
  availability text not null check (char_length(availability) between 2 and 120),
  details text not null check (char_length(details) between 10 and 1000),
  consent_to_contact boolean not null check (consent_to_contact),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'contacted', 'closed')),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index volunteer_offers_review_idx
  on public.volunteer_offers (status, created_at desc);

create table public.submission_rate_limits (
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  form_name text not null check (form_name in ('missing_report', 'volunteer_offer')),
  bucket_start timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (ip_hash, form_name, bucket_start)
);

create table public.relief_camps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  district text not null check (district in ('Rasuwa', 'Nuwakot', 'Dhading')),
  locality text not null check (char_length(locality) between 2 and 160),
  capacity integer check (capacity is null or capacity >= 0),
  current_occupancy integer check (
    current_occupancy is null or current_occupancy >= 0
  ),
  supplies_summary text not null check (char_length(supplies_summary) between 2 and 500),
  status text not null check (status in ('open', 'limited', 'closed')),
  public_notes text check (public_notes is null or char_length(public_notes) <= 500),
  last_verified_at timestamptz not null default now(),
  published boolean not null default false,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  check (
    capacity is null
    or current_occupancy is null
    or current_occupancy <= capacity
  )
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger missing_reports_set_updated_at
  before update on public.missing_reports
  for each row execute function public.set_updated_at();

create trigger volunteer_offers_set_updated_at
  before update on public.volunteer_offers
  for each row execute function public.set_updated_at();

create trigger relief_camps_set_updated_at
  before update on public.relief_camps
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;
alter table public.missing_reports enable row level security;
alter table public.missing_public_notices enable row level security;
alter table public.volunteer_offers enable row level security;
alter table public.relief_camps enable row level security;
alter table public.submission_rate_limits enable row level security;

create policy "Users can view their own admin assignment"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins can read missing reports"
  on public.missing_reports for select to authenticated
  using ((select public.is_relief_admin()));

create policy "Admins can update missing reports"
  on public.missing_reports for update to authenticated
  using ((select public.is_relief_admin()))
  with check ((select public.is_relief_admin()));

create policy "Admins can delete missing reports"
  on public.missing_reports for delete to authenticated
  using ((select public.is_relief_admin()));

create policy "Admins can read public notice records"
  on public.missing_public_notices for select to authenticated
  using ((select public.is_relief_admin()));

create policy "Admins can read volunteer offers"
  on public.volunteer_offers for select to authenticated
  using ((select public.is_relief_admin()));

create policy "Admins can update volunteer offers"
  on public.volunteer_offers for update to authenticated
  using ((select public.is_relief_admin()))
  with check ((select public.is_relief_admin()));

create policy "Admins can delete volunteer offers"
  on public.volunteer_offers for delete to authenticated
  using ((select public.is_relief_admin()));

create policy "Admins can read relief camps"
  on public.relief_camps for select to authenticated
  using ((select public.is_relief_admin()));

revoke all on table
  public.admin_users,
  public.missing_reports,
  public.missing_public_notices,
  public.volunteer_offers,
  public.relief_camps
from anon, authenticated;
revoke all on table public.submission_rate_limits from anon, authenticated;
grant all on table public.submission_rate_limits to service_role;

grant select on public.admin_users to authenticated;
grant select, update, delete on public.missing_reports to authenticated;
grant select on public.missing_public_notices to authenticated;
grant select, update, delete on public.volunteer_offers to authenticated;
grant select on public.relief_camps to authenticated;

create view public.active_missing_notices
with (security_barrier = true)
as
select
  id,
  public_name,
  district,
  approximate_area,
  last_seen_on,
  last_verified_at
from public.missing_public_notices
where is_active
  and last_verified_at >= now() - interval '72 hours';

create view public.active_relief_camps
with (security_barrier = true)
as
select
  id,
  name,
  district,
  locality,
  capacity,
  current_occupancy,
  supplies_summary,
  status,
  public_notes,
  last_verified_at
from public.relief_camps
where published
  and status <> 'closed'
  and last_verified_at >= now() - interval '24 hours';

grant select on public.active_missing_notices to anon, authenticated;
grant select on public.active_relief_camps to anon, authenticated;

create function public.publish_missing_report(
  p_report_id uuid,
  p_public_name text,
  p_district text,
  p_approximate_area text,
  p_last_seen_on date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_consent boolean;
  report_age smallint;
  report_status text;
begin
  if not public.is_relief_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;

  select publication_consent, approximate_age, status
    into report_consent, report_age, report_status
    from public.missing_reports
    where id = p_report_id
    for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Report not found';
  end if;

  if not report_consent or report_age is null or report_age < 18 then
    raise exception using errcode = '42501',
      message = 'Public notices require separate consent and an adult subject';
  end if;
  if report_status in ('resolved', 'rejected') then
    raise exception using errcode = '42501',
      message = 'Resolved or rejected reports cannot be published';
  end if;

  if p_district not in ('Rasuwa', 'Nuwakot', 'Dhading')
    or char_length(trim(p_public_name)) not between 2 and 80
    or char_length(trim(p_approximate_area)) not between 2 and 100 then
    raise exception using errcode = '22023', message = 'Invalid public notice details';
  end if;

  insert into public.missing_public_notices (
    report_id,
    public_name,
    district,
    approximate_area,
    last_seen_on,
    last_verified_at,
    is_active
  )
  values (
    p_report_id,
    trim(p_public_name),
    p_district,
    trim(p_approximate_area),
    p_last_seen_on,
    now(),
    true
  )
  on conflict (report_id) do update set
    public_name = excluded.public_name,
    district = excluded.district,
    approximate_area = excluded.approximate_area,
    last_seen_on = excluded.last_seen_on,
    last_verified_at = now(),
    is_active = true;

  update public.missing_reports
    set status = 'verified', updated_at = now()
    where id = p_report_id;
end;
$$;

create function public.resolve_missing_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_relief_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;

  update public.missing_reports
    set status = 'resolved', updated_at = now()
    where id = p_report_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Report not found';
  end if;

  update public.missing_public_notices
    set is_active = false, last_verified_at = now()
    where report_id = p_report_id;
end;
$$;

create function public.save_relief_camp(
  p_id uuid,
  p_name text,
  p_district text,
  p_locality text,
  p_capacity integer,
  p_current_occupancy integer,
  p_supplies_summary text,
  p_status text,
  p_public_notes text,
  p_confirmed_verified boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not public.is_relief_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  if p_confirmed_verified is not true then
    raise exception using errcode = '42501', message = 'Verification confirmation required';
  end if;

  if p_id is null then
    insert into public.relief_camps (
      name, district, locality, capacity, current_occupancy,
      supplies_summary, status, public_notes, last_verified_at,
      published, updated_by
    )
    values (
      trim(p_name), p_district, trim(p_locality), p_capacity,
      p_current_occupancy, trim(p_supplies_summary), p_status,
      nullif(trim(p_public_notes), ''), now(), p_status <> 'closed',
      (select auth.uid())
    )
    returning id into saved_id;
  else
    update public.relief_camps
      set name = trim(p_name),
          district = p_district,
          locality = trim(p_locality),
          capacity = p_capacity,
          current_occupancy = p_current_occupancy,
          supplies_summary = trim(p_supplies_summary),
          status = p_status,
          public_notes = nullif(trim(p_public_notes), ''),
          last_verified_at = now(),
          published = p_status <> 'closed',
          updated_by = (select auth.uid())
      where id = p_id
      returning id into saved_id;

    if not found then
      raise exception using errcode = 'P0002', message = 'Shelter record not found';
    end if;
  end if;
  return saved_id;
end;
$$;

create function public.unpublish_relief_camp(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_relief_admin() then
    raise exception using errcode = '42501', message = 'Admin access required';
  end if;
  update public.relief_camps
    set published = false, last_verified_at = now()
    where id = p_id;
  if not found then
    raise exception using errcode = 'P0002', message = 'Shelter record not found';
  end if;
end;
$$;

revoke all on function public.publish_missing_report(uuid, text, text, text, date)
  from public, anon;
revoke all on function public.resolve_missing_report(uuid)
  from public, anon;
revoke all on function public.save_relief_camp(uuid, text, text, text, integer, integer, text, text, text, boolean)
  from public, anon;
revoke all on function public.unpublish_relief_camp(uuid)
  from public, anon;
grant execute on function public.publish_missing_report(uuid, text, text, text, date)
  to authenticated;
grant execute on function public.resolve_missing_report(uuid)
  to authenticated;
grant execute on function public.save_relief_camp(uuid, text, text, text, integer, integer, text, text, text, boolean)
  to authenticated;
grant execute on function public.unpublish_relief_camp(uuid)
  to authenticated;

create function public.consume_submission_rate_limit(
  p_ip_hash text,
  p_form_name text,
  p_bucket_start timestamptz,
  p_hourly_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request_count integer;
begin
  if (select auth.role()) <> 'service_role'
    or p_ip_hash !~ '^[0-9a-f]{64}$'
    or p_form_name not in ('missing_report', 'volunteer_offer')
    or p_hourly_limit not between 1 and 10
    or p_bucket_start < now() - interval '2 hours'
    or p_bucket_start > now() then
    raise exception using errcode = '42501', message = 'Invalid rate limit request';
  end if;

  delete from public.submission_rate_limits
    where bucket_start < now() - interval '1 day';

  insert into public.submission_rate_limits (
    ip_hash,
    form_name,
    bucket_start,
    request_count
  )
  values (p_ip_hash, p_form_name, p_bucket_start, 1)
  on conflict (ip_hash, form_name, bucket_start)
  do update set request_count = submission_rate_limits.request_count + 1
  returning submission_rate_limits.request_count into current_request_count;

  return current_request_count <= p_hourly_limit;
end;
$$;

revoke all on function public.consume_submission_rate_limit(text, text, timestamptz, integer)
  from public, anon, authenticated;
grant execute on function public.consume_submission_rate_limit(text, text, timestamptz, integer)
  to service_role;
