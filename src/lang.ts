// Языки, которые можно учить. Чтобы добавить язык: описать его здесь,
// добавить уроки в src/data и тест уровня в src/data/tests.ts.
export type LangId = "en" | "ja" | "tr";

export type LangInfo = {
  id: LangId;
  name: string; // по-русски
  nameEn: string; // для подсказок ИИ
  speech: string; // язык озвучки и распознавания речи
  levels: string[];
  levelNames: Record<string, string>;
  readingLabel: string; // как называется подсказка к чтению
  placeholder: string;
  icon: string; // буквы на значке языка
  tagline: string; // подпись при выборе языка
  readingHint: string; // как ИИ пишет подсказку к чтению
  pronIssues: string; // типичные трудности произношения у русскоговорящих
  soundFormat: string; // как ИИ записывает звук
  micLabel: string; // «Говорю по-…»
  chatIntro: string; // первое сообщение Emma в чате
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
    icon: "Aa",
    tagline: "От A1 до C1, разговор и экзамены",
    readingHint: "транскрипция IPA",
    pronIssues: "th, w/v, r, h, долгие и краткие гласные, æ, оглушение конечных согласных",
    soundFormat: "звук в IPA, например /θ/",
    micLabel: "Говорю по-английски",
    chatIntro: "Привет! Я Emma. Пиши мне по-английски или поговорим голосом. Я поправлю ошибки и объясню их по-русски.",
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
    icon: "あ",
    tagline: "С нуля: азбука, приветствия, первые фразы",
    readingHint: "ромадзи",
    pronIssues: "долгие гласные, удвоенные согласные っ, ら-ряд, ん, ふ",
    soundFormat: "кана и ромадзи",
    micLabel: "Говорю по-японски",
    chatIntro: "Привет! Я Emma. Отвечай как удобно: по-японски, латиницей или по-русски. Я покажу, как сказать правильно.",
  },
  tr: {
    id: "tr",
    name: "Турецкий",
    nameEn: "Turkish",
    speech: "tr-TR",
    levels: ["A1", "A2", "B1", "B2", "C1"],
    levelNames: { A1: "Начальный", A2: "Элементарный", B1: "Средний", B2: "Выше среднего", C1: "Продвинутый" },
    readingLabel: "Чтение",
    placeholder: "Türkçe yazın veya по-русски…",
    icon: "Ğğ",
    tagline: "С нуля: латиница, приветствия, разговор",
    readingHint: "чтение русскими буквами, например мерхаба",
    pronIssues: "ı (как «ы»), ö и ü, ğ (удлиняет гласную), мягкое l, ударение на последний слог, c — «дж», ç — «ч», ş — «ш»",
    soundFormat: "турецкая буква и как она звучит, например ı — «ы»",
    micLabel: "Говорю по-турецки",
    chatIntro: "Merhaba! Я Emma. Пиши мне по-турецки или по-русски, можно и голосом. Я покажу, как сказать правильно, и объясню по-русски.",
  },
};

export const LANG_LIST: LangInfo[] = [LANGS.en, LANGS.ja, LANGS.tr];

/** Новичок: Emma говорит в основном по-русски. */
export function isBeginner(lang: LangId, level: string): boolean {
  return LANGS[lang].levels.indexOf(level) <= 1;
}
