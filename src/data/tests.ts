// Стартовые тесты на уровень: по 3 вопроса на каждый уровень.
import { LangId, LANGS } from "../lang";

export type TestQuestion = { level: string; q: string; options: string[]; answer: number };

const PLACEMENT_EN: TestQuestion[] = [
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

const PLACEMENT_JA: TestQuestion[] = [
  { level: "N5", q: "Как вежливо сказать «спасибо»?", options: ["すみません", "ありがとうございます", "さようなら"], answer: 1 },
  { level: "N5", q: "わたし ＿ がくせいです。", options: ["を", "に", "は"], answer: 2 },
  { level: "N5", q: "Как читается «さ»?", options: ["sa", "ki", "su"], answer: 0 },
  { level: "N4", q: "きのう えいがを ＿。", options: ["みます", "みました", "みる"], answer: 1 },
  { level: "N4", q: "にほんごを はなす ことが ＿。", options: ["あります", "します", "できます"], answer: 2 },
  { level: "N4", q: "あめが ふって いる ＿、かさを もって いきます。", options: ["から", "けど", "のに"], answer: 0 },
  { level: "N3", q: "この本は 読み＿ です。(легко читать)", options: ["たい", "やすい", "ながら"], answer: 1 },
  { level: "N3", q: "雨が 降り＿ だ。(вот-вот пойдёт дождь)", options: ["らしい", "よう", "そう"], answer: 2 },
  { level: "N3", q: "彼は 来ない ＿ しれない。", options: ["かも", "はず", "べき"], answer: 0 },
];

export const PLACEMENT: Record<LangId, TestQuestion[]> = { en: PLACEMENT_EN, ja: PLACEMENT_JA };

export const EXAMS: Record<LangId, { id: string; title: string; desc: string }[]> = {
  en: [
    { id: "ielts", title: "IELTS (Speaking/Writing)", desc: "Тренировка в формате IELTS" },
    { id: "toefl", title: "TOEFL", desc: "Академический английский" },
    { id: "ege", title: "ЕГЭ по английскому", desc: "Задания в стиле ЕГЭ" },
    { id: "general", title: "Проверка по уровню", desc: "Экзамен по вашему уровню" },
  ],
  ja: [
    { id: "jlpt-n5", title: "JLPT N5", desc: "Первый уровень экзамена по японскому" },
    { id: "jlpt-n4", title: "JLPT N4", desc: "Базовая грамматика и слова" },
    { id: "general", title: "Проверка по уровню", desc: "Экзамен по вашему уровню" },
  ],
};

/** Уровень = самый высокий, на котором верно хотя бы 2 из 3 (и на всех уровнях ниже тоже). */
export function levelFromScore(correctByLevel: Record<string, number>, lang: LangId = "en"): string {
  const levels = LANGS[lang].levels;
  let result = levels[0];
  for (const l of levels) {
    if ((correctByLevel[l] ?? 0) >= 2) result = l;
    else break;
  }
  return result;
}

export function levelIndex(l: string, lang: LangId = "en"): number {
  return Math.max(0, LANGS[lang].levels.indexOf(l));
}
