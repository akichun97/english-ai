// Темы и задания. Новые уроки добавляются сюда и попадают в следующую сборку.
export type Exercise =
  | { kind: "choice"; question: string; options: string[]; answer: number; hint?: string }
  | { kind: "translate"; ru: string; example: string } // проверяет ИИ
  | { kind: "write"; task: string }; // свободный ответ, проверяет ИИ

export type Lesson = {
  id: string;
  title: string;
  emoji: string;
  level: string;
  theory: string;
  exercises: Exercise[];
};

export const LESSONS: Lesson[] = [
  {
    id: "greetings",
    title: "Знакомство",
    emoji: "👋",
    level: "A1",
    theory:
      "Hello / Hi — привет. Nice to meet you — приятно познакомиться.\nMy name is… — меня зовут… I'm from… — я из…",
    exercises: [
      { kind: "choice", question: "How do you answer “Nice to meet you”?", options: ["Nice to meet you too", "Goodbye", "I'm fine"], answer: 0 },
      { kind: "choice", question: "I ___ from Russia.", options: ["is", "am", "are"], answer: 1, hint: "I → am" },
      { kind: "translate", ru: "Меня зовут Анна, я из Москвы.", example: "My name is Anna, I'm from Moscow." },
      { kind: "write", task: "Напишите 2–3 предложения о себе по-английски." },
    ],
  },
  {
    id: "present-simple",
    title: "Present Simple",
    emoji: "⏰",
    level: "A2",
    theory:
      "Привычки и факты: I work, she works (+s для he/she/it).\nВопрос: Do you…? Does she…? Отрицание: I don't, he doesn't.",
    exercises: [
      { kind: "choice", question: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking"], answer: 1 },
      { kind: "choice", question: "___ you like football?", options: ["Does", "Are", "Do"], answer: 2 },
      { kind: "translate", ru: "Он не работает по выходным.", example: "He doesn't work on weekends." },
      { kind: "write", task: "Опишите свой обычный день (3–4 предложения)." },
    ],
  },
  {
    id: "travel",
    title: "Путешествия",
    emoji: "✈️",
    level: "A2",
    theory:
      "At the airport: boarding pass, gate, luggage, delayed.\nPolite requests: Could you help me…? Where is…?",
    exercises: [
      { kind: "choice", question: "Your flight is late. It is…", options: ["delayed", "boarded", "landed"], answer: 0 },
      { kind: "choice", question: "___ you tell me where gate 5 is?", options: ["Could", "Must", "Should"], answer: 0 },
      { kind: "translate", ru: "Где я могу забрать свой багаж?", example: "Where can I pick up my luggage?" },
      { kind: "write", task: "Попросите вежливо помочь найти отель (1–2 предложения)." },
    ],
  },
  {
    id: "past-simple",
    title: "Past Simple",
    emoji: "📖",
    level: "B1",
    theory:
      "Прошлое: worked, played; неправильные: went, saw, bought.\nВопрос: Did you…? Отрицание: I didn't go.",
    exercises: [
      { kind: "choice", question: "Yesterday I ___ to the cinema.", options: ["go", "went", "gone"], answer: 1 },
      { kind: "choice", question: "___ she call you last night?", options: ["Did", "Does", "Was"], answer: 0 },
      { kind: "translate", ru: "Мы не видели этот фильм.", example: "We didn't see this film." },
      { kind: "write", task: "Расскажите, что вы делали в прошлые выходные." },
    ],
  },
];
