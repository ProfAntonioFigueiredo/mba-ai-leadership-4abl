import test from 'node:test';
import assert from 'node:assert/strict';
import {getDemoRetentionOffer,respondDemoRetentionOffer,safeStudentOffer} from '../src/student-retention-offer.mjs';
const AT='2026-10-29T01:00:00Z'; // 28/10, 22h em São Paulo.
const TOKEN='00000000-0000-4000-8000-000000000001';
const OTHER='00000000-0000-4000-8000-000000000002';
const user={role:'student',student_id:'001'};
const campaign={id:5,nome:'Renove',churn_min:20,churn_max:40,desconto_percentual:10,titulo_oferta:'Continue evoluindo',mensagem:'{nome}, seu próximo nível espera você, {nome}!',data_inicio:'2026-10-28',data_fim:'2026-11-30',status:'ativa'};
function fixture(){return {students:[{id_aluno:'001',id_aluno_ml:77,nome:'Ana Maria Souza'},{id_aluno:'077',id_aluno_ml:88,nome:'Outro Aluno'}],churnPredictions:[{id_aluno:77,probabilidade_churn:37.5}],retentionCampaigns:[campaign],audit:[]};}
test('login resolve a matrícula pelo vínculo numérico e devolve somente campos públicos',()=>{
 const state=fixture(),copy=structuredClone(state);
 const result=getDemoRetentionOffer(state,user,TOKEN,AT);
 assert.deepEqual(result.offer,{oferta_id:1,titulo_oferta:'Continue evoluindo',mensagem:'Ana, seu próximo nível espera você, Ana!',desconto_percentual:10,validade:'2026-11-30'});
 assert.equal(result.state.retentionOfferEvents[0].student_id,'001');assert.equal(result.state.retentionOfferEvents[0].id_aluno,77);
 assert.equal(result.state.retentionOfferEvents[0].resposta,'sem resposta');assert.equal(result.state.retentionOfferEvents[0].data_exibicao,AT);
 assert.deepEqual(state,copy);
 const dto=safeStudentOffer({...result.offer,probabilidade_churn:37.5,campanha_id:5});
 assert.deepEqual(dto,result.offer);assert.ok(!JSON.stringify(dto).includes('probabilidade'));
});
test('mesmo login não duplica exposição; login posterior sem resposta registra nova exibição',()=>{
 const first=getDemoRetentionOffer(fixture(),user,TOKEN,AT);
 const retry=getDemoRetentionOffer(first.state,user,TOKEN,AT);
 assert.equal(retry.state,first.state);assert.equal(retry.offer.oferta_id,1);
 const again=getDemoRetentionOffer(first.state,user,OTHER,AT);
 assert.equal(again.state.retentionOfferEvents.length,2);assert.equal(again.offer.oferta_id,2);
});
test('sem cadastro vinculado, previsão, campanha ativa ou faixa elegível não mostra nada',()=>{
 for(const mutate of [s=>s.students[0].id_aluno_ml=null,s=>s.churnPredictions=[],s=>s.retentionCampaigns=[],s=>s.retentionCampaigns=[{...campaign,status:'inativa'}],s=>s.churnPredictions[0].probabilidade_churn=40,s=>s.retentionCampaigns=[{...campaign,data_inicio:'2026-11-01'}],s=>s.retentionCampaigns=[{...campaign,data_fim:'2026-10-27'}]]){
  const s=fixture();mutate(s);const r=getDemoRetentionOffer(s,user,TOKEN,AT);assert.equal(r.offer,null);assert.equal(r.state,s);
 }
 const s=fixture();s.retentionCampaigns.push({...campaign,id:6});assert.equal(getDemoRetentionOffer(s,user,TOKEN,AT).offer,null);
});
test('datas usam São Paulo e limite 100 pertence à última faixa',()=>{
 const s=fixture();s.retentionCampaigns=[{...campaign,churn_min:80,churn_max:100,data_inicio:'2026-10-27',data_fim:'2026-10-28'}];s.churnPredictions[0].probabilidade_churn=100;
 assert.ok(getDemoRetentionOffer(s,user,TOKEN,'2026-10-29T02:59:59Z').offer);
 assert.equal(getDemoRetentionOffer(s,user,TOKEN,'2026-10-29T03:00:00Z').offer,null);
});
test('aceite e recusa são terminais por campanha e repetição de resposta é idempotente',()=>{
 for(const response of ['aceitou','recusou']){
  const first=getDemoRetentionOffer(fixture(),user,TOKEN,AT);
  const result=respondDemoRetentionOffer(first.state,user,1,response,AT);
  assert.equal(result.state.retentionOfferEvents[0].resposta,response);assert.equal(result.state.retentionOfferEvents[0].respondida_em,AT);
  assert.equal(getDemoRetentionOffer(result.state,user,OTHER,AT).offer,null);
  const retry=respondDemoRetentionOffer(result.state,user,1,response==='aceitou'?'recusou':'aceitou',AT);
  assert.equal(retry.state,result.state);assert.deepEqual(retry.receipt,{resposta:response,ja_respondida:true});
  assert.equal(first.state.retentionOfferEvents[0].resposta,'sem resposta');
 }
});
test('sessões concorrentes não podem produzir respostas contraditórias',()=>{
 const one=getDemoRetentionOffer(fixture(),user,TOKEN,AT);
 const two=getDemoRetentionOffer(one.state,user,OTHER,AT);
 const accepted=respondDemoRetentionOffer(two.state,user,1,'aceitou',AT);
 const stale=respondDemoRetentionOffer(accepted.state,user,2,'recusou',AT);
 assert.deepEqual(stale.receipt,{resposta:'aceitou',ja_respondida:true});assert.equal(stale.state.retentionOfferEvents[1].resposta,'sem resposta');
});
test('outros perfis e outro aluno não respondem; ofertas expiradas não aceitam interesse',()=>{
 const first=getDemoRetentionOffer(fixture(),user,TOKEN,AT);
 for(const role of ['admin','teacher','rh'])assert.throws(()=>getDemoRetentionOffer(fixture(),{role,student_id:'001'},TOKEN,AT),/aluno autenticado/);
 assert.throws(()=>respondDemoRetentionOffer(first.state,{role:'student',student_id:'077'},1,'aceitou',AT),/não encontrada/);
 assert.throws(()=>respondDemoRetentionOffer(first.state,user,1,'sem resposta',AT),/inválida/);
 const inactive=structuredClone(first.state);inactive.retentionCampaigns[0].status='inativa';
 assert.throws(()=>respondDemoRetentionOffer(inactive,user,1,'aceitou',AT),/não está mais disponível/);
 assert.equal(respondDemoRetentionOffer(inactive,user,1,'recusou',AT).receipt.resposta,'recusou');
 const deleted=structuredClone(first.state);deleted.retentionCampaigns=[];
 assert.equal(deleted.retentionOfferEvents[0].titulo_oferta,'Continue evoluindo');
 assert.throws(()=>getDemoRetentionOffer(fixture(),user,'token inválido',AT),/sessão inválido/);
 assert.throws(()=>safeStudentOffer({oferta_id:1}),/inválida/);
});
