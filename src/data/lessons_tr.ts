// Уроки турецкого. Подсказка к чтению (поле ipa) — русскими буквами. Ударение почти всегда на последнем слоге.
import type { Lesson } from "./lessons";

export const LESSONS_TR: Lesson[] = [
  {
    id: "tr-alphabet",
    lang: "tr",
    title: "Алфавит и чтение",
    emoji: "Ç",
    level: "A1",
    theory:
      "Турецкий пишется латиницей и читается так, как написано.\nОсобые буквы: ç — «ч», ş — «ш», c — «дж», ı (без точки) — «ы», ö — «ё», ü — «ю», ğ — не произносится, а удлиняет гласную перед ней.\nУдарение обычно падает на последний слог.",
    why:
      "Одна буква — один звук, поэтому, зная эти несколько букв, можно прочитать любое слово.\nЧтение: i с точкой — обычное «и», а ı без точки — «ы». Это разные буквы, и они меняют смысл: kız — девочка, а kiz — такого слова нет.",
    examples: [
      { en: "çay", ipa: "чай", ru: "чай" },
      { en: "şeker", ipa: "шекер", ru: "сахар" },
      { en: "kız", ipa: "кыз", ru: "девочка" },
      { en: "cami", ipa: "джами", ru: "мечеть" },
    ],
    exercises: [
      { kind: "choice", question: "Как читается буква «ç»?", options: ["ч", "ц", "к"], answer: 0 },
      { kind: "choice", question: "Какая буква звучит как «ы»?", options: ["i", "ı", "u"], answer: 1, hint: "ı без точки" },
      { kind: "choice", question: "Как читается «cam» (стекло)?", options: ["кам", "сам", "джам"], answer: 2, hint: "c = «дж»" },
      { kind: "write", task: "Напишите турецкими буквами, как пишется слово «шекер» (сахар)." },
    ],
  },
  {
    id: "tr-greetings",
    lang: "tr",
    title: "Приветствия",
    emoji: "👋",
    level: "A1",
    theory:
      "Merhaba — здравствуйте. Günaydın — доброе утро. İyi akşamlar — добрый вечер.\nNasılsın? — как дела? İyiyim — хорошо. Teşekkür ederim — спасибо. Hoşça kal — пока (говорит уходящий).",
    why:
      "Nasılsın — это «как ты», а вежливо «как вы» — Nasılsınız: окончание -sınız показывает уважение, как наше «вы».\nЧтение: ğ не звучит, а тянет гласную перед ней: doğru (верно) читается «доору».",
    examples: [
      { en: "Merhaba!", ipa: "мерхаба", ru: "Здравствуйте!" },
      { en: "Günaydın!", ipa: "гюнайдын", ru: "Доброе утро!" },
      { en: "Nasılsın? — İyiyim, teşekkür ederim.", ipa: "насылсын — ийийим, тешекюр эдерим", ru: "Как дела? — Хорошо, спасибо." },
    ],
    exercises: [
      { kind: "choice", question: "Как сказать «спасибо»?", options: ["Merhaba", "Teşekkür ederim", "Günaydın"], answer: 1 },
      { kind: "choice", question: "— Nasılsın? — ___", options: ["Günaydın", "Hoşça kal", "İyiyim"], answer: 2 },
      { kind: "translate", ru: "Доброе утро! Как дела?", example: "Günaydın! Nasılsın?" },
      { kind: "write", task: "Поздоровайтесь по-турецки и вежливо спросите, как дела (на «вы»)." },
    ],
  },
  {
    id: "tr-ben",
    lang: "tr",
    title: "Я студент: «быть» в турецком",
    emoji: "🙋",
    level: "A1",
    theory:
      "Глагола «быть» нет: к слову добавляется окончание.\nben -im, sen -sin, o — без окончания, biz -iz, siz -siniz, onlar -ler.\nBen öğrenciyim — я студент. Sen doktorsun — ты врач. O öğretmen — он учитель.",
    why:
      "Гласная в окончании подстраивается под последнюю гласную слова (гармония гласных): после a, ı → ı; после e, i → i; после o, u → u; после ö, ü → ü.\nПоэтому doktor-um, öğrenci-yim, yorgun-uz. Если слово кончается на гласную, вставляется y: öğrenci-y-im.",
    examples: [
      { en: "Ben öğrenciyim.", ipa: "бен ёренджийим", ru: "Я студент." },
      { en: "Sen Türk müsün?", ipa: "сен тюрк мюсюн", ru: "Ты турок?" },
      { en: "Biz mutluyuz.", ipa: "биз мутлуйуз", ru: "Мы счастливы." },
    ],
    exercises: [
      { kind: "choice", question: "Ben doktor___.", options: ["um", "im", "sun"], answer: 0, hint: "последняя гласная o → u" },
      { kind: "choice", question: "Sen öğretmen___.", options: ["sun", "sin", "im"], answer: 1, hint: "последняя гласная e → i" },
      { kind: "choice", question: "Biz yorgun___. (Мы устали)", options: ["ız", "iz", "uz"], answer: 2 },
      { kind: "translate", ru: "Я студент.", example: "Ben öğrenciyim." },
    ],
  },
  {
    id: "tr-plural",
    lang: "tr",
    title: "Много: -lar и -ler",
    emoji: "📚",
    level: "A1",
    theory:
      "Множественное число — окончание -lar или -ler.\nkitap → kitaplar (книги), ev → evler (дома), kedi → kediler (кошки).\nПосле числа множественное не нужно: iki kitap — две книги.",
    why:
      "Выбор зависит от последней гласной слова: a, ı, o, u → -lar; e, i, ö, ü → -ler. Это та же гармония гласных, что и в других окончаниях.\nЧтение: ударение переходит на окончание: китаплАр, эвлЕр.",
    examples: [
      { en: "kitaplar", ipa: "китаплар", ru: "книги" },
      { en: "evler", ipa: "эвлер", ru: "дома" },
      { en: "çocuklar", ipa: "чоджуклар", ru: "дети" },
    ],
    exercises: [
      { kind: "choice", question: "Masa___ (столы)", options: ["lar", "ler", "lır"], answer: 0 },
      { kind: "choice", question: "Bunlar kalem___. (Это ручки)", options: ["lar", "ler", "lur"], answer: 1, hint: "последняя гласная e → -ler" },
      { kind: "choice", question: "Göz___ (глаза)", options: ["lör", "lar", "ler"], answer: 2 },
      { kind: "write", task: "Поставьте во множественное число: araba, öğrenci, okul." },
    ],
  },
  {
    id: "tr-present",
    lang: "tr",
    title: "Сейчас: время -iyor",
    emoji: "⏳",
    level: "A2",
    theory:
      "Что происходит сейчас: основа глагола + -iyor + личное окончание.\ngel-mek → geliyorum (я иду), yap-mak → yapıyorsun (ты делаешь), oku-mak → okuyor (он читает).\nВопрос: Ne yapıyorsun? — Что ты делаешь?",
    why:
      "Гласная перед -yor тоже по гармонии: -ıyor, -iyor, -uyor, -üyor. Если основа кончается на гласную, она сливается: oku + iyor → okuyor.\nЧтение: -yor звучит как «йор», а личные окончания: -um, -sun, —, -uz, -sunuz, -lar.",
    examples: [
      { en: "Ne yapıyorsun?", ipa: "не япыйорсун", ru: "Что ты делаешь?" },
      { en: "Türkçe öğreniyorum.", ipa: "тюркче ёренийорум", ru: "Я учу турецкий." },
      { en: "O kahve içiyor.", ipa: "о кахве ичийор", ru: "Он пьёт кофе." },
    ],
    exercises: [
      { kind: "choice", question: "Şimdi ne yap___sun?", options: ["iyor", "ıyor", "uyor"], answer: 1 },
      { kind: "choice", question: "Ben kitap ok___um.", options: ["uyor", "iyor", "ıyor"], answer: 0 },
      { kind: "choice", question: "O televizyon izl___.", options: ["ıyor", "üyor", "iyor"], answer: 2 },
      { kind: "translate", ru: "Что ты сейчас делаешь?", example: "Şimdi ne yapıyorsun?" },
      { kind: "write", task: "Напишите 2–3 предложения о том, что вы делаете сейчас." },
    ],
  },
  {
    id: "tr-locative",
    lang: "tr",
    title: "Где? Окончание -da / -de",
    emoji: "🏠",
    level: "A2",
    theory:
      "«Где» отвечает окончание -da/-de: evde — дома, okulda — в школе, masada — на столе.\nПосле глухих согласных (ç, f, h, k, p, s, ş, t) d превращается в t: mutfakta — на кухне, kitapta — в книге.\nNerede? — Где?",
    why:
      "Предлогов «в» и «на» нет: всё делает окончание. Гласная — по двухвариантной гармонии: a, ı, o, u → -da; e, i, ö, ü → -de.\nЗапомнить глухие помогает фраза «Fıstıkçı Şahap» — в ней все эти буквы.",
    examples: [
      { en: "Evdeyim.", ipa: "эвдейим", ru: "Я дома." },
      { en: "Kitap masada.", ipa: "китап масада", ru: "Книга на столе." },
      { en: "Annem mutfakta.", ipa: "аннэм мутфакта", ru: "Мама на кухне." },
    ],
    exercises: [
      { kind: "choice", question: "Ben ev___yim. (Я дома)", options: ["de", "da", "te"], answer: 0 },
      { kind: "choice", question: "Kitap çanta___. (в сумке)", options: ["de", "ta", "da"], answer: 2 },
      { kind: "choice", question: "Mutfak___ (на кухне)", options: ["da", "ta", "te"], answer: 1, hint: "k — глухая, d → t" },
      { kind: "translate", ru: "Мама дома.", example: "Annem evde." },
    ],
  },
  {
    id: "tr-past",
    lang: "tr",
    title: "Вчера: прошедшее -di",
    emoji: "📅",
    level: "B1",
    theory:
      "Прошедшее время: основа + -di + окончание лица.\ngit-mek → gittim (я пошёл), gel-mek → geldin (ты пришёл), yap-mak → yaptık (мы сделали).\nЛичные окончания: -m, -n, —, -k, -niz, -ler.",
    why:
      "-dı, -di, -du, -dü — по гармонии гласных, а после глухих согласных d → t: yaptım, gittim, içtik.\nЧтение: ударение на последний слог: гиттИм, яптЫк.",
    examples: [
      { en: "Dün sinemaya gittim.", ipa: "дюн синемая гиттим", ru: "Вчера я ходил в кино." },
      { en: "Kahvaltı yaptık.", ipa: "кахвалты яптык", ru: "Мы позавтракали." },
      { en: "Ne zaman geldin?", ipa: "не заман гелдин", ru: "Когда ты пришёл?" },
    ],
    exercises: [
      { kind: "choice", question: "Dün çok çalış___. (Я много работал)", options: ["tım", "dım", "tim"], answer: 0, hint: "ş — глухая, d → t" },
      { kind: "choice", question: "Biz pizza ye___.", options: ["dık", "dik", "tik"], answer: 1 },
      { kind: "choice", question: "Sen nereye git___?", options: ["din", "tın", "tin"], answer: 2 },
      { kind: "translate", ru: "Вчера я смотрел фильм.", example: "Dün film izledim." },
      { kind: "write", task: "Расскажите, что вы делали в выходные (3–4 предложения)." },
    ],
  },
  {
    id: "tr-future",
    lang: "tr",
    title: "Завтра: будущее -ecek",
    emoji: "🚀",
    level: "B1",
    theory:
      "Будущее время: основа + -ecek/-acak + окончание лица.\ngel-mek → geleceğim (я приду), yap-mak → yapacaksın (ты сделаешь), git-mek → gideceğiz (мы пойдём).\nВопрос: Ne yapacaksın? — Что будешь делать?",
    why:
      "Перед гласной k превращается в ğ: gelecek + im → geleceğim. А t в конце некоторых основ звончеет: git → gid-eceğim, et → ed-eceğim.\nЧтение: ğ не звучит, поэтому geleceğim читается «геледжейим».",
    examples: [
      { en: "Yarın geleceğim.", ipa: "ярын геледжейим", ru: "Я приду завтра." },
      { en: "Ne yapacaksın?", ipa: "не япаджаксын", ru: "Что будешь делать?" },
      { en: "Tatile gideceğiz.", ipa: "татиле гидеджейиз", ru: "Мы поедем в отпуск." },
    ],
    exercises: [
      { kind: "choice", question: "Yarın sana telefon ed___. (Я позвоню)", options: ["eceğim", "acağım", "ecek"], answer: 0 },
      { kind: "choice", question: "Onlar yarın gel___.", options: ["eceğiz", "ecekler", "acaklar"], answer: 1 },
      { kind: "choice", question: "Biz akşam sinemaya gid___.", options: ["eceksin", "acağız", "eceğiz"], answer: 2 },
      { kind: "translate", ru: "Завтра я буду учить турецкий.", example: "Yarın Türkçe çalışacağım." },
      { kind: "write", task: "Напишите три плана на следующую неделю." },
    ],
  },
];
