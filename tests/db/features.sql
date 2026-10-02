\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.admin_users(id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
insert into public.games(id,title,slug,status,primary_action,primary_url) values ('11111111-1111-4111-8111-111111111111','Live Game','feature-live-game','published','wishlist','https://store.steampowered.com/app/123/'),('22222222-2222-4222-8222-222222222222','Secret Game','feature-secret-game','draft','none','');
insert into public.posts(id,title,slug,status,published_at,game_id) values ('33333333-3333-4333-8333-333333333333','Live Post','feature-live-post','published',now()-interval '1 day','11111111-1111-4111-8111-111111111111'),('44444444-4444-4444-8444-444444444444','Future Post','feature-future-post','scheduled',now()+interval '1 day','11111111-1111-4111-8111-111111111111');
insert into public.post_translations(post_id,title,is_published) values ('33333333-3333-4333-8333-333333333333','English Post',true);
insert into public.game_translations(game_id,title,is_published) values ('11111111-1111-4111-8111-111111111111','English Game',true);
do $$ begin
 if (select source_revision from public.post_translations where post_id='33333333-3333-4333-8333-333333333333') <> 1 then raise exception 'translation did not capture source revision'; end if;
end $$;
update public.posts set cover_url='/logo.png',game_id=null where id='33333333-3333-4333-8333-333333333333';
do $$ begin
 if (select source_revision from public.posts where id='33333333-3333-4333-8333-333333333333') <> 1 then raise exception 'shared field invalidated translation'; end if;
end $$;
update public.posts set title='Updated Post',game_id='11111111-1111-4111-8111-111111111111' where id='33333333-3333-4333-8333-333333333333';
do $$ begin
 if (select source_revision from public.posts where id='33333333-3333-4333-8333-333333333333') <> 2 then raise exception 'copy did not advance source revision'; end if;
 if (select source_revision from public.post_translations where post_id='33333333-3333-4333-8333-333333333333') <> 1 then raise exception 'stale translation was silently updated'; end if;
 begin
  update public.post_translations set title='Stale English',source_revision=1 where post_id='33333333-3333-4333-8333-333333333333';
  raise exception 'stale source revision accepted';
 exception when raise_exception then if sqlerrm <> 'translation_source_changed' then raise; end if; end;
end $$;
update public.post_translations set title='Reviewed English',source_revision=2 where post_id='33333333-3333-4333-8333-333333333333';
update public.games set primary_action='demo',primary_url='https://example.com/demo' where id='11111111-1111-4111-8111-111111111111';
do $$ begin
 if (select source_revision from public.games where id='11111111-1111-4111-8111-111111111111') <> 1 then raise exception 'CTA invalidated translation'; end if;
end $$;
update public.games set description='Changed copy' where id='11111111-1111-4111-8111-111111111111';
update public.game_translations set title='Reviewed Game',source_revision=2 where game_id='11111111-1111-4111-8111-111111111111';
reset role;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if (select count(*) from public.games where slug like 'feature-%') <> 1 then raise exception 'draft game leaked'; end if;
 if (select count(*) from public.posts where slug like 'feature-%') <> 1 then raise exception 'future devlog leaked'; end if;
 if (select count(*) from public.post_translations) <> 1 then raise exception 'published translation missing'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$ declare n integer; begin
 update public.games set primary_action='none' where slug like 'feature-%'; get diagnostics n=row_count;
 if n <> 0 then raise exception 'non-admin modified CTA'; end if;
 update public.posts set game_id=null where slug like 'feature-%'; get diagnostics n=row_count;
 if n <> 0 then raise exception 'non-admin modified game relation'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
delete from public.games where id='11111111-1111-4111-8111-111111111111';
do $$ begin
 if exists(select 1 from public.posts where slug like 'feature-%' and game_id is not null) then raise exception 'game deletion left orphan relation'; end if;
 if exists(select 1 from public.game_translations where game_id='11111111-1111-4111-8111-111111111111') then raise exception 'game translation was not cascaded'; end if;
end $$;
rollback;
select 'PASS: game relations, CTA, translation revisions, stale-edit rejection and publication RLS' as result;
