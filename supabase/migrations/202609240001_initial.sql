begin;
create extension if not exists pgcrypto;
create table public.admin_users (id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
alter table public.admin_users enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.admin_users where id = (select auth.uid())); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
create policy admin_self_read on public.admin_users for select to authenticated using (id=(select auth.uid()));
-- No client INSERT/UPDATE/DELETE policy: grant membership only in SQL Dashboard.
create table public.posts (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 200), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), excerpt text not null default '', content jsonb not null default '{"type":"doc","content":[]}', cover_url text not null default '', category text not null default '', tags text[] not null default '{}',
 status text not null default 'draft' check(status in ('draft','published','scheduled','archived')), published_at timestamptz, seo_title text not null default '', seo_description text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(status not in ('published','scheduled') or published_at is not null)
);
create index posts_public_date on public.posts(status,published_at desc);
create index posts_tags on public.posts using gin(tags);
create index posts_category on public.posts(category);
create table public.post_categories (id uuid primary key default gen_random_uuid(),name text not null unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.post_tags (id uuid primary key default gen_random_uuid(),name text not null unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.games (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 200), slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), description text not null default '', body text not null default '', cover_url text not null default '', genre text not null default '', development_status text not null default '開発中' check(development_status in ('開発中','プロトタイプ','リリース済み','開発休止')), status text not null default 'draft' check(status in ('draft','published','archived')), sort_order integer not null default 0 check(sort_order>=0), release_date date, tags text[] not null default '{}', technologies text[] not null default '{}', screenshots text[] not null default '{}', trailer_url text not null default '', external_links jsonb not null default '[]', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index games_public_order on public.games(status,sort_order);
create table public.game_images(id uuid primary key default gen_random_uuid(),game_id uuid not null references public.games(id) on delete cascade,url text not null,alt text not null default '',sort_order integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(game_id,sort_order));
create index game_images_game on public.game_images(game_id);
create table public.media(id uuid primary key default gen_random_uuid(),path text not null unique,url text not null,name text not null,mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp')),size bigint not null check(size between 1 and 4194304),created_by uuid references auth.users(id) on delete set null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index media_created on public.media(created_at desc);
create table public.site_settings(id integer primary key check(id=1),site_name text not null default 'YOS STUDIO',description text not null default '',profile text not null default '',og_image text not null default '',social_links jsonb not null default '[]',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
insert into public.site_settings(id,description,profile) values(1,'まだ見たことのない世界を、小さなスタジオから。','遊びの中に、忘れられない瞬間を。心に余韻が残るゲームをつくっています。');
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end $$;
do $$ declare t text; begin foreach t in array array['posts','games','post_categories','post_tags','game_images','media','site_settings'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy admin_all on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
 execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
end loop; end $$;
create policy published_posts on public.posts for select to anon,authenticated using(status in ('published','scheduled') and published_at<=now());
create policy published_games on public.games for select to anon,authenticated using(status='published');
create policy published_images on public.game_images for select to anon,authenticated using(exists(select 1 from public.games where games.id=game_id and games.status='published'));
create policy public_settings on public.site_settings for select to anon,authenticated using(true);
create policy public_categories on public.post_categories for select to anon,authenticated using(exists(select 1 from public.posts p where p.category=name and p.status in ('published','scheduled') and p.published_at<=now()));
create policy public_tags on public.post_tags for select to anon,authenticated using(exists(select 1 from public.posts p where name=any(p.tags) and p.status in ('published','scheduled') and p.published_at<=now()));
-- Keep taxonomy and image index in the same transaction as parent content.
create or replace function public.sync_post_taxonomy() returns trigger language plpgsql set search_path='' as $$ begin
 if new.category<>'' then insert into public.post_categories(name) values(new.category) on conflict(name) do nothing;end if;
 insert into public.post_tags(name) select distinct unnest(new.tags) on conflict(name) do nothing;return new;
end $$;
create trigger sync_taxonomy after insert or update on public.posts for each row execute function public.sync_post_taxonomy();
create or replace function public.sync_game_images() returns trigger language plpgsql set search_path='' as $$ begin
 delete from public.game_images where game_id=new.id;
 insert into public.game_images(game_id,url,alt,sort_order) select new.id,u,new.title||' スクリーンショット '||n,(n-1)::integer from unnest(new.screenshots) with ordinality as images(u,n);return new;
end $$;
create trigger sync_images after insert or update of screenshots,title on public.games for each row execute function public.sync_game_images();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,4194304,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set file_size_limit=4194304,allowed_mime_types=excluded.allowed_mime_types;
create policy admin_storage_insert on storage.objects for insert to authenticated with check(bucket_id='media' and (select public.is_admin()));
create policy admin_storage_select on storage.objects for select to authenticated using(bucket_id='media' and (select public.is_admin()));
create policy admin_storage_update on storage.objects for update to authenticated using(bucket_id='media' and (select public.is_admin())) with check(bucket_id='media' and (select public.is_admin()));
create policy admin_storage_delete on storage.objects for delete to authenticated using(bucket_id='media' and (select public.is_admin()));
grant select on public.posts,public.games,public.site_settings,public.post_categories,public.post_tags,public.game_images to anon;
grant select,insert,update,delete on public.posts,public.games,public.site_settings,public.post_categories,public.post_tags,public.game_images,public.media to authenticated;
grant select on public.admin_users to authenticated;
commit;
