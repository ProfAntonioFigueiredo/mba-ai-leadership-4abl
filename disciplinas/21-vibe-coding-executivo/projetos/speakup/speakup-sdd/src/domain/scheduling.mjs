// RF-01/RF-02: half-open intervals, compared as instants rather than strings.
export function instant(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  )
    throw Error("Use data e hora válidas com fuso horário.");
  const ms = Date.parse(value);
  if (!Number.isFinite(ms))
    throw Error("Use data e hora válidas com fuso horário.");
  const civil = value.slice(0, 10);
  if (new Date(civil).toISOString().slice(0, 10) !== civil)
    throw Error("Use data e hora válidas.");
  return ms;
}
export function overlap(a, b) {
  return instant(a.start) < instant(b.end) && instant(b.start) < instant(a.end);
}
export function assertSlot(slots, slot) {
  const start = instant(slot.start),
    end = instant(slot.end);
  if (!slot.teacher?.trim() || !slot.group?.trim() || start >= end)
    throw Error("Preencha professor, turma e intervalo válido.");
  if (
    !Number.isInteger(slot.capacity) ||
    slot.capacity < 1 ||
    slot.capacity > 100
  )
    throw Error("Capacidade deve ser um inteiro entre 1 e 100.");
  if (
    slots.some(
      (s) =>
        s.id !== slot.id &&
        (s.teacher === slot.teacher.trim() || s.group === slot.group.trim()) &&
        overlap(s, slot),
    )
  )
    throw Error("Conflito de professor ou turma neste horário.");
}
export function book(state, studentId, slotId, oldId = null) {
  const slot = state.slots.find((s) => s.id === Number(slotId));
  if (!slot || instant(slot.start) <= Date.now())
    throw Error("Horário indisponível.");
  if (
    state.students.find((s) => s.id_aluno === studentId)?.status_matricula !==
    "Ativa"
  )
    throw Error("Matrícula inativa.");
  const own = state.bookings.filter(
    (b) => b.student === studentId && b.status === "agendada",
  );
  const old = oldId ? own.find((b) => b.id === Number(oldId)) : null;
  if (oldId && !old) throw Error("Agendamento original não encontrado.");
  if (old?.slot === slot.id) throw Error("Selecione outro horário.");
  if (
    old &&
    instant(state.slots.find((s) => s.id === old.slot).start) <= Date.now()
  )
    throw Error("Não é possível remarcar aula passada.");
  if (
    !Number.isInteger(slot.capacity) ||
    slot.capacity < 1 ||
    slot.capacity > 100
  )
    throw Error("Capacidade inválida; não há vagas.");
  instant(slot.end);
  if (
    state.bookings.filter((b) => b.slot === slot.id && b.status === "agendada")
      .length >= slot.capacity
  )
    throw Error("Não há vagas.");
  if (
    own.some(
      (b) =>
        b.id !== Number(oldId) &&
        overlap(
          state.slots.find((s) => s.id === b.slot),
          slot,
        ),
    )
  )
    throw Error("Você já possui uma aula neste horário.");
  if (old) old.status = "cancelada";
  state.bookings.push({
    id: Math.max(0, ...state.bookings.map((b) => b.id)) + 1,
    student: studentId,
    slot: slot.id,
    status: "agendada",
    attendance: null,
  });
}
