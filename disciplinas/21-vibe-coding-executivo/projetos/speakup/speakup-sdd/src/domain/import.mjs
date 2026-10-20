export const COLUMNS = [
  "id_aluno",
  "nome",
  "email",
  "data_nascimento",
  "idade",
  "genero",
  "unidade",
  "cidade",
  "estado",
  "canal_aquisicao",
  "nivel_curso",
  "modalidade",
  "turno",
  "plano",
  "desconto_percentual",
  "data_matricula",
  "status_matricula",
  "data_cancelamento",
  "Valor Mensalidade",
];
export const STATES = ["Ativa", "Cancelada", "Trancada", "Pausada"];
export function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  const first = text.replace(/^\uFEFF/, "").split(/\r?\n/)[0];
  const sep =
    (first.match(/;/g) || []).length > (first.match(/,/g) || []).length
      ? ";"
      : ",";
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell) {
        throw Error("Aspas inesperadas no CSV.");
      } else quoted = !quoted;
    } else if (c === sep && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("CSV com aspas não fechadas.");
  row.push(cell);
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}
const iso = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
export function validateImport(matrix, existing = []) {
  if (matrix.length > 5001)
    throw Error("Envie entre 1 e 5000 alunos por lote.");
  if (
    !matrix.length ||
    matrix[0].length !== 19 ||
    matrix[0].some((c, i) => c !== COLUMNS[i])
  )
    throw Error(
      "Arquivo inválido. A planilha deve conter rigorosamente as 19 colunas da estrutura oficial, na ordem oficial.",
    );
  const seen = new Set(),
    errors = [],
    rows = [];
  let inserted = 0,
    updated = 0;
  matrix.slice(1).forEach((cells, i) => {
    const line = i + 2,
      record = {};
    const err = (column, message) => errors.push({ line, column, message });
    if (cells.length !== 19)
      err("estrutura", "A linha deve conter 19 células.");
    COLUMNS.forEach((c, j) => {
      const v = cells[j];
      record[c] =
        v instanceof Date
          ? v.toISOString().slice(0, 10)
          : String(v ?? "").trim();
    });
    for (const c of [
      "id_aluno",
      "nome",
      "email",
      "data_matricula",
      "status_matricula",
      "Valor Mensalidade",
    ])
      if (!record[c]) err(c, "Campo obrigatório.");
    for (const [c, max] of Object.entries({
      id_aluno: 50,
      nome: 150,
      email: 100,
      genero: 20,
      unidade: 100,
      cidade: 100,
      estado: 2,
      canal_aquisicao: 50,
      nivel_curso: 50,
      modalidade: 20,
      turno: 20,
      plano: 50,
      status_matricula: 20,
    }))
      if (record[c].length > max) err(c, `Máximo ${max} caracteres.`);
    if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))
      err("email", "E-mail inválido.");
    for (const c of ["data_nascimento", "data_matricula", "data_cancelamento"])
      if (record[c] && !iso(record[c]))
        err(c, "Use uma data válida YYYY-MM-DD.");
    for (const c of ["Valor Mensalidade", "desconto_percentual"])
      if (record[c] && !/^\d+(\.\d{1,2})?$/.test(record[c]))
        err(c, "Use número decimal, ponto e até 2 casas.");
    if (
      record["Valor Mensalidade"] &&
      Number(record["Valor Mensalidade"]) > 99999999.99
    )
      err("Valor Mensalidade", "Valor excede DECIMAL(10,2).");
    if (record.desconto_percentual && Number(record.desconto_percentual) > 100)
      err("desconto_percentual", "Percentual deve estar entre 0 e 100.");
    if (
      record.idade &&
      (!/^\d+$/.test(record.idade) || Number(record.idade) > 2147483647)
    )
      err("idade", "Use um inteiro não negativo.");
    if (!STATES.includes(record.status_matricula))
      err("status_matricula", "Use Ativa, Cancelada, Trancada ou Pausada.");
    if (seen.has(record.id_aluno))
      err("id_aluno", "Matrícula duplicada neste arquivo.");
    seen.add(record.id_aluno);
    existing.includes(record.id_aluno) ? updated++ : inserted++;
    rows.push(record);
  });
  if (!rows.length) throw Error("O arquivo não contém alunos.");
  return { rows, errors, inserted, updated };
}
