import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Acessar portal" }).click();
  if (info.title.startsWith("AC-08"))
    await page.screenshot({
      path: process.env.SPEAKUP_BASELINE_UI
        ? "reports/dashboard-original.png"
        : "reports/dashboard-sdd.png",
      fullPage: true,
    });
});
test("AC-06: modal contém foco, fecha com Escape e restaura acionador", async ({
  page,
}) => {
  const open = page.getByRole("button", { name: "Agendar minha aula" });
  await open.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect
    .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  const buttons = dialog.getByRole("button");
  await buttons.last().focus();
  await page.keyboard.press("Tab");
  await expect
    .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)))
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(open).toBeFocused();
});
test("AC-08: aluno reserva um horário livre e vê confirmação", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Agendar minha aula" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator(".slot-options button").nth(2).click();
  await dialog.getByRole("button", { name: "Confirmar horário" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Aula agendada com sucesso",
  );
  await expect(dialog).not.toBeVisible();
});

test("AC-11: aluno usa dashboard mobile sem rolagem horizontal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: process.env.SPEAKUP_BASELINE_UI
      ? "reports/mobile-original.png"
      : "reports/mobile-sdd.png",
    fullPage: true,
  });
});
