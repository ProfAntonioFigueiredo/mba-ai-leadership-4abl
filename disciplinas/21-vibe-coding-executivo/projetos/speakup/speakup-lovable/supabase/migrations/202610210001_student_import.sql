-- Importação conservadora: mantém contrato RPC e impede sobrescrita de identidade.
alter function public.import_students(jsonb) rename to import_students_unchecked;
revoke all on function public.import_students_unchecked(jsonb) from public, anon, authenticated;

create function public.import_student_checked(p_row jsonb) returns text
language plpgsql security definer set search_path='' as $$
declare old public.tb_aluno; merged jsonb:=p_row; c text; operation text;
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente administradores.'; end if;
 -- Serializa verificações de identidade inclusive entre requisições concorrentes.
 perform pg_advisory_xact_lock(722681,1);
 if jsonb_typeof(p_row)<>'object' or p_row->>'id_aluno' is null then raise exception 'Registro inválido.'; end if;
 select * into old from public.tb_aluno where id_aluno=p_row->>'id_aluno' for update;
 operation:=case when found then 'updated' else 'inserted' end;
 if operation='updated' then
  if lower(trim(old.nome))<>lower(trim(p_row->>'nome')) or lower(trim(old.email))<>lower(trim(p_row->>'email')) then
   raise exception 'ID existente com nome ou e-mail diferente. Revisão manual necessária.';
  end if;
  -- Preserva informações ausentes; mensalidade mantém o nome esperado pelo contrato.
  for c in select jsonb_object_keys(p_row) loop
   if p_row->>c='' then
    merged:=jsonb_set(merged,array[c],to_jsonb(coalesce(case when c='Valor Mensalidade' then old.valor_mensalidade::text else to_jsonb(old)->>c end,'')));
   end if;
  end loop;
 end if;
 if exists(select 1 from public.tb_aluno where id_aluno<>p_row->>'id_aluno' and lower(trim(email))=lower(trim(p_row->>'email'))) then
  raise exception 'E-mail associado a outro identificador. Revisão manual necessária.';
 end if;
 perform public.import_students_unchecked(jsonb_build_array(merged));
 return operation;
end$$;
revoke all on function public.import_student_checked(jsonb) from public,anon;
grant execute on function public.import_student_checked(jsonb) to authenticated;

create function public.import_students(p_rows jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare r jsonb; seen text[]:=array[]::text[]; n integer:=0;
begin
 if public.current_role() is distinct from 'admin' then raise exception 'Somente administradores.'; end if;
 if p_rows is null or jsonb_typeof(p_rows)<>'array' or jsonb_array_length(p_rows) not between 1 and 5000 then raise exception 'Envie entre 1 e 5000 alunos por lote.'; end if;
 for r in select value from jsonb_array_elements(p_rows) loop
  if (r->>'id_aluno')=any(seen) then raise exception 'Identificador duplicado no lote.';end if;
  seen:=array_append(seen,r->>'id_aluno');
  perform public.import_student_checked(r); n:=n+1;
 end loop;
 return n;
end$$;
revoke all on function public.import_students(jsonb) from public,anon;
grant execute on function public.import_students(jsonb) to authenticated;

-- Apenas a Edge Function (service role) pode recuperar uma conta criada parcialmente.
create function public.import_login_identity(p_email text,p_student text) returns jsonb
language sql security definer set search_path='' as $$
 select jsonb_build_object('user_id',u.id,'role',p.role,'student_id',p.student_id)
 from auth.users u left join public.profiles p on p.user_id=u.id where u.email=p_email;
$$;
revoke all on function public.import_login_identity(text,text) from public,anon,authenticated;
grant execute on function public.import_login_identity(text,text) to service_role;

-- Login permitido para todos os status; reserva permanece exclusiva de matrícula Ativa.
create or replace function public.current_role() returns text
language sql stable security definer set search_path='' as $$
 select role from public.profiles where user_id=auth.uid();
$$;
alter function public.book_class(bigint,bigint) rename to book_class_active_impl;
revoke all on function public.book_class_active_impl(bigint,bigint) from public,anon,authenticated;
create function public.book_class(p_slot bigint,p_old bigint default null) returns bigint
language plpgsql security definer set search_path='' as $$
begin
 if public.current_role() is distinct from 'student' or not exists(
  select 1 from public.profiles p join public.tb_aluno a on a.id_aluno=p.student_id
  where p.user_id=auth.uid() and a.status_matricula='Ativa'
 ) then raise exception 'Somente aluno com matrícula ativa pode reservar aulas.';end if;
 return public.book_class_active_impl(p_slot,p_old);
end$$;
revoke all on function public.book_class(bigint,bigint) from public,anon;
grant execute on function public.book_class(bigint,bigint) to authenticated;