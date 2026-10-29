-- Aula 04, Atividade 3, etapa 4.1: vínculo com o ID numérico da base de ML.
-- A matrícula textual continua sendo a chave de login, perfis, reservas e notas.
alter table public.tb_aluno add column id_aluno_ml bigint;
alter table public.tb_aluno add constraint tb_aluno_id_aluno_ml_safe
 check(id_aluno_ml is null or id_aluno_ml between 1 and 9007199254740991);
alter table public.tb_aluno add constraint tb_aluno_id_aluno_ml_key unique(id_aluno_ml);
comment on column public.tb_aluno.id_aluno_ml is
 'ID inteiro da base de Machine Learning. Não substitui nem renumera a matrícula textual id_aluno.';

-- Só uma representação decimal canônica pode ser vinculada automaticamente.
-- "001", IDs alfanuméricos e inteiros maiores que Number.MAX_SAFE_INTEGER
-- permanecem pendentes, sem tentar adivinhar a identidade do aluno.
create function public.student_ml_id_from_matricula(p_student text) returns bigint
language sql immutable strict set search_path='' as $$
 select case when p_student ~ '^[1-9][0-9]*$' and length(p_student)<=16
  then case when p_student::numeric<=9007199254740991 then p_student::bigint end
 end;
$$;
revoke all on function public.student_ml_id_from_matricula(text) from public,anon,authenticated;

update public.tb_aluno set id_aluno_ml=public.student_ml_id_from_matricula(id_aluno);

create function public.preserve_student_ml_identity() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and old.id_aluno_ml is not null then
  if new.id_aluno_ml is distinct from old.id_aluno_ml then
   raise exception 'O vínculo ML existente não pode ser renumerado. Revisão manual necessária.';
  end if;
  return new;
 end if;
 if new.id_aluno_ml is null then
  new.id_aluno_ml:=public.student_ml_id_from_matricula(new.id_aluno);
 end if;
 if new.id_aluno_ml is not null then
  if new.id_aluno_ml not between 1 and 9007199254740991 then
   raise exception 'Informe um ID ML inteiro positivo e seguro, até 9007199254740991.';
  end if;
  -- Serializa novos vínculos, inclusive importações e vínculos manuais concorrentes.
  perform pg_advisory_xact_lock(722681,2);
  if exists(select 1 from public.tb_aluno a
   where a.id_aluno_ml=new.id_aluno_ml and a.id_aluno<>new.id_aluno) then
   raise exception 'ID ML já vinculado a outra matrícula. Revisão manual necessária.';
  end if;
 end if;
 return new;
end$$;
revoke all on function public.preserve_student_ml_identity() from public,anon,authenticated;
create trigger student_ml_identity before insert or update on public.tb_aluno
 for each row execute function public.preserve_student_ml_identity();

create function public.link_student_ml_id(p_student text,p_ml_id bigint) returns bigint
language plpgsql security definer set search_path='' as $$
declare aluno public.tb_aluno;
begin
 if public.current_role() is distinct from 'admin' then
  raise exception 'Somente administradores podem vincular IDs de Machine Learning.';
 end if;
 if p_student is null or length(p_student) not between 1 and 50 then
  raise exception 'Informe a matrícula textual existente.';
 end if;
 if p_ml_id is null or p_ml_id not between 1 and 9007199254740991 then
  raise exception 'Informe um ID ML inteiro positivo e seguro, até 9007199254740991.';
 end if;
 select * into aluno from public.tb_aluno where id_aluno=p_student for update;
 if not found then raise exception 'Matrícula não encontrada.';end if;
 if aluno.id_aluno_ml is not null then
  if aluno.id_aluno_ml<>p_ml_id then
   raise exception 'O vínculo ML existente não pode ser renumerado. Revisão manual necessária.';
  end if;
  return aluno.id_aluno_ml;
 end if;
 update public.tb_aluno set id_aluno_ml=p_ml_id,updated_at=now() where id_aluno=p_student;
 perform public.log_action('ID ML vinculado ao aluno',jsonb_build_object('student_id',p_student,'id_aluno_ml',p_ml_id));
 return p_ml_id;
end$$;
revoke all on function public.link_student_ml_id(text,bigint) from public,anon;
grant execute on function public.link_student_ml_id(text,bigint) to authenticated;
