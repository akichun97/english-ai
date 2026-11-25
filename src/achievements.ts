// Достижения. Некоторые открывают новые образы Emma.
import { LEARNED_BOX, Word } from "./vocab";
import { Progress } from "./storage";

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  outfit?: string; // какой образ Emma открывает
  done: (p: Progress, words: Word[]) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", title: "Первый шаг", desc: "Пройти первый урок", done: (p) => p.doneLessons.length >= 1 },
  { id: "goal", title: "Цель дня", desc: "Выполнить дневную цель", done: (p) => Object.values(p.history).some((d) => d.xp >= p.dailyGoal) },
  { id: "streak3", title: "Три дня подряд", desc: "Заниматься 3 дня подряд", outfit: "glasses", done: (p) => p.streak >= 3 },
  { id: "voice1", title: "Первый разговор", desc: "Провести голосовой урок с Emma", done: (p) => p.counters.voiceLessons >= 1 },
  { id: "words20", title: "Копилка слов", desc: "Собрать 20 слов в словаре", done: (_, w) => w.length >= 20 },
  { id: "learned10", title: "Запомнил!", desc: "Выучить 10 слов", done: (_, w) => w.filter((x) => x.box >= LEARNED_BOX).length >= 10 },
  { id: "pron90", title: "Чистое произношение", desc: "Набрать 90% в тренажёре", done: (p) => p.counters.bestPron >= 90 },
  { id: "listen", title: "Внимательный слушатель", desc: "Ответить на все вопросы аудирования", done: (p) => p.counters.perfectListening >= 1 },
  { id: "streak7", title: "Неделя без пропусков", desc: "Заниматься 7 дней подряд", outfit: "beret", done: (p) => p.streak >= 7 },
  { id: "xp500", title: "500 XP", desc: "Набрать 500 очков опыта", outfit: "jacket", done: (p) => p.xp >= 500 },
  { id: "polyglot", title: "Полиглот", desc: "Начать учить второй язык", done: (p) => Object.keys(p.langs).length >= 2 },
];

/** Возвращает только что полученные достижения. */
export function newAchievements(p: Progress, words: Word[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.done(p, words));
}

export function unlockedOutfits(p: Progress): string[] {
  return ["default", ...ACHIEVEMENTS.filter((a) => a.outfit && p.achievements.includes(a.id)).map((a) => a.outfit!)];
}
