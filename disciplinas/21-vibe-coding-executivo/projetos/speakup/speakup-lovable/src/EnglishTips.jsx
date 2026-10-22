import React,{useEffect,useRef,useState} from 'react';
import {fetchEnglishTips} from './english-tips.mjs';
export function EnglishTips(){
 const [data,setData]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const request=useRef(null);
 useEffect(()=>()=>{request.current?.abort();request.current=null;},[]);
 async function load(){
  if(request.current)return;
  const controller=new AbortController();request.current=controller;
  setLoading(true);setError('');setData(null);
  const timer=setTimeout(()=>controller.abort(),15000);
  try{const result=await fetchEnglishTips({signal:controller.signal});if(request.current===controller)setData(result);}
  catch(e){if(request.current===controller)setError(controller.signal.aborted?'A consulta demorou mais que o esperado. Confira sua conexão e tente novamente.':e instanceof TypeError?'Não foi possível conectar ao serviço de dicas. Confira sua internet e tente novamente.':e.message);}
  finally{clearTimeout(timer);if(request.current===controller){request.current=null;setLoading(false);}}
 }
 return <section className="panel english-tips"><div className="section-head"><div><h2>Um pouco de inglês todos os dias</h2><p>Descubra ideias para praticar, com exemplos em inglês e tradução.</p></div><button className="primary" onClick={load} disabled={loading}>{loading?'Carregando...':data?'Atualizar dicas':'Buscar dicas'}</button></div>
 {loading&&<p role="status">Carregando...</p>}
 {error&&<div className="error" role="alert">{error}</div>}
 {!data&&!loading&&!error&&<p className="notice">Clique em Buscar dicas para receber sugestões de estudo.</p>}
 {data&&<><p role="status">{data.total===0?'Nenhuma dica disponível no momento. Tente novamente mais tarde.':`${data.total} dicas para praticar no seu ritmo.`}</p><div className="english-tips-grid">{data.dicas.map(d=><article className="english-tip-card" key={d.id} aria-labelledby={'tip-'+d.id}><div className="english-tip-heading"><span className="english-tip-number" aria-label={'Dica '+d.id}>{d.id}</span><h3 id={'tip-'+d.id}>{d.titulo}</h3></div><span className="badge">{d.nivel==='intermediario'?'intermediário':d.nivel}</span><p>{d.explicacao}</p><div className="english-tip-example"><span>Exemplo em inglês</span><p lang="en">{d.exemplo_en}</p><span>Tradução</span><p lang="pt-BR">{d.traducao_pt}</p></div></article>)}</div></>}
 <p className="hint">Conteúdo da <a href="https://vibe-coding-frontend-backend.lovable.app/api/public/dicas/docs" target="_blank" rel="noopener noreferrer">API pública de dicas de inglês</a>.</p>
 </section>;
}
