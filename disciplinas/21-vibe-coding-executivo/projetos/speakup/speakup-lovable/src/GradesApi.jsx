import React,{useState} from 'react';
import {supabase} from './backend.js';
import {consultLocalStudent} from './student-query.mjs';
export function GradesApi({user,state}){
 const [id,setId]=useState(''),[name,setName]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState('');
 if(!['admin','rh'].includes(user.role))return null;
 const base=String(import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
 const endpoint=base?base+'/functions/v1/student-grades':null;
 async function test(e){e.preventDefault();if(busy)return;setBusy(true);setError('');setResult(null);try{
  if(!supabase){const response=await consultLocalStudent({user,students:state.students,id,nome:name});setResult({status:response.status,ok:response.ok,body:await response.text()});return;}
  const session=await supabase.auth.getSession();if(session.error||!session.data.session?.access_token)throw Error('Entre novamente para obter uma sessão válida.');
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,Authorization:'Bearer '+session.data.session.access_token},body:JSON.stringify({id_aluno:id.trim(),nome:name.trim()})});
  const body=await response.text();setResult({status:response.status,ok:response.ok,body});
 }catch{setError('Não foi possível obter uma resposta da API. Confira a conexão, a sessão e a configuração do serviço.');}finally{setBusy(false);}}
 async function documentation(){setError('');try{const response=await fetch(import.meta.env.BASE_URL+(supabase?'api-notas.md':'api-alunos-local.md'));if(!response.ok)throw Error();let text=await response.text();text=text.replaceAll('{{SUPABASE_URL}}',base||'https://SEU_PROJETO.supabase.co');const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=supabase?'SpeakUp-API-Notas.md':'SpeakUp-API-Consulta-Alunos.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError('Não foi possível baixar a documentação. Tente novamente.');}}
 return <section className="panel"><div className="section-head"><div><h2>API — Consulta de Alunos</h2><p>Informe o ID para consultar o cadastro existente. O nome é opcional no modo local.</p></div><button onClick={documentation}>Baixar Documentação</button></div>
 {!supabase&&<p className="notice">Consulta local aos cadastros deste navegador, incluindo alunos importados. Não exige Supabase e não cria notas.</p>}
 <p>Consulta: <code style={{overflowWrap:'anywhere'}}>{endpoint||'API interna da aplicação — sem endereço HTTP público'}</code></p>
 <form onSubmit={test}><div className="form-grid"><label>ID do aluno<input value={id} onChange={e=>setId(e.target.value)} maxLength={50} required autoComplete="off"/></label><label>Nome completo do aluno (opcional no modo local)<input value={name} onChange={e=>setName(e.target.value)} maxLength={150} required={!!supabase} autoComplete="off"/></label></div><button className="primary" style={{marginTop:20}} disabled={busy||!id.trim()||(!!supabase&&!name.trim())}>{busy?'Consultando…':'Testar API'}</button></form>
 {error&&<p className="error" role="alert">{error}</p>}
 {result&&<section aria-live="polite"><h3>{result.ok?'Consulta realizada com sucesso':'Erro na consulta'} · {supabase?'HTTP':'Status local'} {result.status}</h3><p>Resposta recebida da API, sem alterar o conteúdo:</p><pre style={{overflow:'auto',padding:18,background:'#f3f5ea',maxHeight:500}}>{result.body}</pre></section>}
 </section>;
}
