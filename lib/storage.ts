export type UserState = {
  nickname: string;
  xp: number;
  completed: number;
  best: number;
  history: { id: string; correct: boolean; topic: string }[];
  achievements: string[];
  sound: boolean;
  reducedMotion: boolean;
  publicOptIn: boolean;
  dailyDates: string[];
  lastResult?: {
    correct: number;
    total: number;
    xp: number;
    mode: string;
    answers: Record<string, string>;
    ids: string[];
  };
};
export const initialState: UserState = {
  nickname: "PLAYER ONE",
  xp: 0,
  completed: 0,
  best: 0,
  history: [],
  achievements: [],
  sound: false,
  reducedMotion: false,
  publicOptIn: false,
  dailyDates: [],
};
const KEY = "cell-wars-v1";
export function readState(): UserState {
  if (typeof window === "undefined") return initialState;
  try {
    const value = JSON.parse(safeGet(KEY) || "null");
    if (!value || typeof value !== "object") return initialState;
    const state = { ...initialState, ...value };
    for (const key of ["history", "achievements", "dailyDates"] as const)
      if (!Array.isArray(state[key])) return initialState;
    state.history = state.history.filter(
      (x: UserState["history"][number]) =>
        x &&
        typeof x.id === "string" &&
        typeof x.correct === "boolean" &&
        typeof x.topic === "string",
    );
    state.achievements = state.achievements.filter(
      (x: unknown) => typeof x === "string",
    );
    state.dailyDates = state.dailyDates.filter(
      (x: unknown) => typeof x === "string",
    );
    for (const key of ["xp", "completed", "best"] as const)
      if (!Number.isFinite(state[key]) || state[key] < 0) state[key] = 0;
    if (typeof state.nickname !== "string")
      state.nickname = initialState.nickname;
    return state;
  } catch {
    return initialState;
  }
}
export function writeState(s: UserState) {
  safeSet(KEY, JSON.stringify(s));
}
export function clearState() {
  safeRemove(KEY);
}

export function safeGet(key: string) {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
export function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
