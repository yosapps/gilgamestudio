create table public.contact_limits (fingerprint text primary key check(length(fingerprint)=64),window_start timestamptz not null default now(),attempts integer not null default 1);
alter table public.contact_limits enable row level security;
-- No direct table access. Hashed IPs only, deleted after 2 hours on the next call.
create or replace function public.consume_contact_limit(fingerprint text) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer;begin
 if fingerprint !~ '^[a-f0-9]{64}$' then return false;end if;
 delete from public.contact_limits where window_start<now()-interval '2 hours';
 insert into public.contact_limits as l(fingerprint) values($1) on conflict on constraint contact_limits_pkey do update set attempts=case when l.window_start<now()-interval '1 hour' then 1 else l.attempts+1 end,window_start=case when l.window_start<now()-interval '1 hour' then now() else l.window_start end returning attempts into n;
 return n<=3;
end $$;
revoke all on function public.consume_contact_limit(text) from public;
grant execute on function public.consume_contact_limit(text) to anon;
