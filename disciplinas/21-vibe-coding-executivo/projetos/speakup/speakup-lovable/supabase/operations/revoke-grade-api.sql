-- Executar no SQL Editor como administrador. Preencha o e-mail da conta de integração.
do $$
declare account_email text := 'PREENCHA_EMAIL_CONTA';
begin
 if account_email='PREENCHA_EMAIL_CONTA' then raise exception 'Preencha account_email antes de executar.';end if;
 update public.grade_api_access a set active=false from auth.users u where a.user_id=u.id and lower(u.email)=lower(trim(account_email));
 if not found then raise exception 'Autorização não encontrada. Nenhum acesso foi alterado.';end if;
end$$;
