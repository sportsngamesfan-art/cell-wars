"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Grid3X3,
  Zap,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Calculator,
  Trophy,
  Home,
  Settings,
  Menu,
  X,
  Check,
  CheckCircle2,
  Compass,
  Flame,
  BrainCircuit,
  Swords,
  GraduationCap,
  Shield,
  RotateCcw,
  Lock,
  Copy,
  Sparkles,
  Target,
  Medal,
  ChevronRight,
  Keyboard,
} from "lucide-react";
import {
  questions,
  Question,
  selectQuestions,
  checkAnswer,
  scoreSession,
  shuffle,
  dailySeed,
  normalizeRange,
  xpByDifficulty,
} from "@/lib/questions";
import {
  initialState,
  readState,
  writeState,
  clearState,
  UserState,
} from "@/lib/storage";
import { initialCells, evaluateCell, items, days } from "@/lib/spreadsheet";
import topics from "@/data/curriculum.json";
import Academy from "./Academy";
import SpreadsheetLab from "./SpreadsheetLab";
import {
  QuizClock,
  Celebration,
  PlayerLevel,
  playFeedback,
} from "./GameEffects";
import { safeGet, safeSet, safeRemove } from "@/lib/storage";
type Mode =
  | "quick"
  | "quest"
  | "exam"
  | "boss"
  | "daily"
  | "revision"
  | "friend"
  | "streak";
type Session = {
  id: string;
  mode: Mode;
  ids: string[];
  index: number;
  answers: Record<string, string>;
  feedback: boolean;
  seed: number;
  level: number;
  done?: boolean;
  deadline?: number;
};
const levels = [
  "Spreadsheet Rookie",
  "Excel Explorer",
  "Workbook Wizard",
  "Cell Detective",
  "Range Ranger",
  "Data Master",
  "Formula Fighter",
  "Function Genius",
  "Shortcut Ninja",
  "Spreadsheet Legend",
];
const levelTopics = [
  "spreadsheet",
  "features",
  "workbooks",
  "components",
  "components",
  "data",
  "formulas",
  "functions",
  "navigation",
  "saving",
];
const gameModes = [
  {
    id: "quick",
    name: "Quick Fire",
    detail: "10 questions · mixed difficulty",
    desc: "A quick knowledge workout.",
    icon: Zap,
    color: "blue",
  },
  {
    id: "quest",
    name: "Chapter Quest",
    detail: "10 levels",
    desc: "Unlock spreadsheet mastery, one level at a time.",
    icon: Compass,
    color: "violet",
  },
  {
    id: "exam",
    name: "Exam Simulator",
    detail: "20, 30 or 50 questions",
    desc: "Test your knowledge under exam-style conditions.",
    icon: GraduationCap,
    color: "cyan",
  },
  {
    id: "boss",
    name: "Boss Battle",
    detail: "15 hard questions",
    desc: "Defeat the Spreadsheet Overlord.",
    icon: Swords,
    color: "pink",
  },
  {
    id: "daily",
    name: "Daily Challenge",
    detail: "1 question · +20 XP",
    desc: "A small challenge that refreshes each day.",
    icon: Flame,
    color: "orange",
  },
  {
    id: "revision",
    name: "Revision Rescue",
    detail: "10 targeted questions",
    desc: "Spend time on the topics that need practice.",
    icon: BrainCircuit,
    color: "green",
  },
  {
    id: "friend",
    name: "Friend Challenge",
    detail: "Shared question link",
    desc: "Play the same questions; scores remain local.",
    icon: Trophy,
    color: "violet",
  },
  {
    id: "streak",
    name: "Streak Sprint",
    detail: "20 questions · build a streak",
    desc: "Keep your combo going. Every question is a fresh chance.",
    icon: Target,
    color: "green",
  },
] as const;
const badgeList = [
  {
    name: "First Cell",
    symbol: "▣",
    desc: "Answer your first question",
    need: 1,
  },
  {
    name: "Excel Explorer",
    symbol: "◇",
    desc: "Answer 20 questions",
    need: 20,
  },
  {
    name: "Formula Genius",
    symbol: "ƒ",
    desc: "Answer 40 questions",
    need: 40,
  },
  { name: "Range Master", symbol: "▦", desc: "Answer 60 questions", need: 60 },
  {
    name: "Shortcut Ninja",
    symbol: "⌘",
    desc: "Answer 80 questions",
    need: 80,
  },
  {
    name: "100 Questions Answered",
    symbol: "∞",
    desc: "Answer 100 questions",
    need: 100,
  },
  {
    name: "Spreadsheet Champion",
    symbol: "♛",
    desc: "Answer 150 questions",
    need: 150,
  },
  {
    name: "Perfect Ten",
    symbol: "✦",
    desc: "Perfect 10-question quiz",
    need: -1,
  },
  {
    name: "Boss Slayer",
    symbol: "⚔",
    desc: "12 correct in Boss Battle",
    need: -1,
  },
  {
    name: "Revision Hero",
    symbol: "↗",
    desc: "Complete Revision Rescue",
    need: -1,
  },
  { name: "Chapter Master", symbol: "★", desc: "Complete Level 10", need: -1 },
];
function dateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Bar({ n, max = 100 }: { n: number; max?: number }) {
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={n}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <i
        style={{
          width: `${max ? Math.max(0, Math.min(100, (n / max) * 100)) : 0}%`,
        }}
      />
    </div>
  );
}
function CellGrid({
  value,
  onChange,
  range = false,
}: {
  value: string;
  onChange: (v: string) => void;
  range?: boolean;
}) {
  const [start, setStart] = useState("");
  return (
    <>
      <p className="subtle">
        {range
          ? "Choose the first and last cells of the range"
          : "Tap the correct cell"}
      </p>
      <div className="select-grid">
        <span />
        <>
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((c) => (
            <b key={c}>{c}</b>
          ))}
        </>
        {Array.from({ length: 10 }, (_, i) => (
          <div className="select-row" key={i}>
            <b>{i + 1}</b>
            {["A", "B", "C", "D", "E", "F", "G", "H"].map((c) => {
              const addr = `${c}${i + 1}`;
              const active =
                value === addr ||
                value.split(":").includes(addr) ||
                start === addr;
              return (
                <button
                  type="button"
                  aria-label={`Cell ${addr}`}
                  className={active ? "active" : ""}
                  key={addr}
                  onClick={() => {
                    if (!range) {
                      onChange(addr);
                    } else if (!start || value) {
                      setStart(addr);
                      onChange("");
                    } else {
                      onChange(normalizeRange(start, addr));
                      setStart("");
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="selection-label">
        Selected: <strong>{value || start || "None"}</strong>
      </p>
    </>
  );
}
function Answer({
  q,
  value,
  change,
  seed,
}: {
  q: Question;
  value: string;
  change: (s: string) => void;
  seed: number;
}) {
  const options = useMemo(
    () => shuffle(q.options || [], seed + q.id.length),
    [q, seed],
  );
  const [sequence, setSequence] = useState<string[]>([]);
  useEffect(() => {
    setSequence([]);
  }, [q.id]);
  if (q.type === "cell" || q.type === "range")
    return (
      <CellGrid
        key={q.id}
        value={value}
        onChange={change}
        range={q.type === "range"}
      />
    );
  if (q.type === "match") {
    const entries = q.answer.split("|").map((s) => s.split("→"));
    const target = entries[sequence.length];
    const options = shuffle(
      entries.map((e) => e[1]),
      seed + 9,
    ).filter((x) => !sequence.some((s) => s.endsWith("→" + x)));
    return (
      <>
        <p className="subtle">Match each term with its definition.</p>
        <div className="ordered">
          {sequence.map((s, i) => (
            <span key={i}>{s}</span>
          ))}
        </div>
        {target ? (
          <>
            <h3>{target[0]} means...</h3>
            <div className="answers">
              {options.map((o) => (
                <button
                  className="answer"
                  key={o}
                  onClick={() => {
                    const next = [...sequence, target[0] + "→" + o];
                    setSequence(next);
                    change(next.join("|"));
                  }}
                >
                  {o}
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="tip">All pairs selected.</div>
        )}
        <button
          className="text-link"
          onClick={() => {
            const next = sequence.slice(0, -1);
            setSequence(next);
            change(next.join("|"));
          }}
        >
          Undo last match
        </button>
      </>
    );
  }
  if (q.type === "order") {
    const entries = shuffle(q.answer.split("|"), seed + 7);
    return (
      <>
        <p className="subtle">
          Tap the items in the correct order (tap Undo to correct a mistake).
        </p>
        <div className="ordered">
          {sequence.map((e, i) => (
            <span key={i}>
              {i + 1}. {e}
            </span>
          ))}
        </div>
        <div className="answers">
          {entries
            .filter((x) => !sequence.includes(x))
            .map((x) => (
              <button
                key={x}
                className="answer"
                onClick={() => {
                  const updated = [...sequence, x];
                  setSequence(updated);
                  change(updated.join("|"));
                }}
              >
                {x}
                <ArrowRight size={17} />
              </button>
            ))}
        </div>
        <button
          className="text-link"
          onClick={() => {
            const updated = sequence.slice(0, -1);
            setSequence(updated);
            change(updated.join("|"));
          }}
        >
          Undo last item
        </button>
      </>
    );
  }
  if (options.length)
    return (
      <div className="answers">
        {options.map((o, i) => (
          <button
            type="button"
            key={o}
            aria-pressed={value === o}
            className={`answer ${value === o ? "picked" : ""}`}
            onClick={() => change(o)}
          >
            <b>{String.fromCharCode(65 + i)}</b>
            <span>{o}</span>
            {value === o ? <Check size={18} /> : null}
          </button>
        ))}
      </div>
    );
  return (
    <div className="answer-input">
      <label htmlFor="student-answer">Your answer</label>
      <input
        id="student-answer"
        spellCheck="false"
        autoComplete="off"
        placeholder={
          q.type === "formula" ? "=SUM(B3:G3)" : "Type your answer..."
        }
        value={value}
        onChange={(e) => change(e.target.value)}
      />
      <small>Use Excel cell notation where relevant.</small>
    </div>
  );
}
function HeroArt() {
  return (
    <div
      className="hero-visual"
      aria-label="Decorative spreadsheet illustration"
    >
      <div className="visual-top">
        <span>◉ ◉ ◉</span> EXCEL WORKBOOK / CELL WARS <Grid3X3 size={17} />
      </div>
      <div className="visual-formula">
        ƒx <span>=SUM(B3:G3)</span>
        <strong>750</strong>
      </div>
      <div className="visual-table">
        {Array.from({ length: 36 }, (_, i) => {
          const r = Math.floor(i / 6),
            c = i % 6;
          return (
            <span
              className={`${r === 0 || c === 0 ? "visual-heading" : ""} ${r === 3 && c === 3 ? "visual-selected" : ""}`}
              key={i}
            >
              {r === 0
                ? " ABCDE"[c]
                : c === 0
                  ? r
                  : ["50", "0", "200", "0", "0"][(r + c) % 5]}
            </span>
          );
        })}
      </div>
      <div className="visual-bottom">
        ▣ Sheet1 <span>+ Add worksheet</span> READY
      </div>
      <div className="floating-xp">
        +30 XP <Sparkles size={17} />
      </div>
      <div className="floating-okay">
        <CheckCircle2 size={17} /> CELL MASTERED
      </div>
    </div>
  );
}
export default function Experience() {
  const path = usePathname() || '/';
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UserState>(initialState);
  const [session, setSession] = useState<Session | null>(null);
  const [choice, setChoice] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [examSize, setExamSize] = useState(20);
  const [mobileNav, setMobileNav] = useState(false);

  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendSeed, setFriendSeed] = useState(41372);
  const [friendCode, setFriendCode] = useState("41372");
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("seed"));
    if (Number.isSafeInteger(n) && n > 0 && n <= 2147483647) {
      setFriendSeed(n);
      setFriendCode(String(n));
    }
  }, [path]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    setUser(readState());
    try {
      const s = JSON.parse(safeGet("cell-wars-session") || "null");
      if (
        s &&
        !s.done &&
        Array.isArray(s.ids) &&
        s.ids.length &&
        s.ids.every((id: string) => questions.some((q) => q.id === id)) &&
        Number.isInteger(s.index) &&
        s.index >= 0 &&
        s.index < s.ids.length &&
        s.answers &&
        typeof s.answers === "object"
      )
        setSession(s);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) writeState(user);
  }, [user, ready]);
  useEffect(() => {
    if (!ready) return;
    if (session && !session.done)
      safeSet("cell-wars-session", JSON.stringify(session));
    else safeRemove("cell-wars-session");
  }, [ready, session]);
  useEffect(() => {
    if (session) {
      setChoice(session.answers[session.ids[session.index]] || "");
      setShowHint(false);
    }
  }, [session?.id, session?.index]);

  const go = (p: string) => {
    // Every view shares this client experience; native history preserves quiz state.
    window.history.pushState(null, '', p);
    setMobileNav(false);
    window.scrollTo(0, 0);
  };
  const accuracy = useMemo(
    () =>
      topics.map((t) => {
        const h = user.history.filter((x) => x.topic === t.id);
        return {
          ...t,
          count: h.length,
          correct: h.filter((x) => x.correct).length,
        };
      }),
    [user.history],
  );
  const weak = accuracy
    .filter((t) => t.count >= 2)
    .sort((a, b) => a.correct / a.count - b.correct / b.count)[0];
  function start(mode: Mode, level = 1, customSeed?: number, topic?: string) {
    if (mode === "daily" && user.dailyDates.includes(dateKey())) {
      setNotice(
        "Daily challenge complete! Come back tomorrow, or try Quick Fire.",
      );
      return;
    }
    const seed =
      customSeed ??
      (mode === "daily"
        ? dailySeed(dateKey())
        : Math.floor(Math.random() * 2147483647));
    let qs = selectQuestions(
      mode === "streak"
        ? 20
        : mode === "daily"
          ? 1
          : mode === "quest"
            ? 8
            : mode === "boss"
              ? 15
              : mode === "exam"
                ? examSize
                : 10,
      seed,
      topic ||
        (mode === "quest"
          ? levelTopics[level - 1]
          : mode === "revision"
            ? weak?.id
            : undefined),
      mode === "boss" ? ["hard", "expert"] : undefined,
    );
    if (mode === "revision" && !topic) {
      const latest = new Map(user.history.map((x) => [x.id, x.correct]));
      const missed = shuffle(
        questions.filter((q) => latest.get(q.id) === false),
        seed,
      );
      qs = [
        ...missed,
        ...qs.filter((q) => !missed.some((m) => m.id === q.id)),
      ].slice(0, 10);
    }
    if (!qs.length) qs = selectQuestions(10, seed);
    setSession({
      id: String(Date.now()),
      mode,
      ids: qs.map((q) => q.id),
      index: 0,
      answers: {},
      feedback: false,
      seed,
      level,
      deadline: mode === "exam" ? Date.now() + examSize * 60 * 1000 : undefined,
    });
    go("/quiz");
  }
  const q = session
    ? questions.find((x) => x.id === session.ids[session.index])
    : undefined;
  function submit() {
    if (!session || !q || !choice.trim() || session.feedback) return;
    if (user.sound) playFeedback(checkAnswer(q, choice));
    setSession({
      ...session,
      answers: { ...session.answers, [q.id]: choice },
      feedback: true,
    });
  }
  function next() {
    if (!session || !session.feedback) return;
    if (session.index < session.ids.length - 1) {
      setSession({ ...session, index: session.index + 1, feedback: false });
      return;
    }
    finishSession();
  }
  function finishSession() {
    if (!session || session.done) return;
    const qs = session.ids
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));
    const result = scoreSession(qs, session.answers);
    if (session.mode === "daily" && user.dailyDates.includes(dateKey()))
      result.xp = 0;
    let extra = session.mode === "quest" ? 30 : 0;
    if (session.mode === "daily" && !user.dailyDates.includes(dateKey()))
      extra += 20;
    const current = [
      ...user.history,
      ...qs.map((x) => ({
        id: x.id,
        topic: x.topicId,
        correct: checkAnswer(x, session.answers[x.id] || ""),
      })),
    ];
    const achievements = [...user.achievements];
    const mark = (b: string) => {
      if (!achievements.includes(b)) achievements.push(b);
    };
    badgeList.forEach((b) => {
      if (b.need > 0 && current.length >= b.need) mark(b.name);
    });
    if (qs.length === 10 && result.correct === 10) mark("Perfect Ten");
    if (session.mode === "boss" && result.correct >= 12) mark("Boss Slayer");
    if (session.mode === "revision") mark("Revision Hero");
    if (session.mode === "quest" && session.level === 10)
      mark("Chapter Master");
    if (session.mode === "quest")
      safeSet(
        "cell-wars-level",
        String(
          Math.max(
            Number(safeGet("cell-wars-level") || 1),
            Math.min(10, session.level + 1),
          ),
        ),
      );
    setUser({
      ...user,
      history: current,
      xp: user.xp + result.xp + extra,
      completed: user.completed + 1,
      best: Math.max(
        user.best,
        Math.round((result.correct / result.total) * 100),
      ),
      dailyDates:
        session.mode === "daily"
          ? [...new Set([...user.dailyDates, dateKey()])]
          : user.dailyDates,
      achievements,
      lastResult: {
        ...result,
        xp: result.xp + extra,
        mode: session.mode,
        answers: session.answers,
        ids: session.ids,
      },
    });
    setSession({ ...session, done: true });
    go("/results");
  }
  const btn = (label: string, fn: () => void, cls = "primary") => (
    <button className={`btn ${cls}`} onClick={fn}>
      {label} <ArrowRight size={17} />
    </button>
  );
  const intro = (eyebrow: string, title: string, desc: string) => (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="muted">{desc}</p>
    </div>
  );
  const playCard = (m: (typeof gameModes)[number]) => (
    <button
      key={m.id}
      className={`mode-card color-${m.color}`}
      onClick={() =>
        m.id === "quest"
          ? go("/quest")
          : m.id === "friend"
            ? go("/friend")
            : m.id === "exam"
              ? document
                  .getElementById("exam-setup")
                  ?.scrollIntoView({ behavior: "smooth" })
              : start(m.id)
      }
    >
      <span className="mode-icon">
        <m.icon size={24} />
      </span>
      <span className="mode-kicker">{m.detail}</span>
      <h3>{m.name}</h3>
      <p>{m.desc}</p>
      <span className="mode-arrow">
        <ArrowRight size={20} />
      </span>
    </button>
  );
  const leaderboard = () => {
    return (
      <>
        {intro(
          "SCOREBOARD",
          "Your leaderboard.",
          "Your real scores, saved on this device. Keep practising to beat your personal best.",
        )}
        <div className="privacy-note">
          <Shield size={22} />
          <div>
            <strong>Scores on this device</strong>
            <p>
              Your scores and progress stay in this browser. Compare Friend
              Challenge results with classmates yourself.
            </p>
          </div>
        </div>
        {user.completed ? (
          <div className="leader-row">
            <b>#1</b>
            <span className="avatar">
              {user.nickname.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{user.nickname}</strong>
              <small>Local champion · {user.completed} completed quizzes</small>
            </div>
            <strong>{user.xp} XP</strong>
          </div>
        ) : (
          <div className="empty">
            <Trophy size={36} />
            <h2>No rankings yet</h2>
            <p>Finish a quiz to earn your first place on this device.</p>
            {btn("Start a quiz", () => go("/modes"))}
          </div>
        )}
      </>
    );
  };
  const landing = () => (
    <>
      <section className="hero wrap">
        <div>
          <span className="hero-pill">
            <span /> ICSE CLASS 7 · COMPUTER STUDIES
          </span>
          <h1>
            ONE CHAPTER.
            <br />
            <em>TEN LEVELS.</em>
            <br />
            ONE LEGEND.
          </h1>
          <p>
            Master spreadsheets, defeat the quiz, and climb the leaderboard.
            Your next favourite subject starts here.
          </p>
          <div className="hero-actions">
            {btn("Start Playing", () => go("/modes"))}
            {btn("Learning Academy", () => go("/library"), "secondary")}
          </div>
          <div className="hero-facts">
            <span>
              <CheckCircle2 size={16} /> 180 questions
            </span>
            <span>
              <CheckCircle2 size={16} /> 10 levels
            </span>
            <span>
              <CheckCircle2 size={16} /> No signup
            </span>
          </div>
        </div>
        <HeroArt />
      </section>
      <section className="stats-strip wrap">
        {[
          ["180", "QUESTIONS"],
          ["10", "QUEST LEVELS"],
          ["08", "GAME MODES"],
          ["100%", "LEARN BY DOING"],
        ].map((x) => (
          <div key={x[0]}>
            <b>{x[0]}</b>
            <span>{x[1]}</span>
          </div>
        ))}
      </section>
      <section className="wrap section">
        <div className="section-title">
          <div>
            <p className="eyebrow">CHOOSE YOUR ARENA</p>
            <h2>Not your average revision.</h2>
          </div>
          <button className="text-link" onClick={() => go("/modes")}>
            All game modes <ArrowRight size={16} />
          </button>
        </div>
        <div className="mode-grid">{gameModes.slice(0, 3).map(playCard)}</div>
      </section>
      <section className="wrap promo">
        <div className="promo-symbol">
          <Calculator size={32} />
        </div>
        <div>
          <p className="eyebrow">ACTUALLY LEARN EXCEL</p>
          <h2>Learn by doing, not just guessing.</h2>
          <p>
            Click cells, type formulas, calculate totals. The Weekly Expenses
            table from your textbook is waiting.
          </p>
        </div>
        {btn("Enter Formula Lab", () => go("/lab"))}
      </section>
    </>
  );
  const dashboard = () => (
    <>
      {intro(
        "YOUR COMMAND CENTRE",
        `Welcome back, ${user.nickname}.`,
        "Every question brings you a little closer to spreadsheet mastery.",
      )}
      <PlayerLevel xp={user.xp} />
      <div className="dash-stats">
        <div className="big-stat">
          <span>YOUR EXPERIENCE</span>
          <h2>
            <Zap size={29} fill="currentColor" /> {user.xp.toLocaleString()}{" "}
            <small>XP</small>
          </h2>
          <p>
            {user.xp >= 2000
              ? "Formula Genius"
              : user.xp >= 500
                ? "Excel Explorer"
                : "Spreadsheet Rookie"}
          </p>
          <Bar n={user.xp % 500} max={500} />
          <small>{500 - (user.xp % 500)} XP to next milestone</small>
        </div>
        <div className="small-stat">
          <Target size={29} />
          <span>Questions answered</span>
          <b>{user.history.length}</b>
        </div>
        <div className="small-stat">
          <Trophy size={29} />
          <span>Personal best</span>
          <b>{user.best}%</b>
        </div>
      </div>
      <div className="panel-grid">
        <div className="panel">
          <h2>
            Continue your journey <Sparkles size={21} />
          </h2>
          <p className="muted">
            Pick up where you left off, or start something new.
          </p>
          <div className="button-row">
            {btn("Quick Fire", () => start("quick"))}
            {btn("Explore levels", () => go("/quest"), "secondary")}
          </div>
          {session && !session.done ? (
            <button className="text-link" onClick={() => go("/quiz")}>
              Resume unfinished quiz <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
        <div className="panel">
          <h2>
            Daily Challenge <Flame size={21} />
          </h2>
          <p className="muted">One question to keep your brain warmed up.</p>
          <p className="notice-inline">
            {user.dailyDates.includes(dateKey())
              ? "Completed today — nice work!"
              : "Today’s challenge is ready · +20 XP"}
          </p>
          {btn("Play Daily Challenge", () => start("daily"), "secondary")}
        </div>
      </div>
      <div className="panel">
        <div className="section-title compact">
          <h2>Topic mastery</h2>
          <button className="text-link" onClick={() => go("/library")}>
            Study guide <ArrowRight size={16} />
          </button>
        </div>
        <div className="mastery-grid">
          {accuracy.slice(0, 8).map((t) => (
            <div key={t.id}>
              <div className="mastery-label">
                <span>{t.title}</span>
                <span>
                  {t.count
                    ? Math.round((t.correct / t.count) * 100) + "%"
                    : "Not started"}
                </span>
              </div>
              <Bar n={t.count ? (t.correct / t.count) * 100 : 0} />
            </div>
          ))}
        </div>
        {weak ? (
          <button className="text-link" onClick={() => start("revision")}>
            Revise {weak.title} <ArrowRight size={16} />
          </button>
        ) : (
          <p className="muted">
            Your weaker topics will appear after some practice.
          </p>
        )}
      </div>
    </>
  );
  const modesPage = () => (
    <>
      {intro(
        "GAME MODES",
        "Pick your battle.",
        "Different ways to learn. Same goal: total spreadsheet mastery.",
      )}
      <div className="mode-grid">{gameModes.map(playCard)}</div>
      <div className="panel" id="exam-setup">
        <h2>Set up your exam</h2>
        <p className="muted">Choose the length of your practice paper.</p>
        <div className="exam-count">
          {[20, 30, 50].map((n) => (
            <button
              key={n}
              aria-pressed={examSize === n}
              className={examSize === n ? "selected" : ""}
              onClick={() => setExamSize(n)}
            >
              {n} questions
            </button>
          ))}
        </div>
        {btn("Begin exam", () => start("exam"))}
      </div>
    </>
  );
  const quest = () => (
    <>
      {intro(
        "YOUR CHAPTER JOURNEY",
        "Ten levels. One legend.",
        "Progress through each unit and earn completion rewards.",
      )}
      <div className="quest-steps">
        {levels.map((name, i) => {
          const unlocked = ready ? Number(safeGet("cell-wars-level") || 1) : 1;
          const open = i + 1 <= unlocked;
          return (
            <div className={`quest-step ${open ? "" : "locked"}`} key={name}>
              <span className="quest-number">
                {open ? String(i + 1).padStart(2, "0") : <Lock size={22} />}
              </span>
              <div>
                <small>
                  LEVEL {i + 1} ·{" "}
                  {topics
                    .find((t) => t.id === levelTopics[i])
                    ?.title.toUpperCase()}
                </small>
                <h3>{name}</h3>
                <p>{Math.min(8,questions.filter(q=>q.topicId===levelTopics[i]).length)} questions · +30 XP reward</p>
              </div>
              <button
                disabled={!open}
                className={`btn ${open ? "primary" : "secondary"}`}
                onClick={() => start("quest", i + 1)}
              >
                {open ? "Play level" : "Locked"}{" "}
                {open ? <ArrowRight size={16} /> : null}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
  const quizPage = () => {
    if (!session || session.done || !q)
      return (
        <div className="empty">
          <h2>No active quiz</h2>
          {btn("Choose a mode", () => go("/modes"))}
        </div>
      );
    const correct = checkAnswer(q, session.answers[q.id] || "");
    const scored = session.ids.slice(0, session.index).filter((id) => {
      const f = questions.find((x) => x.id === id);
      return f && checkAnswer(f, session.answers[id] || "");
    }).length;
    return (
      <div className="quiz-wrap">
        <div className="quiz-top">
          <button onClick={() => go("/modes")}>
            <ArrowLeft size={18} /> Exit quiz
          </button>
          <strong>{gameModes.find((x) => x.id === session.mode)?.name}</strong>
          <span>
            QUESTION {session.index + 1} / {session.ids.length}
          </span>
        </div>
        {session.mode === "exam" && session.deadline ? (
          <QuizClock deadline={session.deadline} onExpire={finishSession} />
        ) : null}
        {session.mode === "streak" ? (
          <div className="streak-combo">
            <Flame size={20} />
            <b>
              {(() => {
                let streak = 0;
                for (const id of session.ids.slice(
                  0,
                  session.index + (session.feedback ? 1 : 0),
                )) {
                  const item = questions.find((q) => q.id === id)!;
                  streak = checkAnswer(item, session.answers[id] || "")
                    ? streak + 1
                    : 0;
                }
                return streak;
              })()}{" "}
              in a row
            </b>
            <span>A fresh chance with every question.</span>
          </div>
        ) : null}
        <Bar
          n={session.index + (session.feedback ? 1 : 0)}
          max={session.ids.length}
        />
        {session.mode === "boss" ? (
          <div className="boss-health">
            <Swords size={21} />
            <b>SPREADSHEET OVERLORD</b>
            <span>
              HP: {15 - scored - (session.feedback && correct ? 1 : 0)}/15
            </span>
            <Bar
              n={15 - scored - (session.feedback && correct ? 1 : 0)}
              max={15}
            />
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: user.reducedMotion ? 0 : 13 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: user.reducedMotion ? 0 : -8 }}
            transition={{ duration: user.reducedMotion ? 0 : 0.2 }}
            className="question-panel"
          >
            <div className="question-badges">
              <span className={`difficulty ${q.difficulty}`}>
                {q.difficulty}
              </span>
              <span>{topics.find((t) => t.id === q.topicId)?.title}</span>
              <span>{q.type}</span>
            </div>
            <h1>{q.prompt}</h1>
            {!session.feedback ? (
              <>
                <Answer
                  key={q.id}
                  q={q}
                  seed={session.seed}
                  value={choice}
                  change={setChoice}
                />
                <div className="quiz-controls">
                  <button
                    className="text-link"
                    onClick={() => setShowHint(!showHint)}
                  >
                    ◉ {showHint ? "Hide hint" : "Need a hint?"}
                  </button>
                  <button
                    className="btn primary"
                    disabled={!choice.trim()}
                    onClick={submit}
                  >
                    Check answer <ArrowRight size={17} />
                  </button>
                </div>
                {showHint ? (
                  <div className="tip">
                    {q.hint ||
                      "Think about the definition or the referenced cells."}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div
                  className={`feedback ${correct ? "correct" : "incorrect"}`}
                  role="status"
                >
                  <h2>
                    {correct ? (
                      <>
                        <CheckCircle2 size={25} /> Correct. Nicely done!
                      </>
                    ) : (
                      <>
                        <BookOpen size={25} /> Here is the right approach.
                      </>
                    )}
                  </h2>
                  <p>
                    <b>Correct answer:</b> {q.answer.replaceAll("|", " → ")}
                  </p>
                  <p>{q.explanation}</p>
                  {correct ? (
                    <strong>+{xpByDifficulty[q.difficulty]} XP</strong>
                  ) : null}
                </div>
                <div className="quiz-controls">
                  <span className="subtle">
                    A mistake is a chance to learn.
                  </span>
                  <button className="btn primary" onClick={next}>
                    {session.index === session.ids.length - 1
                      ? "See results"
                      : "Next question"}{" "}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };
  const results = () => {
    const r = user.lastResult;
    if (!r)
      return (
        <div className="empty">
          No results yet. {btn("Play", () => go("/modes"))}
        </div>
      );
    const percent = Math.round((r.correct / r.total) * 100);
    return (
      <>
        <div className="result-hero">
          <Celebration />
          <div className="result-icon">
            <Trophy size={38} />
          </div>
          <p className="eyebrow">SESSION COMPLETE</p>
          <h1>
            {percent === 100
              ? "Absolute legend."
              : percent >= 70
                ? "Strong work, challenger."
                : "Progress unlocked."}
          </h1>
          <p>Practice makes progress. Keep the momentum going.</p>
          <div className="result-numbers">
            <div>
              <b>
                {r.correct}
                <small>/{r.total}</small>
              </b>
              <span>Correct</span>
            </div>
            <div>
              <b>{percent}%</b>
              <span>Accuracy</span>
            </div>
            <div>
              <b>+{r.xp}</b>
              <span>XP earned</span>
            </div>
          </div>
          <div className="button-row">
            {btn("Play again", () => start(r.mode as Mode))}
            {btn("Dashboard", () => go("/dashboard"), "secondary")}
          </div>
        </div>
        <div className="panel revision-suggestions">
          <p className="eyebrow">YOUR NEXT SMALL WIN</p>
          <h2>Make the tricky bits click.</h2>
          <p className="muted">
            Revisit a lesson from this session, then try targeted practice.
          </p>
          <div className="button-row">
            {[
              ...new Set(
                r.ids
                  .filter((id) => {
                    const item = questions.find((q) => q.id === id);
                    return item && !checkAnswer(item, r.answers[id] || "");
                  })
                  .map((id) => questions.find((q) => q.id === id)!.topicId),
              ),
            ]
              .slice(0, 3)
              .map((id) => (
                <button
                  className="btn secondary"
                  key={id}
                  onClick={() => go("/library?topic=" + id)}
                >
                  <BookOpen size={16} />
                  {topics.find((t) => t.id === id)?.title}
                </button>
              ))}
            {btn("Revision Rescue", () => start("revision"))}
          </div>
        </div>
        <div className="panel">
          <h2>Review your answers</h2>
          {r.ids.map((id, i) => {
            const item = questions.find((q) => q.id === id);
            if (!item) return null;
            const ok = checkAnswer(item, r.answers[id] || "");
            return (
              <details className="review" key={id}>
                <summary>
                  <span className={ok ? "ok" : "no"}>{ok ? "✓" : "×"}</span>
                  {i + 1}. {item.prompt}
                  <ChevronRight size={17} />
                </summary>
                <div>
                  <p>
                    Your answer: <b>{r.answers[id] || "—"}</b>
                  </p>
                  <p>
                    Correct: <b>{item.answer.replaceAll("|", " → ")}</b>
                  </p>
                  <p>{item.explanation}</p>
                </div>
              </details>
            );
          })}
        </div>
      </>
    );
  };
  const lab = () => (
    <>
      {intro(
        "FORMULA LAB / PLAY WITH POSSIBILITIES",
        "Small cells. Big ideas.",
        "Your own spreadsheet playground. Experiment, calculate, and complete the textbook mission.",
      )}
      <SpreadsheetLab />
    </>
  );
  const library = () => (
    <Academy
      onPractice={(topic) => start("quick", 1, undefined, topic)}
      onLab={() => go("/lab")}
      onReward={() => setUser((p) => ({ ...p, xp: p.xp + 25 }))}
    />
  );
  const achievements = () => (
    <>
      {intro(
        "TROPHY ROOM",
        "Your achievements.",
        "Every little win deserves to be celebrated.",
      )}
      <div className="privacy-note">
        <Medal size={25} />
        <strong>
          {user.achievements.length} / {badgeList.length} badges unlocked
        </strong>
      </div>
      <div className="badge-grid">
        {badgeList.map((b) => {
          const unlocked = user.achievements.includes(b.name);
          return (
            <div
              className={`badge-tile ${unlocked ? "earned" : ""}`}
              key={b.name}
            >
              <div>{b.symbol}</div>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
              <span>{unlocked ? "✓ UNLOCKED" : "LOCKED"}</span>
            </div>
          );
        })}
      </div>
    </>
  );
  const settings = () => (
    <>
      {intro(
        "PREFERENCES",
        "Make it yours.",
        "Your progress is stored only in this browser.",
      )}
      <div className="settings-grid">
        <div className="panel">
          <h2>Player identity</h2>
          <p className="muted">Use a pseudonym rather than a full name.</p>
          <label htmlFor="nickname">Display nickname</label>
          <input
            id="nickname"
            className="settings-input"
            maxLength={18}
            value={user.nickname}
            onChange={(e) =>
              setUser({
                ...user,
                nickname: e.target.value.replace(/[^a-zA-Z0-9 _-]/g, ""),
              })
            }
          />
          <p className="subtle">No signup, email or phone number required.</p>
        </div>
        <div className="panel">
          <h2>Accessibility & privacy</h2>
          <label className="switch">
            <span>
              Reduced motion <small>Minimise quiz animations</small>
            </span>
            <input
              type="checkbox"
              checked={user.reducedMotion}
              onChange={(e) =>
                setUser({ ...user, reducedMotion: e.target.checked })
              }
            />
          </label>
          <label className="switch">
            <span>
              Shared leaderboard <small>Coming later; scores currently stay on this device</small>
            </span>
            <input type="checkbox" checked={false} disabled readOnly />
          </label>
          <label className="switch">
            <span>
              Sound effects <small>Gentle answer feedback</small>
            </span>
            <input
              type="checkbox"
              checked={user.sound}
              onChange={(e) => setUser({ ...user, sound: e.target.checked })}
            />
          </label>
        </div>
        <div className="panel">
          <h2>Delete local progress</h2>
          <p className="muted">
            Erase your nickname, scores, achievements and active quiz from this
            device.
          </p>
          {confirmDelete ? (
            <div className="button-row">
              <button
                className="btn danger"
                onClick={() => {
                  clearState();
                  safeRemove("cell-wars-academy");
                  safeRemove("cell-wars-lab");
                  safeRemove("cell-wars-level");
                  safeRemove("cell-wars-session");
                  setUser(initialState);
                  setSession(null);
                  setConfirmDelete(false);
                  go("/");
                }}
              >
                Yes, erase all
              </button>
              <button
                className="btn secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn secondary"
              onClick={() => setConfirmDelete(true)}
            >
              Erase all local data
            </button>
          )}
        </div>
      </div>
    </>
  );
  const friend = () => {
    const seed = friendSeed;
    const url = ready
      ? `${window.location.origin}/friend?seed=${seed}`
      : "/friend?seed=41372";
    return (
      <>
        {intro(
          "FRIEND CHALLENGE",
          "Play the same questions.",
          "Share a code, play the same questions, then compare your scores. Each player keeps their own results.",
        )}
        <div className="panel friend-panel">
          <h2>Challenge code: CW-{seed}</h2>
          <label htmlFor="challenge-code">Enter a friend’s numeric code</label>
          <div className="button-row">
            <input
              id="challenge-code"
              className="practice-input"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.replace(/\D/g, ""))}
            />
            <button
              className="btn secondary"
              disabled={!Number(friendCode) || Number(friendCode) > 2147483647}
              onClick={() => {
                setFriendSeed(Number(friendCode));
                setCopied(false);
              }}
            >
              Use code
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                const n = Math.floor(Math.random() * 2147483646) + 1;
                setFriendSeed(n);
                setFriendCode(String(n));
                setCopied(false);
              }}
            >
              New challenge
            </button>
          </div>
          <p>
            Both players see the same ten questions. Results remain private to
            each browser.
          </p>
          <div className="share-link">
            <span>{url}</span>
            <button
              className="btn secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                } catch {
                  setNotice("Clipboard unavailable");
                }
              }}
            >
              <Copy size={17} />
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          {btn("Play challenge", () => start("friend", 1, seed))}
        </div>
      </>
    );
  };
  if (!ready)
    return (
      <div className="loading">
        <Grid3X3 /> CELL WARS
      </div>
    );
  const nav = [
    ["/dashboard", "Dashboard", Home],
    ["/modes", "Play", Zap],
    ["/library", "Academy", BookOpen],
    ["/lab", "Formula Lab", Calculator],
    ["/leaderboard", "Leaderboard", Trophy],
  ] as const;
  const content =
    path === "/"
      ? landing()
      : path === "/dashboard"
        ? dashboard()
        : path === "/modes"
          ? modesPage()
          : path === "/quest"
            ? quest()
            : path === "/quiz"
              ? quizPage()
              : path === "/results"
                ? results()
                : path === "/lab"
                  ? lab()
                  : path === "/library"
                    ? library()
                    : path === "/leaderboard"
                      ? leaderboard()
                      : path === "/achievements"
                        ? achievements()
                        : path === "/settings"
                          ? settings()
                          : path === "/friend"
                            ? friend()
                            : landing();
  return (
    <div className={user.reducedMotion ? "app reduced-motion" : "app"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="header">
        <div className="header-inner wrap">
          <button className="brand" onClick={() => go("/")}>
            <span className="brand-square">
              <Grid3X3 size={20} />
            </span>
            CELL<span>WARS</span>
            <em>.</em>
          </button>
          <nav className={mobileNav ? "open" : ""}>
            {nav.map(([url, label, Icon]) => (
              <button
                className={path === url ? "current" : ""}
                key={url}
                onClick={() => go(url)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
          <div className="header-right">
            <span className="xp-chip">
              <Zap size={16} fill="currentColor" /> {user.xp.toLocaleString()}{" "}
              XP
            </span>
            <button
              className="avatar"
              aria-label="Settings"
              onClick={() => go("/settings")}
            >
              {(user.nickname || "CW").slice(0, 2).toUpperCase()}
            </button>
            <button
              className="hamburger"
              aria-label="Toggle navigation"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className={path === "/" ? "landing-main" : "inner-main wrap"}
      >
        {content}
      </main>
      <footer className="footer wrap">
        <button className="brand" onClick={() => go("/")}>
          <span className="brand-square">
            <Grid3X3 size={16} />
          </span>
          CELL<span>WARS</span>
          <em>.</em>
        </button>
        <span>Built for curious minds · ICSE Class 7</span>
        <div>
          <button onClick={() => go("/achievements")}>Achievements</button>
          <button onClick={() => go("/settings")}>Settings</button>
        </div>
      </footer>
      {notice ? (
        <div className="toast" role="status" onClick={() => setNotice("")}>
          {notice} <X size={14} />
        </div>
      ) : null}
    </div>
  );
}
