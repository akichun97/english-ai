// Подключение к ИИ (Claude) прямо с телефона, без своего сервера.
// Ключ API вводит сам пользователь в «Настройках», он хранится в защищённом
// хранилище телефона (SecureStore) и никуда, кроме Anthropic, не отправляется.
import Anthropic from "@anthropic-ai/sdk";
import * as SecureStore from "expo-secure-store";

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

export function teacherPrompt(level: string, mode: string): string {
  return `You are Emma, a warm, patient English teacher in a mobile app for Russian speakers.
Student level (CEFR): ${level}. Lesson mode: ${mode}.
Rules:
- Talk mostly in English, using vocabulary and grammar suited to the student's level.
- Keep replies short (2-4 sentences) and always end with a question or a task, so the conversation keeps going.
- When the student makes a mistake, add a final line starting with "✏️ " that shows the corrected sentence and a very short explanation in Russian.
- If the student writes in Russian or asks for help, briefly explain in Russian, then return to English.
- Be encouraging, never judgmental.`;
}
