import React, {useEffect, useMemo, useRef, useState} from 'react';
import readXlsxFile, {readSheetNames} from 'read-excel-file';
import {supabase, rpc} from './backend.js';
import {csvCell} from './domain.mjs';
import {CHURN_BATCH_SIZE, prepareChurnImport, chunks, importChurnDemoBatch, churnAdminData} from './churn-import.mjs';

const emptyData = {rows:[], total:0, total_predictions:0, bands:[], linked:0};
const percent = value => `${String(value).replace('.', ',')}%`;

export function ChurnImport({user, state, save}) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({done:0,total:0});
  const [error, setError] = useState('');
  const [readError, setReadError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [remote, setRemote] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const alive = useRef(true);
  const stateRef = useRef(state);
  useEffect(()=>{stateRef.current=state;},[state]);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    if (!supabase || user.role !== 'admin') return;
    let active=true;
    const timer=setTimeout(async()=>{
      setLoading(true);setReadError('');
      try {
        const data=await rpc('churn_admin_data',{p_search:search,p_page:page,p_page_size:20});
        if(active)setRemote(data);
      } catch(e) {if(active)setReadError(e.message);}
      finally {if(active)setLoading(false);}
    },250);
    return()=>{active=false;clearTimeout(timer);};
  },[search,page,refresh,user.role]);
  const local=useMemo(()=>supabase?emptyData:churnAdminData(state.churnPredictions??[],state.students,{search,page,pageSize:20}),[state,search,page]);
  const data=supabase?remote:local;
  if (user.role !== 'admin') return null;

  async function upload(file) {
    if(!file || busy)return;
    setBusy(true);setError('');setPreview(null);setResults(null);setProgress({done:0,total:0});
    try {
      if(!/\.xlsx$/i.test(file.name))throw Error('Selecione um arquivo Excel .xlsx.');
      if(file.size>5*1024*1024)throw Error('O limite por arquivo é de 5 MB.');
      const sheets=await readSheetNames(file);
      if(sheets.length!==1)throw Error('Use uma única aba com as previsões para evitar omitir alunos de outra aba.');
      const matrix=await readXlsxFile(file);
      if(!alive.current)return;
      setPreview(prepareChurnImport(matrix));setFileName(file.name);
    } catch(e) {if(alive.current)setError(e.message);}
    finally {if(alive.current)setBusy(false);}
  }

  async function confirm() {
    if(busy || !preview || !preview.valid)return;
    setBusy(true);setError('');
    const output=preview.entries.filter(e=>e.reasons.length).map(e=>({line:e.line,id_aluno:e.row.id_aluno,status:'rejected',reason:e.reasons.join(' ')}));
    const rows=preview.entries.filter(e=>!e.reasons.length).map(e=>({line:e.line,...e.row}));
    let predictions=[...(stateRef.current.churnPredictions??[])];
    let processed=0;
    setResults([...output]);setProgress({done:output.length,total:preview.total});
    try {
      for(const batch of chunks(rows,CHURN_BATCH_SIZE)) {
        if(!alive.current)return;
        try {
          let response;
          if(supabase) {
            response=await rpc('import_churn_predictions',{p_rows:batch});
          } else {
            response=importChurnDemoBatch(batch,predictions,new Date().toISOString());
            // Cada lote só é confirmado depois de persistir com sucesso no navegador.
            const next={...structuredClone(stateRef.current),churnPredictions:response.predictions};
            save(next,`Importação de churn: ${response.inserted} novos, ${response.updated} atualizados, ${response.rejected} rejeitados`);
            stateRef.current=next;
            predictions=response.predictions;
          }
          const expected=new Map(batch.map(r=>[r.line,r.id_aluno]));
          if(!Array.isArray(response?.results) || response.results.length!==batch.length || new Set(response.results.map(r=>r.line)).size!==batch.length || response.results.some(r=>!expected.has(r.line)||expected.get(r.line)!==r.id_aluno||!['inserted','updated','rejected'].includes(r.status))) {
            throw Error('O servidor não confirmou todas as linhas do lote.');
          }
          output.push(...response.results);
          processed+=batch.length;
        } catch(e) {
          output.push(...batch.map(r=>({line:r.line,id_aluno:r.id_aluno,status:'unknown',reason:supabase?'Gravação sem confirmação. Confira os dados e reenvie o arquivo.':`Gravação local não confirmada: ${e.message}`})));
          processed+=batch.length;
          output.push(...rows.slice(processed).map(r=>({line:r.line,id_aluno:r.id_aluno,status:'not_processed',reason:'A importação foi interrompida antes deste lote.'})));
          throw Error(`Importação interrompida. ${e.message} Os lotes já confirmados foram preservados.`);
        }
        if(alive.current){setResults([...output]);setProgress({done:preview.invalid+processed,total:preview.total});}
        // Cede a renderização para atualizar a barra e permitir navegação entre os lotes.
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      if(alive.current)setPreview(null);
    } catch(e) {if(alive.current)setError(e.message);}
    finally {
      if(alive.current) {
        setResults(output.sort((a,b)=>a.line-b.line));
        setProgress({done:output.filter(r=>r.status!=='not_processed').length,total:preview.total});
        setRefresh(r=>r+1);setPage(1);setBusy(false);
      }
    }
  }

  function downloadReport() {
    const text=[['linha','id_aluno','resultado','motivo'],...results.map(r=>[r.line,r.id_aluno,r.status,r.reason??''])].map(row=>row.map(csvCell).join(';')).join('\n');
    const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='resultado-importacao-churn.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const counts=Object.fromEntries(['inserted','updated','rejected','unknown','not_processed'].map(s=>[s,results?.filter(r=>r.status===s).length??0]));
  return <div className="churn-import">
    <section className="panel">
      <div className="section-head"><div><h2>Importar previsão de churn</h2><p>Selecione o Excel, confira a prévia e confirme a gravação.</p></div></div>
      <p>O arquivo deve conter apenas <strong>id_aluno</strong> e <strong>probabilidade_churn</strong>, nesta ordem, com valores numéricos. A probabilidade vai de 0 a 100: por exemplo, 37,5 representa 37,5%.</p>
      <label className="churn-file">Arquivo de previsão (.xlsx)<input aria-label="Arquivo de previsão de churn" type="file" accept=".xlsx" disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>
      {!supabase&&<p className="notice">Modo de demonstração: a importação fica salva somente neste navegador. Nenhum dado será enviado a um banco remoto.</p>}
      {error&&<div className="error" role="alert">{error}</div>}
      {busy&&!progress.total&&<p role="status">Lendo e validando o arquivo…</p>}
      {preview&&<div className="churn-preview">
        <h3>Prévia da importação</h3><p>{fileName}</p>
        <p><strong>{preview.total} linhas</strong> · {preview.valid} válidas · {preview.invalid} com problemas</p>
        <div className="table-wrap"><table><thead><tr><th>Linha</th><th>id_aluno</th><th>probabilidade_churn</th><th>Conferência</th></tr></thead><tbody>{preview.entries.slice(0,10).map(e=><tr key={e.line} className={e.reasons.length?'invalid':''}><td>{e.line}</td><td>{String(e.row.id_aluno??'')}</td><td>{String(e.row.probabilidade_churn??'')}</td><td className="churn-reason">{e.reasons.join(' ')||'Pronta para importar'}</td></tr>)}</tbody></table></div>
        <p className="hint">Prévia das dez primeiras linhas. Todas as linhas foram validadas; linhas com erro ou ID duplicado no arquivo serão rejeitadas. IDs sem cadastro são preservados como previsões ainda sem vínculo.</p>
        {preview.invalid>0&&<details><summary>Ver problemas encontrados ({preview.invalid} linhas)</summary>{preview.entries.filter(e=>e.reasons.length).slice(0,100).map(e=><p key={e.line}>Linha {e.line}: {e.reasons.join(' ')}</p>)}{preview.invalid>100&&<p>Exibindo os primeiros 100 problemas. O relatório final contém todas as linhas.</p>}</details>}
        <button className="primary" onClick={confirm} disabled={busy||!preview.valid}>Confirmar importação de churn</button>
      </div>}
      {progress.total>0&&<div className="churn-progress" aria-live="polite"><label>Progresso da importação<progress aria-label="Progresso da importação" max={progress.total} value={progress.done}/></label><p>{progress.done} de {progress.total} linhas processadas · {Math.round(progress.done/progress.total*100)}% · lotes de até {CHURN_BATCH_SIZE}</p>{busy&&<p>Mantenha esta página aberta até a conclusão.</p>}</div>}
      {results&&<div className="churn-results" aria-live="polite"><h3>Resultado da importação de churn</h3><p>Importados: {counts.inserted} · Atualizados: {counts.updated} · Rejeitados: {counts.rejected}</p>{(counts.unknown>0||counts.not_processed>0)&&<p>Sem confirmação: {counts.unknown} · Não processados: {counts.not_processed}</p>}<button disabled={busy} onClick={downloadReport}>Baixar relatório da importação</button></div>}
    </section>
    <section className="panel">
      <div className="section-head"><div><h2>Previsões importadas</h2><p>{data.total_predictions} previsões · {data.linked} com cadastro vinculado · {data.total_predictions-data.linked} sem cadastro vinculado</p></div>{supabase&&<button disabled={busy||loading} onClick={()=>setRefresh(r=>r+1)}>Atualizar previsões</button>}</div>
      {readError&&<div className="error" role="alert">Não foi possível consultar as previsões. {readError} Confira a migração de importação do ambiente conectado.</div>}
      <div className="churn-bands" aria-label="Distribuição por faixa de churn">{data.bands.map(b=><div key={b.label}><span>{b.label}%</span><strong>{b.count}</strong><small>alunos</small></div>)}</div>
      <p className="hint">Faixas incluem o limite inferior e excluem o superior. A última também inclui 100%. O resumo considera todas as previsões importadas.</p>
      <label>Buscar por ID do Excel ou nome<input className="search" value={search} maxLength={200} disabled={busy} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>
      {loading&&<p role="status">Consultando previsões…</p>}
      <div className="table-wrap"><table><thead><tr><th>ID do Excel</th><th>Aluno</th><th>Probabilidade de churn</th><th>Importado em</th></tr></thead><tbody>{data.rows.map(r=><tr key={r.id_aluno}><td>{r.id_aluno}</td><td>{r.nome||'Sem cadastro vinculado'}</td><td><strong>{percent(r.probabilidade_churn)}</strong></td><td>{new Date(r.data_importacao).toLocaleString('pt-BR')}</td></tr>)}</tbody></table></div>
      {!loading&&!data.rows.length&&<p className="empty">{data.total_predictions?'Nenhuma previsão corresponde à busca.':'Nenhuma previsão importada.'}</p>}
      <div className="actions"><button disabled={busy||loading||page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Página {page} · {data.total} resultados</span><button disabled={busy||loading||page*20>=data.total} onClick={()=>setPage(p=>p+1)}>Próxima</button></div>
    </section>
  </div>;
}
