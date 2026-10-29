import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
import {COLUMNS} from '../src/domain.mjs';

test('ID ML: preparação numérica preserva matrículas e vínculos existentes',async t=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 const users={admin:'00000000-0000-0000-0000-000000000001',student:'00000000-0000-0000-0000-000000000002',teacher:'00000000-0000-0000-0000-000000000003'};
 const row=(id,extra={})=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome:'Aluno '+id,email:id+'@example.com',data_matricula:'2026-10-28',status_matricula:'Ativa','Valor Mensalidade':'450.00',...extra});
 async function migration(name){await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));}
 async function as(role){
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[role]||'']);
  await db.exec('set role '+(role==='anon'?'anon':'authenticated'));
 }
 async function importOne(r){return (await db.query('select import_student_checked($1::jsonb) result',[JSON.stringify(r)])).rows[0].result;}
 async function workspace(){return (await db.query('select workspace_data() d')).rows[0].d;}
 async function link(id,value){return (await db.query('select link_student_ml_id($1,$2::bigint) result',[id,value])).rows[0].result;}
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;
   create table auth.users(id uuid primary key,email text);
   create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
   grant usage on schema auth to authenticated;`);
  for(const name of ['202610140001_speakup.sql','202610210001_student_import.sql','202610210002_student_grades.sql'])await migration(name);
  for(const [role,id] of Object.entries(users))await db.query('insert into auth.users(id,email) values($1,$2)',[id,role+'@example.com']);
  await db.query("insert into profiles(user_id,role,name) values($1,'admin','Coordenação')",[users.admin]);
  await as('admin');
  const originals=['1','001','LEGADO-A','0','9007199254740991','9007199254740992','99999999999999999999999999999999999999999999999999'];
  for(const id of originals)await importOne(row(id));
  await db.exec('reset role');
  await db.exec("insert into teachers(name) values('Camila');insert into companies(name) values('Empresa');insert into student_companies(student_id,company_id) values('001',1)");
  await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Aluno 001','001')",[users.student]);
  await db.query("insert into profiles(user_id,role,name,teacher_id) values($1,'teacher','Camila',1)",[users.teacher]);
  await db.exec("insert into student_grades(student_id,disciplina,nota,situacao) values('001','Inglês',8,'Aprovado')");
  await as('admin');
  const slot=(await db.query('select create_slot($1::jsonb) id',[JSON.stringify({teacher:'Camila',group:'Grupo A',start:'2099-01-01T09:00Z',end:'2099-01-01T10:00Z',capacity:5})])).rows[0].id;
  await as('student');
  const booking=(await db.query('select book_class($1) id',[slot])).rows[0].id;
  await db.exec('reset role');
  await migration('202610280001_student_ml_identity.sql');

  await t.test('backfill só aceita inteiros positivos canônicos e seguros',async()=>{
   await as('admin');
   const students=(await workspace()).students;
   assert.equal(students.find(s=>s.id_aluno==='1').id_aluno_ml,1);
   assert.equal(students.find(s=>s.id_aluno==='9007199254740991').id_aluno_ml,Number.MAX_SAFE_INTEGER);
   for(const id of originals.filter(x=>!['1','9007199254740991'].includes(x)))assert.equal(students.find(s=>s.id_aluno===id).id_aluno_ml,null,id);
   assert.deepEqual(students.map(s=>s.id_aluno).sort(),originals.toSorted());
  });

  await t.test('novos alunos recebem ID ML automático sem mudar contrato de importação',async()=>{
   await as('admin');
   assert.equal(await importOne(row('123')),'inserted');
   assert.equal((await workspace()).students.find(s=>s.id_aluno==='123').id_aluno_ml,123);
   assert.equal(await importOne(row('0002')),'inserted');
   assert.equal((await workspace()).students.find(s=>s.id_aluno==='0002').id_aluno_ml,null);
   assert.equal(await importOne(row('NOVO-A')),'inserted');
   assert.equal((await workspace()).students.find(s=>s.id_aluno==='NOVO-A').id_aluno_ml,null);
  });

  await t.test('admin vincula legado explicitamente; reimportação não altera vínculo',async()=>{
   await as('admin');
   assert.equal(await link('001',77),77);
   assert.equal(await link('001',77),77);
   assert.equal(await importOne(row('001',{cidade:'Recife'})),'updated');
   const aluno=(await workspace()).students.find(s=>s.id_aluno==='001');
   assert.equal(aluno.id_aluno_ml,77);assert.equal(aluno.id_aluno,'001');assert.equal(aluno.cidade,'Recife');
   await assert.rejects(link('001',78),/não pode ser renumerado/);
   await assert.rejects(link('0002',77),/já vinculado/);
   await assert.rejects(link('LEGADO-A',1),/já vinculado/);
   await assert.rejects(link('inexistente',80),/não encontrada/);
  });

  await t.test('colisão de nova matrícula canônica exige revisão em vez de renumerar',async()=>{
   await as('admin');
   assert.equal(await link('LEGADO-A',456),456);
   await assert.rejects(importOne(row('456')),/Revisão manual/);
   assert.equal((await workspace()).students.some(s=>s.id_aluno==='456'),false);
   assert.equal((await workspace()).students.find(s=>s.id_aluno==='LEGADO-A').id_aluno_ml,456);
  });

  await t.test('IDs inválidos não entram no vínculo manual nem por escrita direta',async()=>{
   await as('admin');
   for(const value of [null,0,-1,'9007199254740992'])await assert.rejects(link('0002',value),/inteiro positivo e seguro/);
   await assert.rejects(link('0002','1.5'),/invalid input syntax/);
   await assert.rejects(db.exec("update tb_aluno set id_aluno_ml=80 where id_aluno='0002'"),/permission denied/);
   await assert.rejects(db.query('select student_ml_id_from_matricula($1)',['1']),/permission denied/);
   await db.exec('reset role');
   await assert.rejects(db.exec("update tb_aluno set id_aluno_ml=0 where id_aluno='0002'"),/inteiro positivo e seguro/);
   await assert.rejects(db.exec("update tb_aluno set id_aluno_ml=null where id_aluno='001'"),/não pode ser renumerado/);
  });

  await t.test('aluno mantém matrícula, perfil, reserva, empresa e notas; não pode vincular IDs',async()=>{
   await as('student');
   assert.equal((await db.query('select public.current_role() role')).rows[0].role,'student');
   const d=await workspace();
   assert.equal(d.students.length,1);assert.equal(d.students[0].id_aluno,'001');assert.equal(d.students[0].id_aluno_ml,77);
   assert.equal(d.bookings.find(b=>b.id===Number(booking)).student,'001');
   await assert.rejects(link('0002',80),/Somente administradores/);
   await as('teacher');await assert.rejects(link('0002',80),/Somente administradores/);
   await as('anon');await assert.rejects(link('0002',80),/permission denied/);
   await as('unknown');await assert.rejects(link('0002',80),/Somente administradores/);
   await db.exec('reset role');
   assert.equal((await db.query("select student_id from profiles where user_id=$1",[users.student])).rows[0].student_id,'001');
   assert.equal((await db.query("select student_id from student_companies where student_id='001'")).rows[0].student_id,'001');
   assert.equal((await db.query("select student_id from student_grades where student_id='001'")).rows[0].student_id,'001');
   assert.equal((await db.query("select count(*)::int n from audit_events where action='ID ML vinculado ao aluno'")).rows[0].n,2);
  });
 }finally{await db.close();}
});
