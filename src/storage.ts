// Прогресс ученика хранится только на телефоне (AsyncStorage).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LangId, LANGS } from "./lang";

export type LangProgress = { level: string; placementDone: boolean };
export type DayStats = { xp: number; voiceSec: number };
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
  reminderHour: number | null; // во сколько напоминать, null — не напоминать
  theme: ThemeMode;
  counters: { voiceLessons: number; bestPron: number; perfectListening: number; reviews: number };
};

const KEY = "progress_v1";
const DEFAULT: Progress = {
  xp: 0, doneLessons: [], streak: 0, lastDay: null,
  lang: "en", langs: {}, onboarded: false, history: {}, achievements: [], outfit: "default",
  dailyGoal: 20, reminderHour: 19, theme: "system",
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
  const t = dayKey();
  const day = today(p);
  return { ...p, history: { ...p.history, [t]: { ...day, voiceSec: day.voiceSec + Math.round(sec) } } };
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
