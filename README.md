# CELL WARS — The Spreadsheet Challenge

A premium, local-first ICSE Class 7 spreadsheet quiz game. **Database features are intentionally deferred.** No Supabase project, authentication or globally shared leaderboard is required for this phase.

## Run

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

Visit http://localhost:3000. Deploy on Vercel using the Next.js preset. No environment variables are required.

## Current functionality

- 180 curriculum-based questions, each with one answer and explanation, 35/65/55/25 by difficulty.
- Quick Fire, Chapter Quest, Exam Simulator, Boss Battle, Daily Challenge and Revision Rescue.
- Interactive spreadsheet formulas, SUM/AVERAGE/COUNT/MAX/MIN, live cell selection and AutoSum.
- Local XP, rewards, results and study guide; nickname and settings stored only in this browser.
- Local-only leaderboard, clearly labeled. **Not** a public class leaderboard.

## Planned backend phase

Add Supabase Auth and PostgreSQL tables, RLS, opt-in aggregated rankings, server-authoritative question delivery and grading, atomic XP events and replay protection. Client-side score calculation in this demo **is not tamper-resistant** and must never be reused for shared leaderboards.

## Safety and privacy

No email, phone, birth date or location required. Data stays in the device's localStorage, and Settings lets students delete it. No messages or public profiles.

## Curriculum notes

Uses the user-provided Class 7 ICSE 'Introduction to Spreadsheet' material (pages 55–61). The sample's row numbering is B3:G3 for Eatables, with H3 as the total; H4 represents Cold Drink.
