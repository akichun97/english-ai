// Общее состояние приложения: прогресс, словарь, текущий язык.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Achievement, newAchievements } from "./achievements";
import { LangInfo, LANGS } from "./lang";
import { addXp, cur, loadProgress, Progress, saveProgress, today } from "./storage";
import { loadVocab, makeWord, mergeWords, saveVocab, Word } from "./vocab";
import { scheduleReminders } from "./reminders";

type Ctx = {
  p: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  gainXp: (xp: number) => void;
  lang: LangInfo;
  level: string;
  words: Word[]; // все слова; для текущего языка — langWords
  langWords: Word[];
  setWords: (fn: (w: Word[]) => Word[]) => void;
  addWords: (items: { word: string; translation: string; reading?: string }[]) => number;
  unlocked: Achievement | null; // только что полученное достижение
};

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp вне AppProvider");
  return c;
}

export function AppProvider({ children, fallback }: { children: (p: Progress) => React.ReactNode; fallback?: React.ReactNode }) {
  const [p, setP] = useState<Progress | null>(null);
  const [words, setW] = useState<Word[]>([]);
  const [unlocked, setUnlocked] = useState<Achievement | null>(null);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    Promise.all([loadProgress(), loadVocab()]).then(([pp, ww]) => { setW(ww); setP(pp); });
  }, []);

  // Проверяем достижения после каждого изменения прогресса или словаря.
  useEffect(() => {
    if (!p) return;
    const fresh = newAchievements(p, words);
    if (fresh.length) {
      update((x) => ({ ...x, achievements: [...x.achievements, ...fresh.map((a) => a.id)] }));
      setUnlocked(fresh[0]);
      setTimeout(() => setUnlocked(null), 4000);
    }
  }, [p, words]);

  // Перепланируем напоминания, когда меняется цель, час или сегодняшний опыт.
  const goalDone = p ? today(p).xp >= p.dailyGoal : false;
  useEffect(() => { if (p) scheduleReminders(p); }, [p?.reminderHour, p?.dailyGoal, goalDone]);

  function update(fn: (p: Progress) => Progress) {
    setP((old) => {
      if (!old) return old;
      const n = fn(old);
      saveProgress(n);
      return n;
    });
  }

  function setWords(fn: (w: Word[]) => Word[]) {
    setW((old) => {
      const n = fn(old);
      saveVocab(n);
      return n;
    });
  }

  if (!p) return <>{fallback}</>;

  const lang = LANGS[p.lang];
  const ctx: Ctx = {
    p,
    update,
    gainXp: (xp) => update((x) => addXp(x, xp)),
    lang,
    level: cur(p).level,
    words,
    langWords: words.filter((w) => w.lang === p.lang),
    setWords,
    addWords: (items) => {
      const add = items.filter((i) => i.word && i.translation).map((i) => makeWord(p.lang, i.word, i.translation, i.reading));
      const before = wordsRef.current.length;
      const merged = mergeWords(wordsRef.current, add);
      setWords(() => merged);
      return merged.length - before;
    },
    unlocked,
  };
  return <AppCtx.Provider value={ctx}>{children(p)}</AppCtx.Provider>;
}
