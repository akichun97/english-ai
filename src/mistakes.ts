// Память ошибок: Emma запоминает, где ученик ошибается чаще всего.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dayKey } from "./storage";
import { LangId } from "./lang";

export type Mistake = {
  id: string;
  lang: LangId;
  topic: string; // тема ошибки, например «Артикли a/an»
  wrong: string; // как сказал ученик (последний случай)
  right: string; // как правильно
  why: string; // коротко почему
  count: number; // сколько раз встречалась
  last: string; // YYYY-MM-DD
  fixed?: number; // сколько раз ученик потом правильно сделал упражнение
};

const KEY = "mistakes_v1";

export async function loadMistakes(): Promise<Mistake[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMistakes(list: Mistake[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

const topicId = (lang: LangId, topic: string) => `${lang}:${topic.trim().toLowerCase()}`;

/** Добавляет ошибки: одинаковая тема — счётчик растёт, пример обновляется. */
export function mergeMistakes(list: Mistake[], lang: LangId, add: { topic?: string; wrong: string; right: string; why: string }[]): Mistake[] {
  const out = [...list];
  for (const a of add) {
    if (!a.wrong || !a.right) continue;
    const topic = (a.topic || "Разное").trim();
    const id = topicId(lang, topic);
    const i = out.findIndex((m) => m.id === id);
    if (i >= 0) out[i] = { ...out[i], wrong: a.wrong, right: a.right, why: a.why || out[i].why, count: out[i].count + 1, last: dayKey() };
    else out.push({ id, lang, topic, wrong: a.wrong, right: a.right, why: a.why, count: 1, last: dayKey() });
  }
  return out;
}

/** Самые частые ошибки, чтобы Emma обращала на них внимание в разговоре. */
export function topMistakes(list: Mistake[], lang: LangId, n = 5): Mistake[] {
  return list.filter((m) => m.lang === lang).sort((a, b) => b.count - (b.fixed ?? 0) - (a.count - (a.fixed ?? 0))).slice(0, n);
}
