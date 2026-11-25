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
  return { ...w, box, due };
}

export const LEARNED_BOX = 3;
