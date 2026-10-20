import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const root = process.env.SPEAKUP_TARGET;
const domain = root
  ? await import(pathToFileURL(root + "/src/domain.mjs"))
  : await import("../src/domain.mjs");
const demo = root
  ? await import(pathToFileURL(root + "/src/demo.mjs"))
  : await import("../src/demo.mjs");
const { assertSlot, book, overlap, COLUMNS, validateImport } = domain;
const slot = {
  id: 1,
  teacher: "Camila",
  group: "A",
  start: "2099-01-01T09:00:00Z",
  end: "2099-01-01T10:00:00Z",
  capacity: 5,
};
const row = (id) =>
  COLUMNS.map(
    (c) =>
      ({
        id_aluno: String(id),
        nome: "Aluno",
        email: "aluno@example.com",
        data_matricula: "2026-10-19",
        status_matricula: "Ativa",
        "Valor Mensalidade": "450.00",
      })[c] || "",
  );
test("AC-02: intervalo invertido em UTC com offsets diferentes é rejeitado", () =>
  assert.throws(
    () => assertSlot([], { ...slot, end: "2099-01-01T10:00:00+02:00" }),
    /intervalo/,
  ));
test("AC-02: datas inválidas são rejeitadas", () =>
  assert.throws(
    () => assertSlot([], { ...slot, start: "invalid", end: "zzz" }),
    /data|hora/,
  ));
test("AC-02: capacidade 0, 101 e fracionária são rejeitadas", () => {
  for (const capacity of [0, 101, 1.5])
    assert.throws(() => assertSlot([], { ...slot, capacity }), /Capacidade/);
});
test("AC-03: intervalos adjacentes com offsets distintos não conflitam", () =>
  assert.equal(
    overlap(slot, {
      ...slot,
      start: "2099-01-01T10:00:00+02:00",
      end: "2099-01-01T11:00:00+02:00",
    }),
    false,
  ));
test("AC-03: remarcação para a mesma aula falha sem mutação", () => {
  const state = demo.seed(),
    before = structuredClone(state);
  assert.throws(() => book(state, "10045", 1, 1), /outro horário/);
  assert.deepEqual(state, before);
});
test("AC-04: 5001 registros são rejeitados antes da prévia", () =>
  assert.throws(
    () =>
      validateImport([
        COLUMNS,
        ...Array.from({ length: 5001 }, (_, i) => row(i + 1)),
      ]),
    /5000/,
  ));
test("AC-04: idade deve caber no inteiro do PostgreSQL", () => {
  const values = row(1);
  values[4] = "2147483648";
  assert.ok(
    validateImport([COLUMNS, values]).errors.some((e) => e.column === "idade"),
  );
});
test("AC-10: reserva com início inválido não altera estado", () => {
  const state = demo.seed();
  state.slots[2].start = "invalid";
  const before = structuredClone(state);
  assert.throws(() => book(state, "10045", 3), /data|hora/);
  assert.deepEqual(state, before);
});
test("AC-04: lote com exatamente 5000 registros é aceito", () =>
  assert.equal(
    validateImport([
      COLUMNS,
      ...Array.from({ length: 5000 }, (_, i) => row(i + 1)),
    ]).errors.length,
    0,
  ));
