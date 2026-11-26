// Общее состояние приложения: прогресс, словарь, ошибки, текущий язык.
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { newAchievements, newOutfits } from "./achievements";
import { outfit } from "./emma";
import { LangInfo, LANGS } from "./lang";
import { addDay, addXp, cur, goalStatus, loadProgress, Progress, saveProgress } from "./storage";
import { loadVocab, makeWord, mergeWords, saveVocab, Word } from "./vocab";
import { loadMistakes, mergeMistakes, Mistake, saveMistakes, topMistakes } from "./mistakes";
import { scheduleReminders } from "./reminders";
import { Scene } from "./data/scenes";
import { setVoicePrefs } from "./voice";

export type Notice = { title: string; desc: string };

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
  mistakes: Mistake[]; // ошибки по текущему языку
  setMistakes: (fn: (m: Mistake[]) => Mistake[]) => void;
  addMistakes: (items: { topic?: string; wrong: string; right: string; why: string }[]) => void;
  weakSpots: string[]; // частые ошибки для подсказки Emma
  unlocked: Notice | null; // только что полученное достижение или образ
  scene: Scene | null; // ролевая сценка, которую нужно открыть в разговоре
  setScene: (s: Scene | null) => void;
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
  const [mistakes, setM] = useState<Mistake[]>([]);
  const [unlocked, setUnlocked] = useState<Notice | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    Promise.all([loadProgress(), loadVocab(), loadMistakes()]).then(([pp, ww, mm]) => { setW(ww); setM(mm); setP(pp); });
  }, []);

  // Время в приложении: пока оно на экране, каждую минуту добавляем минуту к сегодняшнему дню.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!timer) timer = setInterval(() => update((x) => addDay(x, { activeSec: 60 })), 60000); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    if (AppState.currentState === "active") start();
    const sub = AppState.addEventListener("change", (st) => (st === "active" ? start() : stop()));
    return () => { stop(); sub.remove(); };
  }, []);

  // Проверяем достижения и образы после каждого изменения прогресса или словаря.
  useEffect(() => {
    if (!p) return;
    const fresh = newAchievements(p, words);
    const looks = newOutfits(p, words);
    if (!fresh.length && !looks.length) return;
    update((x) => ({ ...x, achievements: [...x.achievements, ...fresh.map((a) => a.id)], outfits: [...x.outfits, ...looks] }));
    setUnlocked(looks.length
      ? { title: `Новый образ Emma: ${outfit(looks[0]).title}`, desc: "Выберите его в профиле." }
      : { title: `Новое достижение: ${fresh[0].title}`, desc: fresh[0].desc });
    setTimeout(() => setUnlocked(null), 4000);
  }, [p, words]);

  // Голос Emma: передаём выбор из профиля в модуль озвучки.
  useEffect(() => { if (p) setVoicePrefs(p.voices, p.voiceSpeed); }, [p?.voices, p?.voiceSpeed]);

  // Перепланируем напоминания, когда меняется цель, час или выполнение цели.
  const goalDone = p ? goalStatus(p).done : false;
  useEffect(() => { if (p) scheduleReminders(p); }, [p?.reminderHour, p?.dailyGoal, p?.dailyMinutes, p?.goalType, goalDone]);

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

  function setMistakes(fn: (m: Mistake[]) => Mistake[]) {
    setM((old) => {
      const n = fn(old);
      saveMistakes(n);
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
      const n = merged.length - before;
      if (n) update((x) => addDay(x, { words: n }));
      return n;
    },
    mistakes: mistakes.filter((m) => m.lang === p.lang),
    setMistakes,
    addMistakes: (items) => setMistakes((m) => mergeMistakes(m, p.lang, items)),
    weakSpots: topMistakes(mistakes, p.lang, 4).filter((m) => m.count >= 2).map((m) => `${m.topic} (e.g. "${m.wrong}" → "${m.right}")`),
    unlocked,
    scene,
    setScene,
  };
  return <AppCtx.Provider value={ctx}>{children(p)}</AppCtx.Provider>;
}
