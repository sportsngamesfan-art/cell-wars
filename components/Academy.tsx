"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import topics from "@/data/curriculum.json";
import { lessons } from "@/data/lessons";
import { notes } from "@/data/notes";
import { questions, checkAnswer } from "@/lib/questions";
import { safeGet, safeSet } from "@/lib/storage";
import LessonDemo from "./LessonDemo";
import SpreadsheetLab from "./SpreadsheetLab";
import { academyQuestions } from "@/lib/academy";
type Progress = Record<
  string,
  { read: boolean; practice: boolean; quiz: boolean }
>;
export default function Academy({
  onPractice,
  onLab,
  onReward,
}: {
  onPractice: (topic: string) => void;
  onLab: () => void;
  onReward: () => void;
}) {
  const [topic, setTopic] = useState(()=>{if(typeof window==='undefined')return topics[0].id;const id=new URLSearchParams(window.location.search).get('topic');return id&&lessons[id]?id:topics[0].id}),
    [tab, setTab] = useState("lesson"),
    [progress, setProgress] = useState<Progress>({}),
    [loaded, setLoaded] = useState(false),
    [card, setCard] = useState(0),
    [flipped, setFlipped] = useState(false),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState(""),
    [quizIndex, setQuizIndex] = useState(0),
    [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({}),
    [quizFeedback, setQuizFeedback] = useState(false),
    [simulator, setSimulator] = useState(false);
  useEffect(() => {
    try {
      const p = JSON.parse(safeGet("cell-wars-academy") || "{}");
      if (p && typeof p === "object") setProgress(p);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) safeSet("cell-wars-academy", JSON.stringify(progress));
  }, [progress, loaded]);
  const t = topics.find((t) => t.id === topic)!,
    lesson = lessons[topic],
    index = topics.indexOf(t),
    p = progress[topic],
    complete = topics.filter(
      (t) =>
        progress[t.id]?.read &&
        progress[t.id]?.practice &&
        progress[t.id]?.quiz,
    ).length;
  const qs = academyQuestions(topic),
    q = qs[quizIndex];
  function mark(key: "read" | "practice" | "quiz") {
    setProgress((prev) => ({
      ...prev,
      [topic]: {
        ...(prev[topic] || { read: false, practice: false, quiz: false }),
        [key]: true,
      },
    }));
  }
  function select(id: string) {
    setTopic(id);
    setTab("lesson");
    setAnswer("");
    setFeedback("");
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizFeedback(false);
    setCard(0);
    setFlipped(false);
    setSimulator(false);
  }
  const quizDone =
    qs.length > 0 &&
    qs.every((x) => quizAnswers[x.id] && checkAnswer(x, quizAnswers[x.id]));
  function grade() {
    setQuizFeedback(true);
    if (qs.every((x) => checkAnswer(x, quizAnswers[x.id] || ""))) {
      if (!p?.quiz) onReward();
      mark("quiz");
    }
  }
  return (
    <>
      <div className="academy-heading">
        <div>
          <p className="eyebrow">LEARNING ACADEMY / 13 MISSIONS</p>
          <h1>
            Learn it. Try it. <em>Own it.</em>
          </h1>
          <p className="muted">
            Build your spreadsheet skills one small win at a time.
          </p>
        </div>
        <div className="course-progress">
          <GraduationCap size={25} />
          <b>
            {complete}
            <small>/13</small>
          </b>
          <span>lessons mastered</span>
          <div className="bar">
            <i style={{ width: `${(complete / 13) * 100}%` }} />
          </div>
        </div>
      </div>
      <div className="library-layout">
        <aside className="topic-nav" aria-label="Course lessons">
          {topics.map((item, i) => {
            const done =
              progress[item.id]?.quiz &&
              progress[item.id]?.read &&
              progress[item.id]?.practice;
            return (
              <button
                key={item.id}
                className={topic === item.id ? "chosen" : ""}
                onClick={() => select(item.id)}
                aria-current={topic === item.id ? "step" : undefined}
              >
                <span>
                  {done ? <Check size={16} /> : String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  {item.title}
                  <small>
                    {done
                      ? "Mastered"
                      : progress[item.id]?.read
                        ? "In progress"
                        : "Ready to explore"}
                  </small>
                </div>
                <ChevronRight size={14} />
              </button>
            );
          })}
        </aside>
        <div className="academy-content">
          <div className="lesson-banner">
            <span>MISSION {String(index + 1).padStart(2, "0")}</span>
            <h2>{t.title}</h2>
            <p>{lesson.goal}</p>
            <div className="lesson-checkpoints">
              {[
                ["read", "Read"],
                ["practice", "Practice"],
                ["quiz", "Master"],
              ].map(([k, l]) => (
                <span
                  className={p?.[k as keyof typeof p] ? "done" : ""}
                  key={k}
                >
                  <CheckCircle2 size={14} />
                  {l}
                </span>
              ))}
            </div>
            <svg
              className="lesson-banner-art"
              viewBox="0 0 180 160"
              aria-hidden="true"
            >
              <path d="M30 50 90 20 150 50 90 80Z" fill="#8392ff" />
              <path d="M30 50v65l60 30V80Z" fill="#4c5bca" />
              <path d="M90 80v65l60-30V50Z" fill="#b6a2ff" />
              <path
                d="m50 80 20 10m-20 8 20 10m40-18 20-10m-20 28 20-10"
                stroke="#fff"
                strokeWidth="5"
                opacity=".7"
              />
            </svg>
          </div>
          <div
            className="academy-tabs"
            role="tablist"
            aria-label="Lesson activities"
          >
            {[
              ["lesson", "Learn", BookOpen],
              ["practice", "Practice", Sparkles],
              ["flashcards", "Flashcards", RotateCcw],
              ["quiz", "Knowledge check", GraduationCap],
            ].map(([id, label, Icon]) => {
              const I = Icon as typeof BookOpen;
              return (
                <button
                  key={String(id)}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(String(id))}
                >
                  <I size={16} />
                  {String(label)}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={topic + tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, pointerEvents: "none" }}
              transition={{ duration: 0.16 }}
            >
              {tab === "lesson" ? (
                <>
                  <div className="panel lesson-rich">
                    <p className="eyebrow">THE CONCEPT</p>
                    {lesson.explain.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    <div className="worked-example">
                      <span>IN ACTION</span>
                      <p>{lesson.example}</p>
                    </div>
                    <LessonDemo key={topic} lesson={lesson} />
                    <details className="textbook-notes">
                      <summary>Chapter recap · textbook facts</summary>
                      {notes[topic].map((n, i) => (
                        <p key={i}>{n}</p>
                      ))}
                    </details>
                    <button
                      className="btn primary"
                      onClick={() => {
                        mark("read");
                        setTab("practice");
                      }}
                    >
                      Got it. Let me try <ArrowRight size={17} />
                    </button>
                  </div>
                </>
              ) : tab === "practice" ? (
                <div className="panel lesson-rich">
                  <p className="eyebrow">YOUR TURN</p>
                  <h2>{lesson.tryIt}</h2>
                  <label className="practice-label" htmlFor="practice-answer">
                    Your answer
                  </label>
                  <input
                    id="practice-answer"
                    className="practice-input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Think it through…"
                  />
                  <button
                    className="btn primary"
                    disabled={!answer.trim()}
                    onClick={() => {
                      const ok =
                        answer.trim().toLowerCase().replace(/\s/g, "") ===
                        lesson.answer.toLowerCase().replace(/\s/g, "");
                      setFeedback(ok ? "correct" : "retry");
                      if (ok) mark("practice");
                    }}
                  >
                    Check practice <Check size={16} />
                  </button>
                  {feedback && (
                    <div
                      className={`feedback ${feedback === "correct" ? "correct" : "incorrect"}`}
                      role="status"
                    >
                      <h3>
                        {feedback === "correct"
                          ? "You’ve got it!"
                          : "Let’s work through it."}
                      </h3>
                      <p>{lesson.why}</p>
                      {feedback === "retry" && (
                        <p>
                          Try: <b>{lesson.answer}</b>
                        </p>
                      )}
                    </div>
                  )}
                  <LessonDemo key={topic} lesson={lesson} />
                  <button className="text-link" onClick={() => setTab("quiz")}>
                    Ready for the knowledge check? <ArrowRight size={15} />
                  </button>
                </div>
              ) : tab === "flashcards" ? (
                <div className="panel flash-panel">
                  <p className="eyebrow">
                    ACTIVE RECALL · {card + 1}/{lesson.terms.length}
                  </p>
                  <h2>Can you explain it?</h2>
                  <button
                    className={`flashcard ${flipped ? "flipped" : ""}`}
                    onClick={() => setFlipped((p) => !p)}
                    aria-label="Flip flashcard"
                  >
                    <span>{flipped ? "THE MEANING" : "WHAT IS…?"}</span>
                    <b>{lesson.terms[card][flipped ? 1 : 0]}</b>
                    <small>
                      Tap to flip <RotateCcw size={14} />
                    </small>
                  </button>
                  <div className="button-row">
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setCard(
                          (p) =>
                            (p + lesson.terms.length - 1) % lesson.terms.length,
                        );
                        setFlipped(false);
                      }}
                    >
                      <ArrowLeft size={16} />
                      Previous
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setCard((p) => (p + 1) % lesson.terms.length);
                        setFlipped(false);
                      }}
                    >
                      Next
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="panel lesson-rich">
                  <p className="eyebrow">
                    KNOWLEDGE CHECK · {quizIndex + 1}/{qs.length} · +25 XP ON
                    FIRST MASTERY
                  </p>
                  {q ? (
                    <>
                      <h2>{q.prompt}</h2>
                      <div className="answers">
                        {q.options?.map((o, i) => (
                          <button
                            className={`answer ${quizAnswers[q.id] === o ? "picked" : ""}`}
                            key={o}
                            disabled={quizFeedback}
                            onClick={() =>
                              setQuizAnswers((p) => ({ ...p, [q.id]: o }))
                            }
                          >
                            <b>{String.fromCharCode(65 + i)}</b>
                            <span>{o}</span>
                          </button>
                        ))}
                      </div>
                      {quizFeedback ? (
                        <div
                          className={`feedback ${checkAnswer(q, quizAnswers[q.id] || "") ? "correct" : "incorrect"}`}
                          role="status"
                        >
                          <p>
                            {checkAnswer(q, quizAnswers[q.id] || "")
                              ? "Nice work."
                              : "Keep going. The correct answer is " +
                                q.answer +
                                "."}{" "}
                            {q.explanation}
                          </p>
                        </div>
                      ) : null}
                      {quizIndex < qs.length - 1 ? (
                        <button
                          className="btn primary"
                          disabled={!quizAnswers[q.id]}
                          onClick={() => {
                            if (!quizFeedback) setQuizFeedback(true);
                            else {
                              setQuizIndex((p) => p + 1);
                              setQuizFeedback(false);
                            }
                          }}
                        >
                          {quizFeedback ? "Next question" : "Check answer"}
                          <ArrowRight size={16} />
                        </button>
                      ) : !quizFeedback ? (
                        <button
                          className="btn primary"
                          disabled={!quizAnswers[q.id]}
                          onClick={grade}
                        >
                          Finish check <Check size={16} />
                        </button>
                      ) : (
                        <div className="quiz-end">
                          <h3>
                            {quizDone
                              ? "Knowledge check mastered!"
                              : "You’re learning. Give it another go."}
                          </h3>
                          <p>
                            {quizDone
                              ? "Complete the reading and practice to master this mission."
                              : "Review the explanation, then retry. There is no penalty."}
                          </p>
                          <button
                            className="btn secondary"
                            onClick={() => {
                              setQuizIndex(0);
                              setQuizAnswers({});
                              setQuizFeedback(false);
                            }}
                          >
                            Retry knowledge check
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn primary"
                      onClick={() => onPractice(topic)}
                    >
                      Start topic practice
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="academy-next">
            <button
              className="btn secondary"
              disabled={index === 0}
              onClick={() => select(topics[index - 1].id)}
            >
              <ArrowLeft size={16} />
              Previous lesson
            </button>
            <button
              className="btn primary"
              onClick={() =>
                index < 12 ? select(topics[index + 1].id) : onPractice(topic)
              }
            >
              {index < 12 ? "Next lesson" : "Play topic quiz"}
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="academy-lab-callout">
            <div>
              <p className="eyebrow">LEARN BY DOING</p>
              <h3>A real worksheet. Right here.</h3>
              <p className="muted">
                Put the lesson to work in the Weekly Expenses simulator.
              </p>
            </div>
            <button
              className="btn secondary"
              onClick={() => setSimulator((p) => !p)}
            >
              {simulator ? "Close simulator" : "Open simulator"}
            </button>
            <button className="text-link" onClick={onLab}>
              Full Formula Lab <ArrowRight size={14} />
            </button>
          </div>
          {simulator && <SpreadsheetLab compact />}
          <button className="text-link" onClick={() => onPractice(topic)}>
            More practice: {t.title} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
