import test from "node:test";
import assert from "node:assert/strict";
import { executeDemoCommand } from "../src/application/demo-command.mjs";
test("falha após mutação parcial não altera o estado nem registra auditoria", () => {
  const state = { students: [{ nome: "Ana" }], audit: [] };
  assert.throws(() =>
    executeDemoCommand(
      state,
      (next) => {
        next.students[0].nome = "Parcial";
        throw Error("falha");
      },
      { action: "Importação" },
    ),
  );
  assert.deepEqual(state, { students: [{ nome: "Ana" }], audit: [] });
});
