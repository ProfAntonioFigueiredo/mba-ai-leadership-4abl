export const CHURN_COLUMNS = ['id_aluno', 'probabilidade_churn'];
export const CHURN_BATCH_SIZE = 500;
export const CHURN_MAX_ROWS = 100000;
const BAND_LABELS = ['0–20', '20–40', '40–60', '60–80', '80–100'];

const validId = value => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const validProbability = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;

function reasonsFor(row) {
  const reasons = [];
  if (!validId(row?.id_aluno)) reasons.push('id_aluno: use um número inteiro positivo até 9007199254740991, gravado como número no Excel.');
  if (!validProbability(row?.probabilidade_churn)) reasons.push('probabilidade_churn: use um número entre 0 e 100, gravado como número no Excel.');
  return reasons;
}

function duplicateIds(rows) {
  const counts = new Map();
  for (const row of rows) {
    if (validId(row?.id_aluno)) counts.set(row.id_aluno, (counts.get(row.id_aluno) || 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([id]) => id));
}

export function prepareChurnImport(matrix) {
  const header = matrix?.[0];
  if (!Array.isArray(matrix) || !Array.isArray(header) || header.length !== 2 ||
      (typeof header[0] === 'string' ? header[0].replace(/^\uFEFF/, '') : header[0]) !== CHURN_COLUMNS[0] ||
      header[1] !== CHURN_COLUMNS[1]) {
    throw Error('Use exatamente duas colunas nesta ordem: id_aluno e probabilidade_churn, com cabeçalho na primeira linha.');
  }
  if (matrix.length < 2) throw Error('A planilha não contém previsões.');
  if (matrix.length - 1 > CHURN_MAX_ROWS) throw Error(`Limite de ${CHURN_MAX_ROWS.toLocaleString('pt-BR')} previsões por arquivo.`);
  const entries = matrix.slice(1).map((cells, i) => {
    const row = {id_aluno: Array.isArray(cells) ? cells[0] : undefined,
      probabilidade_churn: Array.isArray(cells) ? cells[1] : undefined};
    const reasons = reasonsFor(row);
    if (!Array.isArray(cells) || cells.length !== 2) reasons.unshift('A linha deve conter exatamente duas células.');
    return {line: i + 2, row, reasons};
  });
  const duplicates = duplicateIds(entries.map(entry => entry.row));
  for (const entry of entries) {
    if (duplicates.has(entry.row.id_aluno)) entry.reasons.push('id_aluno repetido no arquivo; todas as ocorrências foram rejeitadas.');
  }
  const invalid = entries.filter(entry => entry.reasons.length).length;
  return {entries, total: entries.length, invalid, valid: entries.length - invalid};
}

export function chunks(array, size = CHURN_BATCH_SIZE) {
  if (!Array.isArray(array) || !Number.isSafeInteger(size) || size < 1 || size > CHURN_BATCH_SIZE) {
    throw Error('Divida os registros em lotes de 1 a 500 linhas.');
  }
  const output = [];
  for (let i = 0; i < array.length; i += size) output.push(array.slice(i, i + size));
  return output;
}

function storedPredictions(predictions) {
  if (!Array.isArray(predictions)) throw Error('Base de previsões inválida.');
  const map = new Map();
  for (const row of predictions) {
    if (reasonsFor(row).length || map.has(row.id_aluno)) throw Error('A base armazenada possui uma previsão inválida ou um ID duplicado.');
    map.set(row.id_aluno, {id_aluno: row.id_aluno, probabilidade_churn: row.probabilidade_churn, data_importacao: row.data_importacao});
  }
  return map;
}

export function importChurnDemoBatch(rows, predictions = [], atISO = new Date().toISOString()) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > CHURN_BATCH_SIZE) throw Error('Envie entre 1 e 500 previsões por lote.');
  if (typeof atISO !== 'string' || !Number.isFinite(Date.parse(atISO))) throw Error('Data de importação inválida.');
  const next = storedPredictions(predictions);
  const duplicates = duplicateIds(rows);
  const results = [];
  let inserted = 0, updated = 0, rejected = 0;
  for (const row of rows) {
    const reasons = reasonsFor(row);
    const isRecord = row != null && typeof row === 'object' && !Array.isArray(row);
    if (!isRecord) reasons.unshift('Registro de previsão inválido.');
    else if (Object.keys(row).length !== 3 || !['line','id_aluno','probabilidade_churn'].every(key => Object.hasOwn(row, key))) {
      reasons.unshift('O registro deve conter somente line, id_aluno e probabilidade_churn.');
    }
    if (!Number.isSafeInteger(row?.line) || row.line < 2 || row.line > 2147483647) reasons.push('Linha de origem inválida: use um inteiro entre 2 e 2147483647.');
    if (duplicates.has(row?.id_aluno)) reasons.push('id_aluno repetido no lote; todas as ocorrências foram rejeitadas.');
    if (reasons.length) {
      rejected++;
      results.push({line: row?.line, id_aluno: row?.id_aluno, status: 'rejected', reason: reasons.join(' ')});
      continue;
    }
    const status = next.has(row.id_aluno) ? 'updated' : 'inserted';
    if (status === 'updated') updated++; else inserted++;
    next.set(row.id_aluno, {id_aluno: row.id_aluno, probabilidade_churn: row.probabilidade_churn, data_importacao: atISO});
    results.push({line: row.line, id_aluno: row.id_aluno, status});
  }
  return {predictions: [...next.values()], results, inserted, updated, rejected};
}

export function churnAdminData(predictions, students, {search = '', page = 1, pageSize = 20} = {}) {
  const records = [...storedPredictions(predictions).values()];
  const studentByMlId = new Map();
  for (const student of students || []) {
    if (!validId(student.id_aluno_ml)) continue;
    // Uma base local corrompida não pode escolher arbitrariamente entre duas pessoas.
    studentByMlId.set(student.id_aluno_ml, studentByMlId.has(student.id_aluno_ml) ? null : student);
  }
  const bands = BAND_LABELS.map(label => ({label, count: 0}));
  let linked = 0;
  const rows = records.map(row => {
    bands[Math.min(4, Math.floor(row.probabilidade_churn / 20))].count++;
    const student = studentByMlId.get(row.id_aluno);
    if (student) linked++;
    return {...row, nome: student?.nome ?? null};
  }).sort((a, b) => b.probabilidade_churn - a.probabilidade_churn || a.id_aluno - b.id_aluno);
  const term = String(search ?? '').toLocaleLowerCase('pt-BR');
  const filtered = rows.filter(row => `${row.id_aluno}`.includes(term) || String(row.nome ?? '').toLocaleLowerCase('pt-BR').includes(term));
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safeSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? Math.min(pageSize, 100) : 20;
  return {rows: filtered.slice((safePage - 1) * safeSize, safePage * safeSize), total: filtered.length,
    total_predictions: records.length, bands, linked, page: safePage, page_size: safeSize};
}
