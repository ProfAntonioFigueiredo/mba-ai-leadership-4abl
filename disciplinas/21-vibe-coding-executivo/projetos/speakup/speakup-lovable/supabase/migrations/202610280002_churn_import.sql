-- Aula 04, Atividade 3, etapa 4.2: previsão administrativa, sem ofertas ou campanhas.
-- IDs sem cadastro são preservados. O vínculo nominal é feito exclusivamente
-- com tb_aluno.id_aluno_ml, nunca por conversão da matrícula textual.
create table public.churn_previsao (
 id_aluno bigint primary key check(id_aluno between 1 and 9007199254740991),
 probabilidade_churn numeric not null check(probabilidade_churn between 0 and 100),
 data_importacao timestamptz not null default now()
);
create index churn_previsao_risk_order on public.churn_previsao(probabilidade_churn desc,id_aluno);
alter table public.churn_previsao enable row level security;
revoke all on public.churn_previsao from public,anon,authenticated;

create function public.import_churn_predictions(p_rows jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 r jsonb; ordinal bigint; v_line integer; v_id bigint; v_number numeric; v_probability numeric;
 v_seen bigint[]:=array[]::bigint[]; v_duplicates bigint[]:=array[]::bigint[];
 v_results jsonb:='[]'::jsonb; v_reason text; v_status text;
 v_inserted integer:=0; v_updated integer:=0; v_rejected integer:=0;
 v_imported_at timestamptz:=now();
begin
 if public.current_role() is distinct from 'admin' then
  raise exception 'Somente administradores podem importar previsões de churn.';
 end if;
 if p_rows is null or jsonb_typeof(p_rows) is distinct from 'array' then
  raise exception 'Envie um lote JSON com entre 1 e 500 linhas.';
 end if;
 if jsonb_array_length(p_rows) not between 1 and 500 then
  raise exception 'Envie entre 1 e 500 linhas por lote.';
 end if;

 -- A classificação inserted/updated é serializada entre importações concorrentes.
 perform pg_advisory_xact_lock(722681,3);

 -- Todas as ocorrências de um ID repetido são rejeitadas, inclusive quando
 -- uma das ocorrências também contém probabilidade ou estrutura inválida.
 for r in select value from jsonb_array_elements(p_rows) loop
  if jsonb_typeof(r)='object' and jsonb_typeof(r->'id_aluno')='number' then
   v_number:=(r->>'id_aluno')::numeric;
   if v_number between 1 and 9007199254740991 and trunc(v_number)=v_number then
    v_id:=v_number::bigint;
    if v_id=any(v_seen) then
     if not(v_id=any(v_duplicates)) then v_duplicates:=array_append(v_duplicates,v_id);end if;
    else v_seen:=array_append(v_seen,v_id);end if;
   end if;
  end if;
 end loop;

 for r,ordinal in select value,ordinality from jsonb_array_elements(p_rows) with ordinality loop
  v_line:=(ordinal+1)::integer;v_id:=null;v_reason:=null;v_status:=null;
  if jsonb_typeof(r) is distinct from 'object' then
   v_reason:='Registro inválido: envie line, id_aluno e probabilidade_churn.';
  else
   if jsonb_typeof(r->'line')='number' then
    v_number:=(r->>'line')::numeric;
    if v_number between 2 and 2147483647 and trunc(v_number)=v_number then v_line:=v_number::integer;
    else v_reason:='line deve ser o número inteiro da linha do Excel, a partir de 2.';end if;
   else v_reason:='line deve ser o número inteiro da linha do Excel, a partir de 2.';end if;

   if v_reason is null and ((select count(*) from jsonb_object_keys(r))<>3
     or not(r ?& array['line','id_aluno','probabilidade_churn'])) then
    v_reason:='O registro deve conter somente line, id_aluno e probabilidade_churn.';
   end if;
   if v_reason is null then
    if jsonb_typeof(r->'id_aluno') is distinct from 'number' then
     v_reason:='id_aluno deve ser um número inteiro positivo e seguro, não texto.';
    else
     v_number:=(r->>'id_aluno')::numeric;
     if not(v_number between 1 and 9007199254740991) or trunc(v_number)<>v_number then
      v_reason:='id_aluno deve ser um inteiro entre 1 e 9007199254740991.';
     else v_id:=v_number::bigint;end if;
    end if;
   end if;
   if v_reason is null and v_id=any(v_duplicates) then
    v_reason:='ID duplicado no lote; todas as ocorrências foram rejeitadas.';
   end if;
   if v_reason is null then
    if jsonb_typeof(r->'probabilidade_churn') is distinct from 'number' then
     v_reason:='probabilidade_churn deve ser um número de 0 a 100, não texto.';
    else
     v_probability:=(r->>'probabilidade_churn')::numeric;
     if not(v_probability between 0 and 100) then
      v_reason:='probabilidade_churn deve estar entre 0 e 100.';
     end if;
    end if;
   end if;
  end if;

  if v_reason is null then
   begin
    v_status:=case when exists(select 1 from public.churn_previsao c where c.id_aluno=v_id)
     then 'updated' else 'inserted' end;
    insert into public.churn_previsao(id_aluno,probabilidade_churn,data_importacao)
     values(v_id,v_probability,v_imported_at)
     on conflict(id_aluno) do update set probabilidade_churn=excluded.probabilidade_churn,
      data_importacao=excluded.data_importacao;
   exception when others then
    v_reason:='Falha ao gravar esta linha: '||sqlerrm;
   end;
  end if;
  if v_reason is not null then
   v_rejected:=v_rejected+1;
   v_results:=v_results||jsonb_build_array(jsonb_build_object('line',v_line,'id_aluno',r->'id_aluno',
    'status','rejected','reason',v_reason));
  else
   if v_status='inserted' then v_inserted:=v_inserted+1;else v_updated:=v_updated+1;end if;
   v_results:=v_results||jsonb_build_array(jsonb_build_object('line',v_line,'id_aluno',v_id,'status',v_status));
  end if;
 end loop;
 perform public.log_action('Importação de previsão de churn',jsonb_build_object('rows',jsonb_array_length(p_rows),
  'inserted',v_inserted,'updated',v_updated,'rejected',v_rejected));
 return jsonb_build_object('results',v_results,'inserted',v_inserted,'updated',v_updated,'rejected',v_rejected);
end$$;
revoke all on function public.import_churn_predictions(jsonb) from public,anon;
grant execute on function public.import_churn_predictions(jsonb) to authenticated;

create function public.churn_admin_data(p_search text default '',p_page integer default 1,p_page_size integer default 20) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_search text:=coalesce(p_search,'');v_rows jsonb;v_total bigint;v_all bigint;v_linked bigint;v_bands jsonb;
begin
 if public.current_role() is distinct from 'admin' then
  raise exception 'Somente administradores podem consultar previsões de churn.';
 end if;
 if p_page is null or p_page<1 or p_page_size is null or p_page_size not between 1 and 100 then
  raise exception 'Informe página positiva e tamanho de página entre 1 e 100.';
 end if;
 if length(v_search)>200 then raise exception 'A busca deve ter até 200 caracteres.';end if;

 select count(*),count(a.id_aluno_ml) into v_all,v_linked
  from public.churn_previsao c left join public.tb_aluno a on a.id_aluno_ml=c.id_aluno;
 select count(*) into v_total
  from public.churn_previsao c left join public.tb_aluno a on a.id_aluno_ml=c.id_aluno
  where strpos(lower(c.id_aluno::text),lower(v_search))>0 or strpos(lower(coalesce(a.nome,'')),lower(v_search))>0;
 select coalesce(jsonb_agg(jsonb_build_object('id_aluno',x.id_aluno,'probabilidade_churn',x.probabilidade_churn,
  'data_importacao',x.data_importacao,'nome',x.nome) order by x.probabilidade_churn desc,x.id_aluno),'[]'::jsonb)
  into v_rows from (
   select c.id_aluno,c.probabilidade_churn,c.data_importacao,a.nome
    from public.churn_previsao c left join public.tb_aluno a on a.id_aluno_ml=c.id_aluno
    where strpos(lower(c.id_aluno::text),lower(v_search))>0 or strpos(lower(coalesce(a.nome,'')),lower(v_search))>0
    order by c.probabilidade_churn desc,c.id_aluno
    limit p_page_size offset ((p_page::bigint-1)*p_page_size)
  ) x;
 select jsonb_build_array(
  jsonb_build_object('label','0–20','count',count(*) filter(where probabilidade_churn>=0 and probabilidade_churn<20)),
  jsonb_build_object('label','20–40','count',count(*) filter(where probabilidade_churn>=20 and probabilidade_churn<40)),
  jsonb_build_object('label','40–60','count',count(*) filter(where probabilidade_churn>=40 and probabilidade_churn<60)),
  jsonb_build_object('label','60–80','count',count(*) filter(where probabilidade_churn>=60 and probabilidade_churn<80)),
  jsonb_build_object('label','80–100','count',count(*) filter(where probabilidade_churn>=80 and probabilidade_churn<=100))
 ) into v_bands from public.churn_previsao;
 return jsonb_build_object('rows',v_rows,'total',v_total,'total_predictions',v_all,'bands',v_bands,
  'linked',v_linked,'page',p_page,'page_size',p_page_size);
end$$;
revoke all on function public.churn_admin_data(text,integer,integer) from public,anon;
grant execute on function public.churn_admin_data(text,integer,integer) to authenticated;
