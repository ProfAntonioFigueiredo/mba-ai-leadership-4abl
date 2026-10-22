import { COLUMNS, validateImport } from './domain.mjs';
const key = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const aliases = {matricula:'id_aluno',idaluno:'id_aluno',nomecompleto:'nome',datanascimento:'data_nascimento',curso:'nivel_curso',nivel:'nivel_curso',status:'status_matricula',mensalidade:'Valor Mensalidade',valormensalidade:'Valor Mensalidade',datamatricula:'data_matricula',desconto:'desconto_percentual'};
const fields = Object.fromEntries(COLUMNS.map(c => [key(c), c]));
export function prepareImport(matrix, existing = []) {
  if (!matrix.length) throw Error('Planilha vazia.');
  if (matrix.length > 5001) throw Error('Limite de 5.000 alunos por arquivo.');
  const headers = matrix[0].map(h => fields[key(h)] || aliases[key(h)]);
  if (headers.some(h => !h)) throw Error('Coluna não reconhecida. Use o modelo para não perder informações.');
  if (new Set(headers).size !== headers.length) throw Error('Duas colunas correspondem ao mesmo campo.');
  for (const c of COLUMNS) if (!headers.includes(c)) throw Error(`Coluna ausente: ${c}. Use o modelo completo.`);
  const normalized = matrix.slice(1).map(cells => COLUMNS.map(c => {
    let value = cells[headers.indexOf(c)];
    if (value instanceof Date) value = value.toISOString().slice(0,10);
    value = String(value ?? '').trim();
    if (c.startsWith('data_') && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) value = value.slice(6)+'-'+value.slice(3,5)+'-'+value.slice(0,2);
    if (['Valor Mensalidade','desconto_percentual'].includes(c)) value = value.replace(/^R\$\s*/, '').replace(/\s/g,'').replace(/^(\d{1,3}(?:\.\d{3})*),(\d{1,2})$/, (_,a,b)=>a.replaceAll('.','')+'.'+b).replace(/^(\d+),(\d{1,2})$/, '$1.$2');
    if (c === 'status_matricula') value = ({ativa:'Ativa',cancelada:'Cancelada',trancada:'Trancada',pausada:'Pausada'})[key(value)] || value;
    return value;
  }));
  const validated = validateImport([COLUMNS,...normalized]);
  const errors = [...validated.errors];
  const counts = new Map();
  for (const r of validated.rows) counts.set(r.id_aluno,(counts.get(r.id_aluno)||0)+1);
  const entries = validated.rows.map((row,i) => {
    const reasons = errors.filter(e=>e.line===i+2).map(e=>`${e.column}: ${e.message}`);
    if (matrix[i+1].length !== headers.length) reasons.push('Quantidade de células diferente do cabeçalho.');
    if (counts.get(row.id_aluno)>1) reasons.push('Identificador repetido no arquivo; todas as ocorrências foram rejeitadas.');
    if (row.idade && (!Number.isSafeInteger(Number(row.idade)) || Number(row.idade)>2147483647)) reasons.push('Idade fora do limite do banco.');
    const old = existing.find(s=>s.id_aluno===row.id_aluno);
    if (old && (key(old.nome)!==key(row.nome) || old.email.toLowerCase()!==row.email.toLowerCase())) reasons.push('ID existente com nome ou e-mail diferente. Revisão manual necessária.');
    if (existing.some(s=>s.id_aluno!==row.id_aluno && s.email.toLowerCase()===row.email.toLowerCase()) || validated.rows.some((s,j)=>j!==i && s.id_aluno!==row.id_aluno && s.email.toLowerCase()===row.email.toLowerCase())) reasons.push('E-mail associado a outro identificador. Revisão manual necessária.');
    return {line:i+2,row,reasons,operation:old?'updated':'inserted'};
  });
  return {entries, mapping:matrix[0].map((source,i)=>({source,target:headers[i]}))};
}
export function mergeStudent(old, row) {
  return {...old,...Object.fromEntries(COLUMNS.map(c=>[c,row[c] === '' && old ? old[c] ?? '' : row[c]]))};
}
export function importDemo(entries, state) {
  const next=structuredClone(state), results=[];
  for(const entry of entries) {
    if(entry.reasons.length){results.push({...entry,status:'rejected',reason:entry.reasons.join(' ')});continue;}
    const index=next.students.findIndex(s=>s.id_aluno===entry.row.id_aluno);
    const row=mergeStudent(next.students[index],entry.row);
    if(index<0) next.students.push(row); else next.students[index]=row;
    results.push({line:entry.line,id_aluno:row.id_aluno,status:index<0?'inserted':'updated',login:'ready'});
  }
  return {next,results};
}


