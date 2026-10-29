-- Aula 04, etapa 4.3. A oferta no login pertence à próxima etapa.
create table public.campanhas_retencao (
 id bigint generated always as identity primary key,
 nome text not null check(length(trim(nome)) between 1 and 150),
 churn_min numeric not null check(churn_min>=0),
 churn_max numeric not null check(churn_max<=100),
 desconto_percentual numeric not null check(desconto_percentual between 0 and 100),
 titulo_oferta text not null check(length(trim(titulo_oferta)) between 1 and 180),
 mensagem text not null check(length(trim(mensagem)) between 1 and 2000),
 data_inicio date not null,
 data_fim date not null,
 status text not null check(status in ('ativa','inativa')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(churn_min<churn_max),
 check(data_fim>data_inicio),
 constraint campanhas_ativas_sem_sobreposicao exclude using gist (
  numrange(churn_min,churn_max,'[)') with &&,
  daterange(data_inicio,data_fim,'[]') with &&
 ) where(status='ativa')
);
alter table public.campanhas_retencao enable row level security;
revoke all on public.campanhas_retencao from public,anon,authenticated;

create function public.save_retention_campaign(p_campaign jsonb) returns bigint
language plpgsql security definer set search_path='' as $$
declare v_id bigint;v_min numeric;v_max numeric;v_discount numeric;v_start date;v_end date;v_key text;
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente administradores podem cadastrar campanhas.';end if;
 if p_campaign is null or jsonb_typeof(p_campaign) is distinct from 'object' then raise exception 'Campanha inválida.';end if;
 if not(p_campaign ?& array['nome','churn_min','churn_max','desconto_percentual','titulo_oferta','mensagem','data_inicio','data_fim','status'])
  or exists(select 1 from jsonb_object_keys(p_campaign) k where k not in ('id','nome','churn_min','churn_max','desconto_percentual','titulo_oferta','mensagem','data_inicio','data_fim','status')) then
  raise exception 'Preencha os campos oficiais da campanha.';
 end if;
 foreach v_key in array array['churn_min','churn_max','desconto_percentual'] loop
  if jsonb_typeof(p_campaign->v_key) is distinct from 'number' then raise exception 'Percentuais devem ser números entre 0 e 100.';end if;
 end loop;
 v_min:=(p_campaign->>'churn_min')::numeric;v_max:=(p_campaign->>'churn_max')::numeric;v_discount:=(p_campaign->>'desconto_percentual')::numeric;
 if not(v_min>=0 and v_min<v_max and v_max<=100 and v_discount between 0 and 100) then raise exception 'Faixa de churn ou desconto inválido.';end if;
 foreach v_key in array array['nome','titulo_oferta','mensagem','data_inicio','data_fim','status'] loop
  if jsonb_typeof(p_campaign->v_key) is distinct from 'string' then raise exception 'Preencha nome, oferta, mensagem, datas e status.';end if;
 end loop;
 if length(trim(p_campaign->>'nome')) not between 1 and 150 or length(trim(p_campaign->>'titulo_oferta')) not between 1 and 180 or length(trim(p_campaign->>'mensagem')) not between 1 and 2000 then
  raise exception 'Nome, título ou mensagem vazio ou acima do limite.';
 end if;
 if p_campaign->>'status' not in ('ativa','inativa') then raise exception 'Status inválido.';end if;
 begin
  if p_campaign->>'data_inicio' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or p_campaign->>'data_fim' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Formato inválido.';end if;
  v_start:=(p_campaign->>'data_inicio')::date;v_end:=(p_campaign->>'data_fim')::date;
  if to_char(v_start,'YYYY-MM-DD')<>p_campaign->>'data_inicio' or to_char(v_end,'YYYY-MM-DD')<>p_campaign->>'data_fim' or v_end<=v_start then raise exception 'Período inválido.';end if;
 exception when others then raise exception 'A data de fim deve ser posterior à data de início, com datas válidas.';end;
 if p_campaign ? 'id' and p_campaign->'id'<>'null'::jsonb then
  if jsonb_typeof(p_campaign->'id') is distinct from 'number' or (p_campaign->>'id')::numeric not between 1 and 9007199254740991 or trunc((p_campaign->>'id')::numeric)<>(p_campaign->>'id')::numeric then raise exception 'ID da campanha inválido.';end if;
  v_id:=(p_campaign->>'id')::bigint;
  update public.campanhas_retencao set nome=trim(p_campaign->>'nome'),churn_min=v_min,churn_max=v_max,desconto_percentual=v_discount,
   titulo_oferta=trim(p_campaign->>'titulo_oferta'),mensagem=trim(p_campaign->>'mensagem'),data_inicio=v_start,data_fim=v_end,status=p_campaign->>'status',updated_at=now() where id=v_id;
  if not found then raise exception 'Campanha não encontrada.';end if;
 else
  insert into public.campanhas_retencao(nome,churn_min,churn_max,desconto_percentual,titulo_oferta,mensagem,data_inicio,data_fim,status)
   values(trim(p_campaign->>'nome'),v_min,v_max,v_discount,trim(p_campaign->>'titulo_oferta'),trim(p_campaign->>'mensagem'),v_start,v_end,p_campaign->>'status') returning id into v_id;
 end if;
 perform public.log_action('Campanha de retenção salva',jsonb_build_object('campanha',v_id,'status',p_campaign->>'status'));
 return v_id;
 exception when exclusion_violation then raise exception 'Campanha ativa sobrepõe faixa de churn e período de outra campanha ativa.';
end$$;
revoke all on function public.save_retention_campaign(jsonb) from public,anon;
grant execute on function public.save_retention_campaign(jsonb) to authenticated;

create function public.delete_retention_campaign(p_id bigint) returns void
language plpgsql security definer set search_path='' as $$
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente administradores podem excluir campanhas.';end if;
 delete from public.campanhas_retencao where id=p_id;
 if not found then raise exception 'Campanha não encontrada.';end if;
 perform public.log_action('Campanha de retenção excluída',jsonb_build_object('campanha',p_id));
end$$;
revoke all on function public.delete_retention_campaign(bigint) from public,anon;
grant execute on function public.delete_retention_campaign(bigint) to authenticated;

create function public.retention_campaigns_admin_data() returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_rows jsonb;
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente administradores podem consultar campanhas.';end if;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.churn_min,x.churn_max,x.id),'[]'::jsonb) into v_rows from (
  select c.*, (select count(*) from public.churn_previsao p where p.probabilidade_churn>=c.churn_min and
   (p.probabilidade_churn<c.churn_max or c.churn_max=100 and p.probabilidade_churn=100)) as alunos_faixa
  from public.campanhas_retencao c
 ) x;
 return v_rows;
end$$;
revoke all on function public.retention_campaigns_admin_data() from public,anon;
grant execute on function public.retention_campaigns_admin_data() to authenticated;
