import test from 'node:test';
import assert from 'node:assert/strict';
import {CHURN_COLUMNS, CHURN_BATCH_SIZE, CHURN_MAX_ROWS, prepareChurnImport, chunks, importChurnDemoBatch, churnAdminData} from '../src/churn-import.mjs';

const AT = '2026-10-28T23:33:29.000Z';
const matrix = rows => [CHURN_COLUMNS, ...rows];
const record = (id, p = 37.5, line = id + 1) => ({line, id_aluno: id, probabilidade_churn: p});

test('prévia exige as duas colunas oficiais e preserva o zero numérico', () => {
  const preview = prepareChurnImport([['\uFEFFid_aluno', 'probabilidade_churn'], [1, 0], [2, 100], [3, 37.5]]);
  assert.equal(preview.total, 3); assert.equal(preview.valid, 3); assert.equal(preview.invalid, 0);
  assert.equal(preview.entries[0].row.probabilidade_churn, 0);
  assert.equal(preview.entries[0].line, 2);
  for (const input of [[], null, [['id_aluno']], [['probabilidade_churn','id_aluno'],[10,1]],
    [['id_aluno','probabilidade_churn','nome'],[1,10,'Aluno']], [['ID_ALUNO','probabilidade_churn'],[1,10]],
    [['id_aluno ','probabilidade_churn'],[1,10]], [Array(2),[1,10]]]) assert.throws(() => prepareChurnImport(input), /duas colunas/);
  assert.throws(() => prepareChurnImport([CHURN_COLUMNS]), /não contém/);
});

test('prévia rejeita células vazias, texto numérico, datas, booleanos e limites inválidos', () => {
  const bad = [[null, 10], ['1', 10], [0, 10], [-1,10], [1.5,10], [Number.MAX_SAFE_INTEGER+1,10],
    [1,'37.5'], [2,true], [3,null], [4,NaN], [5,Infinity], [6,-0.1], [7,100.1], [8,new Date()],
    [9,undefined], [], [10,10,'extra'], undefined];
  const input = matrix(bad);
  const preview = prepareChurnImport(input);
  assert.equal(preview.invalid, bad.length);
  assert.equal(preview.valid, 0);
  assert.equal(preview.entries[6].row.probabilidade_churn, '37.5');
  assert.equal(prepareChurnImport(matrix([[Number.MAX_SAFE_INTEGER,10]])).valid, 1);
});

test('IDs duplicados são rejeitados globalmente inclusive entre lotes e linhas já inválidas', () => {
  const rows = Array.from({length: 1001}, (_, i) => [i + 1, 20]);
  rows[1000][0] = 1;
  rows[1000][1] = 'inválido';
  const preview = prepareChurnImport(matrix(rows));
  assert.equal(preview.invalid, 2);
  assert.match(preview.entries[0].reasons.join(' '), /todas as ocorrências/);
  assert.match(preview.entries[1000].reasons.join(' '), /todas as ocorrências/);
});

test('13 mil previsões são preparadas e divididas em 26 lotes de 500', () => {
  const rows = Array.from({length:13000}, (_,i)=>[i+1,(i%1001)/10]);
  const preview = prepareChurnImport(matrix(rows));
  const batches = chunks(preview.entries);
  assert.equal(CHURN_BATCH_SIZE,500);
  assert.equal(preview.valid,13000);
  assert.equal(batches.length,26);
  assert.ok(batches.every(batch=>batch.length===500));
  assert.equal(chunks(Array(501).fill(null)).at(-1).length,1);
  assert.equal(chunks([]).length,0);
  assert.throws(()=>chunks([],501),/500/);
  assert.throws(()=>prepareChurnImport(matrix(Array(CHURN_MAX_ROWS+1).fill([1,0]))),/100.000/);
});

test('demo faz upsert sem criar alunos, preserva entradas e atualiza a data de importação', () => {
  const before = [{id_aluno:1,probabilidade_churn:80,data_importacao:AT}];
  const beforeCopy = structuredClone(before);
  const rows = [record(1,0),record(2,100)];
  const result = importChurnDemoBatch(rows,before,'2026-10-29T01:00:00.000Z');
  assert.deepEqual({inserted:result.inserted,updated:result.updated,rejected:result.rejected},{inserted:1,updated:1,rejected:0});
  assert.deepEqual(result.results.map(r=>r.status),['updated','inserted']);
  assert.equal(result.predictions[0].probabilidade_churn,0);
  assert.equal(result.predictions[0].data_importacao,'2026-10-29T01:00:00.000Z');
  assert.deepEqual(before,beforeCopy);
  assert.deepEqual(rows,[record(1,0),record(2,100)]);
  assert.equal(Object.hasOwn(result,'students'),false);
  const again=importChurnDemoBatch(rows,result.predictions,AT);
  assert.equal(again.updated,2); assert.equal(again.inserted,0); assert.equal(again.predictions.length,2);
});

test('revalidação do lote rejeita inválidos e todas as duplicatas sem perder as linhas válidas', () => {
  const result = importChurnDemoBatch([record(1),record(1,90,3),record(2,0),record(3,'10'),null,record(4,20,0)],[],AT);
  assert.equal(result.inserted,1); assert.equal(result.rejected,5);
  assert.deepEqual(result.predictions,[{id_aluno:2,probabilidade_churn:0,data_importacao:AT}]);
  assert.throws(()=>importChurnDemoBatch([],[],AT),/1 e 500/);
  assert.throws(()=>importChurnDemoBatch(Array.from({length:501},(_,i)=>record(i+1)),[],AT),/1 e 500/);
  assert.equal(importChurnDemoBatch(Array.from({length:500},(_,i)=>record(i+1)),[],AT).inserted,500);
  assert.throws(()=>importChurnDemoBatch([record(1)],[],'inválida'),/Data/);
});

test('contrato do lote exige as três propriedades exatas e a linha cabe em inteiro SQL', () => {
  const rows = [
    {...record(1), nome:'Extra'},
    {id_aluno:2, probabilidade_churn:10},
    {line:4, id_aluno:3},
    record(4,10,2147483648),
    record(5,10,Number.MAX_SAFE_INTEGER),
    record(6,10,2147483647)
  ];
  const result=importChurnDemoBatch(rows,[],AT);
  assert.equal(result.rejected,5);
  assert.equal(result.inserted,1);
  assert.equal(result.predictions[0].id_aluno,6);
  assert.match(result.results[0].reason,/somente line/);
  assert.match(result.results[1].reason,/somente line/);
  assert.match(result.results[3].reason,/2147483647/);
});

test('faixas respeitam 0/20/40/60/80/100 e resumo global não muda com filtro ou página', () => {
  const input = [0,19.9,20,39.9,40,59.9,60,79.9,80,100].map((p,i)=>({id_aluno:i+1,probabilidade_churn:p,data_importacao:AT}));
  const copy = structuredClone(input);
  const students=[{id_aluno:'MATRICULA-REAL',id_aluno_ml:10,nome:'Ana Souza'}, {id_aluno:'9',id_aluno_ml:55,nome:'Outra pessoa'}];
  const data = churnAdminData(input,students);
  assert.deepEqual(data.bands.map(b=>b.count),[2,2,2,2,2]);
  assert.equal(data.total_predictions,10); assert.equal(data.linked,1);
  assert.equal(data.rows[0].id_aluno,10); assert.equal(data.rows[0].nome,'Ana Souza');
  assert.equal(data.rows[1].id_aluno,9); assert.equal(data.rows[1].nome,null,'Matrícula textual não é ID ML');
  const filtered=churnAdminData(input,students,{search:'ANA',page:1,pageSize:1});
  assert.equal(filtered.total,1); assert.equal(filtered.rows[0].id_aluno,10);
  assert.deepEqual(filtered.bands,data.bands); assert.equal(filtered.linked,1);
  const second=churnAdminData(input,students,{page:2,pageSize:3});
  assert.equal(second.rows.length,3); assert.equal(second.rows[0].id_aluno,7);
  assert.deepEqual(input,copy);
});

test('ordenação desempata por ID e busca é substring literal sem padrões especiais', () => {
  const input=[{id_aluno:2,probabilidade_churn:50},{id_aluno:1,probabilidade_churn:50}];
  const students=[{id_aluno:'A',id_aluno_ml:1,nome:'A_[%]'}];
  assert.deepEqual(churnAdminData(input,students).rows.map(r=>r.id_aluno),[1,2]);
  assert.equal(churnAdminData(input,students,{search:'[%]'}).total,1);
  assert.equal(churnAdminData(input,students,{search:'2'}).rows[0].id_aluno,2);
  assert.equal(churnAdminData(input,students,{search:'inexistente'}).total,0);
  const unsafe=[...students,{id_aluno:'B',id_aluno_ml:1,nome:'Conflito'}];
  assert.equal(churnAdminData(input,unsafe).linked,0);
  assert.equal(churnAdminData(input,unsafe).rows[0].nome,null);
});
