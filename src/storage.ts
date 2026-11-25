// Прогресс ученика хранится только на телефоне (AsyncStorage).
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Progress = {
  xp: number;
  level: string; // A1, A2, B1, B2, C1
  doneLessons: string[];
  streak: number;
  lastDay: string | null;
  placementDone: boolean; // прошёл ли стартовый тест
};

const KEY = "progress_v1";
const DEFAULT: Progress = { xp: 0, level: "A2", doneLessons: [], streak: 0, lastDay: null, placementDone: false };

export async function loadProgress(): Promise<Progress> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
}

export async function saveProgress(p: Progress): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(p));
}

/** Начисляет опыт и обновляет серию дней подряд. */
export function addXp(p: Progress, xp: number): Progress {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = p.streak;
  if (p.lastDay !== today) streak = p.lastDay === yesterday ? streak + 1 : 1;
  return { ...p, xp: p.xp + xp, streak, lastDay: today };
}

/** Когда все уроки текущего уровня пройдены, ученик переходит на следующий. */
export function maybeLevelUp(p: Progress, lessons: { id: string; level: string }[], levels: string[]): Progress {
  const current = lessons.filter((l) => l.level === p.level);
  const allDone = current.length > 0 && current.every((l) => p.doneLessons.includes(l.id));
  const i = levels.indexOf(p.level);
  if (allDone && i >= 0 && i < levels.length - 1) return { ...p, level: levels[i + 1] };
  return p;
}
