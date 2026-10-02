create table public.portfolio_admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portfolio_admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public, anon;
grant execute on function public.is_portfolio_admin() to authenticated;

create table public.portfolio_content (
  id text primary key check (id = 'main'),
  content jsonb not null
    check (jsonb_typeof(content) = 'object' and char_length(content::text) <= 20000),
  updated_at timestamptz not null default now()
);

create trigger portfolio_content_set_updated_at
  before update on public.portfolio_content
  for each row execute function public.set_updated_at();

insert into public.portfolio_content (id, content)
values (
  'main',
  '{
    "hero": {
      "titleLine1": "Thoughtful interfaces.",
      "titleLine2": "Reliable delivery.",
      "intro": "I’m Aayusha, a front-end developer focused on building polished, responsive digital experiences with clear business impact and strong product thinking.",
      "availability": "Available for product-focused roles"
    },
    "about": {
      "heading": "Front-end developer with a product mindset",
      "paragraph1": "I build responsive, user-centered interfaces that turn complex requirements into clear, practical experiences for clients and end users.",
      "paragraph2": "My work blends design thinking, front-end engineering, and iterative improvement—creating interfaces that are usable, maintainable, and ready for real-world product use."
    },
    "projects": {
      "reliefHub": {
        "title": "BhoteKoshi Relief Hub",
        "description": "A responsive community information and reporting portal designed for operational support, public updates, and structured client-facing information flow across affected areas."
      },
      "deepScan": {
        "title": "DeepScan",
        "description": "A team-based exploration into media authenticity and AI-assisted verification workflows, focused on evaluating detection approaches in a research and validation context."
      }
    }
  }'::jsonb
)
on conflict (id) do nothing;

alter table public.portfolio_admin_users enable row level security;
alter table public.portfolio_content enable row level security;

create policy "Portfolio editors can view their own assignment"
  on public.portfolio_admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Anyone can view published portfolio content"
  on public.portfolio_content for select to anon, authenticated
  using (true);

create policy "Portfolio editors can publish content"
  on public.portfolio_content for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

grant select on public.portfolio_admin_users to authenticated;
grant select on public.portfolio_content to anon, authenticated;
grant update on public.portfolio_content to authenticated;

alter publication supabase_realtime add table public.portfolio_content;
