begin;

-- English copy shares the parent's slug, media, release date and publication schedule.
create table public.post_translations (
  post_id uuid primary key references public.posts(id) on delete cascade,
  locale text not null default 'en' check (locale = 'en'),
  title text not null check (length(btrim(title)) between 1 and 200),
  excerpt text not null default '' check (length(excerpt) <= 500),
  content jsonb not null default '{"type":"doc","content":[]}' check (content->>'type' = 'doc'),
  category text not null default '' check (length(category) <= 80),
  tags text[] not null default '{}',
  seo_title text not null default '' check (length(seo_title) <= 200),
  seo_description text not null default '' check (length(seo_description) <= 500),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.game_translations (
  game_id uuid primary key references public.games(id) on delete cascade,
  locale text not null default 'en' check (locale = 'en'),
  title text not null check (length(btrim(title)) between 1 and 200),
  description text not null default '' check (length(description) <= 500),
  body text not null default '' check (length(body) <= 50000),
  genre text not null default '' check (length(genre) <= 80),
  tags text[] not null default '{}',
  external_links jsonb not null default '[]' check (jsonb_typeof(external_links) = 'array'),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.post_translations enable row level security;
alter table public.game_translations enable row level security;

create policy admin_translations on public.post_translations for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_translations on public.game_translations for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy published_translation on public.post_translations for select to anon, authenticated
  using (is_published and exists (
    select 1 from public.posts p where p.id = post_id
      and p.status in ('published', 'scheduled') and p.published_at <= now()
  ));
create policy published_translation on public.game_translations for select to anon, authenticated
  using (is_published and exists (
    select 1 from public.games g where g.id = game_id and g.status = 'published'
  ));

create trigger touch_updated_at before update on public.post_translations
  for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.game_translations
  for each row execute function public.touch_updated_at();

revoke all on public.post_translations, public.game_translations from anon, authenticated;
grant select on public.post_translations, public.game_translations to anon;
grant select, insert, update, delete on public.post_translations, public.game_translations to authenticated;
grant all on public.post_translations, public.game_translations to service_role;

comment on table public.post_translations is 'English article copy. Public only when both this translation and its parent are published.';
comment on table public.game_translations is 'English game copy. Parent owns slug, media, release date and publication state.';
notify pgrst, 'reload schema';
commit;
