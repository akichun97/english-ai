// Озвучка. Для японского новичку Emma говорит смесью русского и японского,
// поэтому японские куски читаем японским голосом, а остальное — русским.
import * as Speech from "expo-speech";
import { LangInfo } from "./lang";

const JA = /[぀-ヿ㐀-鿿ｦ-ﾟ々〜ー]+[぀-ヿ㐀-鿿　-〿！-～\s]*/g;

// Турецкий текст: латиница с турецкими буквами, без кириллицы.
const TR = /[A-Za-zÇĞİÖŞÜçğıöşüâî][^А-Яа-яЁё]*/g;

type Opts = { rate?: number; onDone?: () => void; onStop?: () => void };

export function stopSpeaking() {
  Speech.stop();
}

export function speak(text: string, lang: LangInfo, opts: Opts = {}) {
  Speech.stop();
  const rate = opts.rate ?? 0.95;
  if (lang.id === "en") {
    Speech.speak(text, { language: lang.speech, rate, onDone: opts.onDone, onStopped: opts.onStop, onError: opts.onStop });
    return;
  }
  // Убираем подсказку к чтению в скобках: ромадзи для японского, русские буквы для турецкого.
  const clean = lang.id === "ja"
    ? text.replace(/\(([A-Za-zāīūēōĀĪŪĒŌ' ,.\-]+)\)/g, "")
    : text.replace(/([A-Za-zÇĞİÖŞÜçğıöşüâî.!?,]\s?)\([а-яёА-ЯЁ\u0301\s-]+\)/g, "$1");
  // Куски на изучаемом языке читаем его голосом, русские — русским.
  const re = lang.id === "ja" ? JA : TR;
  const parts: { t: string; ja: boolean }[] = [];
  let last = 0;
  for (const m of clean.matchAll(re)) {
    if (m.index! > last) parts.push({ t: clean.slice(last, m.index), ja: false });
    parts.push({ t: m[0], ja: true });
    last = m.index! + m[0].length;
  }
  if (last < clean.length) parts.push({ t: clean.slice(last), ja: false });
  const spoken = parts.filter((x) => x.t.replace(/[\s\p{P}—–-]/gu, "").length > 0);
  if (!spoken.length) { opts.onDone?.(); return; }
  spoken.forEach((x, i) =>
    Speech.speak(x.t, {
      language: x.ja ? lang.speech : "ru-RU",
      rate: x.ja ? rate * 0.9 : rate,
      onDone: i === spoken.length - 1 ? opts.onDone : undefined,
      onStopped: i === spoken.length - 1 ? opts.onStop : undefined,
      onError: opts.onStop,
    }),
  );
}
