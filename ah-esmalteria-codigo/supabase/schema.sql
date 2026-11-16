-- Execute uma vez em um projeto Supabase novo.
begin;
create extension if not exists btree_gist;
create table public.salon_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.salon_admins enable row level security;
revoke all on public.salon_admins from anon,authenticated;
create function public.is_salon_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.salon_admins where user_id=auth.uid()); $$;
revoke all on function public.is_salon_admin() from public;
grant execute on function public.is_salon_admin() to authenticated;
create table public.profiles(user_id uuid primary key references auth.users(id) on delete cascade,name text not null check(char_length(name) between 1 and 100),phone text not null check(phone ~ '^[0-9]{10,13}$'));
alter table public.profiles enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select,insert,update on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated using(user_id=(select auth.uid()) or (select public.is_salon_admin()));
create policy profile_insert on public.profiles for insert to authenticated with check(user_id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create table public.appointments(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),day date not null,start_min integer not null,duration integer not null check(duration in(30,60)),total numeric(10,2) not null,services text[] not null,name text not null,phone text not null,exclude using gist(day with =,int4range(start_min,start_min+duration,'[)') with &&));
alter table public.appointments enable row level security;
revoke all on public.appointments from anon,authenticated;
grant select on public.appointments to authenticated;
create policy appointment_read on public.appointments for select to authenticated using(user_id=(select auth.uid()) or (select public.is_salon_admin()));
create function public.busy_slots(p_day date) returns table(start_min integer,duration integer) language sql stable security definer set search_path='' as $$ select a.start_min,a.duration from public.appointments a where a.day=p_day and auth.uid() is not null; $$;
create function public.book_appointment(p_day date,p_time text,p_services integer[]) returns uuid language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); profile public.profiles; start_at integer; dur integer; amount numeric:=0; labels text[]:=array[]::text[]; i integer; result uuid;
begin
if uid is null then raise exception 'Entre na sua conta para agendar.'; end if;
select * into profile from public.profiles where user_id=uid;
if not found then raise exception 'Salve seu nome e telefone antes de agendar.'; end if;
if p_day is null or p_time is null or p_time !~ '^(09|1[0-7]):(00|30)$' or extract(dow from p_day) in(0,1) or p_day<(now() at time zone 'America/Sao_Paulo')::date or p_day>(now() at time zone 'America/Sao_Paulo')::date+29 then raise exception 'Escolha uma data e horário válidos. Domingo e segunda são fechados.'; end if;
if p_services is null or cardinality(p_services)=0 or exists(select 1 from unnest(p_services) x where x is null or x<0 or x>5) or cardinality(p_services)<>(select count(distinct x) from unnest(p_services) x) or (select count(*) from unnest(p_services) x where x<3)<>1 then raise exception 'Escolha mão, pé ou pé e mão, com os adicionais desejados.'; end if;
start_at:=split_part(p_time,':',1)::integer*60+split_part(p_time,':',2)::integer;
dur:=case when 2=any(p_services) then 60 else 30 end;
if start_at+dur>1080 or ((p_day+p_time::time) at time zone 'America/Sao_Paulo')<=now() then raise exception 'Esse horário não está disponível.'; end if;
foreach i in array p_services loop
amount:=amount+(array[28,35,55,10,3,3])[i+1];
labels:=array_append(labels,(array['Mão','Pé','Pé e mão','Escalda-pés','Francesinha','Adesivo (o par)'])[i+1]);
end loop;
insert into public.appointments(user_id,day,start_min,duration,total,services,name,phone) values(uid,p_day,start_at,dur,amount,labels,profile.name,profile.phone) returning id into result;
return result;
end; $$;
create function public.cancel_appointment(p_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin
if auth.uid() is null then raise exception 'Entre na sua conta.'; end if;
delete from public.appointments where id=p_id and(user_id=auth.uid() or public.is_salon_admin());
if not found then raise exception 'Reserva não encontrada ou sem permissão.'; end if;
end; $$;
revoke all on function public.busy_slots(date) from public;
revoke all on function public.book_appointment(date,text,integer[]) from public;
revoke all on function public.cancel_appointment(uuid) from public;
grant execute on function public.busy_slots(date) to authenticated;
grant execute on function public.book_appointment(date,text,integer[]) to authenticated;
grant execute on function public.cancel_appointment(uuid) to authenticated;
commit;
