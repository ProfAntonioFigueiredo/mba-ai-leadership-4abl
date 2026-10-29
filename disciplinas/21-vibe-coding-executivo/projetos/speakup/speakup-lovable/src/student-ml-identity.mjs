// A matrícula literal continua sendo a identidade de login. O ID ML é um vínculo separado.
export function parseMlId(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function automaticMlId(studentId) {
  return typeof studentId === 'string' ? parseMlId(studentId) : null;
}

export function withStudentMlIds(students) {
  const next = students.map(s => ({...s, id_aluno_ml: s.id_aluno_ml ?? null}));
  const occupied = new Set(next.filter(s => s.id_aluno_ml != null).map(s => Number(s.id_aluno_ml)));
  for (const student of next) {
    if (student.id_aluno_ml != null) continue;
    const id = automaticMlId(student.id_aluno);
    if (id != null && !occupied.has(id)) {
      student.id_aluno_ml = id;
      occupied.add(id);
    }
  }
  return next;
}

export function mlIdentityStatus(student, students) {
  const linked = parseMlId(student.id_aluno_ml);
  if (linked != null && !students.some(s => s.id_aluno !== student.id_aluno && Number(s.id_aluno_ml) === linked)) {
    return {ready: true, message: 'Vínculo numérico pronto'};
  }
  if (student.id_aluno_ml != null) return {ready: false, message: 'Vínculo inválido ou duplicado; revisão necessária'};
  return {ready: false, message: automaticMlId(student.id_aluno) == null
    ? 'Matrícula legada: informe o ID da fonte de alunos'
    : 'ID numérico em uso por outra matrícula; revisão necessária'};
}

export function linkStudentMlId(students, studentId, value) {
  const current = withStudentMlIds(students);
  const id = parseMlId(value);
  if (id == null) throw Error('Use um inteiro positivo, sem zeros iniciais, até 9007199254740991.');
  const student = current.find(s => s.id_aluno === studentId);
  if (!student) throw Error('Matrícula não encontrada.');
  if (student.id_aluno_ml != null && Number(student.id_aluno_ml) !== id) {
    throw Error('O vínculo já foi definido e não pode ser alterado por esta tela.');
  }
  if (current.some(s => s.id_aluno !== studentId && Number(s.id_aluno_ml) === id)) {
    throw Error('ID do Excel já associado a outra matrícula.');
  }
  return current.map(s => s.id_aluno === studentId ? {...s, id_aluno_ml: id} : {...s});
}
