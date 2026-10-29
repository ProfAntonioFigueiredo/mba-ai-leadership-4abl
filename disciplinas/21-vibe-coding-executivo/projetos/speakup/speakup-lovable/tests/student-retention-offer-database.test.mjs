import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
import {COLUMNS} from '../src/domain.mjs';

test('PostgreSQL: oferta no login, privacidade, respostas e isolamento entre alunos',async t=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 const ids={admin:'00000000-0000-0000-0000-000000000001',student:'00000000-0000-0000-0000-000000000002',other:'00000000-0000-0000-0000-000000000003',teacher:'00000000-0000-0000-0000-000000000004',rh:'00000000-0000-0000-0000-000000000005'};
 const token=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
 const as=async role=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[role]??'']);await db.exec('set role '+(role==='anon'?'anon':'authenticated'));};
 const get=async n=>(await db.query('select get_student_retention_offer($1::uuid) d',[token(n)])).rows[0].d;
 const respond=async(id,res)=>(await db.query('select respond_student_retention_offer($1,$2) d',[id,res])).rows[0].d;
 let day,end,campaign,offer;
 const row=(id,nome)=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome,email:id+'@example.com',data_matricula:'2026-10-28',status_matricula:'Ativa','Valor Mensalidade':'450.00'});
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;
  create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
  for(const name of ['202610140001_speakup.sql','202610210001_student_import.sql','202610210002_student_grades.sql','202610280001_student_ml_identity.sql','202610280002_churn_import.sql','202610280003_retention_campaigns.sql','202610280004_student_retention_offer.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
  for(const id of Object.values(ids))await db.query('insert into auth.users(id) values($1)',[id]);
  await db.query("insert into profiles(user_id,role,name) values($1,'admin','Coordenação')",[ids.admin]);
  await as('admin');
  for(const r of [row('001','Ana Maria Souza'),row('077','Outro Aluno')])await db.query('select import_student_checked($1::jsonb)',[JSON.stringify(r)]);
  await db.query('select link_student_ml_id($1,$2)',['001',77]);
  await db.query('select link_student_ml_id($1,$2)',['077',88]);
  await db.exec('reset role');await db.exec("insert into teachers(name) values('Teacher');insert into companies(name) values('Empresa')");
  await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Ana','001'),($2,'student','Outro','077')",[ids.student,ids.other]);
  await db.query("insert into profiles(user_id,role,name,teacher_id) values($1,'teacher','Teacher',1)",[ids.teacher]);
  await db.query("insert into profiles(user_id,role,name,company_id) values($1,'rh','RH',1)",[ids.rh]);
  const dates=(await db.query("select ((now() at time zone 'America/Sao_Paulo')::date)::text d,(((now() at time zone 'America/Sao_Paulo')::date)+30)::text e")).rows[0];day=dates.d;end=dates.e;
  await t.test('sem churn, sem campanha e campanha inativa não geram exposição',async()=>{
   await as('student');assert.equal(await get(1),null);
   await as('admin');await db.query('select import_churn_predictions($1::jsonb)',[JSON.stringify([{line:2,id_aluno:77,probabilidade_churn:37.5}])]);
   await as('student');assert.equal(await get(1),null);
   await as('admin');campaign=(await db.query('select save_retention_campaign($1::jsonb) id',[JSON.stringify({nome:'Renove',churn_min:20,churn_max:40,desconto_percentual:10,titulo_oferta:'Seu próximo nível',mensagem:'{nome}, renove agora, {nome}!',data_inicio:day,data_fim:end,status:'inativa'})])).rows[0].id;
   await as('student');assert.equal(await get(1),null);
   await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from oferta_exibida')).rows[0].n,0);
  });
  await t.test('vínculo numérico escolhe a pessoa correta; JSON não contém risco ou IDs privados',async()=>{
   await db.exec('reset role');await db.query("update campanhas_retencao set status='ativa' where id=$1",[campaign]);
   await as('other');assert.equal(await get(1),null,'A matrícula textual 077 tem ID ML diferente de 77');
   await as('student');offer=await get(1);
   assert.deepEqual(Object.keys(offer).sort(),['desconto_percentual','mensagem','oferta_id','titulo_oferta','validade']);
   assert.equal(offer.mensagem,'Ana, renove agora, Ana!');assert.equal(offer.desconto_percentual,10);assert.equal(offer.validade,end);
   assert.ok(!JSON.stringify(offer).includes('probabilidade'));assert.ok(!JSON.stringify((await db.query('select workspace_data() d')).rows[0].d).includes('probabilidade_churn'));
   await assert.rejects(db.exec('select * from churn_previsao'),/permission denied/);await assert.rejects(db.exec('select * from oferta_exibida'),/permission denied/);
  });
  await t.test('idempotência por login e nova exibição sem resposta em login posterior',async()=>{
   await as('student');assert.equal((await get(1)).oferta_id,offer.oferta_id);
   const next=await get(2);assert.notEqual(next.oferta_id,offer.oferta_id);
   await db.exec('reset role');const rows=(await db.query('select * from oferta_exibida order by id')).rows;
   assert.equal(rows.length,2);assert.ok(rows.every(r=>r.resposta==='sem resposta'&&r.respondida_em===null&&r.student_id==='001'&&r.id_aluno===77));
  });
  await t.test('resposta de outro aluno é rejeitada e aceite suprime a campanha nos próximos logins',async()=>{
   await as('other');await assert.rejects(respond(offer.oferta_id,'aceitou'),/não encontrada/);
   await as('student');assert.deepEqual(await respond(offer.oferta_id,'aceitou'),{resposta:'aceitou',ja_respondida:false});
   assert.equal(await get(3),null);assert.deepEqual(await respond(offer.oferta_id,'aceitou'),{resposta:'aceitou',ja_respondida:true});
   assert.deepEqual(await respond(offer.oferta_id,'recusou'),{resposta:'aceitou',ja_respondida:true});
   await assert.rejects(respond(offer.oferta_id,'sem resposta'),/inválida/);
   await db.exec('reset role');const answered=(await db.query("select * from oferta_exibida where resposta='aceitou'")).rows;
   assert.equal(answered.length,1);assert.ok(answered[0].respondida_em);
  });
  await t.test('recusa é registrada e preserva histórico após excluir campanha',async()=>{
   await db.exec('reset role');await db.query("update campanhas_retencao set status='inativa' where id=$1",[campaign]);
   await as('admin');const c=(await db.query('select save_retention_campaign($1::jsonb) id',[JSON.stringify({nome:'Outra',churn_min:20,churn_max:40,desconto_percentual:15,titulo_oferta:'Nova oferta',mensagem:'{nome}, continue!',data_inicio:day,data_fim:end,status:'ativa'})])).rows[0].id;
   await as('student');const o=await get(4);assert.equal(o.desconto_percentual,15);
   assert.equal((await respond(o.oferta_id,'recusou')).resposta,'recusou');assert.equal(await get(5),null);
   await as('admin');await db.query('select delete_retention_campaign($1)',[c]);
   await db.exec('reset role');const log=(await db.query('select * from oferta_exibida where id=$1',[o.oferta_id])).rows[0];
   assert.equal(log.resposta,'recusou');assert.equal(log.titulo_oferta,'Nova oferta');assert.equal(log.campanha_id,Number(c));
  });
  await t.test('campanha fora da validade ou fora da faixa é silenciosa; 100 é elegível na última',async()=>{
   await as('admin');const c=(await db.query('select save_retention_campaign($1::jsonb) id',[JSON.stringify({nome:'Última',churn_min:80,churn_max:100,desconto_percentual:25,titulo_oferta:'Última oferta',mensagem:'{nome}, vamos continuar.',data_inicio:day,data_fim:end,status:'ativa'})])).rows[0].id;
   await as('student');assert.equal(await get(6),null);
   await as('admin');await db.query('select import_churn_predictions($1::jsonb)',[JSON.stringify([{line:2,id_aluno:77,probabilidade_churn:100}])]);
   await as('student');const o=await get(6);assert.equal(o.desconto_percentual,25);
   await db.exec('reset role');await db.query("update campanhas_retencao set status='inativa' where id=$1",[c]);
   await as('student');await assert.rejects(respond(o.oferta_id,'aceitou'),/não está mais disponível/);
   assert.equal((await respond(o.oferta_id,'recusou')).resposta,'recusou');
   await db.exec('reset role');await db.query("update campanhas_retencao set status='ativa',data_inicio=($2::date+1),data_fim=($2::date+30) where id=$1",[c,day]);
   await as('student');assert.equal(await get(7),null);
  });
  await t.test('outros perfis, usuário sem perfil e anônimo não consultam ou respondem',async()=>{
   for(const role of ['admin','teacher','rh','unknown']){
    await as(role);await assert.rejects(get(8),/Somente o aluno/);await assert.rejects(respond(offer.oferta_id,'aceitou'),/Somente o aluno/);
   }
   await as('anon');await assert.rejects(get(8),/permission denied/);await assert.rejects(respond(offer.oferta_id,'aceitou'),/permission denied/);
   await as('student');await assert.rejects(db.exec("update oferta_exibida set resposta='aceitou'"),/permission denied/);
   await db.exec('reset role');assert.equal((await db.query("select relrowsecurity from pg_class where oid='public.oferta_exibida'::regclass")).rows[0].relrowsecurity,true);
  });
 }finally{await db.close();}
});
