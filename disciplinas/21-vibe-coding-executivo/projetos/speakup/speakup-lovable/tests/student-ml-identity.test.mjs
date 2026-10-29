import test from 'node:test';
import assert from 'node:assert/strict';
import {COLUMNS} from '../src/domain.mjs';
import {seed} from '../src/demo.mjs';
import {prepareImport, importDemo} from '../src/student-import.mjs';
import {parseMlId, automaticMlId, withStudentMlIds, mlIdentityStatus, linkStudentMlId} from '../src/student-ml-identity.mjs';

test('ID ML aceita somente representação inteira positiva e segura',()=>{
  for (const value of ['',null,undefined,0,-1,'001',' 1','1 ','+1','1.0','1e2',1.5,'AL-1','9007199254740992',{},true]) {
    assert.equal(parseMlId(value),null,String(value));
  }
  assert.equal(parseMlId('123'),123);
  assert.equal(parseMlId(123),123);
  assert.equal(parseMlId('9007199254740991'),Number.MAX_SAFE_INTEGER);
  assert.equal(automaticMlId(123),null,'A matrícula de login permanece texto literal');
});

test('backfill local preserva matrícula, perfil e agendamentos e não funde 1 com 001',()=>{
  const students=[{id_aluno:'1',nome:'Um'},{id_aluno:'001',nome:'Zero Um'},{id_aluno:'AL-1',nome:'Legado'}];
  const next=withStudentMlIds(students);
  assert.deepEqual(next.map(s=>s.id_aluno_ml),[1,null,null]);
  assert.deepEqual(next.map(s=>s.id_aluno),['1','001','AL-1']);
  assert.equal(Object.hasOwn(students[0],'id_aluno_ml'),false);
  assert.deepEqual(withStudentMlIds(next),next);
  assert.equal(mlIdentityStatus(next[0],next).ready,true);
  assert.equal(mlIdentityStatus(next[1],next).ready,false);
  const demo=seed();
  assert.deepEqual(demo.students.map(s=>s.id_aluno_ml),[10045,10046,10047,10048,10049,10050]);
  assert.equal(demo.bookings[0].student,'10045');
});

test('vínculo explícito preserva zeros, rejeita duplicidade e remapeamento',()=>{
  const original=[{id_aluno:'1'},{id_aluno:'001'},{id_aluno:'AL-2'}];
  assert.throws(()=>linkStudentMlId(original,'001',1),/outra matrícula/);
  const linked=linkStudentMlId(original,'001',77);
  assert.equal(linked[1].id_aluno,'001');
  assert.equal(linked[1].id_aluno_ml,77);
  assert.deepEqual(linkStudentMlId(linked,'001','77'),linked);
  assert.throws(()=>linkStudentMlId(linked,'AL-2',77),/outra matrícula/);
  assert.throws(()=>linkStudentMlId(linked,'001',78),/não pode ser alterado/);
  assert.throws(()=>linkStudentMlId(linked,'AL-2','1e3'),/inteiro positivo/);
  assert.throws(()=>linkStudentMlId(linked,'ausente',55),/não encontrada/);
  assert.equal(Object.hasOwn(original[1],'id_aluno_ml'),false);
});

test('conflito entre matrícula numérica nova e ID manual é sinalizado sem renumerar',()=>{
  const current=withStudentMlIds([{id_aluno:'LEGADO',id_aluno_ml:123},{id_aluno:'123'}]);
  assert.equal(current[1].id_aluno_ml,null);
  assert.match(mlIdentityStatus(current[1],current).message,/outra matrícula/);
  const duplicated=[{id_aluno:'A',id_aluno_ml:10},{id_aluno:'B',id_aluno_ml:10}];
  assert.equal(mlIdentityStatus(duplicated[0],duplicated).ready,false);
});

const row=(id,extra={})=>({...Object.fromEntries(COLUMNS.map(c=>[c,''])),id_aluno:id,nome:'Aluno '+id,email:id+'@example.com',data_matricula:'2026-10-28',status_matricula:'Ativa','Valor Mensalidade':'450.00',...extra});
const matrix=rows=>[COLUMNS,...rows.map(r=>COLUMNS.map(c=>r[c]))];

test('importação cadastra o ID automaticamente e reimportação mantém vínculo manual',()=>{
  const old={...row('001'),id_aluno_ml:77};
  const preview=prepareImport(matrix([row('001'),row('123'),row('AL-1')]),[old]);
  const {next,results}=importDemo(preview.entries,{students:[old],bookings:[{student:'001'}],audit:[]});
  assert.deepEqual(results.map(r=>r.status),['updated','inserted','inserted']);
  assert.deepEqual(next.students.map(s=>s.id_aluno_ml),[77,123,null]);
  assert.equal(next.bookings[0].student,'001');
  assert.equal(old.id_aluno_ml,77);
});

test('prévia e confirmação rejeitam colisão do ID ML, inclusive se surgir após a prévia',()=>{
  const owner={...row('LEGADO'),id_aluno_ml:123};
  const blocked=prepareImport(matrix([row('123')]),[owner]);
  assert.match(blocked.entries[0].reasons.join(' '),/outra matrícula/);
  const stale=prepareImport(matrix([row('123')]));
  const {next,results}=importDemo(stale.entries,{students:[owner],audit:[]});
  assert.equal(results[0].status,'rejected');
  assert.equal(next.students.length,1);
  const conflicted=[owner,{...row('123'),id_aluno_ml:null}];
  const reimported=prepareImport(matrix([row('123')]),conflicted);
  assert.match(reimported.entries[0].reasons.join(' '),/outra matrícula/);
  const staleUpdate=importDemo(stale.entries,{students:conflicted,audit:[]});
  assert.equal(staleUpdate.results[0].status,'rejected');
  assert.equal(staleUpdate.next.students[1].id_aluno_ml,null);
});
