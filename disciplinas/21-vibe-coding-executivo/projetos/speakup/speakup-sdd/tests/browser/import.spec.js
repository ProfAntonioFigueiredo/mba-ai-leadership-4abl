import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const header = readFileSync(
  new URL("../../examples/modelo-alunos.csv", import.meta.url),
);
const fixture = Buffer.from(
  header.toString().trimEnd() +
    "\n" +
    [
      "00999",
      "Ana Teste",
      "ana@example.com",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "2026-10-19",
      "Ativa",
      "",
      "450.00",
    ].join(";") +
    "\n",
);
test("AC-05: arquivo inválido remove prévia anterior e impede confirmação", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Coordenação", exact: true }).click();
  await page.getByRole("button", { name: "Acessar portal" }).click();
  await page
    .getByRole("button", { name: "Importar alunos", exact: false })
    .first()
    .click();
  const input = page.getByLabel("Selecionar planilha");
  await input.setInputFiles({
    name: "alunos.csv",
    mimeType: "text/csv",
    buffer: fixture,
  });
  await expect(
    page.getByRole("button", { name: "Confirmar importação em lote" }),
  ).toBeVisible();
  await input.setInputFiles({
    name: "invalido.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("apenas,duas\n1,2"),
  });
  await expect(page.getByRole("status")).toContainText("19 colunas");
  await expect(
    page.getByRole("button", { name: "Confirmar importação em lote" }),
  ).not.toBeVisible();
});
