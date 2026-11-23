import { test, expect } from "@playwright/test";
import raw from "../../data/questions.json";

test("quick fire awards XP once and saves local results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Start Playing/ }).click();
  await page
    .getByRole("button", { name: /Quick Fire/ })
    .first()
    .click();
  for (let n = 0; n < 10; n++) {
    const prompt = await page.locator(".question-panel h1").innerText();
    const q = raw.find((x) => x.prompt === prompt);
    expect(q).toBeTruthy();
    if (!q) throw Error("Missing question");
    if (q.type === "cell")
      await page.getByRole("button", { name: `Cell ${q.answer}` }).click();
    else if (q.type === "range") {
      const [a, b] = q.answer.split(":");
      await page.getByRole("button", { name: `Cell ${a}` }).click();
      await page.getByRole("button", { name: `Cell ${b}` }).click();
    } else if (q.type === "match") {
      for (const s of q.answer.split("|")) {
        const [, meaning] = s.split("→");
        await page.getByRole("button", { name: meaning, exact: true }).click();
      }
    } else if (q.type === "order") {
      for (const s of q.answer.split("|"))
        await page.getByRole("button", { name: s, exact: true }).click();
    } else if (q.options) {
      await page
        .getByRole("button", { name: q.answer, exact: false })
        .last()
        .click();
    } else
      await page.getByRole("textbox", { name: "Your answer" }).fill(q.answer);
    await page.getByRole("button", { name: /Check answer/ }).click();
    await expect(page.getByText(/Correct answer:/)).toBeVisible();
    await page
      .getByRole("button", { name: n === 9 ? /See results/ : /Next question/ })
      .click();
  }
  await expect(page.getByText("SESSION COMPLETE")).toBeVisible();
  await page
    .getByRole("button", { name: /Dashboard/ })
    .first()
    .click();
  await expect(page.getByText("Questions answered")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Questions answered")).toBeVisible();
});
