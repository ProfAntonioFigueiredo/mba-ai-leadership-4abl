import {inCampaignBand,previewCampaignMessage} from './retention-campaigns.mjs';

const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const answered=e=>['aceitou','recusou'].includes(e.resposta);
function studentFor(state,user){
  if(user?.role!=='student'||typeof user.student_id!=='string')throw Error('Somente o aluno autenticado pode consultar ou responder à oferta.');
  const matches=state.students.filter(s=>s.id_aluno===user.student_id);
  if(matches.length!==1)throw Error('Matrícula não encontrada.');
  return matches[0];
}
function localDay(at){
  if(!Number.isFinite(Date.parse(at)))throw Error('Data de exibição inválida.');
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date(at));
}
const activeOn=(c,day)=>c.status==='ativa'&&c.data_inicio<=day&&day<=c.data_fim;
export const publicOffer=e=>({oferta_id:e.id,titulo_oferta:e.titulo_oferta,mensagem:e.mensagem,desconto_percentual:e.desconto_percentual,validade:e.validade});

export function safeStudentOffer(data) {
  if(data==null)return null;
  if(!Number.isSafeInteger(data.oferta_id)||data.oferta_id<1||typeof data.titulo_oferta!=='string'||typeof data.mensagem!=='string'||
    typeof data.desconto_percentual!=='number'||!Number.isFinite(data.desconto_percentual)||data.desconto_percentual<0||data.desconto_percentual>100||
    typeof data.validade!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.validade))throw Error('Oferta inválida.');
  return {oferta_id:data.oferta_id,titulo_oferta:data.titulo_oferta,mensagem:data.mensagem,desconto_percentual:data.desconto_percentual,validade:data.validade};
}

export function getDemoRetentionOffer(state,user,loginToken,at=new Date().toISOString()) {
  const student=studentFor(state,user),day=localDay(at);
  if(!uuid(loginToken))throw Error('Identificador da sessão inválido.');
  const mlId=student.id_aluno_ml;
  if(!Number.isSafeInteger(mlId)||mlId<1)return {state,offer:null};
  const predictions=(state.churnPredictions??[]).filter(p=>p.id_aluno===mlId);
  if(predictions.length!==1)return {state,offer:null};
  const eligible=(state.retentionCampaigns??[]).filter(c=>activeOn(c,day)&&inCampaignBand(predictions[0].probabilidade_churn,c));
  // A regra escolhida impede sobreposição; uma base local inconsistente não escolhe uma oferta arbitrária.
  if(eligible.length!==1)return {state,offer:null};
  const campaign=eligible[0],events=state.retentionOfferEvents??[];
  if(events.some(e=>e.student_id===student.id_aluno&&e.campanha_id===campaign.id&&answered(e)))return {state,offer:null};
  const previous=events.find(e=>e.student_id===student.id_aluno&&e.login_token===loginToken);
  if(previous)return {state,offer:previous.campanha_id===campaign.id&&!answered(previous)?publicOffer(previous):null};
  const event={id:events.reduce((max,e)=>Math.max(max,e.id),0)+1,id_aluno:mlId,student_id:student.id_aluno,campanha_id:campaign.id,
    login_token:loginToken,data_exibicao:at,resposta:'sem resposta',respondida_em:null,titulo_oferta:campaign.titulo_oferta,
    mensagem:previewCampaignMessage(campaign.mensagem,student.nome),desconto_percentual:campaign.desconto_percentual,validade:campaign.data_fim};
  const next=structuredClone(state);next.retentionOfferEvents=[...(next.retentionOfferEvents??[]),event];
  return {state:next,offer:publicOffer(event)};
}

export function respondDemoRetentionOffer(state,user,offerId,response,at=new Date().toISOString()) {
  const student=studentFor(state,user),day=localDay(at);
  if(!Number.isSafeInteger(offerId)||offerId<1||!['aceitou','recusou'].includes(response))throw Error('Resposta de oferta inválida.');
  const events=state.retentionOfferEvents??[];
  const event=events.find(e=>e.id===offerId&&e.student_id===student.id_aluno);
  if(!event)throw Error('Oferta não encontrada para este aluno.');
  const previous=events.find(e=>e.student_id===student.id_aluno&&e.campanha_id===event.campanha_id&&answered(e));
  if(previous)return {state,receipt:{resposta:previous.resposta,ja_respondida:true}};
  if(response==='aceitou'&&!(state.retentionCampaigns??[]).some(c=>c.id===event.campanha_id&&activeOn(c,day)))throw Error('Esta oferta não está mais disponível. Você pode dispensá-la e consultar a escola.');
  const next=structuredClone(state);
  next.retentionOfferEvents=next.retentionOfferEvents.map(e=>e.id===offerId?{...e,resposta:response,respondida_em:at}:e);
  return {state:next,receipt:{resposta:response,ja_respondida:false}};
}
