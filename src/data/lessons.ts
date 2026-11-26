// Темы и задания. Новые уроки добавляются сюда и попадают в следующую сборку.
import { LangId } from "../lang";
import { LESSONS_JA } from "./lessons_ja";
import { LESSONS_TR } from "./lessons_tr";
export type Exercise =
  | { kind: "choice"; question: string; options: string[]; answer: number; hint?: string }
  | { kind: "translate"; ru: string; example: string } // проверяет ИИ
  | { kind: "write"; task: string }; // свободный ответ, проверяет ИИ

/** en — фраза на изучаемом языке, ipa — подсказка к чтению (транскрипция или ромадзи). */
export type Example = { en: string; ipa: string; ru: string };

export type Lesson = {
  id: string;
  lang?: LangId; // по умолчанию английский
  title: string;
  emoji: string;
  level: string;
  theory: string;
  /** Почему так и как читается: короткое объяснение по-русски. */
  why: string;
  /** Примеры с транскрипцией (британский вариант) и переводом. */
  examples: Example[];
  exercises: Exercise[];
};

const LESSONS_EN: Lesson[] = [
  {
    id: "greetings",
    title: "Знакомство",
    emoji: "👋",
    level: "A1",
    theory:
      "Hello / Hi — привет. Nice to meet you — приятно познакомиться.\nMy name is… — меня зовут… I'm from… — я из…",
    why:
      "После I всегда am, после he/she/it — is, после you/we/they — are. В разговоре их сливают: I am → I'm, you are → you're.\nЧтение: в «Nice to meet you» слово to звучит коротко, как «тэ» /tə/, а не «ту».",
    examples: [
      { en: "Nice to meet you.", ipa: "/naɪs tə miːt juː/", ru: "Приятно познакомиться." },
      { en: "My name is Anna.", ipa: "/maɪ neɪm ɪz ˈænə/", ru: "Меня зовут Анна." },
      { en: "I'm from Moscow.", ipa: "/aɪm frəm ˈmɒskəʊ/", ru: "Я из Москвы." },
    ],
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
    why:
      "Окончание -s у he/she/it — остаток старой формы глагола, его просто нужно запомнить. В вопросах и отрицаниях работу -s берёт на себя does: she works → does she work? (без -s у work).\nЧтение -s: после глухих звуков /s/ (works), после звонких и гласных /z/ (plays), после s, sh, ch — /ɪz/ (watches).",
    examples: [
      { en: "She works in a bank.", ipa: "/ʃiː wɜːks ɪn ə bæŋk/", ru: "Она работает в банке." },
      { en: "Do you like coffee?", ipa: "/duː juː laɪk ˈkɒfi/", ru: "Ты любишь кофе?" },
      { en: "He doesn't eat meat.", ipa: "/hiː ˈdʌznt iːt miːt/", ru: "Он не ест мясо." },
    ],
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
    why:
      "Could звучит вежливее, чем can: это как «не могли бы вы» вместо «можете». Поэтому в просьбах к незнакомым людям лучше говорить Could you…?\nЧтение: в could буква l не читается — /kʊd/. В delayed ударение на второй слог: de-LAYED.",
    examples: [
      { en: "My flight is delayed.", ipa: "/maɪ flaɪt ɪz dɪˈleɪd/", ru: "Мой рейс задерживается." },
      { en: "Could you help me, please?", ipa: "/kʊd juː help miː pliːz/", ru: "Не могли бы вы мне помочь?" },
      { en: "Where is gate five?", ipa: "/weər ɪz ɡeɪt faɪv/", ru: "Где выход номер пять?" },
    ],
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
    why:
      "Did уже показывает прошлое время, поэтому глагол после него стоит в начальной форме: Did you see? (а не saw).\nЧтение -ed: после глухих звуков /t/ (worked), после звонких /d/ (played), после t и d — /ɪd/ (wanted). Неправильные глаголы (go — went, buy — bought) учатся списком.",
    examples: [
      { en: "I went to the cinema.", ipa: "/aɪ went tə ðə ˈsɪnəmə/", ru: "Я ходил в кино." },
      { en: "Did you see that film?", ipa: "/dɪd juː siː ðæt fɪlm/", ru: "Ты видел тот фильм?" },
      { en: "We bought a new car.", ipa: "/wiː bɔːt ə njuː kɑː/", ru: "Мы купили новую машину." },
    ],
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
    why:
      "I'd like — сокращение от I would like, это вежливое «я бы хотел». Want звучит слишком прямо, поэтому в кафе говорят I'd like.\nЧтение: в bill и tea звуки разные — короткий /ɪ/ и долгий /iː/. От этого зависит смысл: bit и beat — разные слова.",
    examples: [
      { en: "I'd like a cup of tea.", ipa: "/aɪd laɪk ə kʌp əv tiː/", ru: "Я бы хотел чашку чая." },
      { en: "Can I have the bill, please?", ipa: "/kən aɪ hæv ðə bɪl pliːz/", ru: "Можно счёт, пожалуйста?" },
      { en: "I'm hungry.", ipa: "/aɪm ˈhʌŋɡri/", ru: "Я голоден." },
    ],
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
    why:
      "Present Perfect связывает прошлое с настоящим: важен результат или опыт сейчас, а не когда это было. Поэтому с ним не говорят yesterday или in 2020 — для этого есть Past Simple.\nЧтение: have и has в середине фразы безударные — /həv/, /həz/. Часто их сливают: I've, she's.",
    examples: [
      { en: "I have never tried sushi.", ipa: "/aɪ həv ˈnevə traɪd ˈsuːʃi/", ru: "Я никогда не пробовал суши." },
      { en: "Have you ever been to London?", ipa: "/həv juː ˈevə biːn tə ˈlʌndən/", ru: "Ты когда-нибудь был в Лондоне?" },
      { en: "She has already finished.", ipa: "/ʃiː həz ɔːlˈredi ˈfɪnɪʃt/", ru: "Она уже закончила." },
    ],
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
    why:
      "Прошедшее время после if показывает, что ситуация нереальная: If I were rich (но я не богат). Were вместо was — особая форма для нереального, её используют со всеми лицами.\nЧтение: would have в речи сливается в /wʊd əv/, звучит почти как «вудэв».",
    examples: [
      { en: "If I were rich, I would travel.", ipa: "/ɪf aɪ wɜː rɪtʃ aɪ wʊd ˈtrævl/", ru: "Если бы я был богат, я бы путешествовал." },
      { en: "If I had known, I would have come.", ipa: "/ɪf aɪ həd nəʊn aɪ wʊd əv kʌm/", ru: "Если бы я знал, я бы пришёл." },
      { en: "If it rains, we will stay home.", ipa: "/ɪf ɪt reɪnz wiː wɪl steɪ həʊm/", ru: "Если пойдёт дождь, мы останемся дома." },
    ],
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
    why:
      "Инверсия (Rarely have I…) — приём книжной и ораторской речи: отрицательное наречие выносят вперёд для силы, и тогда порядок слов становится вопросительным.\nЧтение: в nevertheless ударение на последний слог — never-the-LESS.",
    examples: [
      { en: "Rarely have I seen such a view.", ipa: "/ˈreəli həv aɪ siːn sʌtʃ ə vjuː/", ru: "Редко я видел такой вид." },
      { en: "It could be argued that money matters.", ipa: "/ɪt kʊd bi ˈɑːɡjuːd ðət ˈmʌni ˈmætəz/", ru: "Можно утверждать, что деньги важны." },
      { en: "Nevertheless, it's worth trying.", ipa: "/ˌnevəðəˈles ɪts wɜːθ ˈtraɪɪŋ/", ru: "Тем не менее стоит попробовать." },
    ],
    exercises: [
      { kind: "choice", question: "___ have I seen such a beautiful place.", options: ["Rarely", "Usually", "Often"], answer: 0 },
      { kind: "choice", question: "The plan is risky; ___, it's worth trying.", options: ["whereas", "nevertheless", "because"], answer: 1 },
      { kind: "translate", ru: "Можно утверждать, что технологии делают нас одинокими.", example: "It could be argued that technology makes us lonely." },
      { kind: "write", task: "Аргументируйте мнение: «Работа из дома лучше офиса» (4–5 предложений)." },
    ],
  },
];

export const LESSONS: Lesson[] = [...LESSONS_EN, ...LESSONS_JA, ...LESSONS_TR];

export function lessonsFor(lang: LangId): Lesson[] {
  return LESSONS.filter((l) => (l.lang ?? "en") === lang);
}
