// Подключение к ИИ (Claude) прямо с телефона, без своего сервера.
// Ключ API вводит сам пользователь в «Настройках», он хранится в защищённом
// хранилище телефона (SecureStore) и никуда, кроме Anthropic, не отправляется.
import Anthropic from "@anthropic-ai/sdk";
import * as SecureStore from "expo-secure-store";
import { isBeginner, LangId, LANGS } from "./lang";

const KEY_NAME = "anthropic_api_key";
export const MODEL = "claude-opus-5-5";

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEY_NAME);
}
export async function saveApiKey(key: string): Promise<void> {
  if (key.trim()) await SecureStore.setItemAsync(KEY_NAME, key.trim());
  else await SecureStore.deleteItemAsync(KEY_NAME);
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export class NoKeyError extends Error {
  constructor() {
    super("Добавьте ключ API в «Настройках», чтобы говорить с ИИ.");
  }
}

async function client(): Promise<Anthropic> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new NoKeyError();
  // dangerouslyAllowBrowser: библиотека предупреждает, что ключ находится
  // на устройстве. Здесь это осознанно: ключ принадлежит самому пользователю.
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

/** Один ответ ИИ на переписку. */
export async function askTeacher(
  system: string,
  messages: ChatMessage[],
  maxTokens = 2000,
): Promise<string> {
  return ask(system, messages, maxTokens);
}

/** Ответ ИИ по фотографии (вывеска, меню, страница учебника). */
export async function askPhotoJson<T>(system: string, prompt: string, base64: string, mediaType = "image/jpeg"): Promise<T> {
  const text = await ask(system + "\nОтвечай ТОЛЬКО одним JSON-объектом, без пояснений и без ```.", [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
      { type: "text", text: prompt },
    ],
  }], 3000);
  return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as T;
}

async function ask(system: string, messages: any[], maxTokens: number): Promise<string> {
  const c = await client();
  try {
    const res = await c.beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      output_config: { effort: "low" },
      // Если основная модель откажется отвечать, сервер сам попробует запасную.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    if (res.stop_reason === "refusal") {
      return "Извините, на это я ответить не могу. Давайте продолжим урок!";
    }
    return res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      throw new Error("Ключ API не подошёл. Проверьте его в «Настройках».");
    }
    if (e instanceof Anthropic.RateLimitError) {
      throw new Error("Слишком много запросов. Подождите минуту и попробуйте снова.");
    }
    if (e instanceof Anthropic.APIConnectionError) {
      throw new Error("Нет связи с ИИ. Проверьте интернет.");
    }
    throw e;
  }
}

/** Просим ИИ вернуть JSON (для проверки ответов и экзаменов). */
export async function askJson<T>(system: string, prompt: string): Promise<T> {
  const text = await askTeacher(
    system + "\nОтвечай ТОЛЬКО одним JSON-объектом, без пояснений и без ```.",
    [{ role: "user", content: prompt }],
    4000,
  );
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

export function teacherPrompt(lang: LangId, level: string, mode: string, weakSpots: string[] = []): string {
  const L = LANGS[lang];
  const beginner = isBeginner(lang, level);
  const weak = weakSpots.length
    ? `\n- The student often makes these mistakes: ${weakSpots.join("; ")}. Gently create chances to practise them and praise correct use.`
    : "";
  // Как писать на изучаемом языке.
  const script = lang === "ja"
    ? "Write Japanese in kana (common kanji allowed for N4+), followed by romaji in parentheses."
    : lang === "tr"
      ? (beginner
        ? "Write Turkish with correct letters (ç, ğ, ı, İ, ö, ş, ü), followed by its reading in Russian letters in parentheses (no accent marks)."
        : "Write Turkish with correct letters (ç, ğ, ı, İ, ö, ş, ü).")
      : "Write natural English.";
  const extra = lang === "ja"
    ? "- The student may answer in Russian, in romaji or in Japanese. Understand any of them and show how to say it correctly in Japanese."
    : lang === "tr"
      ? "- The student may answer in Russian or in Turkish, possibly without Turkish letters. Understand both and show how to say it correctly in Turkish.\n- Explain Turkish logic simply: suffixes stick to the word one after another, vowel harmony chooses -lar/-ler, -da/-de etc."
      : "- If the student writes in Russian, understand it and show how to say it in English.";
  return `You are Emma, a warm, lively ${L.nameEn} teacher in a mobile app for Russian speakers.
Student level: ${level}.
Lesson mode: ${mode}.
Reply format (always, for every reply):
1. First say everything in ${L.nameEn}, using words and grammar suited to the level (${beginner ? "very short, simple sentences" : "natural sentences"}). ${script}
2. Then a new line starting with "— " and the same message in natural spoken Russian${beginner ? ", plus a very short hint for a new word if needed" : ""}.
Rules:
- Keep it short: 1-3 sentences in ${L.nameEn}, and always end with a question or a task, so the conversation keeps going.
- When the student makes a mistake, add a final line starting with "✏️ " that shows the corrected sentence and a very short explanation in Russian.
${extra}
- Be warm and encouraging, never judgmental. Do not use markdown.${weak}`;
}
