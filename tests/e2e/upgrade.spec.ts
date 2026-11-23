import { test, expect, Page } from "@playwright/test";
import raw from "../../data/questions.json";
import topics from "../../data/curriculum.json";
import { lessons } from "../../data/lessons";
async function answerQuiz(page: Page) {
  const prompt = await page.locator(".question-panel h1").innerText();
  const q = raw.find((q) => q.prompt === prompt)!;
  expect(q).toBeTruthy();
  if (q.type === "cell")
    await page
      .getByRole("button", { name: `Cell ${q.answer}`, exact: true })
      .click();
  else if (q.type === "range") {
    for (const a of q.answer.split(":"))
      await page
        .getByRole("button", { name: `Cell ${a}`, exact: true })
        .click();
  } else if (q.type === "match") {
    for (const s of q.answer.split("|"))
      await page
        .getByRole("button", { name: s.split("→")[1], exact: true })
        .click();
  } else if (q.type === "order") {
    for (const s of q.answer.split("|"))
      await page.getByRole("button", { name: s, exact: true }).click();
  } else if (q.options)
    await page
      .locator(".answers .answer")
      .getByText(q.answer, { exact: true })
      .click();
  else
    await page
      .getByRole("textbox", { name: "Your answer", exact: true })
      .fill(q.answer);
  await page
    .getByRole("button", { name: "Check answer", exact: false })
    .click();
  await expect(page.getByText("Correct. Nicely done!")).toBeVisible();
  const advance=page.getByRole('button',{name:/Next question|See results/});
  const last=(await advance.innerText()).includes('See results');
  await advance.click();
  if(last)await expect(page.getByText('SESSION COMPLETE')).toBeVisible();
  else await expect(page.locator('.question-panel h1')).not.toHaveText(prompt);
}
for (const [mode, count] of [
  ["Quick Fire", 10],
  ["Chapter Quest", 8],
  ["Exam Simulator", 20],
  ["Boss Battle", 15],
  ["Daily Challenge", 1],
  ["Revision Rescue", 10],
  ["Friend Challenge", 10],
  ["Streak Sprint", 20],
] as const) {
  test(`${mode} completes and saves accurate results`, async ({ page }) => {
    test.setTimeout(90000);
    await page.goto("/modes");
    await page.getByRole("button", { name: new RegExp(mode) }).click();
    if (mode === "Chapter Quest")
      await page.getByRole("button", { name: "Play level" }).first().click();
    if (mode === "Exam Simulator") {
      await page.getByRole("button", { name: "Begin exam" }).click();
      await expect(page.getByLabel("Exam time remaining")).toBeVisible();
    }
    if (mode === "Friend Challenge")
      await page.getByRole("button", { name: "Play challenge" }).click();
    for (let i = 0; i < count; i++) await answerQuiz(page);
    await expect(page.getByText("SESSION COMPLETE")).toBeVisible();
    const before = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cell-wars-v1")!),
    );
    expect(before.lastResult.correct).toBe(count);
    expect(before.history.length).toBe(count);
    expect(before.xp).toBeGreaterThan(0);
    if (mode === "Boss Battle")
      expect(before.achievements).toContain("Boss Slayer");
    if (mode === "Chapter Quest")
      expect(
        await page.evaluate(() => localStorage.getItem("cell-wars-level")),
      ).toBe("2");
    await page.reload();
    await expect(page.getByText("SESSION COMPLETE")).toBeVisible();
    expect(
      (
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("cell-wars-v1")!),
        )
      ).xp,
    ).toBe(before.xp);
    if (mode === "Daily Challenge") {
      await page.goto("/modes");
      await page.getByRole("button", { name: /Daily Challenge/ }).click();
      await expect(page.getByRole("status")).toContainText(
        "Daily challenge complete",
      );
      expect(
        (
          await page.evaluate(() =>
            JSON.parse(localStorage.getItem("cell-wars-v1")!),
          )
        ).xp,
      ).toBe(before.xp);
    }
  });
}
for (const topic of topics)
  test(`academy ${topic.id}: read, practice, flashcard, mastery and persistence`, async ({
    page,
  }) => {
    await page.goto("/library?topic=" + topic.id);
    await expect(page.locator(".lesson-banner h2")).toHaveText(topic.title);
    await page.getByRole("button", { name: /Got it. Let me try/ }).click();
    await page
      .getByLabel("Your answer", { exact: true })
      .fill(lessons[topic.id].answer);
    await page.getByRole("button", { name: "Check practice" }).click();
    await expect(page.getByRole("status")).toContainText("You’ve got it!");
    await page.getByRole("tab", { name: "Flashcards" }).click();
    const card = page.getByRole("button", { name: "Flip flashcard" });
    await card.click();
    await expect(card).toContainText(lessons[topic.id].terms[0][1]);
    await page.getByRole("tab", { name: "Knowledge check" }).click();
    await expect(page.locator('.lesson-rich .eyebrow')).toContainText('KNOWLEDGE CHECK');
    for (let i = 0; i < 3; i++) {
      const prompt = await page.locator(".lesson-rich h2").innerText();
      const q = raw.find((q) => q.prompt === prompt);
      const answer = q?.answer || lessons[topic.id].answer;
      await page.locator(".answer").getByText(answer, { exact: true }).click();
      if (i < 2) {
        await page.getByRole("button", { name: "Check answer" }).click();
        await page.getByRole("button", { name: "Next question" }).click();
      } else await page.getByRole("button", { name: "Finish check" }).click();
    }
    await expect(page.getByText("Knowledge check mastered!")).toBeVisible();
    await expect(page.locator(".course-progress>b")).toHaveText("1/13");
    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("cell-wars-v1")!),
    );
    expect(stored.xp).toBe(25);
    await page.reload();
    await expect(page.locator(".course-progress>b")).toHaveText("1/13");
  });
test("Formula Lab edits, recalculates, selects a range, undoes and persists", async ({
  page,
}) => {
  await page.goto("/lab");
  await page.getByRole("button", { name: "=SUM(B3:G3)", exact: false }).click();
  await expect(
    page.getByRole("button", { name: "Select H3", exact: true }),
  ).toHaveText("750");
  await page.getByRole("button", { name: "Select B3", exact: true }).click();
  await page.getByRole("textbox", { name: "Formula bar" }).fill("100");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Select H3", exact: true }),
  ).toHaveText("800");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Select H3", exact: true }),
  ).toHaveText("750");
  await page.getByRole("button", { name: "Select B3", exact: true }).click();
  await page
    .getByRole("button", { name: "Select G3", exact: true })
    .click({ modifiers: ["Shift"] });
  await expect(page.locator(".formula-bar>b")).toHaveText("B3:G3");
  await page
    .getByRole("button", { name: "Merge & Center", exact: true })
    .click();
  await expect(page.locator(".merged-title")).toHaveText("WEEKLY EXPENSES");
  await page.reload();
  await expect(page.locator(".merged-title")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Select H3", exact: true }),
  ).toHaveText("750");
});
test("textbook mission completes with seven totals", async ({ page }) => {
  await page.goto("/lab");
  for (let r = 3; r <= 9; r++) {
    await page
      .getByRole("button", { name: `Select H${r}`, exact: true })
      .click();
    await page.getByRole("button", { name: "AutoSum", exact: true }).click();
  }
  await page
    .getByRole("button", { name: "Merge & Center", exact: true })
    .click();
  await page.getByRole("button", { name: "Check mission" }).click();
  await expect(page.locator(".mission-success")).toBeVisible();
});
test("shared challenge uses the supplied seed", async ({ page }) => {
  await page.goto("/friend?seed=98123");
  await expect(
    page.getByRole("heading", { name: "Challenge code: CW-98123" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play challenge" }).click();
  const a = await page.locator(".question-panel h1").innerText();
  await page.goto("/friend?seed=98123");
  await page.getByRole("button", { name: "Play challenge" }).click();
  await expect(page.locator(".question-panel h1")).toHaveText(a);
});
test("mobile navigation and layouts fit the viewport", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page.getByRole("button", { name: "Academy", exact: true }).click();
  } else
    await page.getByRole("button", { name: "Academy", exact: true }).click();
  await expect(page.locator(".academy-heading")).toBeVisible();
  for (const path of [
    "/",
    "/library",
    "/lab",
    "/modes",
    "/dashboard",
    "/quest",
    "/friend",
    "/settings",
  ]) {
    await page.goto(path);
    await expect(page.locator(".header")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
test("expired exam scores once without a running timer", async ({ page }) => {
  await page.addInitScript((id) => {
    if (!localStorage.getItem("exam-fixture")) {
      localStorage.setItem("exam-fixture", "1");
      localStorage.setItem(
        "cell-wars-session",
        JSON.stringify({
          id: "expired",
          mode: "exam",
          ids: [id],
          index: 0,
          answers: {},
          feedback: false,
          seed: 1,
          level: 1,
          deadline: Date.now() - 1000,
        }),
      );
    }
  }, raw[0].id);
  await page.goto("/quiz");
  await expect(page.getByText("SESSION COMPLETE")).toBeVisible();
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cell-wars-v1")!),
  );
  await page.reload();
  await expect(page.getByText("SESSION COMPLETE")).toBeVisible();
  expect(
    (
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("cell-wars-v1")!),
      )
    ).completed,
  ).toBe(before.completed);
});
