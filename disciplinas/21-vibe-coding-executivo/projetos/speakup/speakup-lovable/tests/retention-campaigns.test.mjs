import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCampaign,inCampaignBand,campaignOverlap,saveCampaignDemo,deleteCampaignDemo,campaignAdminData,previewCampaignMessage,campaignExamples} from '../src/retention-campaigns.mjs';
const sample=extra=>({nome:'Campanha',churn_min:20,churn_max:40,desconto_percentual:10,titulo_oferta:'Seu próximo nível',mensagem:'{nome}, renove com 10% de desconto.',data_inicio:'2026-10-28',data_fim:'2026-11-30',status:'ativa',...extra});

test('campanha valida percentuais, campos, data civil e status sem converter vazios em zero',()=>{
 assert.equal(validateCampaign(sample({nome:'  Nome  '})).nome,'Nome');
 assert.equal(validateCampaign(sample({desconto_percentual:0})).desconto_percentual,0);
 assert.equal(validateCampaign(sample({desconto_percentual:100})).desconto_percentual,100);
 for(const extra of [{churn_min:40},{churn_min:-1},{churn_max:101},{desconto_percentual:NaN},{desconto_percentual:Infinity},{desconto_percentual:'10'},{nome:' '},{mensagem:'x'.repeat(2001)},{titulo_oferta:''},{data_inicio:'0000-01-01'},{data_fim:'2026-02-30'},{data_fim:'2026-10-28'},{data_fim:'2026-10-27'},{status:'outro'},{id:0},{extra:'ignorado'}])assert.throws(()=>validateCampaign(sample(extra)),undefined,JSON.stringify(extra));
});
test('faixas são semiabertas e incluem 100 somente na última',()=>{
 assert.equal(inCampaignBand(20,sample()),true);assert.equal(inCampaignBand(40,sample()),false);
 assert.equal(inCampaignBand(100,sample({churn_min:80,churn_max:100})),true);
 for(const value of ['20',NaN,Infinity,101,-1])assert.equal(inCampaignBand(value,sample()),false);
});
test('sobreposição exige faixa e período simultâneos, incluindo o último dia',()=>{
 const a=sample();
 assert.equal(campaignOverlap(a,sample({churn_min:40,churn_max:60})),false);
 assert.equal(campaignOverlap(a,sample({data_inicio:'2026-11-30',data_fim:'2026-12-31'})),true);
 assert.equal(campaignOverlap(a,sample({data_inicio:'2026-12-01',data_fim:'2026-12-31'})),false);
 assert.equal(campaignOverlap(a,sample({status:'inativa'})),false);
 assert.equal(campaignOverlap(a,sample({churn_min:39.99,churn_max:100})),true);
});
test('criar, editar e ativar protegem conflitos e preservam a base na falha',()=>{
 const first=saveCampaignDemo([],sample());
 const second=saveCampaignDemo(first,sample({nome:'Reserva',status:'inativa'}));
 const copy=structuredClone(second);
 assert.throws(()=>saveCampaignDemo(second,sample({id:2,status:'ativa'})),/sobrepõe/);
 assert.deepEqual(second,copy);
 const edited=saveCampaignDemo(second,sample({id:1,desconto_percentual:15}));
 assert.equal(edited[0].desconto_percentual,15);assert.equal(edited.length,2);
 const inactive=saveCampaignDemo(second,sample({id:1,status:'inativa'}));
 const switched=saveCampaignDemo(inactive,sample({id:2,status:'ativa'}));
 assert.equal(switched[1].status,'ativa');
 assert.throws(()=>saveCampaignDemo(switched,sample({id:999})),/não encontrada/);
});
test('exclusão remove somente a campanha e mantém a entrada intacta',()=>{
 const input=saveCampaignDemo([],sample());
 assert.deepEqual(deleteCampaignDemo(input,1),[]);assert.equal(input.length,1);
 assert.throws(()=>deleteCampaignDemo(input,999),/não encontrada/);
});
test('exemplos são inativos, ordenados por faixa e contam os limites sem duplicar',()=>{
 const examples=campaignExamples('2026-10-28','2026-11-30');
 assert.deepEqual(examples.map(c=>c.desconto_percentual),[5,10,15,20,25]);
 assert.ok(examples.every(c=>c.status==='inativa'));
 const rows=examples.map((c,i)=>({...c,id:i+1}));
 const predictions=[0,19.9,20,39.9,40,59.9,60,79.9,80,100].map(probabilidade_churn=>({probabilidade_churn}));
 const sorted=campaignAdminData(rows.toReversed(),predictions);
 assert.deepEqual(sorted.map(c=>c.alunos_faixa),[2,2,2,2,2]);
 assert.equal(rows[0].nome,'Fidelidade');assert.equal(predictions.length,10);
});
test('prévia substitui todas as ocorrências pelo primeiro nome literal',()=>{
 assert.equal(previewCampaignMessage('{nome}, oi {nome}!','  Ana Maria '),'Ana, oi Ana!');
 assert.equal(previewCampaignMessage('{nome}',''),'Aluno');
 assert.equal(previewCampaignMessage('{nome}','$&'),'$&');
});
