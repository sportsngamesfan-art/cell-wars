# CELL WARS — The Spreadsheet Challenge

An upgrade to the original Next.js CELL WARS project for ICSE Class 7 spreadsheet revision. The original 180-question curriculum bank is preserved unchanged in `data/questions.json`. The original source is retained on `main`; the upgrade lives on `feat/academy-upgrade`.

## Run and verify

Use Node.js 22 or 24.

```sh
npm ci
npm run dev
npm run check
npm run test:bank
npx playwright install chromium
npm run test:e2e
```

The browser suite uses the production build (`npm run build` first). Set `BASE_URL` to test a hosted deployment. `CHROMIUM_PATH` is an optional custom browser executable. GitHub Actions runs the unit tests, curriculum validator, production build, and desktop/mobile browser tests.

## What works

- 13-topic Learning Academy: explanations, textbook recaps, interactive diagrams, formula demonstrations, sheet management demonstration, practice exercises, per-topic flashcards, three-question mastery checks and local course progress. First mastery earns 25 XP. Two supplemental academy questions fill gaps without modifying the 180-question bank.
- Eight modes: Quick Fire, Chapter Quest, timed Exam Simulator (20/30/50 questions), Boss Battle, Daily Challenge, Revision Rescue, Friend Challenge, and Streak Sprint.
- XP, player levels, achievements, question hints, answer explanations, resumable sessions, results, and topic revision links.
- Formula Lab: editable values through the formula bar; cell references; arithmetic and parentheses; SUM, AVERAGE, COUNT, MAX, MIN; range selection by drag or Shift-click; AutoSum; undo; simulated Merge & Center; a seven-row Weekly Expenses challenge; automatic recalculation; local worksheet persistence.
- Responsive layouts, keyboard navigation, reduced-motion support, optional synthesized answer sounds, and no external image or font requests.

## Boundaries

No database, authentication, global leaderboard, or cross-device progress syncing. The leaderboard shows only this browser's player; Friend Challenge shares a deterministic set of questions, and students compare their results themselves. Browser-local progress is editable and is not suitable for competitive, tamper-resistant rankings.

The lab intentionally models an 8-column × 12-row worksheet, not all of Excel. Merge & Center simulates the textbook title across A1:H1 while preserving D1. Supported functions accept numeric arguments and cell ranges; macros, files, charts and full Excel formula syntax are outside this learning simulator. Unsupported formulas return explicit errors.

Windows desktop Excel shortcuts are labelled; platform versions may differ. The course is based on the existing supplied curriculum. No production deployment is performed by this upgrade.
