import test from "node:test";
import assert from "node:assert/strict";
import { resolveBackendConfig } from "../src/infrastructure/configuration.mjs";
test("AC-01: sem configuração usa demo", () =>
  assert.equal(resolveBackendConfig({}).mode, "demo"));
test("AC-01: configuração parcial falha explicitamente", () => {
  for (const env of [
    { VITE_SUPABASE_URL: "https://example.supabase.co" },
    { VITE_SUPABASE_PUBLISHABLE_KEY: "public-test" },
  ])
    assert.throws(() => resolveBackendConfig(env), /incompleta/);
});
test("AC-01: URL e chave válidas selecionam backend", () =>
  assert.deepEqual(
    resolveBackendConfig({
      VITE_SUPABASE_URL: " https://example.supabase.co ",
      VITE_SUPABASE_PUBLISHABLE_KEY: " public-test ",
    }),
    {
      mode: "supabase",
      url: "https://example.supabase.co",
      key: "public-test",
    },
  ));
test("AC-01: URL inválida e HTTP remoto são rejeitados", () => {
  for (const url of ["invalid", "javascript:alert(1)", "http://remote.example"])
    assert.throws(
      () =>
        resolveBackendConfig({
          VITE_SUPABASE_URL: url,
          VITE_SUPABASE_PUBLISHABLE_KEY: "x",
        }),
      /URL|HTTPS/,
    );
});
