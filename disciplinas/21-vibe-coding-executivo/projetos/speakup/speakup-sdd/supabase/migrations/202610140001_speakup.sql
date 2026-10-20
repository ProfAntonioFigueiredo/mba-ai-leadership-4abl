-- Piloto P0. Revisar em ambiente de desenvolvimento antes de aplicar.
-- Datas civis DATE; eventos TIMESTAMPTZ; dinheiro NUMERIC exato.
create extension if not exists btree_gist with schema extensions;
create table public.companies(id bigint generated always as identity primary key,name text not null unique);
create table public.teachers(id bigint generated always as identity primary key,name text not null unique);
create table public.tb_aluno(
 id_aluno varchar(50) primary key,
 nome varchar(150) not null check(length(trim(nome))>0),
 email varchar(100) not null check(email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
 data_nascimento date, idade integer check(idade>=0), genero varchar(20),
 unidade varchar(100),cidade varchar(100),estado varchar(2),canal_aquisicao varchar(50),
 nivel_curso varchar(50),modalidade varchar(20),turno varchar(20),plano varchar(50),
 desconto_percentual numeric(5,2) check(desconto_percentual between 0 and 100),
 data_matricula date not null,status_matricula varchar(20) not null check(status_matricula in ('Ativa','Cancelada','Trancada','Pausada')),
 data_cancelamento date,valor_mensalidade numeric(10,2) not null check(valor_mensalidade>=0),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
-- Vinculo corporativo separado: unidade NÃO equivale a empresa em produção.
create table public.student_companies(student_id varchar(50) primary key references public.tb_aluno(id_aluno),company_id bigint not null references public.companies(id));
create table public.profiles(
 id bigint generated always as identity unique,user_id uuid primary key references auth.users(id),
 role text not null check(role in ('admin','student','teacher','rh')),name text not null,
 student_id varchar(50) unique references public.tb_aluno(id_aluno),
 teacher_id bigint references public.teachers(id),company_id bigint references public.companies(id),
 check(role<>'student' or student_id is not null),check(role<>'teacher' or teacher_id is not null),check(role<>'rh' or company_id is not null)
);
create table public.slots(
 id bigint generated always as identity primary key,teacher_id bigint not null references public.teachers(id),
 group_name text not null check(length(trim(group_name)) between 1 and 150),
 starts_at timestamptz not null,ends_at timestamptz not null,capacity integer not null check(capacity between 1 and 100),
 check(ends_at>starts_at),
 exclude using gist(teacher_id with =,tstzrange(starts_at,ends_at,'[)') with &&),
 exclude using gist(group_name with =,tstzrange(starts_at,ends_at,'[)') with &&)
);
create table public.bookings(
 id bigint generated always as identity primary key,student_id varchar(50) not null references public.tb_aluno(id_aluno),
 slot_id bigint not null references public.slots(id),status text not null default 'agendada' check(status in ('agendada','cancelada')),
 attendance text check(attendance in ('Presente','Falta justificada','Falta não justificada')),
 created_at timestamptz not null default now()
);
create unique index one_active_booking on public.bookings(student_id,slot_id) where status='agendada';
create index booking_student on public.bookings(student_id);
create index booking_slot on public.bookings(slot_id);
create index slots_start on public.slots(starts_at);
create table public.audit_events(id bigint generated always as identity primary key,actor uuid references auth.users(id),action text not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create or replace function public.current_role() returns text language sql stable security definer set search_path='' as $$
 select p.role from public.profiles p where p.user_id=auth.uid() and (p.role<>'student' or exists(select 1 from public.tb_aluno a where a.id_aluno=p.student_id and a.status_matricula='Ativa'));
$$;
-- Sem privilégios de escrita direta: toda mutação passa por funções autorizadas.
alter table public.companies enable row level security;
alter table public.teachers enable row level security;
alter table public.tb_aluno enable row level security;
alter table public.student_companies enable row level security;
alter table public.profiles enable row level security;
alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.audit_events enable row level security;
revoke all on public.companies,public.teachers,public.tb_aluno,public.student_companies,public.profiles,public.slots,public.bookings,public.audit_events from anon,authenticated;
grant select on public.profiles to authenticated;
create policy read_own_profile on public.profiles for select to authenticated using(user_id=auth.uid());
create function public.prevent_audit_mutation() returns trigger language plpgsql set search_path='' as $$begin raise exception 'Eventos de auditoria não podem ser alterados ou apagados.';end$$;
create trigger audit_immutable before update or delete on public.audit_events for each row execute function public.prevent_audit_mutation();
create function public.log_action(p_action text,p_details jsonb default '{}') returns void language sql security definer set search_path='' as $$insert into public.audit_events(actor,action,details) values(auth.uid(),p_action,p_details)$$;
revoke all on function public.log_action(text,jsonb) from public,anon,authenticated;
create function public.workspace_data() returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.profiles;v_role text;v_students jsonb;v_slots jsonb;v_bookings jsonb;v_audit jsonb;v_metrics jsonb;
begin
 select * into p from public.profiles where user_id=auth.uid();v_role:=public.current_role();
 if v_role is null then raise exception 'Acesso não autorizado.';end if;
 if v_role='admin' then
  select coalesce(jsonb_agg(to_jsonb(a)-'valor_mensalidade'-'created_at'-'updated_at'||jsonb_build_object('Valor Mensalidade',a.valor_mensalidade::text)),'[]') into v_students from public.tb_aluno a;
 elsif v_role='student' then
  select coalesce(jsonb_agg(to_jsonb(a)-'valor_mensalidade'-'created_at'-'updated_at'||jsonb_build_object('Valor Mensalidade',a.valor_mensalidade::text)),'[]') into v_students from public.tb_aluno a where a.id_aluno=p.student_id;
 elsif v_role='teacher' then
  select coalesce(jsonb_agg(jsonb_build_object('id_aluno',a.id_aluno,'nome',a.nome)),'[]') into v_students from public.tb_aluno a where exists(select 1 from public.bookings b join public.slots s on s.id=b.slot_id where b.student_id=a.id_aluno and b.status='agendada' and s.teacher_id=p.teacher_id);
 else v_students:='[]';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'teacher',t.name,'group',s.group_name,'start',s.starts_at,'end',s.ends_at,'capacity',s.capacity,'occupied',(select count(*) from public.bookings ob where ob.slot_id=s.id and ob.status='agendada')) order by s.starts_at),'[]') into v_slots from public.slots s join public.teachers t on t.id=s.teacher_id where v_role in ('admin','student') or (v_role='teacher' and s.teacher_id=p.teacher_id) or (v_role='rh' and exists(select 1 from public.bookings b join public.student_companies sc on sc.student_id=b.student_id where b.slot_id=s.id and sc.company_id=p.company_id));
 select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'student',case when v_role='rh' then null else b.student_id end,'slot',b.slot_id,'status',b.status,'attendance',b.attendance)),'[]') into v_bookings from public.bookings b join public.slots s on s.id=b.slot_id where v_role='admin' or (v_role='student' and b.student_id=p.student_id) or (v_role='teacher' and s.teacher_id=p.teacher_id) or (v_role='rh' and exists(select 1 from public.student_companies sc where sc.student_id=b.student_id and sc.company_id=p.company_id));
 select jsonb_build_object('active',count(*)) into v_metrics from public.tb_aluno a where a.status_matricula='Ativa' and (v_role='admin' or(v_role='rh' and exists(select 1 from public.student_companies sc where sc.student_id=a.id_aluno and sc.company_id=p.company_id)));
 if v_role='admin' then select coalesce(jsonb_agg(jsonb_build_object('action',x.action,'actor',coalesce(pr.name,'Sistema'),'at',x.created_at) order by x.created_at desc),'[]') into v_audit from (select * from public.audit_events order by created_at desc limit 20) x left join public.profiles pr on pr.user_id=x.actor;else v_audit:='[]';end if;
 return jsonb_build_object('students',v_students,'slots',v_slots,'bookings',v_bookings,'audit',v_audit,'metrics',v_metrics);
end$$;
create function public.create_slot(p_slot jsonb) returns bigint language plpgsql security definer set search_path='' as $$
declare v_teacher bigint;v_id bigint;
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente coordenação.';end if;
 if length(trim(p_slot->>'teacher')) not between 1 and 150 then raise exception 'Professor inválido.';end if;
 insert into public.teachers(name) values(trim(p_slot->>'teacher')) on conflict(name) do update set name=excluded.name returning id into v_teacher;
 insert into public.slots(teacher_id,group_name,starts_at,ends_at,capacity) values(v_teacher,p_slot->>'group',(p_slot->>'start')::timestamptz,(p_slot->>'end')::timestamptz,(p_slot->>'capacity')::integer) returning id into v_id;
 perform public.log_action('Aula criada',jsonb_build_object('slot',v_id));return v_id;
 exception when exclusion_violation then raise exception 'Conflito de professor ou turma neste horário.';
end$$;
create function public.book_class(p_slot bigint,p_old bigint default null) returns bigint language plpgsql security definer set search_path='' as $$
declare v_student text;v_slot public.slots;v_old public.bookings;v_id bigint;
begin
 if public.current_role() is distinct from 'student' then raise exception 'Somente aluno com matrícula ativa.';end if;
 select student_id into v_student from public.profiles where user_id=auth.uid();
 -- Trava por aluno evita duas reservas concorrentes em horários sobrepostos.
 perform pg_advisory_xact_lock(hashtextextended(v_student,0));
 select * into v_slot from public.slots where id=p_slot for update;
 if not found or v_slot.starts_at<=now() then raise exception 'Horário indisponível.';end if;
 if p_old is not null then
  select * into v_old from public.bookings where id=p_old and student_id=v_student and status='agendada' for update;
  if not found then raise exception 'Agendamento original não encontrado.';end if;
  if v_old.slot_id=p_slot then raise exception 'Selecione outro horário.';end if;
  if exists(select 1 from public.slots where id=v_old.slot_id and starts_at<=now()) then raise exception 'Não é possível remarcar aula passada.';end if;
 end if;
 if (select count(*) from public.bookings where slot_id=p_slot and status='agendada')>=v_slot.capacity then raise exception 'Não há vagas.';end if;
 if exists(select 1 from public.bookings b join public.slots s on s.id=b.slot_id where b.student_id=v_student and b.status='agendada' and (p_old is null or b.id<>p_old) and tstzrange(s.starts_at,s.ends_at,'[)')&&tstzrange(v_slot.starts_at,v_slot.ends_at,'[)')) then raise exception 'Você já possui uma aula neste horário.';end if;
 if p_old is not null then update public.bookings set status='cancelada' where id=p_old;end if;
 insert into public.bookings(student_id,slot_id) values(v_student,p_slot) returning id into v_id;
 perform public.log_action('Aula agendada',jsonb_build_object('booking',v_id,'old',p_old));return v_id;
end$$;
create function public.cancel_booking(p_booking bigint) returns void language plpgsql security definer set search_path='' as $$
declare v_student text;v_id bigint;
begin
 if public.current_role() is distinct from 'student' then raise exception 'Somente aluno com matrícula ativa.';end if;
 select student_id into v_student from public.profiles where user_id=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended(v_student,0));
 update public.bookings b set status='cancelada' from public.slots s where b.id=p_booking and b.student_id=v_student and b.status='agendada' and s.id=b.slot_id and s.starts_at>now() returning b.id into v_id;
 if v_id is null then raise exception 'Agendamento não encontrado ou aula já iniciada.';end if;
 perform public.log_action('Aula cancelada; crédito pendente de política',jsonb_build_object('booking',p_booking));
end$$;
create function public.mark_attendance(p_booking bigint,p_status text) returns void language plpgsql security definer set search_path='' as $$
declare p public.profiles;v_id bigint;
begin
 select * into p from public.profiles where user_id=auth.uid();
 if public.current_role() not in ('admin','teacher') or public.current_role() is null then raise exception 'Acesso não autorizado.';end if;
 if p_status not in ('Presente','Falta justificada','Falta não justificada') or p_status is null then raise exception 'Situação inválida.';end if;
 update public.bookings b set attendance=p_status from public.slots s where b.id=p_booking and b.status='agendada' and s.id=b.slot_id and (p.role='admin' or s.teacher_id=p.teacher_id) returning b.id into v_id;
 if v_id is null then raise exception 'Aluno fora da sua turma.';end if;
 perform public.log_action('Presença registrada',jsonb_build_object('booking',p_booking,'status',p_status));
end$$;
create function public.import_students(p_rows jsonb) returns integer language plpgsql security definer set search_path='' as $$
declare r jsonb;c text;v_count integer:=0;v_line integer:=1;v_keys text[];v_expected text[]:=array['id_aluno','nome','email','data_nascimento','idade','genero','unidade','cidade','estado','canal_aquisicao','nivel_curso','modalidade','turno','plano','desconto_percentual','data_matricula','status_matricula','data_cancelamento','Valor Mensalidade'];v_seen text[]:=array[]::text[];
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente coordenação.';end if;
 if p_rows is null or jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows) not between 1 and 5000 then raise exception 'Envie entre 1 e 5000 alunos por lote.';end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  v_line:=v_line+1;
  if jsonb_typeof(r)<>'object' then raise exception 'Linha %: registro inválido.',v_line;end if;
  select array_agg(k order by k) into v_keys from jsonb_object_keys(r) k;
  if cardinality(v_keys)<>19 or not(v_keys @> v_expected and v_keys <@ v_expected) then raise exception 'Linha %: são exigidas as 19 colunas oficiais.',v_line;end if;
  foreach c in array v_expected loop
   if jsonb_typeof(r->c)<>'string' then raise exception 'Linha %, coluna %: envie conteúdo textual normalizado.',v_line,c;end if;
  end loop;
  foreach c in array array['id_aluno','nome','email','data_matricula','status_matricula','Valor Mensalidade'] loop
   if length(trim(r->>c))=0 then raise exception 'Linha %, coluna %: campo obrigatório.',v_line,c;end if;
  end loop;
  if (r->>'id_aluno')=any(v_seen) then raise exception 'Linha %, coluna id_aluno: matrícula duplicada.',v_line;end if;v_seen:=array_append(v_seen,r->>'id_aluno');
  foreach c in array array['data_nascimento','data_matricula','data_cancelamento'] loop
   if r->>c<>'' then
    begin
     if r->>c !~ '^\d{4}-\d{2}-\d{2}$' or to_char((r->>c)::date,'YYYY-MM-DD')<>r->>c then raise exception 'Formato inválido';end if;
    exception when others then raise exception 'Linha %, coluna %: use data válida YYYY-MM-DD.',v_line,c;end;
   end if;
  end loop;
  foreach c in array array['Valor Mensalidade','desconto_percentual'] loop
   if r->>c<>'' and r->>c !~ '^\d+(\.\d{1,2})?$' then raise exception 'Linha %, coluna %: número decimal inválido.',v_line,c;end if;
  end loop;
  if r->>'idade'<>'' and r->>'idade' !~ '^\d+$' then raise exception 'Linha %, coluna idade: inteiro inválido.',v_line;end if;
  begin
   insert into public.tb_aluno as a(id_aluno,nome,email,data_nascimento,idade,genero,unidade,cidade,estado,canal_aquisicao,nivel_curso,modalidade,turno,plano,desconto_percentual,data_matricula,status_matricula,data_cancelamento,valor_mensalidade)
   values(r->>'id_aluno',r->>'nome',r->>'email',nullif(r->>'data_nascimento','')::date,nullif(r->>'idade','')::integer,r->>'genero',r->>'unidade',r->>'cidade',r->>'estado',r->>'canal_aquisicao',r->>'nivel_curso',r->>'modalidade',r->>'turno',r->>'plano',nullif(r->>'desconto_percentual','')::numeric,(r->>'data_matricula')::date,r->>'status_matricula',nullif(r->>'data_cancelamento','')::date,(r->>'Valor Mensalidade')::numeric)
   on conflict(id_aluno) do update set nome=excluded.nome,email=excluded.email,data_nascimento=excluded.data_nascimento,idade=excluded.idade,genero=excluded.genero,unidade=excluded.unidade,cidade=excluded.cidade,estado=excluded.estado,canal_aquisicao=excluded.canal_aquisicao,nivel_curso=excluded.nivel_curso,modalidade=excluded.modalidade,turno=excluded.turno,plano=excluded.plano,desconto_percentual=excluded.desconto_percentual,data_matricula=excluded.data_matricula,status_matricula=excluded.status_matricula,data_cancelamento=excluded.data_cancelamento,valor_mensalidade=excluded.valor_mensalidade,updated_at=now();
  exception when others then raise exception 'Linha %: %',v_line,sqlerrm;end;
  v_count:=v_count+1;
 end loop;
 perform public.log_action('Importação de alunos',jsonb_build_object('rows',v_count));return v_count;
end$$;
-- Revoga execução pública padrão inclusive para funções auxiliares.
revoke execute on function public.current_role(),public.prevent_audit_mutation(),public.workspace_data(),public.create_slot(jsonb),public.book_class(bigint,bigint),public.cancel_booking(bigint),public.mark_attendance(bigint,text),public.import_students(jsonb) from public,anon;
grant execute on function public.current_role(),public.workspace_data(),public.create_slot(jsonb),public.book_class(bigint,bigint),public.cancel_booking(bigint),public.mark_attendance(bigint,text),public.import_students(jsonb) to authenticated;
