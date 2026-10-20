-- ENG-05 / AC-07: RH occupancy is scoped to its company, including mixed classes.
create or replace function public.workspace_data() returns jsonb language plpgsql security definer set search_path='' as $$
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
 select coalesce(jsonb_agg(jsonb_build_object('id',s.id,'teacher',t.name,'group',s.group_name,'start',s.starts_at,'end',s.ends_at,'capacity',s.capacity,'occupied',(select count(*) from public.bookings ob where ob.slot_id=s.id and ob.status='agendada' and (v_role<>'rh' or exists(select 1 from public.student_companies osc where osc.student_id=ob.student_id and osc.company_id=p.company_id)))) order by s.starts_at),'[]') into v_slots from public.slots s join public.teachers t on t.id=s.teacher_id where v_role in ('admin','student') or (v_role='teacher' and s.teacher_id=p.teacher_id) or (v_role='rh' and exists(select 1 from public.bookings b join public.student_companies sc on sc.student_id=b.student_id where b.slot_id=s.id and sc.company_id=p.company_id));
 select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'student',case when v_role='rh' then null else b.student_id end,'slot',b.slot_id,'status',b.status,'attendance',b.attendance)),'[]') into v_bookings from public.bookings b join public.slots s on s.id=b.slot_id where v_role='admin' or (v_role='student' and b.student_id=p.student_id) or (v_role='teacher' and s.teacher_id=p.teacher_id) or (v_role='rh' and exists(select 1 from public.student_companies sc where sc.student_id=b.student_id and sc.company_id=p.company_id));
 select jsonb_build_object('active',count(*)) into v_metrics from public.tb_aluno a where a.status_matricula='Ativa' and (v_role='admin' or(v_role='rh' and exists(select 1 from public.student_companies sc where sc.student_id=a.id_aluno and sc.company_id=p.company_id)));
 if v_role='admin' then select coalesce(jsonb_agg(jsonb_build_object('action',x.action,'actor',coalesce(pr.name,'Sistema'),'at',x.created_at) order by x.created_at desc),'[]') into v_audit from (select * from public.audit_events order by created_at desc limit 20) x left join public.profiles pr on pr.user_id=x.actor;else v_audit:='[]';end if;
 return jsonb_build_object('students',v_students,'slots',v_slots,'bookings',v_bookings,'audit',v_audit,'metrics',v_metrics);
end$$;
