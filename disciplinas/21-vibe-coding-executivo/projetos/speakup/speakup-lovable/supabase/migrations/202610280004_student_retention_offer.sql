-- Etapa 4: oferta no login. O risco é consultado no servidor e não é devolvido ao aluno.
create table public.oferta_exibida (
 id bigint generated always as identity primary key,
 student_id varchar(50) not null references public.tb_aluno(id_aluno),
 id_aluno bigint not null check(id_aluno between 1 and 9007199254740991),
 -- Snapshot do identificador: a exclusão da campanha não apaga o histórico.
 campanha_id bigint not null,
 login_token uuid not null,
 data_exibicao timestamptz not null default now(),
 resposta text not null default 'sem resposta' check(resposta in ('aceitou','recusou','sem resposta')),
 respondida_em timestamptz,
 titulo_oferta text not null,
 mensagem text not null,
 desconto_percentual numeric not null check(desconto_percentual between 0 and 100),
 validade date not null,
 unique(student_id,login_token),
 check((resposta='sem resposta' and respondida_em is null) or (resposta in ('aceitou','recusou') and respondida_em is not null))
);
create unique index oferta_uma_resposta_por_campanha on public.oferta_exibida(student_id,campanha_id) where resposta in ('aceitou','recusou');
create index oferta_historico_aluno_campanha on public.oferta_exibida(student_id,campanha_id);
alter table public.oferta_exibida enable row level security;
revoke all on public.oferta_exibida from public,anon,authenticated;

create function public.get_student_retention_offer(p_login_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student text;v_aluno public.tb_aluno;v_campaign public.campanhas_retencao;v_event public.oferta_exibida;
 v_count integer;v_campaign_id bigint;v_day date:=(now() at time zone 'America/Sao_Paulo')::date;v_first text;
begin
 if public.current_role() is distinct from 'student' then raise exception 'Somente o aluno autenticado pode consultar a oferta.';end if;
 if p_login_token is null then raise exception 'Identificador da sessão inválido.';end if;
 select student_id into v_student from public.profiles where user_id=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended(v_student,404));
 select * into v_aluno from public.tb_aluno where id_aluno=v_student;
 if not found or v_aluno.id_aluno_ml is null then return null;end if;
 select count(*),min(c.id) into v_count,v_campaign_id
  from public.campanhas_retencao c join public.churn_previsao p on p.id_aluno=v_aluno.id_aluno_ml
  where c.status='ativa' and v_day between c.data_inicio and c.data_fim and p.probabilidade_churn>=c.churn_min
   and (p.probabilidade_churn<c.churn_max or c.churn_max=100 and p.probabilidade_churn=100);
 if v_count<>1 then return null;end if;
 select c.* into v_campaign from public.campanhas_retencao c join public.churn_previsao p on p.id_aluno=v_aluno.id_aluno_ml
  where c.id=v_campaign_id and c.status='ativa' and v_day between c.data_inicio and c.data_fim
   and p.probabilidade_churn>=c.churn_min and (p.probabilidade_churn<c.churn_max or c.churn_max=100 and p.probabilidade_churn=100)
  for share of c,p;
 if not found then return null;end if;
 if exists(select 1 from public.oferta_exibida e where e.student_id=v_student and e.campanha_id=v_campaign_id and e.resposta in ('aceitou','recusou')) then return null;end if;
 select * into v_event from public.oferta_exibida where student_id=v_student and login_token=p_login_token;
 if found then
  if v_event.campanha_id<>v_campaign_id or v_event.resposta<>'sem resposta' then return null;end if;
 else
  v_first:=split_part(regexp_replace(trim(v_aluno.nome),'\s+',' ','g'),' ',1);
  insert into public.oferta_exibida(student_id,id_aluno,campanha_id,login_token,titulo_oferta,mensagem,desconto_percentual,validade)
   values(v_student,v_aluno.id_aluno_ml,v_campaign.id,p_login_token,v_campaign.titulo_oferta,
    replace(v_campaign.mensagem,'{nome}',v_first),v_campaign.desconto_percentual,v_campaign.data_fim) returning * into v_event;
 end if;
 return jsonb_build_object('oferta_id',v_event.id,'titulo_oferta',v_event.titulo_oferta,'mensagem',v_event.mensagem,
  'desconto_percentual',v_event.desconto_percentual,'validade',v_event.validade);
end$$;
revoke all on function public.get_student_retention_offer(uuid) from public,anon;
grant execute on function public.get_student_retention_offer(uuid) to authenticated;

create function public.respond_student_retention_offer(p_offer bigint,p_response text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student text;v_event public.oferta_exibida;v_previous text;v_day date:=(now() at time zone 'America/Sao_Paulo')::date;
begin
 if public.current_role() is distinct from 'student' then raise exception 'Somente o aluno autenticado pode responder à oferta.';end if;
 if p_offer is null or p_offer<1 or p_response is null or p_response not in ('aceitou','recusou') then raise exception 'Resposta de oferta inválida.';end if;
 select student_id into v_student from public.profiles where user_id=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended(v_student,404));
 select * into v_event from public.oferta_exibida where id=p_offer and student_id=v_student for update;
 if not found then raise exception 'Oferta não encontrada para este aluno.';end if;
 select resposta into v_previous from public.oferta_exibida where student_id=v_student and campanha_id=v_event.campanha_id and resposta in ('aceitou','recusou');
 if found then return jsonb_build_object('resposta',v_previous,'ja_respondida',true);end if;
 if p_response='aceitou' and not exists(select 1 from public.campanhas_retencao where id=v_event.campanha_id and status='ativa' and v_day between data_inicio and data_fim) then
  raise exception 'Esta oferta não está mais disponível. Você pode dispensá-la e consultar a escola.';
 end if;
 update public.oferta_exibida set resposta=p_response,respondida_em=now() where id=v_event.id;
 return jsonb_build_object('resposta',p_response,'ja_respondida',false);
end$$;
revoke all on function public.respond_student_retention_offer(bigint,text) from public,anon;
grant execute on function public.respond_student_retention_offer(bigint,text) to authenticated;
