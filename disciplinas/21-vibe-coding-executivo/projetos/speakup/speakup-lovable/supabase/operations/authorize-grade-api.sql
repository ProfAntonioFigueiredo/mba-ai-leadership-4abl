-- Executar no SQL Editor como administrador, depois de preencher os dois valores abaixo.
-- Não cria contas e não modifica o perfil existente.
do $$
declare
 account_email text := 'PREENCHA_EMAIL_CONTA';
 authorized_company bigint := null;
 account public.profiles;
begin
 if account_email='PREENCHA_EMAIL_CONTA' or authorized_company is null then
  raise exception 'Preencha account_email e authorized_company antes de executar.';
 end if;
 select p.* into account from public.profiles p join auth.users u on u.id=p.user_id where lower(u.email)=lower(trim(account_email));
 if not found then raise exception 'Conta Auth com perfil existente não encontrada.';end if;
 if account.role<>'rh' or account.company_id is distinct from authorized_company then
  raise exception 'O perfil precisa ser RH e já estar vinculado à empresa informada.';
 end if;
 if exists(select 1 from public.grade_api_access where user_id=account.user_id and company_id<>authorized_company) then
  raise exception 'Já existe autorização para outra empresa. Revise manualmente.';
 end if;
 insert into public.grade_api_access(user_id,company_id,active) values(account.user_id,authorized_company,true)
 on conflict(user_id) do update set active=true;
end$$;
