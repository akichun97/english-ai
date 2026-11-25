// Стартовый тест на уровень: по 3 вопроса на каждый уровень CEFR (A1–C1).
export type TestQuestion = { level: string; q: string; options: string[]; answer: number };

export const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export const LEVEL_NAMES: Record<string, string> = {
  A1: "Начальный",
  A2: "Элементарный",
  B1: "Средний",
  B2: "Выше среднего",
  C1: "Продвинутый",
};

export const PLACEMENT_TEST: TestQuestion[] = [
  { level: "A1", q: "They ___ students.", options: ["is", "are", "am"], answer: 1 },
  { level: "A1", q: "I have two ___.", options: ["child", "childs", "children"], answer: 2 },
  { level: "A1", q: "___ is your name?", options: ["What", "Who", "Where"], answer: 0 },
  { level: "A2", q: "She ___ TV right now.", options: ["watches", "is watching", "watched"], answer: 1 },
  { level: "A2", q: "This is the ___ book I've ever read.", options: ["good", "better", "best"], answer: 2 },
  { level: "A2", q: "We ___ to Paris last summer.", options: ["go", "went", "have gone"], answer: 1 },
  { level: "B1", q: "If it rains, we ___ at home.", options: ["stay", "will stay", "stayed"], answer: 1 },
  { level: "B1", q: "I've lived here ___ 2015.", options: ["for", "since", "from"], answer: 1 },
  { level: "B1", q: "You ___ wear a uniform; it's optional.", options: ["mustn't", "don't have to", "can't"], answer: 1 },
  { level: "B2", q: "If I ___ you, I would apologise.", options: ["am", "was", "were"], answer: 2 },
  { level: "B2", q: "The report ___ by Friday.", options: ["must finish", "must be finished", "must finishing"], answer: 1 },
  { level: "B2", q: "I wish I ___ more time yesterday.", options: ["had", "had had", "would have"], answer: 1 },
  { level: "C1", q: "Hardly ___ the house when it started to rain.", options: ["I had left", "had I left", "I left"], answer: 1 },
  { level: "C1", q: "He denied ___ the money.", options: ["to take", "taking", "take"], answer: 1 },
  { level: "C1", q: "The proposal was met with widespread ___.", options: ["scepticism", "sceptic", "sceptically"], answer: 0 },
];

export const EXAMS = [
  { id: "ielts", title: "IELTS (Speaking/Writing)", desc: "Тренировка в формате IELTS" },
  { id: "toefl", title: "TOEFL", desc: "Академический английский" },
  { id: "ege", title: "ЕГЭ по английскому", desc: "Задания в стиле ЕГЭ" },
  { id: "general", title: "Проверка по уровню", desc: "Экзамен по вашему уровню CEFR" },
];

/** Уровень = самый высокий, на котором верно хотя бы 2 из 3 (и на всех уровнях ниже тоже). */
export function levelFromScore(correctByLevel: Record<string, number>): string {
  let result = "A1";
  for (const l of LEVELS) {
    if ((correctByLevel[l] ?? 0) >= 2) result = l;
    else break;
  }
  return result;
}

export function levelIndex(l: string): number {
  return Math.max(0, LEVELS.indexOf(l));
}
