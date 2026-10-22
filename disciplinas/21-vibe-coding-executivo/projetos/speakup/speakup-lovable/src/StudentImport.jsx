import React, {useState} from 'react';
import readXlsxFile from 'read-excel-file';
import {COLUMNS,parseCSV,csvCell} from './domain.mjs';
import {prepareImport,importDemo} from './student-import.mjs';
import {supabase,load} from './backend.js';
export function StudentImport({user,state,setState,save}) {
 const [preview,setPreview]=useState(null),[results,setResults]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 if(user.role!=='admin') return null;
 async function upload(file){if(!file)return;setBusy(true);setError('');setPreview(null);setResults(null);try{
  if(file.size>5*1024*1024)throw Error('Limite de 5 MB por arquivo.');
  const ext=file.name.split('.').pop().toLowerCase();
  const matrix=ext==='xlsx'?await readXlsxFile(file):ext==='csv'?parseCSV(await file.text()):null;
  if(!matrix)throw Error('Selecione um arquivo XLSX ou CSV.');
  const current=supabase?await load():state;
  setPreview(prepareImport(matrix,current.students));
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 async function confirm(){if(busy||!preview)return;setBusy(true);setError('');const output=[];try{
  if(!supabase){const {next,results}=importDemo(preview.entries,state);save(next,'Importação de alunos');output.push(...results);}
  else {
   for(const entry of preview.entries){
    if(entry.reasons.length){output.push({line:entry.line,id_aluno:entry.row.id_aluno,status:'rejected',reason:entry.reasons.join(' ')});continue;}
    try {const {data,error}=await supabase.functions.invoke('import-students',{body:{rows:[{line:entry.line,row:entry.row}]}});if(error||!data?.results)throw Error('Resposta não confirmada. Reenvie o arquivo para conferir o estado e tentar novamente.');output.push(...data.results);}
    catch(e){output.push({line:entry.line,id_aluno:entry.row.id_aluno,status:'unknown',reason:e.message});}
    setResults([...output]);
   }
   try{setState(await load());}catch{setError('Importação processada, mas a lista não atualizou. Recarregue a página.');}
  }
  setResults(output);setPreview(null);
 }catch(e){setError(e.message);}finally{setBusy(false);}}
 function report(){const data=[['Linha','ID','Resultado','Login','Motivo'],...results.map(r=>[r.line,r.id_aluno||r.row?.id_aluno,r.status,r.login||'',r.reason||''])].map(r=>r.map(csvCell).join(';')).join('\n');const url=URL.createObjectURL(new Blob(['\ufeff'+data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='resultado-importacao.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <section className="panel"><div className="section-head"><div><h2>Importação de Alunos</h2><p>Selecione o Excel, revise os registros e confirme a gravação.</p></div><button disabled={busy} onClick={()=>{const a=document.createElement('a');a.href='./modelo-alunos.csv';a.download='modelo-alunos.csv';a.click();}}>Baixar modelo</button></div>
 <p>As 19 colunas do cadastro são preservadas. Colunas podem estar em outra ordem. IDs devem ser texto no Excel para preservar zeros iniciais. Conflitos de identidade são rejeitados; campos vazios não apagam valores existentes.</p>
 <label className="primary" style={{display:'inline-block',padding:12,borderRadius:8}}>Importar Excel<input aria-label="Importar Excel" type="file" accept=".xlsx,.csv" disabled={busy} onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/></label>
 <p className="hint">Novas contas: login pelo Id_aluno e senha Escola@@@. Senhas existentes são preservadas. Todos os status podem fazer login; reservas de aulas exigem matrícula Ativa.</p>
 {error&&<div className="error" role="alert">{error}</div>}
 {busy&&<p role="status">Processando… {results?.length||0} registros concluídos. Mantenha esta página aberta.</p>}
 {preview&&<><details><summary>Correspondência das colunas</summary>{preview.mapping.map(m=><p key={m.target}>{m.source} → {m.target}</p>)}</details><p>{preview.entries.length} registros · {preview.entries.filter(e=>!e.reasons.length).length} aptos · {preview.entries.filter(e=>e.reasons.length).length} rejeitados na prévia</p><div className="table-wrap"><table><thead><tr><th>Linha / análise</th>{COLUMNS.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{preview.entries.slice(0,100).map(e=><tr key={e.line} className={e.reasons.length?'invalid':''}><td>{e.line}: {e.reasons.join(' ')||(e.operation==='inserted'?'Novo':'Atualizar')}</td>{COLUMNS.map(c=><td key={c}>{e.row[c]}</td>)}</tr>)}</tbody></table></div><p className="hint">Prévia das primeiras 100 linhas. Todas as linhas foram analisadas. Linhas rejeitadas não serão gravadas.</p><button className="primary" disabled={busy||!preview.entries.some(e=>!e.reasons.length)} onClick={confirm}>Confirmar Importação</button></>}
 {results&&<div aria-live="polite"><h3>Resumo da importação</h3><p>Importados: {results.filter(r=>r.status==='inserted').length} · Atualizados: {results.filter(r=>r.status==='updated').length} · Rejeitados: {results.filter(r=>r.status==='rejected').length} · Sem confirmação: {results.filter(r=>r.status==='unknown').length}</p><p>Login pronto: {results.filter(r=>r.login==='ready').length} · Login pendente: {results.filter(r=>r.login==='pending').length}</p><button onClick={report}>Baixar relatório completo</button>{results.filter(r=>r.reason).slice(0,100).map((r,i)=><p key={i}>Linha {r.line}: {r.reason}</p>)}</div>}
 {!supabase&&<p className="notice">Demonstração: gravação somente neste navegador. Contas reais são criadas apenas com o Supabase configurado.</p>}
 </section>;
}

