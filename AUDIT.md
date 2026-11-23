# CELL WARS upgrade audit

## Scope and baseline

Audited the supplied `cell-wars-source.zip`, the later `preview.html`, and the existing deployed CELL WARS landing page. Edited the supplied Next.js project rather than replacing it. The original source is preserved on `main` of the dedicated repository. No other repository or existing production website was changed.

The deployed baseline used a standalone HTML preview; its landing page advertised six quiz modes, while the Next.js source listed seven. Both had the same visual identity. The question bank is preserved byte-for-byte: SHA-256 `867024ff539431a7aa5090bd6faa549536e520170a635e0d66fc6dde743a18b9`.

## Findings and changes

| Finding | Upgrade |
| --- | --- |
| Learning Library contained short static notes and eight generic flashcards. | 13 full lessons, topic-specific flashcards, interactive examples, practice exercises, three-question checks, saved course progress and first-mastery XP. |
| Lesson practice started a random full-bank quiz. | Academy practice targets the selected topic. |
| Quest cards advertised eight questions even when a topic contained fewer. | Cards show the actual topic question count; introductory levels remain short and focused. |
| Only seven playable modes, with an inaccurate landing count. | Eight modes including Streak Sprint; corrected landing count. |
| Exam setup selected a question count but did not time the session. | Timed 20/30/50-question sessions with expiry scoring and reload-safe deadlines. |
| Friend Challenge ignored incoming seeds and always used one fixed code. | Seeded URL handling, editable codes, new random challenges, deterministic questions and copyable links. |
| Daily challenges could be replayed for base XP. | Daily completion checked before starting; repeat attempts show an encouraging message. |
| Revision selected only one historically weak topic. | Latest missed questions prioritized, then weak-topic questions fill the session. |
| Boss health did not reflect the current checked answer. | Health updates after feedback. |
| Formula evaluator could silently ignore circular errors in range functions. | Errors propagate across references and functions; cycles, invalid references, text arithmetic and division by zero have explicit results. |
| Lab had selection but no ranges, undo or persistence. | Drag and Shift-click ranges, keyboard navigation, range-aware AutoSum, undo and saved worksheet state. |
| Title merge was a visual toggle without a complete exercise. | Clearly labelled title simulation plus a checked seven-row Weekly Expenses mission. |
| Test configuration did not resolve aliases and loaded Playwright files into Vitest. | Correct test isolation and aliases, calculation/error tests, course coverage tests, desktop/mobile browser suite and GitHub Actions. |
| Large component mixed learning content, simulation and navigation. | Academy, lesson demonstrations, lab and game effects extracted; course data and spreadsheet parser separated. |
| Default system typography and restrained interactions. | Locally bundled Outfit and DM Sans, blue/violet arcade styling, custom SVG lesson art, animated examples, answer feedback, optional synthesized sounds and completion confetti. |
| Hosted navigation stalled on client transitions. | Client views use Next-integrated native history while preserving quiz state; long-page navigation stays sticky. |
| Local storage exceptions could break writes. | Guarded access, validated core state arrays, fallback values and combined progress reset. |

## Deliberate scope

All progress remains browser-local. The leaderboard is labelled as local, and Friend Challenge shares questions without claiming live multiplayer or synced scores. The lab is an educational A1:H12 simulator, with a preserved-data title merge. It does not implement the entire Excel application. No database was added.
