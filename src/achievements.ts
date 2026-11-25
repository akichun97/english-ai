// Достижения и образы Emma. Образ открывается, когда выполнены все его условия.
import { LEARNED_BOX, Word } from "./vocab";
import { goalStatus, Progress } from "./storage";

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  done: (p: Progress, words: Word[]) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", title: "Первый шаг", desc: "Пройти первый урок", done: (p) => p.doneLessons.length >= 1 },
  { id: "goal", title: "Цель дня", desc: "Выполнить дневную цель", done: (p) => Object.values(p.history).some((d) => goalStatus(p, d).done) },
  { id: "streak3", title: "Три дня подряд", desc: "Заниматься 3 дня подряд", done: (p) => p.streak >= 3 },
  { id: "voice1", title: "Первый разговор", desc: "Провести голосовой урок с Emma", done: (p) => p.counters.voiceLessons >= 1 },
  { id: "words20", title: "Копилка слов", desc: "Собрать 20 слов в словаре", done: (_, w) => w.length >= 20 },
  { id: "learned10", title: "Запомнил!", desc: "Выучить 10 слов", done: (_, w) => learnedCount(w) >= 10 },
  { id: "pron90", title: "Чистое произношение", desc: "Набрать 90% в тренажёре", done: (p) => p.counters.bestPron >= 90 },
  { id: "listen", title: "Внимательный слушатель", desc: "Ответить на все вопросы аудирования", done: (p) => p.counters.perfectListening >= 1 },
  { id: "streak7", title: "Неделя без пропусков", desc: "Заниматься 7 дней подряд", done: (p) => p.streak >= 7 },
  { id: "xp500", title: "500 XP", desc: "Набрать 500 очков опыта", done: (p) => p.xp >= 500 },
  { id: "polyglot", title: "Полиглот", desc: "Начать учить второй язык", done: (p) => Object.keys(p.langs).length >= 2 },
];

const learnedCount = (w: Word[]) => w.filter((x) => x.box >= LEARNED_BOX).length;
const voiceMinutes = (p: Progress) => Math.floor(Object.values(p.history).reduce((a, d) => a + d.voiceSec, 0) / 60);
const studyDays = (p: Progress) => Object.values(p.history).filter((d) => d.xp > 0).length;

/** Условие открытия образа: подпись, текущее значение и сколько нужно. */
type Cond = { label: string; value: (p: Progress, w: Word[]) => number; need: number };

export const OUTFIT_RULES: { outfit: string; conds: Cond[] }[] = [
  { outfit: "glasses", conds: [
    { label: "Пройти уроков", value: (p) => p.doneLessons.length, need: 3 },
    { label: "Собрать слов в словаре", value: (_, w) => w.length, need: 20 },
    { label: "Дней подряд", value: (p) => p.streak, need: 3 },
  ] },
  { outfit: "beret", conds: [
    { label: "Голосовых уроков с Emma", value: (p) => p.counters.voiceLessons, need: 3 },
    { label: "Минут разговора", value: voiceMinutes, need: 30 },
    { label: "Дней подряд", value: (p) => p.streak, need: 7 },
  ] },
  { outfit: "jacket", conds: [
    { label: "Очков опыта", value: (p) => p.xp, need: 500 },
    { label: "Выучить слов", value: (_, w) => learnedCount(w), need: 10 },
    { label: "Лучшее произношение, %", value: (p) => p.counters.bestPron, need: 90 },
    { label: "Дней занятий всего", value: studyDays, need: 14 },
  ] },
];

/** Возвращает только что полученные достижения. */
export function newAchievements(p: Progress, words: Word[]): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id) && a.done(p, words));
}

/** Образы, условия которых только что выполнены. */
export function newOutfits(p: Progress, words: Word[]): string[] {
  return OUTFIT_RULES.filter((r) => !p.outfits.includes(r.outfit) && r.conds.every((c) => c.value(p, words) >= c.need)).map((r) => r.outfit);
}

export function unlockedOutfits(p: Progress): string[] {
  return p.outfits;
}
