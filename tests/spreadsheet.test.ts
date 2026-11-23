import { describe, it, expect } from "vitest";
import { initialCells, evaluateCell, rangeAddresses } from "../lib/spreadsheet";
import topics from "../data/curriculum.json";
import { lessons } from "../data/lessons";
import { questions } from "../lib/questions";
import { academyQuestions } from "../lib/academy";
describe("spreadsheet correctness", () => {
  it.each([
    ["SUM", 750],
    ["AVERAGE", 125],
    ["COUNT", 6],
    ["MAX", 500],
    ["MIN", 0],
  ])("%s handles zeros in textbook data", (f, n) =>
    expect(evaluateCell("H3", { ...initialCells(), H3: `=${f}(B3:G3)` })).toBe(
      n,
    ),
  );
  it("recalculates transitive references", () => {
    const c = { A1: "2", B1: "=A1*3", C1: "=B1+4" };
    expect(evaluateCell("C1", c)).toBe(10);
    c.A1 = "5";
    expect(evaluateCell("C1", c)).toBe(19);
  });
  it.each([
    ["=2+3*4", 14],
    ["=(2+3)*4", 20],
    ["=SUM(A1:A2)+MAX(A1:A2)", 8],
    ["=SUM(1,2,3)", 6],
    ["=2^3", 8],
    ["=.5+1", 1.5],
  ])("parses %s", (f, n) =>
    expect(evaluateCell("H3", { A1: "2", A2: "3", H3: f })).toBe(n),
  );
  it.each([
    ["=H3", "#CYCLE!"],
    ["=SUM(H3:H4)", "#CYCLE!"],
    ["=1/0", "#DIV/0!"],
    ["=I1", "#REF!"],
    ["=SUM(A1:A99)", "#REF!"],
    ["=A1+1", "#VALUE!"],
    ["=AVERAGE(A2:A3)", "#DIV/0!"],
  ])("propagates formula errors %s", (f, err) =>
    expect(
      evaluateCell("H3", { A1: "text", H3: f }),
    ).toBe(err),
  );
  it("detects indirect cycles within range functions", () =>
    expect(evaluateCell("A1", { A1: "=SUM(B1:B2)", B1: "=A1" })).toBe(
      "#CYCLE!",
    ));
  it("ignores blank and text in COUNT while including zero", () =>
    expect(
      evaluateCell("H3", { A1: "0", A2: "text", H3: "=COUNT(A1:A3)" }),
    ).toBe(1));
  it("blank references act as zero in arithmetic", () =>
    expect(evaluateCell("H3", { H3: "=A1+5" })).toBe(5));
  it("normalizes reversed ranges", () =>
    expect(rangeAddresses("C3", "B2")).toEqual(["B2", "C2", "B3", "C3"]));
  it("never executes arbitrary expressions", () =>
    expect(
      String(evaluateCell("A1", { A1: "=globalThis.process.exit()" })),
    ).toMatch(/^#/));
});
describe("academy coverage", () => {
  it("covers all 13 curriculum topics with content and mini quizzes", () => {
    expect(Object.keys(lessons)).toHaveLength(13);
    for (const t of topics) {
      expect(lessons[t.id].explain.length).toBeGreaterThanOrEqual(3);
      expect(lessons[t.id].terms.length).toBeGreaterThanOrEqual(2);
      expect(academyQuestions(t.id).length).toBeGreaterThanOrEqual(3);
    }
  });
});
