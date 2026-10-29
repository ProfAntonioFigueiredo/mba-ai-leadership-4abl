import React,{useEffect,useMemo,useState} from 'react';
import {supabase,rpc} from './backend.js';
import {validateCampaign,saveCampaignDemo,deleteCampaignDemo,campaignAdminData,previewCampaignMessage,campaignExamples} from './retention-campaigns.mjs';

const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
const plusDays=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
const emptyForm=()=>({nome:'',churn_min:'0',churn_max:'20',desconto_percentual:'5',titulo_oferta:'',mensagem:'{nome}, garanta sua rematrícula com uma condição especial.',data_inicio:today(),data_fim:plusDays(today(),30),status:'inativa'});
const fields=Object.keys(emptyForm());
const civil=date=>date.split('-').reverse().join('/');
const payload=form=>validateCampaign({...Object.fromEntries(fields.map(k=>[k,form[k]])),
  ...Object.fromEntries(['churn_min','churn_max','desconto_percentual'].map(k=>{
    if(String(form[k]).trim()==='')throw Error('Preencha todos os percentuais.');return [k,Number(form[k])];
  })),...(form.id!=null?{id:form.id}:{})});

export function RetentionCampaigns({user,state,save}) {
  const [form,setForm]=useState(emptyForm);
  const [remote,setRemote]=useState([]);
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [deleting,setDeleting]=useState(null);
  const [sampleName,setSampleName]=useState('Aluno Exemplo');
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    if(!supabase||user.role!=='admin')return;
    let active=true;setLoading(true);
    rpc('retention_campaigns_admin_data').then(rows=>{if(active)setRemote(rows);})
      .catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[refresh,user.role]);
  const local=useMemo(()=>supabase?[]:campaignAdminData(state.retentionCampaigns??[],state.churnPredictions??[]),[state]);
  const campaigns=supabase?remote:local;
  if(user.role!=='admin')return null;
  const set=(field,value)=>setForm(f=>({...f,[field]:value}));
  async function run(action){
    if(busy)return;setBusy(true);setError('');setMessage('');
    try{await action();}catch(e){setError(e.message);}finally{setBusy(false);if(supabase)setRefresh(n=>n+1);}
  }
  async function submit(e){e.preventDefault();await run(async()=>{
    const row=payload(form);
    if(supabase)await rpc('save_retention_campaign',{p_campaign:row});
    else save({...structuredClone(state),retentionCampaigns:saveCampaignDemo(state.retentionCampaigns??[],row)},'Campanha de retenção salva');
    setForm(emptyForm());setMessage('Campanha salva.');
  });}
  async function toggle(c){await run(async()=>{
    const row=payload({...c,status:c.status==='ativa'?'inativa':'ativa'});
    if(supabase)await rpc('save_retention_campaign',{p_campaign:row});
    else save({...structuredClone(state),retentionCampaigns:saveCampaignDemo(state.retentionCampaigns??[],row)},'Status de campanha atualizado');
    setMessage(`Campanha ${row.status==='ativa'?'ativada':'desativada'}.`);
  });}
  async function remove(){await run(async()=>{
    if(supabase)await rpc('delete_retention_campaign',{p_id:deleting.id});
    else save({...structuredClone(state),retentionCampaigns:deleteCampaignDemo(state.retentionCampaigns??[],deleting.id)},'Campanha de retenção excluída');
    if(form.id===deleting.id)setForm(emptyForm());setDeleting(null);setMessage('Campanha excluída.');
  });}
  async function examples(){await run(async()=>{
    const rows=campaignExamples(form.data_inicio,form.data_fim);
    let current=state.retentionCampaigns??[],added=0;
    try{
      for(const row of rows){
        if(campaigns.some(c=>c.nome===row.nome&&c.churn_min===row.churn_min&&c.churn_max===row.churn_max))continue;
        if(supabase)await rpc('save_retention_campaign',{p_campaign:row});
        else current=saveCampaignDemo(current,row);
        added++;
      }
    }finally{if(!supabase&&added)save({...structuredClone(state),retentionCampaigns:current},'Exemplos de campanhas da aula cadastrados');}
    setMessage(`${added} exemplos da aula adicionados como inativos.`);
  });}

  return <div className="retention-campaigns">
    <section className="panel">
      <div className="section-head"><div><h2>Campanhas de Retenção</h2><p>Ofertas de rematrícula por faixa de risco e período.</p></div><button disabled={busy||loading} onClick={examples}>Carregar 5 exemplos da aula</button></div>
      <p>Campanhas ativas não podem se sobrepor na faixa de churn e no período. O último dia de validade está incluído. Faixas vizinhas, como 0–20 e 20–40, podem estar ativas juntas.</p>
      <p className="hint">Os exemplos usam as datas do formulário e os descontos de referência da aula (5%, 10%, 15%, 20% e 25%). São cadastrados inativos e podem ser editados.</p>
      {!supabase&&<p className="notice">Demonstração: campanhas e alterações ficam salvas neste navegador.</p>}
      {error&&<div className="error" role="alert">{error}</div>}{message&&<p role="status">{message}</p>}
      {loading&&<p role="status">Consultando campanhas…</p>}
      <form className="campaign-form" onSubmit={submit}>
        <h3>{form.id?'Editar campanha':'Nova campanha'}</h3>
        <label>Nome da campanha<input required maxLength={150} value={form.nome} disabled={busy} onChange={e=>set('nome',e.target.value)}/></label>
        <div className="campaign-fields"><label>Churn mínimo (%)<input required type="number" min="0" max="100" step="any" value={form.churn_min} disabled={busy} onChange={e=>set('churn_min',e.target.value)}/></label><label>Churn máximo (%)<input required type="number" min="0" max="100" step="any" value={form.churn_max} disabled={busy} onChange={e=>set('churn_max',e.target.value)}/></label><label>Desconto na rematrícula (%)<input required type="number" min="0" max="100" step="any" value={form.desconto_percentual} disabled={busy} onChange={e=>set('desconto_percentual',e.target.value)}/></label></div>
        <label>Título da oferta<input required maxLength={180} value={form.titulo_oferta} disabled={busy} onChange={e=>set('titulo_oferta',e.target.value)}/></label>
        <label>Mensagem da oferta<textarea required maxLength={2000} rows={3} value={form.mensagem} disabled={busy} onChange={e=>set('mensagem',e.target.value)}/></label>
        <p className="hint">Use {'{nome}'} para inserir o primeiro nome do aluno.</p>
        <div className="campaign-fields"><label>Data de início<input required type="date" value={form.data_inicio} disabled={busy} onChange={e=>set('data_inicio',e.target.value)}/></label><label>Data de fim<input required type="date" value={form.data_fim} disabled={busy} onChange={e=>set('data_fim',e.target.value)}/></label><label>Status da campanha<select value={form.status} disabled={busy} onChange={e=>set('status',e.target.value)}><option value="inativa">Inativa</option><option value="ativa">Ativa</option></select></label></div>
        <details className="campaign-preview"><summary>Prévia da mensagem personalizada</summary><label>Nome para simulação<input value={sampleName} maxLength={150} onChange={e=>setSampleName(e.target.value)}/></label><h3>{form.titulo_oferta||'Título da oferta'}</h3><p>{previewCampaignMessage(form.mensagem,sampleName)}</p><strong>{form.desconto_percentual||'0'}% de desconto na rematrícula antecipada</strong></details>
        <div className="actions"><button className="primary" disabled={busy||loading}>{busy?'Processando…':'Salvar campanha'}</button>{form.id&&<button type="button" disabled={busy} onClick={()=>setForm(emptyForm())}>Cancelar edição</button>}</div>
      </form>
    </section>
    <section className="panel">
      <div className="section-head"><div><h2>Campanhas cadastradas</h2><p>{campaigns.length} campanhas · {campaigns.filter(c=>c.status==='ativa').length} ativas · {campaigns.filter(c=>c.status==='inativa').length} inativas</p></div>{supabase&&<button disabled={busy||loading} onClick={()=>setRefresh(n=>n+1)}>Atualizar campanhas</button>}</div>
      <p className="hint">A contagem inclui todas as previsões importadas na faixa, mesmo sem cadastro nominal. Não representa ofertas exibidas ou aceitas, nem soma pessoas únicas entre campanhas de períodos diferentes.</p>
      {deleting&&<div className="campaign-delete" role="alertdialog" aria-label="Confirmar exclusão da campanha"><h3>Excluir {deleting.nome}?</h3><p>A campanha será removida. As previsões e os alunos serão preservados.</p><div className="actions"><button className="text-danger" disabled={busy} onClick={remove}>Confirmar exclusão</button><button disabled={busy} onClick={()=>setDeleting(null)}>Manter campanha</button></div></div>}
      <ol className="retention-list">{campaigns.map(c=><li key={c.id}><article className="retention-card">
        <div className="section-head"><h3>{c.nome}</h3><span className="badge">{c.status==='ativa'?'Ativa':'Inativa'}</span></div>
        <dl><div><dt>Faixa de churn</dt><dd>{c.churn_min}% a {c.churn_max}%<small>{c.churn_max===100?'Inclui 100%':'Exclui o limite máximo'}</small></dd></div><div><dt>Desconto</dt><dd>{c.desconto_percentual}%</dd></div><div><dt>Validade</dt><dd>{civil(c.data_inicio)} a {civil(c.data_fim)}</dd></div><div><dt>Alunos na faixa</dt><dd className="retention-count">{c.alunos_faixa}</dd></div></dl>
        <strong>{c.titulo_oferta}</strong><p className="campaign-message">{c.mensagem}</p>
        <div className="actions"><button disabled={busy||loading} onClick={()=>{setForm({...Object.fromEntries(fields.map(k=>[k,c[k]])),id:c.id});setError('');setMessage('');}}>Editar {c.nome}</button><button disabled={busy||loading} onClick={()=>toggle(c)}>{c.status==='ativa'?'Desativar':'Ativar'} {c.nome}</button><button className="text-danger" disabled={busy||loading} onClick={()=>setDeleting(c)}>Excluir {c.nome}</button></div>
      </article></li>)}</ol>
      {!loading&&!campaigns.length&&<p className="empty">Nenhuma campanha cadastrada.</p>}
    </section>
  </div>;
}
