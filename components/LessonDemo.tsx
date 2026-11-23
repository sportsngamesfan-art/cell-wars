"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ArrowRight, Check, MousePointer2 } from "lucide-react";
import { Lesson } from "@/data/lessons";
export default function LessonDemo({ lesson }: { lesson: Lesson }) {
  const [active, setActive] = useState("B3"),
    [number, setNumber] = useState(50),
    [fn, setFn] = useState("SUM"),
    [step, setStep] = useState(0),
    [sheets, setSheets] = useState(["Expenses", "Marks"]),
    [sheet, setSheet] = useState("Expenses"),
    [rename, setRename] = useState(false),
    [name, setName] = useState("");
  const nums = [number, 0, 200, 0, 0, 500],
    total = nums.reduce((a, b) => a + b, 0);
  const result =
    fn === "SUM"
      ? total
      : fn === "AVERAGE"
        ? total / 6
        : fn === "COUNT"
          ? 6
          : fn === "MAX"
            ? Math.max(...nums)
            : Math.min(...nums);
  return (
    <div className="lesson-demo">
      <div className="demo-label">
        <span className="live-dot" />
        INTERACTIVE EXAMPLE <MousePointer2 size={14} />
      </div>
      {lesson.demo === "grid" ? (
        <>
          <div className="demo-formula">
            <b>{active}</b>
            <span>ƒx</span>
            <span>
              Column {active[0]} · Row {active.slice(1)}
            </span>
          </div>
          <div className="teaching-grid">
            <span />
            {"ABCDE".split("").map((c) => (
              <b className={active[0] === c ? "lit" : ""} key={c}>
                {c}
              </b>
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <div className="teaching-row" key={i}>
                <b className={+active.slice(1) === i + 1 ? "lit" : ""}>
                  {i + 1}
                </b>
                {"ABCDE".split("").map((c) => (
                  <button
                    key={c}
                    className={active === c + (i + 1) ? "lit selected" : ""}
                    onClick={() => setActive(c + (i + 1))}
                    aria-label={`Explore ${c}${i + 1}`}
                  >
                    {active === c + (i + 1) ? active : ""}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <p>
            Tap a cell. Its address is the <b>column letter</b> followed by the{" "}
            <b>row number</b>.
          </p>
        </>
      ) : lesson.demo === "formula" ? (
        <>
          <div className="demo-formula">
            <b>H3</b>
            <span>ƒx</span>
            <code>={fn}(B3:G3)</code>
          </div>
          <div className="formula-numbers">
            {nums.map((n, i) => (
              <div key={i}>
                <small>{String.fromCharCode(66 + i)}3</small>
                {i === 0 ? (
                  <input
                    aria-label="Example B3 value"
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(Number(e.target.value))}
                  />
                ) : (
                  <b>{n}</b>
                )}
              </div>
            ))}
          </div>
          <div className="function-tabs">
            {["SUM", "AVERAGE", "COUNT", "MAX", "MIN"].map((f) => (
              <button key={f} aria-pressed={fn === f} onClick={() => setFn(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="formula-live-result">
            <span>H3 · RECALCULATED RESULT</span>
            <AnimatePresence mode="wait">
              <motion.b
                key={String(result)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Number(result.toFixed(2))}
              </motion.b>
            </AnimatePresence>
          </div>
          <p>
            Change B3 above. The result updates because the formula uses{" "}
            <b>cell references</b>.
          </p>
        </>
      ) : lesson.demo === "steps" ? (
        <>
          <ol className="demo-steps">
            {lesson.steps?.map((s, i) => (
              <li
                key={s}
                className={i === step ? "active" : i < step ? "finished" : ""}
              >
                <span>{i < step ? <Check size={14} /> : i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <button
            className="btn secondary"
            onClick={() =>
              setStep((p) => (p + 1) % (lesson.steps?.length || 1))
            }
          >
            {step === (lesson.steps?.length || 1) - 1
              ? "Replay example"
              : "Next step"}
            <ArrowRight size={16} />
          </button>
        </>
      ) : (
        <>
          <div className="sheet-preview">
            <span>{sheet}.xlsx / ACTIVE WORKSHEET</span>
            <div className="sheet-lines" />
            <b>{sheet}</b>
          </div>
          <div className="sheet-tabs">
            {sheets.map((s) => (
              <button
                aria-pressed={s === sheet}
                key={s}
                onClick={() => setSheet(s)}
                onDoubleClick={() => {
                  setSheet(s);
                  setName(s);
                  setRename(true);
                }}
              >
                {s}
              </button>
            ))}
            <button
              aria-label="Add worksheet"
              onClick={() => {
                const n = `Sheet${sheets.length + 1}`;
                setSheets((p) => [...p, n]);
                setSheet(n);
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          {rename ? (
            <form
              className="sheet-rename"
              onSubmit={(e) => {
                e.preventDefault();
                const n = name.trim().slice(0, 31);
                if (!n || sheets.includes(n) || /[\\/?*\[\]:]/.test(n)) return;
                setSheets((p) => p.map((s) => (s === sheet ? n : s)));
                setSheet(n);
                setRename(false);
              }}
            >
              <input
                aria-label="Worksheet name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={31}
              />
              <button className="btn secondary">Save name</button>
              <button
                type="button"
                className="text-link"
                onClick={() => setRename(false)}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              className="text-link"
              onClick={() => {
                setName(sheet);
                setRename(true);
              }}
            >
              Rename active sheet
            </button>
          )}
          <p>
            Use + to add a worksheet. Tap a tab to switch, or rename the active
            sheet.
          </p>
        </>
      )}
    </div>
  );
}
