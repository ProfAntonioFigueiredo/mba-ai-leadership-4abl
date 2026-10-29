const FIELDS=['nome','churn_min','churn_max','desconto_percentual','titulo_oferta','mensagem','data_inicio','data_fim','status'];
const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && value.slice(0,4)>='0001' && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const percentage=value=>typeof value==='number' && Number.isFinite(value) && value>=0 && value<=100;

export function validateCampaign(input) {
  if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>![...FIELDS,'id'].includes(k)))throw Error('Campanha inválida.');
  const row={};
  for(const [field,max] of [['nome',150],['titulo_oferta',180],['mensagem',2000]]) {
    if(typeof input[field]!=='string' || !input[field].trim() || input[field].trim().length>max)throw Error(`Preencha ${field} com até ${max} caracteres.`);
    row[field]=input[field].trim();
  }
  for(const field of ['churn_min','churn_max','desconto_percentual']) {
    if(!percentage(input[field]))throw Error(`${field}: use um número entre 0 e 100.`);
    row[field]=input[field];
  }
  if(row.churn_min>=row.churn_max)throw Error('O churn mínimo deve ser menor que o máximo.');
  if(!validDate(input.data_inicio)||!validDate(input.data_fim)||input.data_fim<=input.data_inicio)throw Error('A data de fim deve ser posterior à data de início, com datas válidas.');
  if(!['ativa','inativa'].includes(input.status))throw Error('Selecione o status ativa ou inativa.');
  Object.assign(row,{data_inicio:input.data_inicio,data_fim:input.data_fim,status:input.status});
  if(input.id!=null){if(!Number.isSafeInteger(input.id)||input.id<1)throw Error('Identificador da campanha inválido.');row.id=input.id;}
  return row;
}

export function inCampaignBand(probability,campaign) {
  return typeof probability==='number' && Number.isFinite(probability) && probability>=campaign.churn_min &&
    (probability<campaign.churn_max || campaign.churn_max===100 && probability===100);
}

export function campaignOverlap(a,b) {
  return a.status==='ativa' && b.status==='ativa' && a.churn_min<b.churn_max && b.churn_min<a.churn_max &&
    a.data_inicio<=b.data_fim && b.data_inicio<=a.data_fim;
}

export function saveCampaignDemo(campaigns,input) {
  const row=validateCampaign(input);
  if(row.id!=null&&!campaigns.some(c=>c.id===row.id))throw Error('Campanha não encontrada.');
  if(campaigns.some(c=>c.id!==row.id&&campaignOverlap(c,row)))throw Error('Campanha ativa sobrepõe faixa de churn e período de outra campanha ativa.');
  const id=row.id??Math.max(0,...campaigns.map(c=>c.id))+1;
  const exists=campaigns.some(c=>c.id===id);
  return exists?campaigns.map(c=>c.id===id?{...c,...row}:c):[...campaigns,{...row,id}];
}

export function deleteCampaignDemo(campaigns,id) {
  if(!campaigns.some(c=>c.id===id))throw Error('Campanha não encontrada.');
  return campaigns.filter(c=>c.id!==id);
}

export function campaignAdminData(campaigns,predictions=[]) {
  return [...campaigns].sort((a,b)=>a.churn_min-b.churn_min||a.churn_max-b.churn_max||a.id-b.id)
    .map(c=>({...c,alunos_faixa:predictions.filter(p=>inCampaignBand(p.probabilidade_churn,c)).length}));
}

export function previewCampaignMessage(message,name='Aluno') {
  const first=String(name).trim().split(/\s+/)[0]||'Aluno';
  return String(message).replaceAll('{nome}',()=>first);
}

export function campaignExamples(start,end) {
  const names=['Fidelidade','Renove já','Fique com a gente','Não desista agora','Última chamada'];
  const messages=[
    '{nome}, que bom ter você com a gente! Garanta sua rematrícula com condição especial.',
    '{nome}, seu próximo nível de inglês está a um clique. Renove agora com 10% off.',
    '{nome}, preparamos uma condição exclusiva para você continuar evoluindo.',
    '{nome}, você já percorreu um bom caminho. Renove com 20% de desconto.',
    '{nome}, queremos muito que você continue. Esta é a nossa melhor oferta.'
  ];
  return names.map((nome,i)=>validateCampaign({nome,churn_min:i*20,churn_max:(i+1)*20,desconto_percentual:(i+1)*5,
    titulo_oferta:nome,mensagem:messages[i],data_inicio:start,data_fim:end,status:'inativa'}));
}
