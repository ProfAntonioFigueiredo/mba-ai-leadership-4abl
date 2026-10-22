import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {btree_gist} from '@electric-sql/pglite/contrib/btree_gist';
import {COLUMNS} from '../src/domain.mjs';
test('nova migração: importação conservadora, permissões e preservação no PostgreSQL',async()=>{
 const db=await PGlite.create({extensions:{btree_gist}});
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create schema extensions;set search_path=public,extensions;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;`);
 for(const name of ['202610140001_speakup.sql','202610210001_student_import.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 const admin='00000000-0000-0000-0000-000000000001';
 await db.query('insert into auth.users(id,email) values($1,$2)',[admin,'admin@example.com']);
 await db.query("insert into profiles(user_id,role,name) values($1,'admin','ADM')",[admin]);
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[admin]);await db.exec('set role authenticated');
 const row=(id,extra={})=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome:'Aluno '+id,email:id+'@example.com',data_matricula:'2026-10-14',status_matricula:'Ativa','Valor Mensalidade':'450.90',...extra});
 const importOne=async r=>(await db.query('select import_student_checked($1::jsonb) result',[JSON.stringify(r)])).rows[0].result;
 assert.equal(await importOne(row('001',{cidade:'Recife'})),'inserted');
 assert.equal(await importOne(row('001')),'updated');
 assert.equal((await db.query('select workspace_data() d')).rows[0].d.students[0].cidade,'Recife');
 await assert.rejects(importOne(row('001',{nome:'Outra pessoa'})),/Revisão manual/);
 await assert.rejects(importOne(row('002',{email:'001@example.com'})),/outro identificador/);
 await assert.rejects(db.query('select import_students_unchecked($1::jsonb)',[JSON.stringify([row('003')])]),/permission denied/);
 await assert.rejects(db.query('select import_login_identity($1,$2)',['001@students.speakup.invalid','001']),/permission denied/);
 await assert.rejects(db.query('select import_students($1::jsonb)',[JSON.stringify([row('004'),row('004')])]),/duplicado/);
 assert.equal((await db.query('select workspace_data() d')).rows[0].d.students.length,1);
 const student='00000000-0000-0000-0000-000000000002';
 await db.exec('reset role');await db.query('insert into auth.users(id,email) values($1,$2)',[student,'student@example.com']);
 await db.query("insert into profiles(user_id,role,name,student_id) values($1,'student','Aluno','001')",[student]);
 await db.exec("update tb_aluno set status_matricula='Pausada' where id_aluno='001'");
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[student]);await db.exec('set role authenticated');
 assert.equal((await db.query('select public.current_role() r')).rows[0].r,'student');
 assert.equal((await db.query('select workspace_data() d')).rows[0].d.students[0].id_aluno,'001');
 await assert.rejects(db.query('select book_class(9999)'),/matrícula ativa/);
 await assert.rejects(importOne(row('006')),/administradores/);
 await db.query("select set_config('request.jwt.claim.sub','',false)");
 await assert.rejects(importOne(row('005')),/administradores/);
 await db.exec('reset role; set role anon');await assert.rejects(importOne(row('005')),/permission denied/);
 }finally{await db.close();}
});


