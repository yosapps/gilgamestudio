\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.admin_users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into public.posts(title,slug,status,published_at) values
  ('Draft','translation-draft','draft',null),
  ('Future','translation-future','scheduled',now()+interval '1 day'),
  ('Due','translation-due','scheduled',now()-interval '1 day'),
  ('Live','translation-live','published',now()-interval '1 day'),
  ('Pending English','translation-pending','published',now()-interval '1 day');
insert into public.post_translations(post_id,title,is_published)
  select id, 'English ' || title, slug <> 'translation-pending' from public.posts where slug like 'translation-%';
insert into public.games(title,slug,status) values ('Draft','translation-game-draft','draft'),('Live','translation-game-live','published');
insert into public.game_translations(game_id,title,is_published) select id,'English '||title,true from public.games where slug like 'translation-game-%';
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  if (select count(*) from public.post_translations) <> 2 then raise exception 'post translation publication gate failed'; end if;
  if (select count(*) from public.game_translations) <> 1 then raise exception 'game translation publication gate failed'; end if;
  begin
    insert into public.post_translations(post_id,title) select id,'Attack' from public.posts limit 1;
    raise exception 'anonymous translation write allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$ declare n integer; begin
  if (select count(*) from public.post_translations) <> 2 then raise exception 'nonadmin draft translation leaked'; end if;
  update public.post_translations set title='Attack'; get diagnostics n=row_count;
  if n <> 0 then raise exception 'nonadmin update allowed'; end if;
  delete from public.game_translations; get diagnostics n=row_count;
  if n <> 0 then raise exception 'nonadmin delete allowed'; end if;
  begin
    insert into public.game_translations(game_id,title) select id,'Attack' from public.games limit 1;
    raise exception 'nonadmin insert allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin
  if (select count(*) from public.post_translations) <> 5 then raise exception 'admin cannot read drafts'; end if;
  insert into public.post_translations(post_id,title,is_published)
    select id,'Updated English',false from public.posts where slug='translation-live'
    on conflict(post_id) do update set title=excluded.title,is_published=excluded.is_published;
  if not exists(select 1 from public.post_translations where title='Updated English' and not is_published) then raise exception 'admin upsert failed'; end if;
  begin
    insert into public.game_translations(game_id,title) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Orphan');
    raise exception 'orphan translation accepted';
  exception when foreign_key_violation then null; end;
  delete from public.games where slug='translation-game-live';
  if (select count(*) from public.game_translations) <> 1 then raise exception 'parent deletion did not cascade'; end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  if (select count(*) from public.post_translations) <> 1 then raise exception 'unpublished translation still visible'; end if;
end $$;
rollback;
select 'PASS: translation RLS, parent schedules, drafts, admin upsert, foreign keys and cascade' as result;
