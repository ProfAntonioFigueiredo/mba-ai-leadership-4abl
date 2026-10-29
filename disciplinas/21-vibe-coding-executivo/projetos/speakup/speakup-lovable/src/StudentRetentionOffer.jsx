import React,{useEffect,useRef,useState} from 'react';
import {supabase,rpc} from './backend.js';
import {getDemoRetentionOffer,respondDemoRetentionOffer,safeStudentOffer} from './student-retention-offer.mjs';

export function StudentRetentionOffer({user,state,save}) {
  const [loginToken]=useState(()=>crypto.randomUUID());
  const [offer,setOffer]=useState(null);
  const [busy,setBusy]=useState(false);
  const [loadError,setLoadError]=useState(false);
  const [responseError,setResponseError]=useState('');
  const [message,setMessage]=useState('');
  const [attempt,setAttempt]=useState(0);
  const current=useRef(state);
  const saveRef=useRef(save);
  const dialog=useRef(null);
  useEffect(()=>{current.current=state;saveRef.current=save;},[state,save]);
  useEffect(()=>{
    if(user.role!=='student')return;
    let active=true;setLoadError(false);
    (async()=>{
      try{
        let data;
        if(supabase)data=await rpc('get_student_retention_offer',{p_login_token:loginToken});
        else{
          const result=getDemoRetentionOffer(current.current,user,loginToken);
          if(result.state!==current.current){saveRef.current(result.state,'Oferta de rematrícula exibida');current.current=result.state;}
          data=result.offer;
        }
        if(active)setOffer(safeStudentOffer(data));
      }catch{if(active)setLoadError(true);}
    })();
    return()=>{active=false;};
  },[user.role,user.student_id,user.user_id,loginToken,attempt]);
  useEffect(()=>{
    if(!offer)return;
    const previous=document.activeElement;
    dialog.current?.focus();
    return()=>{if(previous?.isConnected)previous.focus();};
  },[offer?.oferta_id]);
  useEffect(()=>{if(!message)return;const timer=setTimeout(()=>setMessage(''),9000);return()=>clearTimeout(timer);},[message]);
  if(user.role!=='student')return null;
  function dismiss(){if(!busy){setOffer(null);setResponseError('');}}
  function keyboard(e){
    if(e.key==='Escape'){e.preventDefault();dismiss();}
    if(e.key==='Tab'){
      const buttons=[...dialog.current.querySelectorAll('button:not(:disabled)')];
      if(!buttons.length){e.preventDefault();return;}
      const first=buttons[0],last=buttons.at(-1),focused=document.activeElement;
      if(e.shiftKey&&(focused===first||focused===dialog.current)){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&(focused===last||focused===dialog.current)){e.preventDefault();first.focus();}
    }
  }
  async function respond(response){
    if(busy||!offer)return;setBusy(true);setResponseError('');
    try{
      let receipt;
      if(supabase)receipt=await rpc('respond_student_retention_offer',{p_offer:offer.oferta_id,p_response:response});
      else{
        const result=respondDemoRetentionOffer(current.current,user,offer.oferta_id,response);
        if(result.state!==current.current){saveRef.current(result.state,'Resposta de oferta de rematrícula registrada');current.current=result.state;}
        receipt=result.receipt;
      }
      if(!['aceitou','recusou'].includes(receipt?.resposta))throw Error('Resposta não confirmada.');
      setOffer(null);
      setMessage(receipt.ja_respondida?'Sua resposta a esta campanha já estava registrada.':receipt.resposta==='aceitou'
        ?'Seu interesse foi registrado. A rematrícula e o desconto ainda precisam ser concluídos com a escola.'
        :'Sua resposta foi registrada. Esta campanha não será exibida novamente.');
    }catch(e){setResponseError(e.message.includes('não está mais disponível')?e.message:'Não foi possível confirmar sua resposta. Tente novamente.');}
    finally{setBusy(false);}
  }
  return <>
    {loadError&&<div className="retention-offer-load-error" role="alert"><span>Não foi possível consultar suas condições de rematrícula.</span><button onClick={()=>setAttempt(n=>n+1)}>Tentar novamente</button></div>}
    {offer&&<div className="overlay retention-offer-overlay" onClick={e=>{if(e.target===e.currentTarget)dismiss();}}>
      <section className="dialog retention-offer" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="retention-offer-title" aria-describedby="retention-offer-message" tabIndex={-1} onKeyDown={keyboard}>
        <div className="section-head"><span className="eyebrow">SUA PRÓXIMA ETAPA NA SPEAKUP</span><button aria-label="Fechar oferta sem responder" disabled={busy} onClick={dismiss}>×</button></div>
        <h2 id="retention-offer-title">{offer.titulo_oferta}</h2>
        <p id="retention-offer-message">{offer.mensagem}</p>
        <div className="retention-offer-discount"><strong>{offer.desconto_percentual}%</strong><span>de desconto na rematrícula antecipada</span></div>
        <p>Condição válida até {offer.validade.split('-').reverse().join('/')}.</p>
        {responseError&&<div className="error" role="alert">{responseError}</div>}
        <div className="retention-offer-actions"><button className="primary" disabled={busy} onClick={()=>respond('aceitou')}>Quero garantir minha rematrícula</button><button disabled={busy} onClick={()=>respond('recusou')}>Agora não</button></div>
        <p className="hint">Ao confirmar, você registra seu interesse. A contratação é concluída com a escola.</p>
      </section>
    </div>}
    {message&&<div className="toast retention-offer-receipt" role="status">{message}<button aria-label="Fechar confirmação" onClick={()=>setMessage('')}>×</button></div>}
  </>;
}
