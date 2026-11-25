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
  {
    id: "food",
    title: "Еда и кафе",
    emoji: "🍕",
    level: "A1",
    theory:
      "I'd like… — я бы хотел… Can I have…? — можно мне…?\nбыть голодным — to be hungry, счёт — the bill.",
    exercises: [
      { kind: "choice", question: "I'm ___. Let's eat!", options: ["hungry", "angry", "happy"], answer: 0 },
      { kind: "choice", question: "Can I ___ the bill, please?", options: ["make", "have", "do"], answer: 1 },
      { kind: "translate", ru: "Я бы хотел чашку чая.", example: "I'd like a cup of tea." },
      { kind: "write", task: "Закажите обед в кафе (2 предложения)." },
    ],
  },
  {
    id: "present-perfect",
    title: "Present Perfect",
    emoji: "✅",
    level: "B1",
    theory:
      "Опыт и результат к настоящему: I have seen, she has finished.\never / never / already / yet / since / for.",
    exercises: [
      { kind: "choice", question: "Have you ___ been to London?", options: ["ever", "yet", "already"], answer: 0 },
      { kind: "choice", question: "She ___ her homework already.", options: ["did", "has done", "does"], answer: 1 },
      { kind: "translate", ru: "Я никогда не пробовал суши.", example: "I have never tried sushi." },
      { kind: "write", task: "Напишите 3 вещи, которые вы уже сделали в этом году." },
    ],
  },
  {
    id: "conditionals",
    title: "Условные предложения",
    emoji: "🔀",
    level: "B2",
    theory:
      "2-й тип (нереальное сейчас): If I had money, I would travel.\n3-й тип (прошлое): If I had known, I would have come.",
    exercises: [
      { kind: "choice", question: "If I ___ rich, I would buy a boat.", options: ["am", "were", "will be"], answer: 1 },
      { kind: "choice", question: "If she had studied, she ___ the exam.", options: ["would pass", "would have passed", "passed"], answer: 1 },
      { kind: "translate", ru: "Если бы я знал, я бы тебе помог.", example: "If I had known, I would have helped you." },
      { kind: "write", task: "Что бы вы сделали, если бы выиграли миллион? (3 предложения)" },
    ],
  },
  {
    id: "advanced-vocab",
    title: "Дискуссия и аргументы",
    emoji: "🎓",
    level: "C1",
    theory:
      "Связки для эссе и споров: nevertheless, whereas, on the grounds that, it could be argued that.\nИнверсия: Not only did he…, Rarely have I…",
    exercises: [
      { kind: "choice", question: "___ have I seen such a beautiful place.", options: ["Rarely", "Usually", "Often"], answer: 0 },
      { kind: "choice", question: "The plan is risky; ___, it's worth trying.", options: ["whereas", "nevertheless", "because"], answer: 1 },
      { kind: "translate", ru: "Можно утверждать, что технологии делают нас одинокими.", example: "It could be argued that technology makes us lonely." },
      { kind: "write", task: "Аргументируйте мнение: «Работа из дома лучше офиса» (4–5 предложений)." },
    ],
  },
];
