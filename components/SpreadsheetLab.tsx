"use client";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Calculator,
  Grid3X3,
  Undo2,
} from "lucide-react";
import {
  Cells,
  initialCells,
  evaluateCell,
  rangeAddresses,
  rangeValues,
} from "@/lib/spreadsheet";
import { safeGet, safeSet } from "@/lib/storage";
export default function SpreadsheetLab({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [cells, setCells] = useState<Cells>(initialCells),
    [selected, setSelected] = useState("H3"),
    [end, setEnd] = useState("H3"),
    [draft, setDraft] = useState(""),
    [merged, setMerged] = useState(false),
    [status, setStatus] = useState("Ready. Select a cell to begin."),
    [undo, setUndo] = useState<Cells[]>([]),
    [loaded, setLoaded] = useState(false),
    [checked, setChecked] = useState(false);
  const dragging = useRef(false),
    input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const s = JSON.parse(safeGet("cell-wars-lab") || "null");
      if (
        s &&
        s.cells &&
        typeof s.cells === "object" &&
        Object.values(s.cells).every((v) => typeof v === "string")
      ) {
        setCells(s.cells);
        setMerged(!!s.merged);
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) safeSet("cell-wars-lab", JSON.stringify({ cells, merged }));
  }, [cells, merged, loaded]);
  useEffect(() => setDraft(cells[selected] || ""), [selected, cells]);
  useEffect(() => {
    const up = () => (dragging.current = false);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);
  const range = rangeAddresses(selected, end),
    nums = rangeValues(selected, end, cells);
  function edit(id: string, value: string) {
    setUndo((p) => [...p.slice(-19), cells]);
    setCells((p) => ({ ...p, [id]: value }));
    setStatus(`${id} updated. Dependent formulas recalculated.`);
  }
  function apply() {
    edit(selected, draft);
  }
  function autoSum() {
    if (range.length > 1) {
      const last = range[range.length - 1],
        row = +last.slice(1),
        col = last.charCodeAt(0);
      const target =
        row < 12
          ? last[0] + (row + 1)
          : col < 72
            ? String.fromCharCode(col + 1) + row
            : "";
      if (!target) {
        setStatus("Select a range with space for a total below it.");
        return;
      }
      edit(target, `=SUM(${selected}:${end})`);
      setSelected(target);
      setEnd(target);
    } else if (/^H[3-9]$/.test(selected)) {
      edit(selected, `=SUM(B${selected.slice(1)}:G${selected.slice(1)})`);
    } else setStatus("Select H3–H9, or select a range and press AutoSum.");
  }
  function move(key: string, shift: boolean) {
    const r = +end.slice(1),
      c = end.charCodeAt(0);
    const to =
      key === "ArrowUp"
        ? end[0] + Math.max(1, r - 1)
        : key === "ArrowDown"
          ? end[0] + Math.min(12, r + 1)
          : key === "ArrowLeft"
            ? String.fromCharCode(Math.max(65, c - 1)) + r
            : key === "ArrowRight"
              ? String.fromCharCode(Math.min(72, c + 1)) + r
              : "A1";
    if (!shift) setSelected(to);
    setEnd(to);
  }
  const challenge = Array.from({ length: 7 }, (_, i) => {
    const r = i + 3;
    return {
      r,
      ok:
        typeof cells["H" + r] === "string" &&
        cells["H" + r].startsWith("=") &&
        Number(evaluateCell("H" + r, cells)) ===
          rangeValues("B" + r, "G" + r, cells).reduce((a, b) => a + b, 0),
    };
  });
  return (
    <div className={compact ? "lab-layout compact-lab" : "lab-layout"}>
      <div>
        <div className="excel-window">
          <div className="excel-title">
            <span className="excel-logo">X</span>
            <strong>Weekly Expenses.xlsx</strong>
            <span>LIVE WORKSHEET</span>
          </div>
          <div className="excel-tabs">
            <b>Home</b>
            <span>Formulas</span>
            <span>Learning edition</span>
          </div>
          <div className="lab-ribbon">
            <button onClick={autoSum}>
              <Calculator size={16} />
              AutoSum
            </button>
            <button
              onClick={() => {
                setMerged((p) => !p);
                setStatus(
                  merged
                    ? "Title unmerged."
                    : "D1 title centered across A1:H1; other cells preserved.",
                );
              }}
            >
              <Grid3X3 size={16} />
              {merged ? "Unmerge" : "Merge & Center"}
            </button>
            <button
              disabled={!undo.length}
              onClick={() => {
                setCells(undo[undo.length - 1]);
                setUndo((p) => p.slice(0, -1));
                setStatus("Last edit undone.");
              }}
            >
              <Undo2 size={16} />
              Undo
            </button>
          </div>
          <div className="formula-bar">
            <b>{selected === end ? selected : `${selected}:${end}`}</b>
            <span>ƒx</span>
            <input
              ref={input}
              aria-label="Formula bar"
              value={draft}
              placeholder="Type a value or =SUM(B3:G3)"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply();
                if (e.key === "Escape") setDraft(cells[selected] || "");
              }}
            />
            <button onClick={apply}>
              <Check size={16} />
              Apply
            </button>
          </div>
          <div
            className="excel-scroll"
            onKeyDown={(e) => {
              if (e.target instanceof HTMLInputElement) return;
              if (e.key.startsWith("Arrow") || e.key === "Home") {
                e.preventDefault();
                move(e.key, e.shiftKey);
              }
              if (e.key === "Enter") input.current?.focus();
            }}
          >
            <table className="excel-table">
              <thead>
                <tr>
                  <th />
                  {"ABCDEFGH".split("").map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }, (_, i) => (
                  <tr key={i}>
                    <th>{i + 1}</th>
                    {i === 0 && merged ? (
                      <td colSpan={8}>
                        <button
                          className="merged-title"
                          onClick={() => {
                            setSelected("D1");
                            setEnd("D1");
                          }}
                        >
                          {String(evaluateCell("D1", cells))}
                        </button>
                      </td>
                    ) : (
                      "ABCDEFGH".split("").map((c) => {
                        const id = c + (i + 1),
                          value = String(evaluateCell(id, cells));
                        return (
                          <td key={c}>
                            <button
                              aria-label={`Select ${id}`}
                              aria-pressed={range.includes(id)}
                              className={`${range.includes(id) ? "cell-selected" : ""} ${i === 1 ? "table-heading" : ""} ${value.startsWith("#") ? "cell-error" : ""}`}
                              onPointerDown={(e) => {
                                dragging.current = true;
                                if (e.shiftKey) setEnd(id);
                                else {
                                  setSelected(id);
                                  setEnd(id);
                                }
                              }}
                              onPointerEnter={() => {
                                if (dragging.current) setEnd(id);
                              }}
                              onClick={(e) => {
                                if (e.detail === 0) {
                                  if (e.shiftKey) setEnd(id);
                                  else {
                                    setSelected(id);
                                    setEnd(id);
                                  }
                                }
                              }}
                              onDoubleClick={() => input.current?.focus()}
                            >
                              {value}
                            </button>
                          </td>
                        );
                      })
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="excel-bottom">
            <b>▣ Sheet1</b>
            <span>
              Count: {nums.length} · Sum: {nums.reduce((a, b) => a + b, 0)}
            </span>
          </div>
        </div>
        <p className="lab-status" role="status">
          {status}
        </p>
        <p className="subtle">
          Click to select · Drag or Shift-click to select a range · Arrow keys
          to navigate · Enter to edit
        </p>
      </div>
      <aside className="lab-side">
        <div className="panel">
          <p className="eyebrow">FORMULA TOOLKIT</p>
          <h2>Make cells do the work.</h2>
          <p className="muted">
            Choose a function to calculate the Eatables row in H3. Change B3 and
            watch H3 update.
          </p>
          {["SUM", "AVERAGE", "COUNT", "MAX", "MIN"].map((f) => (
            <button
              className="formula-choice"
              key={f}
              onClick={() => {
                edit("H3", `=${f}(B3:G3)`);
                setSelected("H3");
                setEnd("H3");
              }}
            >
              <code>={f}(B3:G3)</code>
              <ChevronRight size={16} />
            </button>
          ))}
          <div className="tip">
            SUM = 750 · AVERAGE = 125 · COUNT = 6 · MAX = 500 · MIN = 0, using
            the original data.
          </div>
        </div>
        {!compact && (
          <div className="panel challenge-panel">
            <p className="eyebrow">TEXTBOOK MISSION</p>
            <h2>The weekly budget.</h2>
            <p className="muted">
              Enter a formula in each total cell H3:H9. Merge & Center the
              title, then check your work.
            </p>
            {challenge.map(({ r, ok }) => (
              <div className="mission-row" key={r}>
                <span>
                  {checked && ok ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <span className="mission-dot" />
                  )}
                  H{r} · {cells["A" + r]}
                </span>
                <b>{checked ? (ok ? "Complete" : "Try a SUM formula") : "—"}</b>
              </div>
            ))}
            <button
              className="btn primary"
              onClick={() => {
                setChecked(true);
                setStatus(
                  challenge.every((x) => x.ok) && merged
                    ? "Mission complete. Seven totals and one beautifully centered title!"
                    : "Keep going: use SUM for all seven totals and center the title.",
                );
              }}
            >
              Check mission <Check size={16} />
            </button>
            {checked && challenge.every((x) => x.ok) && merged && (
              <p className="mission-success">
                Mission complete! You made a working expense sheet.
              </p>
            )}
          </div>
        )}
        <button
          className="btn secondary"
          onClick={() => {
            setUndo((p) => [...p, cells]);
            setCells(initialCells());
            setMerged(false);
            setChecked(false);
            setStatus("Original textbook values restored.");
          }}
        >
          <RotateCcw size={16} />
          Reset worksheet
        </button>
      </aside>
    </div>
  );
}
