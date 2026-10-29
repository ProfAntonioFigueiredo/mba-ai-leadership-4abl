import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
import {COLUMNS} from '../src/domain.mjs';

test('PostgreSQL: importação de churn, limites, vínculos ML e isolamento administrativo',async t=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 const users={admin:'00000000-0000-0000-0000-000000000001',student:'00000000-0000-0000-0000-000000000002',teacher:'00000000-0000-0000-0000-000000000003',rh:'00000000-0000-0000-0000-000000000004'};
 const prediction=(id,probability,line=2)=>({line,id_aluno:id,probabilidade_churn:probability});
 async function as(role){
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[role]||'']);
  await db.exec('set role '+(role==='anon'?'anon':'authenticated'));
 }
 async function importing(rows){return(await db.query('select import_churn_predictions($1::jsonb) d',[JSON.stringify(rows)])).rows[0].d;}
 async function overview(search='',page=1,size=20){return(await db.query('select churn_admin_data($1,$2,$3) d',[search,page,size])).rows[0].d;}
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;
   create table auth.users(id uuid primary key,email text);
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to authenticated;`);
  for(const name of ['202610140001_speakup.sql','202610210001_student_import.sql','202610210002_student_grades.sql','202610280001_student_ml_identity.sql','202610280002_churn_import.sql']){
   await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
  }
  for(const [role,id] of Object.entries(users))await db.query('insert into auth.users(id,email) values($1,$2)',[id,role+'@example.com']);
  await db.query("insert into profiles(user_id,role,name) values($1,'admin','Coordenação')",[users.admin]);
  await as('admin');
  for(const [id,nome] of [['1','Aluno Um'],['001','Aluno Legado']]){
   const row={...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome,email:id+'@example.com',data_matricula:'2026-10-28',status_matricula:'Ativa','Valor Mensalidade':'450.00'};
   await db.query('select import_student_checked($1::jsonb)',[JSON.stringify(row)]);
  }
  await db.query('select link_student_ml_id($1,$2)',['001',77]);
  await db.exec('reset role');
  await db.exec("insert into teachers(name) values('Camila');insert into companies(name) values('Empresa')");
  await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Aluno 001','001')",[users.student]);
  await db.query("insert into profiles(user_id,role,name,teacher_id) values($1,'teacher','Camila',1)",[users.teacher]);
  await db.query("insert into profiles(user_id,role,name,company_id) values($1,'rh','Gestor',1)",[users.rh]);

  await t.test('banco vazio retorna as cinco faixas e nenhuma previsão',async()=>{
   await as('admin');const d=await overview();
   assert.deepEqual(d.rows,[]);assert.equal(d.total,0);assert.equal(d.total_predictions,0);assert.equal(d.linked,0);
   assert.deepEqual(d.bands,[{label:'0–20',count:0},{label:'20–40',count:0},{label:'40–60',count:0},{label:'60–80',count:0},{label:'80–100',count:0}]);
  });

  const boundaryRows=[prediction(1,0,2),prediction(2,19.9,3),prediction(3,20,4),prediction(4,39.99,5),prediction(5,40,6),prediction(6,59.999,7),prediction(7,60,8),prediction(8,79.9,9),prediction(9,80,10),prediction(10,100,11),prediction(77,88,12),prediction(99,37.5,13)];
  await t.test('importa números e IDs sem cadastro, preservando linha e precisão',async()=>{
   await as('admin');const result=await importing(boundaryRows);
   assert.equal(result.inserted,12);assert.equal(result.updated,0);assert.equal(result.rejected,0);
   assert.deepEqual(result.results,boundaryRows.map(r=>({line:r.line,id_aluno:r.id_aluno,status:'inserted'})));
   const d=await overview();assert.equal(d.total_predictions,12);assert.equal(d.linked,2);
   assert.equal(d.rows.find(r=>r.id_aluno===6).probabilidade_churn,59.999);
   assert.ok(d.rows.every(r=>!Number.isNaN(Date.parse(r.data_importacao))));
  });

  await t.test('faixas incluem limites inferiores e 100 apenas na última',async()=>{
   await as('admin');const d=await overview();
   assert.deepEqual(d.bands.map(b=>b.count),[2,3,2,2,3]);
   assert.equal(d.bands.reduce((n,b)=>n+b.count,0),d.total_predictions);
   assert.deepEqual(d.rows.map(r=>r.id_aluno),[10,77,9,8,7,6,5,4,99,3,2,1]);
  });

  await t.test('join usa id_aluno_ml; não remove zeros da matrícula nem inventa nomes',async()=>{
   await as('admin');const d=await overview();
   assert.equal(d.rows.find(r=>r.id_aluno===1).nome,'Aluno Um');
   assert.equal(d.rows.find(r=>r.id_aluno===77).nome,'Aluno Legado');
   assert.equal(d.rows.find(r=>r.id_aluno===99).nome,null);
   const filtered=await overview('LEGADO');assert.equal(filtered.total,1);assert.equal(filtered.rows[0].id_aluno,77);
   assert.equal(filtered.total_predictions,12);assert.equal(filtered.linked,2);
   assert.deepEqual(filtered.bands,d.bands,'Resumo é global, não apenas o resultado da busca');
   assert.equal((await overview('%')).total,0);assert.equal((await overview('_')).total,0);
  });

  await t.test('reimportação atualiza sem duplicar e sem arredondar probabilidades',async()=>{
   await as('admin');const before=(await overview('99')).rows.find(r=>r.id_aluno===99);
   const result=await importing([prediction(99,37.51234567,22)]);
   assert.deepEqual(result,{results:[{line:22,id_aluno:99,status:'updated'}],inserted:0,updated:1,rejected:0});
   const after=(await overview('99')).rows[0];
   assert.equal(after.probabilidade_churn,37.51234567);assert.ok(Date.parse(after.data_importacao)>=Date.parse(before.data_importacao));
   assert.equal((await overview()).total_predictions,12);
  });

  await t.test('duplicados no lote rejeitam todas as ocorrências e preservam valor anterior',async()=>{
   await as('admin');
   const result=await importing([prediction(1,55),prediction(1,80,3),prediction(300,50,4),prediction(300,'inválido',5),prediction(301,33,6)]);
   assert.equal(result.inserted,1);assert.equal(result.updated,0);assert.equal(result.rejected,4);
   assert.ok(result.results.slice(0,4).every(r=>r.status==='rejected'&&/duplicado/.test(r.reason)));
   assert.equal((await overview('1',1,100)).rows.find(r=>r.id_aluno===1).probabilidade_churn,0);
   assert.equal((await overview('300')).total,0);
  });

  await t.test('lote parcialmente inválido não impede linha válida',async()=>{
   await as('admin');
   const invalid=[prediction('400',15),prediction(null,15),prediction(true,15),prediction(0,15),prediction(-4,15),prediction(4.5,15),prediction('9007199254740992',15),prediction(9007199254740992,15),
    prediction(400,'12.0'),prediction(401,null),prediction(402,false),prediction(403,-0.1),prediction(404,100.1),prediction(405,'NaN'),prediction(406,'Infinity'),
    {line:20,id_aluno:407}, {line:21,id_aluno:408,probabilidade_churn:20,extra:'não permitido'},prediction(409,20,'22'),prediction(410,20,1),prediction(411,20,2.5),null,12];
   const result=await importing([...invalid,prediction(450,12.3456789,95)]);
   assert.equal(result.rejected,invalid.length);assert.equal(result.inserted,1);assert.equal(result.updated,0);
   assert.ok(result.results.slice(0,-1).every(r=>r.status==='rejected'&&r.reason));
   assert.deepEqual(result.results.at(-1),{line:95,id_aluno:450,status:'inserted'});
   assert.equal((await overview('450')).rows[0].probabilidade_churn,12.3456789);
  });

  await t.test('NaN/Infinity de NUMERIC viram texto JSON e são rejeitados; tabela também protege intervalo',async()=>{
   await as('admin');
   const result=(await db.query("select import_churn_predictions(jsonb_build_array(jsonb_build_object('line',2,'id_aluno',600,'probabilidade_churn','NaN'::numeric),jsonb_build_object('line',3,'id_aluno',601,'probabilidade_churn','Infinity'::numeric))) d")).rows[0].d;
   assert.equal(result.rejected,2);assert.equal(result.inserted,0);
   await db.exec('reset role');
   await assert.rejects(db.exec("insert into churn_previsao values(600,'NaN'::numeric,now())"),/check constraint/);
   await assert.rejects(db.exec("insert into churn_previsao values(600,'Infinity'::numeric,now())"),/check constraint/);
   await assert.rejects(db.exec("insert into churn_previsao values(0,10,now())"),/check constraint/);
   await assert.rejects(db.exec("insert into churn_previsao values(9007199254740992,10,now())"),/check constraint/);
  });

  await t.test('paginação ordena risco decrescente e desempata pelo ID',async()=>{
   await as('admin');await importing([prediction(500,90),prediction(501,90,3)]);
   const one=await overview('',1,3);const two=await overview('',2,3);
   assert.deepEqual(one.rows.map(r=>r.id_aluno),[10,500,501]);
   assert.deepEqual(two.rows.map(r=>r.id_aluno),[77,9,8]);
   assert.equal(one.page,1);assert.equal(one.page_size,3);assert.equal(two.total,one.total);
   assert.equal((await overview('',2147483647,100)).rows.length,0);
   await assert.rejects(overview('',0,20),/página positiva/);
   await assert.rejects(overview('',1,101),/entre 1 e 100/);
   await assert.rejects(overview('x'.repeat(201)),/200 caracteres/);
  });

  await t.test('aceita lote de 500; estrutura inválida e 501 linhas abortam sem gravações',async()=>{
   await as('admin');
   const batch=Array.from({length:500},(_,i)=>prediction(10000+i,i%101,1000+i));
   const result=await importing(batch);assert.equal(result.inserted,500);assert.equal(result.rejected,0);
   const before=(await overview()).total_predictions;
   for(const invalid of [null,{},'not-array',[],[...batch,prediction(10500,2)]])await assert.rejects(importing(invalid),/1 e 500/);
   assert.equal((await overview()).total_predictions,before);
   assert.equal((await overview('10500')).total,0);
   const max=await importing([prediction(Number.MAX_SAFE_INTEGER,20)]);assert.equal(max.inserted,1);
   assert.equal((await overview(String(Number.MAX_SAFE_INTEGER))).rows[0].id_aluno,Number.MAX_SAFE_INTEGER);
  });

  await t.test('tabelas são privadas; aluno, professor, RH e anônimo não consultam/importam',async()=>{
   for(const role of ['student','teacher','rh','unknown']){
    await as(role);
    await assert.rejects(importing([prediction(800,10)]),/Somente administradores/);
    await assert.rejects(overview(),/Somente administradores/);
    await assert.rejects(db.exec('select * from churn_previsao'),/permission denied/);
    if(role!=='unknown'){
     const d=(await db.query('select workspace_data() d')).rows[0].d;
     assert.ok(!JSON.stringify(d).includes('probabilidade_churn'));
    }
   }
   await as('anon');await assert.rejects(importing([prediction(800,10)]),/permission denied/);await assert.rejects(overview(),/permission denied/);
   await as('admin');
   await assert.rejects(db.exec('select * from churn_previsao'),/permission denied/);
   await assert.rejects(db.exec('insert into churn_previsao(id_aluno,probabilidade_churn) values(800,10)'),/permission denied/);
   await db.exec('reset role');
   assert.equal((await db.query("select relrowsecurity from pg_class where oid='public.churn_previsao'::regclass")).rows[0].relrowsecurity,true);
   assert.equal((await db.query("select has_function_privilege('anon','public.import_churn_predictions(jsonb)','EXECUTE') allowed")).rows[0].allowed,false);
   assert.equal((await db.query("select has_function_privilege('anon','public.churn_admin_data(text,integer,integer)','EXECUTE') allowed")).rows[0].allowed,false);
   const logs=(await db.query("select details from audit_events where action='Importação de previsão de churn'")).rows;
   assert.ok(logs.length>0);
   assert.ok(logs.every(r=>Object.keys(r.details).sort().join(',')==='inserted,rejected,rows,updated'));
  });
 }finally{await db.close();}
});
