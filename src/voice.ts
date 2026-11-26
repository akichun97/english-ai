// Озвучка Emma.
//
// Важно: на Android expo-speech не понимает коды вида "en-US" в поле language
// и молча включает голос системы (у русскоязычного телефона — русский). Из-за
// этого Emma читала английский русским голосом, с сильным акцентом. Поэтому мы
// сами выбираем конкретный голос по имени и передаём его в voice, а в language
// кладём только короткий код ("en", "ja", "ru"), который expo-speech понимает.
//
// Смешанный текст (английский или японский вперемешку с русскими объяснениями)
// режем на куски и каждый читаем голосом своего языка.
import * as Speech from "expo-speech";
import { Linking, Platform } from "react-native";
import { LangInfo } from "./lang";

export type VoiceLang = "en" | "ja" | "ru" | "tr";
export type VoiceOption = { id: string; label: string; region: string; good: boolean; online: boolean };

const JA = /[぀-ヿ㐀-鿿ｦ-ﾟ々〜ー]+[぀-ヿ㐀-鿿　-〿！-～\s]*/g;
const RU = /[А-Яа-яЁё]+[А-Яа-яЁё0-9\s,.!?:;«»"'()—–-]*/g;

const SAMPLES: Record<VoiceLang, string> = {
  en: "Hi! I'm Emma. Let's practice English together. How was your day?",
  ja: "こんにちは、エマです。一緒に日本語を練習しましょう。",
  ru: "Привет! Я Эмма. Давай заниматься вместе.",
  tr: "Merhaba! Ben Emma. Birlikte Türkçe çalışalım. Bugün nasılsın?",
};

// Женские голоса известных движков (Google, Samsung). Emma — девушка.
const FEMALE = /(sfg|tpf|tpc|iob|iog|gba|gbc|gbg|htm|jab|dfc|smtf|female|samantha|karen|kyoko|milena)/i;
const MALE = /(iol|iom|tpd|rjs|gbb|gbd|jac|jad|smtm|male)/i;

const REGIONS: Record<string, string> = {
  US: "США", GB: "Британия", AU: "Австралия", CA: "Канада", IE: "Ирландия", NZ: "Новая Зеландия",
  IN: "Индия", NG: "Нигерия", ZA: "ЮАР", JP: "Япония", RU: "Россия", TR: "Турция",
};
// Чем выше, тем лучше: американский и британский акцент — эталон для ученика.
const REGION_SCORE: Record<string, number> = { US: 30, GB: 26, AU: 12, CA: 12, IE: 8, NZ: 8, JP: 30, RU: 30, TR: 30 };

let prefs: Record<string, string> = {};
let speed = 1;
let voices: Speech.Voice[] = [];
let loading: Promise<Speech.Voice[]> | null = null;

export function setVoicePrefs(v: Record<string, string> | undefined, s: number | undefined) {
  prefs = v ?? {};
  speed = s ?? 1;
}

/** Список голосов телефона. Движок речи может проснуться не сразу, поэтому пустой ответ не запоминаем. */
export function loadVoices(): Promise<Speech.Voice[]> {
  if (voices.length) return Promise.resolve(voices);
  if (!loading) {
    loading = Speech.getAvailableVoicesAsync()
      .catch(() => [] as Speech.Voice[])
      .then((v) => { voices = v; loading = null; return v; });
  }
  return loading;
}
loadVoices();

function region(v: Speech.Voice): string {
  return (v.language.split(/[-_]/)[1] ?? "").toUpperCase();
}
const isOnline = (v: Speech.Voice) => /network|online/i.test(v.identifier);

function score(v: Speech.Voice): number {
  let n = REGION_SCORE[region(v)] ?? 0;
  if (v.quality === Speech.VoiceQuality.Enhanced) n += 10;
  if (FEMALE.test(v.identifier) || FEMALE.test(v.name)) n += 6;
  else if (MALE.test(v.identifier) || MALE.test(v.name)) n -= 3;
  // Сетевые голоса Google звучат заметно живее, а Emma и так работает только с интернетом.
  if (isOnline(v)) n += 4;
  return n;
}

function forLang(code: VoiceLang): Speech.Voice[] {
  return voices
    .filter((v) => v.language.toLowerCase().split(/[-_]/)[0] === code)
    .sort((a, b) => score(b) - score(a));
}

/** Голоса для выбора в профиле: лучшие сверху, с понятными подписями. */
export async function voiceOptions(code: VoiceLang): Promise<VoiceOption[]> {
  await loadVoices();
  const list = forLang(code).filter((v) => (REGION_SCORE[region(v)] ?? 0) > 0).slice(0, 8);
  const count: Record<string, number> = {};
  return list.map((v) => {
    const r = region(v);
    count[r] = (count[r] ?? 0) + 1;
    const g = FEMALE.test(v.identifier) || FEMALE.test(v.name) ? " ♀" : MALE.test(v.identifier) || MALE.test(v.name) ? " ♂" : "";
    return {
      id: v.identifier,
      label: `${REGIONS[r] ?? r} ${count[r]}${g}`,
      region: r,
      good: v.quality === Speech.VoiceQuality.Enhanced,
      online: isOnline(v),
    };
  });
}

function pickVoice(code: VoiceLang): string | undefined {
  const mine = prefs[code];
  if (mine && (!voices.length || voices.some((v) => v.identifier === mine))) return mine;
  return forLang(code)[0]?.identifier;
}

/** Есть ли на телефоне голос нужного языка (если список голосов вообще удалось получить). */
export async function hasVoice(code: VoiceLang): Promise<boolean> {
  const v = await loadVoices();
  return !v.length || forLang(code).length > 0;
}

/** Открыть системные настройки синтеза речи, чтобы скачать голоса. */
export function openTtsSettings() {
  if (Platform.OS === "android") {
    Linking.sendIntent("com.android.settings.TTS_SETTINGS").catch(() => Linking.openSettings());
  } else {
    Linking.openSettings();
  }
}

export function stopSpeaking() {
  Speech.stop();
}

/** Послушать голос в профиле. */
export async function previewVoice(code: VoiceLang, id: string | undefined, rate = 1) {
  await loadVoices();
  Speech.stop();
  Speech.speak(SAMPLES[code], { language: code, voice: id ?? pickVoice(code), rate: 0.95 * rate, pitch: 1 });
}

type Opts = { rate?: number; onDone?: () => void; onStop?: () => void };

/**
 * Японский текст для озвучки: убираем ромадзи (латиницу) и чтение кандзи в скобках,
 * иначе голос читает одно и то же дважды, да ещё и латиницу.
 */
export function cleanJa(text: string): string {
  return text
    .replace(/[(（][^()（）]*[A-Za-z][^()（）]*[)）]/g, "") // (Konnichiwa! Ema desu.)
    .replace(/([㐀-鿿々])[（(][぀-ゟ゠-ヿー]+[）)]/g, "$1") // 今日（きょう） → 今日
    .replace(/[A-Za-zāīūēōĀĪŪĒŌ]+(?:[\s'’,.!?-]+[A-Za-zāīūēōĀĪŪĒŌ]+)*[.!?]?/g, " ") // оставшаяся латиница
    .replace(/[ \t]{2,}/g, " ");
}

function split(text: string, re: RegExp, inside: VoiceLang, outside: VoiceLang) {
  const parts: { t: string; code: VoiceLang }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push({ t: text.slice(last, m.index), code: outside });
    parts.push({ t: m[0], code: inside });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push({ t: text.slice(last), code: outside });
  return parts;
}

export function speak(text: string, lang: LangInfo, opts: Opts = {}) {
  Speech.stop();
  const rate = (opts.rate ?? 0.95) * speed;
  let parts: { t: string; code: VoiceLang }[];
  if (lang.id === "ja") {
    parts = split(cleanJa(text), JA, "ja", "ru");
  } else if (lang.id === "tr") {
    // Чтение русскими буквами в скобках после турецкой фразы не произносим.
    const clean = text.replace(/([A-Za-zÇĞİÖŞÜçğıöşüâî.!?,]\s?)\([а-яёА-ЯЁ\s-]+\)/g, "$1");
    parts = split(clean, RU, "ru", "tr");
  } else {
    parts = split(text, RU, "ru", "en");
  }
  const spoken = parts.filter((x) => x.t.replace(/[\s\p{P}—–-]/gu, "").length > 0);
  if (!spoken.length) { opts.onDone?.(); return; }
  const go = () =>
    spoken.forEach((x, i) =>
      Speech.speak(x.t, {
        language: x.code,
        voice: pickVoice(x.code),
        pitch: 1,
        rate: x.code === "ja" ? rate * 0.9 : rate,
        onDone: i === spoken.length - 1 ? opts.onDone : undefined,
        onStopped: i === spoken.length - 1 ? opts.onStop : undefined,
        onError: opts.onStop,
      }),
    );
  // Список голосов обычно уже загружен; если нет — ждём его, чтобы не заговорить чужим голосом.
  if (voices.length) go();
  else loadVoices().then(go);
}
