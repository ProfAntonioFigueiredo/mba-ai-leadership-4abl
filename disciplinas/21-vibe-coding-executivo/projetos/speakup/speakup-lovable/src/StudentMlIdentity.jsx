import React, {useState} from 'react';
import {supabase, rpc, load} from './backend.js';
import {withStudentMlIds, mlIdentityStatus, linkStudentMlId} from './student-ml-identity.mjs';

export function StudentMlIdentity({user, state, setState, save}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  if (user.role !== 'admin') return null;
  const students = supabase ? state.students : withStudentMlIds(state.students);
  const ready = students.filter(s => mlIdentityStatus(s, students).ready).length;
  const filtered = students.filter(s => `${s.nome} ${s.id_aluno} ${s.id_aluno_ml ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  async function submit(e) {
    e.preventDefault();
    if (busy || !editing || !confirmed) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const next = linkStudentMlId(students, editing.id_aluno, value);
      if (supabase) {
        await rpc('link_student_ml_id', {p_student: editing.id_aluno, p_ml_id: Number(value)});
        setState(await load());
      } else {
        save({...structuredClone(state), students: next}, 'Vínculo do ID do Excel registrado');
      }
      setMessage(`Vínculo registrado para a matrícula ${editing.id_aluno}.`);
      setEditing(null); setValue(''); setConfirmed(false);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <section className="panel ml-identity">
    <div className="section-head"><div><h2>Identificação de alunos para Machine Learning</h2><p>Atividade 3 · Preparação do cadastro e ligação com o Excel</p></div></div>
    <p>A matrícula continua sendo usada no login. O <strong>ID do Excel</strong> é um número inteiro único, armazenado em <code>id_aluno_ml</code>, que corresponde à coluna <code>id_aluno</code> da planilha.</p>
    <div className="stats compact"><div className="stat"><span>Alunos cadastrados</span><strong>{students.length}</strong></div><div className="stat"><span>Vínculos numéricos prontos</span><strong>{ready}</strong></div><div className="stat"><span>Exigem conferência</span><strong>{students.length-ready}</strong></div></div>
    <div className="notice">Matrículas numéricas sem zeros iniciais recebem o mesmo número automaticamente. Matrículas como 001 ou AL-23 mantêm o login original e precisam do ID confirmado na fonte de alunos. A ordem das linhas do Excel não define identidade.</div>
    {supabase && state.students.some(s => !Object.hasOwn(s, 'id_aluno_ml')) && <div className="error" role="alert">O banco ainda não devolve o identificador ML. Aplique a migração de preparação no Supabase antes de registrar vínculos.</div>}
    {!supabase && <p className="hint">Demonstração: os vínculos são locais neste navegador. A correspondência com pessoas reais depende do cadastro da escola.</p>}
    {message && <p role="status">{message}</p>}
    {error && <div className="error" role="alert">{error}</div>}
    {editing && <form className="ml-identity-form" onSubmit={submit}>
      <h3>Associar ID do Excel</h3><p><strong>{editing.nome}</strong> · Matrícula {editing.id_aluno}</p>
      <label>ID numérico da planilha<input value={value} onChange={e=>setValue(e.target.value)} inputMode="numeric" pattern="[1-9][0-9]*" required maxLength={16} disabled={busy}/></label>
      <label className="ml-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} required disabled={busy}/><span>Conferi na fonte de alunos que este ID pertence a esta matrícula.</span></label>
      <p className="hint">O vínculo salvo não pode ser renumerado por esta tela. O login, a senha e os agendamentos permanecem associados à matrícula.</p>
      <div className="actions"><button className="primary" disabled={busy || !confirmed}>{busy?'Salvando…':'Registrar vínculo'}</button><button type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancelar</button></div>
    </form>}
    <label>Buscar por aluno, matrícula ou ID do Excel<input className="search" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>
    <div className="table-wrap"><table><thead><tr><th>Aluno</th><th>Matrícula / login</th><th>ID do Excel</th><th>Conferência</th><th>Ação</th></tr></thead><tbody>{filtered.slice((page-1)*20,page*20).map(s=>{
      const status = mlIdentityStatus(s,students);
      return <tr key={s.id_aluno}><td><strong>{s.nome}</strong></td><td>{s.id_aluno}</td><td>{s.id_aluno_ml ?? 'Não associado'}</td><td className="ml-status">{status.message}</td><td>{s.id_aluno_ml == null && <button disabled={busy} onClick={()=>{setEditing(s);setValue('');setConfirmed(false);setError('');setMessage('');}}>Associar ID</button>}</td></tr>;
    })}</tbody></table></div>
    {!filtered.length && <p className="empty">Nenhum aluno encontrado.</p>}
    <div className="actions"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Página {page} · {filtered.length} alunos</span><button disabled={page*20>=filtered.length} onClick={()=>setPage(p=>p+1)}>Próxima</button></div>
  </section>;
}
