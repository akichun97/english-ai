// Языки, которые можно учить. Чтобы добавить язык: описать его здесь,
// добавить уроки в src/data и тест уровня в src/data/tests.ts.
export type LangId = "en" | "ja";

export type LangInfo = {
  id: LangId;
  name: string; // по-русски
  nameEn: string; // для подсказок ИИ
  speech: string; // язык озвучки и распознавания речи
  levels: string[];
  levelNames: Record<string, string>;
  readingLabel: string; // как называется подсказка к чтению
  placeholder: string;
};

export const LANGS: Record<LangId, LangInfo> = {
  en: {
    id: "en",
    name: "Английский",
    nameEn: "English",
    speech: "en-US",
    levels: ["A1", "A2", "B1", "B2", "C1"],
    levelNames: { A1: "Начальный", A2: "Элементарный", B1: "Средний", B2: "Выше среднего", C1: "Продвинутый" },
    readingLabel: "Транскрипция",
    placeholder: "Type in English…",
  },
  ja: {
    id: "ja",
    name: "Японский",
    nameEn: "Japanese",
    speech: "ja-JP",
    levels: ["N5", "N4", "N3", "N2", "N1"],
    levelNames: { N5: "Начальный", N4: "Базовый", N3: "Средний", N2: "Выше среднего", N1: "Продвинутый" },
    readingLabel: "Чтение (ромадзи)",
    placeholder: "Пишите по-японски, латиницей или по-русски…",
  },
};

export const LANG_LIST: LangInfo[] = [LANGS.en, LANGS.ja];

/** Новичок: Emma говорит в основном по-русски. */
export function isBeginner(lang: LangId, level: string): boolean {
  return LANGS[lang].levels.indexOf(level) <= 1;
}
