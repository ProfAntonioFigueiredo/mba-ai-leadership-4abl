import test from 'node:test';
import assert from 'node:assert/strict';
import {consultLocalStudent} from '../src/student-query.mjs';
const student={id_aluno:'001',nome:'Ana Teste',status_matricula:'Ativa',email:'privado@fixture.test'};
const query=options=>consultLocalStudent({user:{role:'admin'},students:[student],id:'001',...options});
test('consulta local encontra ID textual e não inventa notas nem expõe e-mail',async()=>{const r=await query();assert.equal(r.status,200);const b=await r.json();assert.equal(b.aluno.id_aluno,'001');assert.equal(b.aluno.nome,student.nome);assert.deepEqual(b.disciplinas,[]);assert.ok(!('email' in b.aluno));});
test('consulta local valida ID, nome opcional e sessão',async()=>{assert.equal((await query({id:''})).status,400);assert.equal((await query({id:'999'})).status,404);assert.equal((await query({nome:'Outro nome'})).status,404);assert.equal((await query({nome:' ana  teste '})).status,200);assert.equal((await query({user:{role:'rh'}})).status,403);assert.equal((await query({user:null})).status,403);});
test('consulta local usa alunos importados sem alterar o estado e rejeita ID ambíguo',async()=>{const students=[student,{...student,id_aluno:'novo'}];const before=JSON.stringify(students);assert.equal((await query({students,id:'novo'})).status,200);assert.equal(JSON.stringify(students),before);assert.equal((await query({students:[student,student]})).status,409);});
