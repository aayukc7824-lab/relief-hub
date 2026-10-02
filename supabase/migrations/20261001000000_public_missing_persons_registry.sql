-- Expose only active, time-limited public notices in the missing_persons
-- registry. Private reports remain in missing_reports behind admin RLS.
create view public.missing_persons
with (security_barrier = true)
as
select
  id,
  public_name,
  district,
  approximate_area,
  last_seen_on,
  last_verified_at
from public.active_missing_notices;

grant select on public.missing_persons to anon, authenticated;
