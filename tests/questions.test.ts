import { describe, it, expect } from "vitest";
import {
  questions,
  checkAnswer,
  scoreSession,
  normalizeRange,
  dailySeed,
} from "../lib/questions";
import { initialCells, evaluateCell } from "../lib/spreadsheet";
describe("question bank", () => {
  it("contains 180 unique questions", () => {
    expect(questions).toHaveLength(180);
    expect(new Set(questions.map((q) => q.id)).size).toBe(180);
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(180);
  });
  it("has exact difficulty distribution", () => {
    expect(
      Object.fromEntries(
        ["easy", "medium", "hard", "expert"].map((d) => [
          d,
          questions.filter((q) => q.difficulty === d).length,
        ]),
      ),
    ).toEqual({ easy: 35, medium: 65, hard: 55, expert: 25 });
  });
  it("has answer keys and explanations", () => {
    for (const q of questions) {
      expect(q.answer).toBeTruthy();
      expect(q.explanation.length).toBeGreaterThan(10);
      expect(checkAnswer(q, q.answer)).toBe(true);
      if (q.options) expect(q.options).toContain(q.answer);
    }
  });
  it("scores without duplicate ids", () => {
    const pair = questions.slice(0, 2);
    expect(scoreSession(pair, { [pair[0].id]: pair[0].answer }).correct).toBe(
      1,
    );
  });
  it("range normalisation", () =>
    expect(normalizeRange("G3", "B3")).toBe("B3:G3"));
  it("daily selection reproducible", () =>
    expect(dailySeed("2026-11-23")).toBe(dailySeed("2026-11-23")));
});
describe("spreadsheet", () => {
  it("calculates eatables sum", () => {
    const cells = { ...initialCells(), H3: "=SUM(B3:G3)" };
    expect(evaluateCell("H3", cells)).toBe(750);
  });
  it("calculates average and max", () => {
    const cells = {
      ...initialCells(),
      H3: "=AVERAGE(B3:G3)",
      H4: "=MAX(B4:G4)",
    };
    expect(evaluateCell("H3", cells)).toBe(125);
    expect(evaluateCell("H4", cells)).toBe(120);
  });
  it("evaluates references", () => {
    const cells = { ...initialCells(), H3: "=B3+C3+D3+E3+F3+G3" };
    expect(evaluateCell("H3", cells)).toBe(750);
  });
  it("rejects arbitrary expressions", () => {
    expect(evaluateCell("A1", { A1: "=alert(1)" })).toBe("#NAME?");
  });
});
