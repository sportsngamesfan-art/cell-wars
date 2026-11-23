import raw from "@/data/questions.json";
import { z } from "zod";
export const Difficulty = z.enum(["easy", "medium", "hard", "expert"]);
export const QuestionSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  difficulty: Difficulty,
  type: z.string(),
  prompt: z.string(),
  answer: z.string(),
  options: z.array(z.string()).nullable(),
  explanation: z.string(),
  hint: z.string(),
  concept: z.string(),
  estimatedSeconds: z.number(),
  meta: z.record(z.string(), z.unknown()).optional(),
});
export type Question = z.infer<typeof QuestionSchema>;
export const questions = z.array(QuestionSchema).parse(raw);
export const xpByDifficulty = {
  easy: 10,
  medium: 20,
  hard: 30,
  expert: 40,
} as const;
export function normalizeAnswer(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([:+*/=])\s*/g, "$1");
}
export function checkAnswer(q: Question, value: string) {
  const result = normalizeAnswer(value);
  if (q.type === "order") return result === normalizeAnswer(q.answer);
  if (q.type === "match") return result === normalizeAnswer(q.answer);
  if (result === normalizeAnswer(q.answer)) return true;
  const a = Number(result),
    b = Number(normalizeAnswer(q.answer));
  return (
    result.length > 0 &&
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    Math.abs(a - b) < 0.011
  );
}
export function scoreSession(qs: Question[], answers: Record<string, string>) {
  const correct = qs.filter((q) => checkAnswer(q, answers[q.id] || ""));
  return {
    correct: correct.length,
    total: qs.length,
    xp:
      correct.reduce((s, q) => s + xpByDifficulty[q.difficulty], 0) +
      (correct.length === qs.length && qs.length > 0 ? 50 : 0),
  };
}
export function shuffle<T>(values: T[], seed: number): T[] {
  const a = [...values];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function selectQuestions(
  count: number,
  seed: number,
  topic?: string,
  difficulties?: string[],
) {
  const pool = questions.filter(
    (q) =>
      (!topic || q.topicId === topic) &&
      (!difficulties || difficulties.includes(q.difficulty)),
  );
  return shuffle(pool, seed).slice(0, count);
}
export function dailySeed(date: string) {
  return [...date].reduce(
    (s, c) => (Math.imul(s, 31) + c.charCodeAt(0)) | 0,
    2026,
  );
}
export function normalizeRange(a: string, b: string) {
  const p = (s: string) => {
    const m = /^([A-Z]+)(\d+)$/.exec(s);
    if (!m) return null;
    return {
      c: [...m[1]].reduce((n, l) => n * 26 + l.charCodeAt(0) - 64, 0),
      r: +m[2],
    };
  };
  const x = p(a),
    y = p(b);
  if (!x || !y) return "";
  const col = (n: number) => {
    let s = "";
    while (n) {
      n--;
      s = String.fromCharCode(65 + (n % 26)) + s;
      n = Math.floor(n / 26);
    }
    return s;
  };
  return `${col(Math.min(x.c, y.c))}${Math.min(x.r, y.r)}:${col(Math.max(x.c, y.c))}${Math.max(x.r, y.r)}`;
}
