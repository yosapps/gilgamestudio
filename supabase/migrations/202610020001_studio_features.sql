begin;
alter table public.posts add column game_id uuid references public.games(id) on delete set null;
create index posts_game_id on public.posts(game_id);
alter table public.games add column primary_action text not null default 'auto' check (primary_action in ('auto','wishlist','demo','buy','none'));
alter table public.games add column primary_url text not null default '' check (primary_url = '' or primary_url ~ '^https://');
alter table public.site_settings add column press_guidelines text not null default '';
alter table public.site_settings add column press_guidelines_en text not null default '';
alter table public.posts add column source_revision integer not null default 1;
alter table public.games add column source_revision integer not null default 1;
alter table public.post_translations add column source_revision integer not null default 0;
alter table public.game_translations add column source_revision integer not null default 0;
-- Only changes to translatable copy make the translation stale.
create function public.advance_content_revision() returns trigger language plpgsql set search_path = '' as $$
begin
 if tg_table_name = 'posts' then
  if (new.title,new.excerpt,new.content,new.category,new.tags,new.seo_title,new.seo_description) is distinct from (old.title,old.excerpt,old.content,old.category,old.tags,old.seo_title,old.seo_description) then new.source_revision := old.source_revision + 1; else new.source_revision := old.source_revision; end if;
 else
  if (new.title,new.description,new.body,new.genre,new.tags,new.external_links) is distinct from (old.title,old.description,old.body,old.genre,old.tags,old.external_links) then new.source_revision := old.source_revision + 1; else new.source_revision := old.source_revision; end if;
 end if;
 return new;
end $$;
create trigger advance_revision before update on public.posts for each row execute function public.advance_content_revision();
create trigger advance_revision before update on public.games for each row execute function public.advance_content_revision();
create function public.track_translation_revision() returns trigger language plpgsql set search_path = '' as $$
declare current_revision integer;
begin
 if tg_table_name = 'post_translations' then select source_revision into current_revision from public.posts where id = new.post_id;
 else select source_revision into current_revision from public.games where id = new.game_id; end if;
 if current_revision is null then return new; end if;
 if new.source_revision <> 0 and new.source_revision <> current_revision then raise exception 'translation_source_changed' using errcode = 'P0001'; end if;
 new.source_revision := current_revision;
 return new;
end $$;
-- Existing translations are marked current only when saved after their source.
update public.post_translations t set source_revision = p.source_revision from public.posts p where p.id = t.post_id and t.updated_at >= p.updated_at;
update public.game_translations t set source_revision = g.source_revision from public.games g where g.id = t.game_id and t.updated_at >= g.updated_at;
create trigger track_source_revision before insert or update on public.post_translations for each row execute function public.track_translation_revision();
create trigger track_source_revision before insert or update on public.game_translations for each row execute function public.track_translation_revision();
commit;
