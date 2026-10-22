import test from 'node:test';
import assert from 'node:assert/strict';
import {COLUMNS} from '../src/domain.mjs';
import {prepareImport,importDemo} from '../src/student-import.mjs';
import {processStudentImport} from '../supabase/functions/_shared/student-import.mjs';
const row=(id='0001',extra={})=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome:'Aluno '+id,email:id+'@example.com',data_matricula:'2026-10-14',status_matricula:'Ativa','Valor Mensalidade':'450.90',...extra});
const matrix=(rows,headers=COLUMNS)=>[headers,...rows.map(r=>COLUMNS.map(c=>r[c]))];
test('importação mapeia colunas fora de ordem e formatos brasileiros',()=>{
 const r=row('0001',{data_nascimento:'15/01/2000','Valor Mensalidade':'R$ 1.250,90'});
 const headers=[...COLUMNS].reverse().map(c=>c==='id_aluno'?'Matrícula':c==='nivel_curso'?'Curso':c);
 const p=prepareImport([headers,[...COLUMNS].reverse().map(c=>r[c])]);
 assert.deepEqual(p.entries[0].reasons,[]);assert.equal(p.entries[0].row.id_aluno,'0001');assert.equal(p.entries[0].row['Valor Mensalidade'],'1250.90');assert.equal(p.entries[0].row.data_nascimento,'2000-01-15');
});
test('duplicidade de ID rejeita todas as ocorrências e não grava no demo',()=>{const p=prepareImport(matrix([row(),row()]));const state={students:[],audit:[]};const r=importDemo(p.entries,state);assert.equal(r.next.students.length,0);assert.equal(r.results.filter(r=>r.status==='rejected').length,2);assert.deepEqual(state.students,[]);});
test('ID com outra identidade e e-mail de outro ID exigem revisão',()=>{
 const old=row();assert.ok(prepareImport(matrix([row('0001',{nome:'Outra pessoa'})]),[old]).entries[0].reasons.length);
 assert.ok(prepareImport(matrix([row('0002',{email:old.email})]),[old]).entries[0].reasons.length);
});
test('demo preserva campo vazio e importa linhas válidas apesar de outras rejeitadas',()=>{
 const old=row('0001',{cidade:'Recife'});const p=prepareImport(matrix([row(),row('0002',{email:'inválido'}),row('0003')]),[old]);
 const r=importDemo(p.entries,{students:[old],audit:[]});assert.equal(r.next.students[0].cidade,'Recife');assert.equal(r.next.students.length,2);assert.equal(r.results.filter(r=>r.status==='rejected').length,1);
});
test('estrutura desconhecida e cabeçalho ambíguo não perdem campos silenciosamente',()=>{
 assert.throws(()=>prepareImport([['id','nome'],['1','A']]),/reconhecida/);
 assert.throws(()=>prepareImport([[...COLUMNS,'Nome'],[]]),/mesmo campo/);
});
function mocks({identity=null,createError=false,profileError=false,sqlError=false}={}){
 const calls=[];const admin={rpc:async()=>({data:identity}),auth:{admin:{createUser:async args=>{calls.push(['create',args]);return createError?{error:{message:'failed'}}:{data:{user:{id:'u1'}}};}}},from:()=>({insert:async args=>{calls.push(['profile',args]);return {error:profileError?{}:null};}})};
 const client={rpc:async()=>sqlError?{error:{message:'Conflito de identidade'}}:{data:'inserted'}};
 return {admin,client,calls,technicalEmail:async id=>id+'@students.speakup.invalid'};
}
test('conta nova recebe senha solicitada e vínculo student',async()=>{const m=mocks();const results=await processStudentImport({...m,rows:[{line:2,row:row()}]});assert.equal(results[0].login,'ready');assert.equal(m.calls[0][1].password,'Escola@@@');assert.equal(m.calls[1][1].role,'student');assert.equal(m.calls[1][1].student_id,'0001');});
test('reimportação não reseta senha de conta existente',async()=>{const m=mocks({identity:{user_id:'u1',role:'student',student_id:'0001'}});const r=await processStudentImport({...m,rows:[{line:2,row:row()}]});assert.equal(r[0].login,'ready');assert.equal(m.calls.length,0);});
test('falha de Auth reporta aluno salvo com login pendente, não rejeição falsa',async()=>{const m=mocks({createError:true});const r=await processStudentImport({...m,rows:[{line:2,row:row()}]});assert.equal(r[0].status,'inserted');assert.equal(r[0].login,'pending');});
test('conta criada sem perfil é recuperável sem criar outra conta',async()=>{const m=mocks({identity:{user_id:'u1',role:null,student_id:null}});const r=await processStudentImport({...m,rows:[{line:2,row:row()}]});assert.equal(r[0].login,'ready');assert.deepEqual(m.calls.map(c=>c[0]),['profile']);});
test('conflito no banco não provisiona conta e outro perfil não é tomado',async()=>{
 const m=mocks({sqlError:true});assert.equal((await processStudentImport({...m,rows:[{line:2,row:row()}]}))[0].status,'rejected');assert.equal(m.calls.length,0);
 const n=mocks({identity:{user_id:'u1',role:'admin'}});assert.equal((await processStudentImport({...n,rows:[{line:2,row:row()}]}))[0].login,'pending');assert.equal(n.calls.length,0);
});
