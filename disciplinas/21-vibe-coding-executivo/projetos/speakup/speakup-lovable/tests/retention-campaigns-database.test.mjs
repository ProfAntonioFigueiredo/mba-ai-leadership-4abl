import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
const campaign=extra=>({nome:'Renove já',churn_min:20,churn_max:40,desconto_percentual:10,titulo_oferta:'Seu próximo nível',mensagem:'{nome}, renove com 10% off.',data_inicio:'2026-10-28',data_fim:'2026-11-30',status:'ativa',...extra});

test('PostgreSQL: campanhas administrativas, contagens e exclusão de sobreposição',async t=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 const ids={admin:'00000000-0000-0000-0000-000000000001',student:'00000000-0000-0000-0000-000000000002',teacher:'00000000-0000-0000-0000-000000000003',rh:'00000000-0000-0000-0000-000000000004'};
 const as=async role=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[role]??'']);await db.exec('set role '+(role==='anon'?'anon':'authenticated'));};
 const save=async row=>(await db.query('select save_retention_campaign($1::jsonb) id',[JSON.stringify(row)])).rows[0].id;
 const list=async()=>(await db.query('select retention_campaigns_admin_data() d')).rows[0].d;
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;
  create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
  for(const file of ['202610140001_speakup.sql','202610210001_student_import.sql','202610210002_student_grades.sql','202610280001_student_ml_identity.sql','202610280002_churn_import.sql','202610280003_retention_campaigns.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  for(const id of Object.values(ids))await db.query('insert into auth.users(id) values($1)',[id]);
  await db.query("insert into profiles(user_id,role,name) values($1,'admin','Admin')",[ids.admin]);
  await db.exec("insert into tb_aluno(id_aluno,nome,email,data_matricula,status_matricula,valor_mensalidade) values('1','Aluno','a@example.com','2026-10-28','Ativa',450);insert into teachers(name) values('Teacher');insert into companies(name) values('Empresa')");
  await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Aluno','1')",[ids.student]);
  await db.query("insert into profiles(user_id,role,name,teacher_id) values($1,'teacher','Teacher',1)",[ids.teacher]);
  await db.query("insert into profiles(user_id,role,name,company_id) values($1,'rh','Gestor',1)",[ids.rh]);
  await as('admin');
  let first,inactive;
  await t.test('cadastro e listagem contam faixas e preservam previsão sem cadastro',async()=>{
   assert.deepEqual(await list(),[]);
   const rows=[0,19.9,20,39.9,40,60,80,100].map((p,i)=>({line:i+2,id_aluno:i+1,probabilidade_churn:p}));
   await db.query('select import_churn_predictions($1::jsonb)',[JSON.stringify(rows)]);
   first=await save(campaign());
   const low=await save(campaign({nome:'Fidelidade',churn_min:0,churn_max:20}));
   await save(campaign({nome:'Última chamada',churn_min:80,churn_max:100}));
   const data=await list();assert.equal(data[0].id,Number(low));assert.deepEqual(data.map(c=>c.alunos_faixa),[2,2,2]);
   assert.equal(data.find(c=>c.id===Number(first)).mensagem,'{nome}, renove com 10% off.');
  });
  await t.test('faixa ativa sobreposta é rejeitada inclusive em edição e ativação',async()=>{
   await assert.rejects(save(campaign({nome:'Conflito'})),/sobrepõe/);
   inactive=await save(campaign({nome:'Inativa sobreposta',status:'inativa'}));
   await assert.rejects(save(campaign({id:Number(inactive)})),/sobrepõe/);
   assert.equal((await list()).find(c=>c.id===Number(inactive)).status,'inativa');
   await save(campaign({id:Number(first),desconto_percentual:15}));
   assert.equal((await list()).find(c=>c.id===Number(first)).desconto_percentual,15);
   await assert.rejects(save(campaign({id:Number(first),churn_min:10})),/sobrepõe/);
  });
  await t.test('fim é inclusivo e períodos não coincidentes podem usar a mesma faixa',async()=>{
   await assert.rejects(save(campaign({data_inicio:'2026-11-30',data_fim:'2026-12-31'})),/sobrepõe/);
   await save(campaign({data_inicio:'2026-12-01',data_fim:'2026-12-31'}));
   await save(campaign({nome:'Faixa vizinha',churn_min:40,churn_max:60}));
  });
  await t.test('validação no servidor rejeita percentuais, tipos, datas e campos inválidos',async()=>{
   for(const extra of [{churn_min:40},{churn_min:-1},{churn_max:101},{desconto_percentual:101},{desconto_percentual:'10'},{desconto_percentual:null},{nome:' '},{mensagem:'x'.repeat(2001)},{titulo_oferta:false},{data_inicio:'0000-01-01'},{data_inicio:'2026-02-30'},{data_fim:'2026-10-28'},{data_fim:'2026-10-27'},{status:'outro'},{id:1.5},{extra:'campo'}])await assert.rejects(save(campaign({...extra,status:extra.status??'inativa'})));
   await assert.rejects(save(campaign({id:99999})),/não encontrada/);
  });
  await t.test('desativar, reativar e excluir atualizam somente campanhas',async()=>{
   await save(campaign({id:Number(first),status:'inativa'}));
   await save(campaign({id:Number(inactive),status:'ativa'}));
   await assert.rejects(save(campaign({id:Number(first),status:'ativa'})),/sobrepõe/);
   await db.query('select delete_retention_campaign($1)',[inactive]);
   assert.ok(!(await list()).some(c=>c.id===Number(inactive)));
   await save(campaign({id:Number(first),status:'ativa'}));
   assert.equal((await db.query('select churn_admin_data() d')).rows[0].d.total_predictions,8);
   await assert.rejects(db.query('select delete_retention_campaign(99999)'),/não encontrada/);
  });
  await t.test('aluno, professor, RH e anônimo não administram campanhas nem leem a tabela',async()=>{
   for(const role of ['student','teacher','rh','unknown']){
    await as(role);await assert.rejects(save(campaign()),/Somente administradores/);await assert.rejects(list(),/Somente administradores/);
    await assert.rejects(db.query('select delete_retention_campaign($1)',[first]),/Somente administradores/);
    await assert.rejects(db.exec('select * from campanhas_retencao'),/permission denied/);
   }
   await as('anon');await assert.rejects(list(),/permission denied/);await assert.rejects(save(campaign()),/permission denied/);
   await as('admin');await assert.rejects(db.exec("update campanhas_retencao set status='ativa'"),/permission denied/);
   await db.exec('reset role');assert.equal((await db.query("select relrowsecurity from pg_class where oid='public.campanhas_retencao'::regclass")).rows[0].relrowsecurity,true);
   assert.ok((await db.query("select count(*)::int n from audit_events where action like 'Campanha de retenção%'")).rows[0].n>0);
  });
 }finally{await db.close();}
});
