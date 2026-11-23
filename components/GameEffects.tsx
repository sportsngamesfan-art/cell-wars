"use client";
import { useEffect, useState } from "react";
import { Timer, Zap } from "lucide-react";
export function QuizClock({
  deadline,
  onExpire,
}: {
  deadline: number;
  onExpire: () => void;
}) {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.ceil((deadline - Date.now()) / 1000)),
  );
  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(s);
      if (s === 0) onExpire();
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [deadline, onExpire]);
  return (
    <span
      className={`quiz-clock ${seconds < 60 ? "urgent" : ""}`}
      aria-label="Exam time remaining"
    >
      <Timer size={16} />
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </span>
  );
}
export function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 20 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${i * 5}%`,
            animationDelay: `${(i % 5) * 0.12}s`,
            background: ["#8fa8ff", "#bd9dff", "#62e2c0"][i % 3],
            transform: `rotate(${i * 37}deg)`,
          }}
        />
      ))}
    </div>
  );
}
export function PlayerLevel({ xp }: { xp: number }) {
  const level = Math.floor(xp / 250) + 1;
  return (
    <span className="player-level">
      <Zap size={14} />
      LVL {level}
      <span>{xp % 250}/250 XP to next level</span>
    </span>
  );
}
export function playFeedback(correct: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(correct ? 660 : 260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      correct ? 990 : 220,
      ctx.currentTime + 0.15,
    );
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.23);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {}
}
