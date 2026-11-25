// Личный словарь с интервальным повторением (система Лейтнера).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dayKey } from "./storage";
import { LangId } from "./lang";

export type Word = {
  id: string;
  lang: LangId;
  word: string; // на изучаемом языке
  reading?: string; // транскрипция или ромадзи
  translation: string;
  box: number; // 0..5: чем больше, тем лучше выучено
  due: string; // когда повторить, YYYY-MM-DD
  added: string;
  reviews?: number; // сколько раз повторяли
  lapses?: number; // сколько раз забыли
};

// Через сколько дней повторять слово в каждой «коробке».
const INTERVALS = [0, 1, 3, 7, 14, 30];
const KEY = "vocab_v1";

export async function loadVocab(): Promise<Word[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveVocab(words: Word[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
}

export function makeWord(lang: LangId, word: string, translation: string, reading?: string): Word {
  const t = dayKey();
  return { id: `${lang}:${word.trim().toLowerCase()}`, lang, word: word.trim(), reading: reading?.trim() || undefined,
    translation: translation.trim(), box: 0, due: t, added: t };
}

/** Добавляет слова, пропуская те, что уже есть в словаре. */
export function mergeWords(list: Word[], add: Word[]): Word[] {
  const ids = new Set(list.map((w) => w.id));
  return [...list, ...add.filter((w) => w.word && !ids.has(w.id) && (ids.add(w.id), true))];
}

export function isDue(w: Word): boolean {
  return w.due <= dayKey();
}

export function review(w: Word, remembered: boolean): Word {
  const box = remembered ? Math.min(w.box + 1, INTERVALS.length - 1) : 0;
  const due = dayKey(new Date(Date.now() + INTERVALS[box] * 86400000));
  return { ...w, box, due, reviews: (w.reviews ?? 0) + 1, lapses: (w.lapses ?? 0) + (remembered ? 0 : 1) };
}

export const LEARNED_BOX = 3;

export const isNew = (w: Word) => !w.reviews;
export const isLearned = (w: Word) => w.box >= LEARNED_BOX;
/** Сложное слово: забывали два раза и больше, и оно ещё не выучено. */
export const isHard = (w: Word) => (w.lapses ?? 0) >= 2 && !isLearned(w);

export type VocabFilter = "all" | "new" | "learning" | "learned" | "hard";
export const FILTERS: { id: VocabFilter; label: string; test: (w: Word) => boolean }[] = [
  { id: "all", label: "Все", test: () => true },
  { id: "new", label: "Новые", test: isNew },
  { id: "learning", label: "Изучаемые", test: (w) => !isNew(w) && !isLearned(w) },
  { id: "learned", label: "Выученные", test: isLearned },
  { id: "hard", label: "Сложные", test: isHard },
];

/**
 * Подборка дня от Emma: сначала сложные слова, потом те, что пора повторить
 * (от наименее знакомых), и немного новых. Не больше 15, чтобы не утомлять.
 */
export function dailyPick(words: Word[], max = 15): { list: Word[]; hard: number; due: number; fresh: number } {
  const due = words.filter(isDue);
  const hard = due.filter(isHard);
  const old = due.filter((w) => !isHard(w) && !isNew(w)).sort((a, b) => a.box - b.box || a.due.localeCompare(b.due));
  const fresh = due.filter(isNew);
  const freshCount = Math.min(fresh.length, Math.max(3, max - hard.length - old.length));
  const list = [...hard, ...old.slice(0, Math.max(0, max - hard.length - Math.min(3, fresh.length))), ...fresh.slice(0, freshCount)].slice(0, max);
  return { list, hard: list.filter(isHard).length, due: list.filter((w) => !isNew(w) && !isHard(w)).length, fresh: list.filter(isNew).length };
}
