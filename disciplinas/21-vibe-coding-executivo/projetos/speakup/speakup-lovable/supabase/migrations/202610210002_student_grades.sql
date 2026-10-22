-- Estruturas vazias: nenhum aluno, disciplina ou nota é inventado nesta migração.
create table public.student_grades (
 id bigint generated always as identity primary key,
 student_id varchar(50) not null references public.tb_aluno(id_aluno),
 disciplina text not null check(length(trim(disciplina)) between 1 and 150),
 nota numeric not null,
 situacao text not null check(length(trim(situacao)) between 1 and 100),
 updated_at timestamptz not null default now(),
 unique(student_id,disciplina)
);
-- Não inferimos escala de notas nem regras de aprovação: situação vem da fonte oficial.
create table public.grade_api_access (
 user_id uuid primary key references public.profiles(user_id),
 company_id bigint not null references public.companies(id),
 active boolean not null default true
);
alter table public.student_grades enable row level security;
alter table public.grade_api_access enable row level security;
revoke all on public.student_grades,public.grade_api_access from public,anon,authenticated;

create function public.consult_student_grades(p_id text,p_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.profiles; a public.tb_aluno; company bigint; grades jsonb;
begin
 select * into p from public.profiles where user_id=auth.uid();
 if p.user_id is null or p.role not in ('admin','rh') then
  return jsonb_build_object('http_status',403,'body',jsonb_build_object('error',jsonb_build_object('code','FORBIDDEN','message','Acesso à API não autorizado.')));
 end if;
 if p.role='rh' then
  select g.company_id into company from public.grade_api_access g where g.user_id=p.user_id and g.active and g.company_id=p.company_id;
  if company is null then return jsonb_build_object('http_status',403,'body',jsonb_build_object('error',jsonb_build_object('code','FORBIDDEN','message','Acesso à API não autorizado.')));end if;
 end if;
 if p_id is null or p_name is null or length(trim(p_id)) not between 1 and 50 or length(trim(p_name)) not between 1 and 150 then
  return jsonb_build_object('http_status',400,'body',jsonb_build_object('error',jsonb_build_object('code','INVALID_INPUT','message','Informe id_aluno e nome válidos.')));
 end if;
 select * into a from public.tb_aluno s where s.id_aluno=trim(p_id)
 and lower(regexp_replace(trim(s.nome),'\s+',' ','g'))=lower(regexp_replace(trim(p_name),'\s+',' ','g'))
 and (p.role='admin' or exists(select 1 from public.student_companies sc where sc.student_id=s.id_aluno and sc.company_id=company));
 if not found then
  return jsonb_build_object('http_status',404,'body',jsonb_build_object('error',jsonb_build_object('code','STUDENT_NOT_FOUND','message','Aluno não encontrado para o ID e nome informados no escopo autorizado.')));
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('disciplina',g.disciplina,'nota',g.nota,'situacao',g.situacao) order by g.disciplina),'[]'::jsonb) into grades from public.student_grades g where g.student_id=a.id_aluno;
 perform public.log_action('Consulta de notas por API',jsonb_build_object('student_id',a.id_aluno,'company_id',company));
 return jsonb_build_object('http_status',200,'body',jsonb_build_object('aluno',jsonb_build_object('id_aluno',a.id_aluno,'nome',a.nome),'disciplinas',grades,'mensagem',case when jsonb_array_length(grades)=0 then 'Aluno encontrado, sem notas cadastradas.' else 'Consulta realizada com sucesso.' end));
end$$;
revoke all on function public.consult_student_grades(text,text) from public,anon;
grant execute on function public.consult_student_grades(text,text) to authenticated;
