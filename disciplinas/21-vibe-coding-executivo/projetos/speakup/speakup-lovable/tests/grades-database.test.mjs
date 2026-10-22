import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
import {COLUMNS} from '../src/domain.mjs';
test('API notas: PostgreSQL, autorização explícita, isolamento e ausência de dados inventados',async()=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 try {
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
  for(const file of ['202610140001_speakup.sql','202610210001_student_import.sql','202610210002_student_grades.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
  const ids={admin:'00000000-0000-0000-0000-000000000001',rh:'00000000-0000-0000-0000-000000000002',rh2:'00000000-0000-0000-0000-000000000003',student:'00000000-0000-0000-0000-000000000004',teacher:'00000000-0000-0000-0000-000000000005'};
  for(const [role,id] of Object.entries(ids))await db.query('insert into auth.users(id,email) values($1,$2)',[id,role+'@fixture.test']);
  await db.query("insert into profiles(user_id,role,name) values($1,'admin','Admin fixture')",[ids.admin]);
  async function as(role){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[ids[role]||'']);await db.exec('set role '+(role==='anon'?'anon':'authenticated'));}
  const row=(id,nome)=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome,email:id+'@fixture.test',data_matricula:'2026-10-21',status_matricula:'Ativa','Valor Mensalidade':'100'});
  await as('admin');await db.query('select import_students($1::jsonb)',[JSON.stringify([row('001','Aluno Um'),row('002','Aluno Dois')])]);
  const consult=async(id,name)=>(await db.query('select consult_student_grades($1,$2) d',[id,name])).rows[0].d;
  const empty=await consult('001','Aluno Um');assert.equal(empty.http_status,200);assert.deepEqual(empty.body.disciplinas,[]);assert.match(empty.body.mensagem,/sem notas/);
  await db.exec('reset role');await db.exec("insert into companies(name) values('Empresa A fixture'),('Empresa B fixture');insert into teachers(name) values('Professor fixture');insert into student_companies values('001',1),('002',2)");
  await db.query("insert into profiles(user_id,role,name,company_id) values($1,'rh','RH A',1),($2,'rh','RH B',2)",[ids.rh,ids.rh2]);
  await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Aluno','001')",[ids.student]);
  await db.query("insert into profiles(user_id,role,name,teacher_id) values($1,'teacher','Professor',1)",[ids.teacher]);
  await as('rh');assert.equal((await consult('001','Aluno Um')).http_status,403,'RH agregado não ganha acesso nominal automaticamente');
  await db.exec('reset role');await db.query('insert into grade_api_access(user_id,company_id) values($1,1),($2,2)',[ids.rh,ids.rh2]);
  // Fixtures apenas neste banco de teste: não são notas carregadas na aplicação.
  await db.exec("insert into student_grades(student_id,disciplina,nota,situacao) values('001','Disciplina de teste',7.25,'Situação da fixture')");
  await as('rh');const success=await consult('001','  aluno   um  ');assert.equal(success.http_status,200);assert.deepEqual(success.body.disciplinas,[{disciplina:'Disciplina de teste',nota:7.25,situacao:'Situação da fixture'}]);assert.equal(success.body.aluno.nome,'Aluno Um');
  const outside=await consult('002','Aluno Dois');const wrong=await consult('001','Nome errado');const missing=await consult('999','Nome ausente');
  assert.equal(outside.http_status,404);assert.deepEqual(outside,wrong);assert.deepEqual(outside,missing);
  await assert.rejects(db.query('select * from student_grades'),/permission denied/);await assert.rejects(db.exec('update grade_api_access set active=true'),/permission denied/);
  assert.equal((await consult('','Nome')).http_status,400);
  await db.exec('reset role');await db.query('update grade_api_access set active=false where user_id=$1',[ids.rh]);await as('rh');assert.equal((await consult('001','Aluno Um')).http_status,403);
  await as('rh2');assert.equal((await consult('001','Aluno Um')).http_status,404);assert.equal((await consult('002','Aluno Dois')).http_status,200);
  await as('student');assert.equal((await consult('001','Aluno Um')).http_status,403);
  await as('teacher');assert.equal((await consult('001','Aluno Um')).http_status,403);
  await as('anon');await assert.rejects(consult('001','Aluno Um'),/permission denied/);
  await as('admin');assert.equal((await consult('002','Aluno Dois')).http_status,200);
 }finally{await db.close();}
});
