// Прогресс ученика хранится только на телефоне (AsyncStorage).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LangId, LANGS } from "./lang";

export type LangProgress = { level: string; placementDone: boolean };
export type DayStats = {
  xp: number;
  voiceSec: number; // время голосовых уроков
  activeSec?: number; // сколько приложение было открыто
  lessons?: number; // пройдено уроков
  words?: number; // добавлено слов
  learned?: number; // выучено слов
};
export type GoalType = "xp" | "min";
export type ThemeMode = "system" | "light" | "dark";

export type Progress = {
  xp: number;
  doneLessons: string[];
  streak: number;
  lastDay: string | null;
  lang: LangId; // какой язык учим сейчас
  langs: Partial<Record<LangId, LangProgress>>;
  onboarded: boolean;
  history: Record<string, DayStats>; // по дням, ключ YYYY-MM-DD
  achievements: string[];
  outfit: string; // образ Emma
  dailyGoal: number; // XP в день
  goalType: GoalType; // цель дня в XP или в минутах
  dailyMinutes: number; // минут в день
  outfits: string[]; // открытые образы Emma
  reminderHour: number | null; // во сколько напоминать, null — не напоминать
  theme: ThemeMode;
  counters: { voiceLessons: number; bestPron: number; perfectListening: number; reviews: number };
};

const KEY = "progress_v1";
const DEFAULT: Progress = {
  xp: 0, doneLessons: [], streak: 0, lastDay: null,
  lang: "en", langs: {}, onboarded: false, history: {}, achievements: [], outfit: "default",
  dailyGoal: 20, goalType: "xp", dailyMinutes: 15, outfits: ["default"], reminderHour: 19, theme: "system",
  counters: { voiceLessons: 0, bestPron: 0, perfectListening: 0, reviews: 0 },
};

export function dayKey(d = new Date()): string {
  // Локальная дата, а не UTC: день должен меняться в полночь у пользователя.
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function loadProgress(): Promise<Progress> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT;
  const old = JSON.parse(raw);
  const p: Progress = { ...DEFAULT, ...old, counters: { ...DEFAULT.counters, ...(old.counters ?? {}) } };
  // Переход со старой версии, где был только английский.
  if (old.level && !old.langs) {
    p.langs = { en: { level: old.level, placementDone: !!old.placementDone } };
    p.onboarded = !!old.placementDone;
  }
  // Образы, открытые в прошлой версии за достижения, остаются открытыми.
  if (!old.outfits) {
    const was: Record<string, string> = { streak3: "glasses", streak7: "beret", xp500: "jacket" };
    p.outfits = ["default", ...p.achievements.filter((a) => was[a]).map((a) => was[a])];
  }
  return p;
}

export async function saveProgress(p: Progress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}

/** Прогресс по текущему языку. */
export function cur(p: Progress): LangProgress {
  return p.langs[p.lang] ?? { level: LANGS[p.lang].levels[0], placementDone: false };
}

export function setLevel(p: Progress, level: string): Progress {
  return { ...p, langs: { ...p.langs, [p.lang]: { ...cur(p), level, placementDone: true } } };
}

export function today(p: Progress): DayStats {
  return p.history[dayKey()] ?? { xp: 0, voiceSec: 0 };
}

/** Начисляет опыт и обновляет серию дней подряд. */
export function addXp(p: Progress, xp: number): Progress {
  const t = dayKey();
  const y = dayKey(new Date(Date.now() - 86400000));
  let streak = p.streak;
  if (p.lastDay !== t) streak = p.lastDay === y ? streak + 1 : 1;
  const day = today(p);
  return { ...p, xp: p.xp + xp, streak, lastDay: t, history: { ...p.history, [t]: { ...day, xp: day.xp + xp } } };
}

export function addVoiceTime(p: Progress, sec: number): Progress {
  return addDay(p, { voiceSec: Math.round(sec) });
}

/** Прибавляет числа к статистике сегодняшнего дня. */
export function addDay(p: Progress, add: Partial<Record<keyof DayStats, number>>): Progress {
  const t = dayKey();
  const day: DayStats = { ...today(p) };
  for (const [k, v] of Object.entries(add)) (day as any)[k] = ((day as any)[k] ?? 0) + (v ?? 0);
  return { ...p, history: { ...p.history, [t]: day } };
}

/** Минуты занятий за день: открытое приложение, но не меньше, чем голосовые уроки. */
export function dayMinutes(d: DayStats): number {
  return Math.floor(Math.max(d.activeSec ?? 0, d.voiceSec) / 60);
}

/** Прогресс дневной цели (XP или минуты). */
export function goalStatus(p: Progress, d: DayStats = today(p)): { value: number; goal: number; unit: string; done: boolean } {
  const value = p.goalType === "min" ? dayMinutes(d) : d.xp;
  const goal = p.goalType === "min" ? p.dailyMinutes : p.dailyGoal;
  return { value, goal, unit: p.goalType === "min" ? "мин" : "XP", done: value >= goal };
}

export function bump(p: Progress, key: keyof Progress["counters"], value?: number): Progress {
  const c = p.counters;
  const v = value === undefined ? c[key] + 1 : Math.max(c[key], value);
  return { ...p, counters: { ...c, [key]: v } };
}

/** Когда все уроки текущего уровня пройдены, ученик переходит на следующий. */
export function maybeLevelUp(p: Progress, lessons: { id: string; level: string }[]): Progress {
  const level = cur(p).level;
  const levels = LANGS[p.lang].levels;
  const current = lessons.filter((l) => l.level === level);
  const allDone = current.length > 0 && current.every((l) => p.doneLessons.includes(l.id));
  const i = levels.indexOf(level);
  if (allDone && i >= 0 && i < levels.length - 1) return setLevel(p, levels[i + 1]);
  return p;
}

/** Последние n дней (от старых к новым) для графика. */
export function lastDays(p: Progress, n: number): { key: string; label: string; stats: DayStats }[] {
  const names = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = dayKey(d);
    out.push({ key, label: names[d.getDay()], stats: p.history[key] ?? { xp: 0, voiceSec: 0 } });
  }
  return out;
}
