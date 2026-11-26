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
  {
    id: "tr-conditional",
    lang: "tr",
    title: "Если: условие -se / -sa",
    emoji: "🤔",
    level: "B2",
    theory:
      "Реальное условие: глагол в широком времени + -se/-sa: Zamanım olursa gelirim — если будет время, приду.\nНереальное: основа + -se + личное окончание: Param olsa ev alırdım — если бы были деньги, купил бы дом.\nKeşke + -se — «жаль, что не…»: Keşke Türkçe bilsem — жаль, что я не знаю турецкий.",
    why:
      "-sa после a, ı, o, u; -se после e, i, ö, ü. Личные окончания у условия короткие: -m, -n, —, -k, -niz, -ler: olsam, olsan, olsa.\nЧтение: ударение падает на слог перед -se: олУрса, гелсЕм.",
    examples: [
      { en: "Zamanım olursa gelirim.", ipa: "заманым олурса гелирим", ru: "Если будет время, я приду." },
      { en: "Param olsa ev alırdım.", ipa: "парам олса эв алырдым", ru: "Будь у меня деньги, я бы купил дом." },
      { en: "Keşke daha erken gelseydin.", ipa: "кешке даха эркен гелсейдин", ru: "Жаль, что ты не пришёл раньше." },
    ],
    exercises: [
      { kind: "choice", question: "Yağmur yağar___, evde kalırız.", options: ["sa", "se", "di"], answer: 0 },
      { kind: "choice", question: "Zengin ol___, dünyayı gezerdim.", options: ["sem", "sam", "dum"], answer: 1 },
      { kind: "choice", question: "Keşke Türkçe bil___.", options: ["sam", "dim", "sem"], answer: 2 },
      { kind: "translate", ru: "Если будет время, я приду.", example: "Zamanım olursa gelirim." },
      { kind: "write", task: "Напишите, что бы вы сделали, если бы жили в Стамбуле (2–3 предложения)." },
    ],
  },
  {
    id: "tr-passive",
    lang: "tr",
    title: "Страдательный залог -il / -in",
    emoji: "🏛",
    level: "B2",
    theory:
      "Страдательный залог: основа + -il (-ıl, -ul, -ül): yap → yapıldı (было сделано), gönder → gönderildi (было отправлено).\nПосле гласной или l — -n: oku → okunur (читается), bil → bilinir (известно).\nBurada Türkçe konuşulur — здесь говорят по-турецки.",
    why:
      "Так говорят, когда важно действие, а не кто его сделал: в новостях, объявлениях, инструкциях. Залог стоит сразу после основы, потом время и лицо: yap-ıl-dı.\nЧтение: ударение на последний слог: япылдЫ.",
    examples: [
      { en: "Bu ev 1900 yılında yapıldı.", ipa: "бу эв бин докуз юз йылында япылды", ru: "Этот дом построили в 1900 году." },
      { en: "Burada Türkçe konuşulur.", ipa: "бурада тюркче конушулур", ru: "Здесь говорят по-турецки." },
      { en: "Kapı kapatıldı.", ipa: "капы капатылды", ru: "Дверь закрыли." },
    ],
    exercises: [
      { kind: "choice", question: "Bu kitap çok oku___. (читается)", options: ["nur", "lur", "yor"], answer: 0, hint: "после гласной — -n" },
      { kind: "choice", question: "Mektup dün gönder___.", options: ["ıldı", "ildi", "di"], answer: 1 },
      { kind: "choice", question: "Burada sigara iç___. (здесь не курят)", options: ["mez", "ilir", "ilmez"], answer: 2 },
      { kind: "translate", ru: "Этот дом построили в 1900 году.", example: "Bu ev 1900 yılında yapıldı." },
    ],
  },
  {
    id: "tr-participles",
    lang: "tr",
    title: "«Который»: причастия -en и -dik",
    emoji: "🔗",
    level: "C1",
    theory:
      "В турецком нет слова «который»: определение-оборот ставится перед словом.\n-en/-an — когда слово само делает действие: kitap okuyan kız — девушка, которая читает книгу.\n-dik + притяжательное — когда действие совершают над ним: okuduğum kitap — книга, которую я читаю.\n-ecek (olan) — в будущем: gelecek olan misafirler — гости, которые придут.",
    why:
      "Порядок обратный русскому: сначала весь оборот, потом главное слово. Притяжательное окончание показывает, кто делает действие: okuduğum (я), okuduğun (ты), okuduğu (он).\nЧтение: ğ не звучит, поэтому okuduğum — «окудуум».",
    examples: [
      { en: "Kitap okuyan kız benim kardeşim.", ipa: "китап окуян кыз беним кардешим", ru: "Девушка, которая читает книгу, — моя сестра." },
      { en: "Okuduğum kitap çok ilginç.", ipa: "окудуум китап чок ильгинч", ru: "Книга, которую я читаю, очень интересная." },
      { en: "Tanıştığımız gün yağmur yağıyordu.", ipa: "таныштыымыз гюн ягмур ягыйорду", ru: "В день, когда мы познакомились, шёл дождь." },
    ],
    exercises: [
      { kind: "choice", question: "Türkçe konuş___ adam rehberdi. (человек, который говорит)", options: ["an", "tuğum", "duğu"], answer: 0 },
      { kind: "choice", question: "Dün izle___ film harikaydı. (фильм, который я посмотрел)", options: ["yen", "diğim", "ecek"], answer: 1 },
      { kind: "choice", question: "Yarın gel___ misafirler kim? (гости, которые придут)", options: ["diğim", "en", "ecek olan"], answer: 2 },
      { kind: "translate", ru: "Город, в котором я живу, очень красивый.", example: "Yaşadığım şehir çok güzel." },
      { kind: "write", task: "Опишите 3 вещи или людей с помощью оборотов на -en и -dik (например: «книга, которую я люблю»)." },
    ],
  },
  {
    id: "tr-connectors",
    lang: "tr",
    title: "Связки: потому что, несмотря на, чем больше",
    emoji: "🧵",
    level: "C1",
    theory:
      "-dığı için — потому что: Yorgun olduğum için erken yattım.\n-masına rağmen — несмотря на то что: Yağmur yağmasına rağmen dışarı çıktık.\n-dıkça — чем больше…, тем: Okudukça öğreniyorsun.\n-ınca — когда, как только: Eve gelince seni ararım.",
    why:
      "Придаточные строятся не союзом, а окончанием на глаголе, а связка стоит после него. Поэтому «потому что я устал» — yorgun olduğum için: сначала причина, потом «для».\nЧтение: rağmen — «раамен», ğ тянет гласную.",
    examples: [
      { en: "Yorgun olduğum için erken yattım.", ipa: "йоргун олдуум ичин эркен яттым", ru: "Я лёг рано, потому что устал." },
      { en: "Yağmur yağmasına rağmen dışarı çıktık.", ipa: "ягмур яамасына раамен дышары чыктык", ru: "Несмотря на дождь, мы вышли на улицу." },
      { en: "Türkçe konuştukça daha rahat oluyorum.", ipa: "тюркче конуштукча даха рахат олуйорум", ru: "Чем больше говорю по-турецки, тем свободнее себя чувствую." },
    ],
    exercises: [
      { kind: "choice", question: "Hasta ol___ için gelemedim.", options: ["duğum", "masına", "dukça"], answer: 0 },
      { kind: "choice", question: "Çok çalış___ rağmen sınavı geçemedi.", options: ["tığı", "masına", "ınca"], answer: 1 },
      { kind: "choice", question: "Eve gel___ seni ararım. (как только приду)", options: ["diğim için", "dikçe", "ince"], answer: 2 },
      { kind: "translate", ru: "Несмотря на то что было холодно, мы пошли к морю.", example: "Hava soğuk olmasına rağmen denize gittik." },
      { kind: "write", task: "Напишите 3 предложения о себе со связками -dığı için, -masına rağmen и -dıkça." },
    ],
  },
  {
    id: "tr-idioms",
    lang: "tr",
    title: "Живые выражения и идиомы",
    emoji: "🧿",
    level: "C1",
    theory:
      "Kolay gelsin — «лёгкой работы», говорят тому, кто работает.\nEllerine sağlık — «здоровья твоим рукам», спасибо за угощение.\nGeçmiş olsun — «пусть пройдёт», выздоравливай или сочувствую.\nGöz atmak — бегло просмотреть. Ağzı kulaklarında — рот до ушей, очень рад.",
    why:
      "Эти фразы в Турции звучат каждый день, и дословный перевод их не объясняет. Когда иностранец к месту говорит «Kolay gelsin» или «Ellerine sağlık», это сразу звучит естественно и вызывает улыбку.\nЧтение: sağlık — «саалык».",
    examples: [
      { en: "Kolay gelsin!", ipa: "колай гельсин", ru: "Лёгкой работы! (Бог в помощь!)" },
      { en: "Ellerine sağlık, çok lezzetliydi.", ipa: "эллерине саалык, чок лезетлийди", ru: "Спасибо, было очень вкусно." },
      { en: "Raporuna göz attım.", ipa: "рапоруна гёз аттым", ru: "Я просмотрел твой отчёт." },
    ],
    exercises: [
      { kind: "choice", question: "Что сказать хозяйке после вкусного ужина?", options: ["Kolay gelsin", "Ellerine sağlık", "Geçmiş olsun"], answer: 1 },
      { kind: "choice", question: "Друг заболел. Что ему сказать?", options: ["Geçmiş olsun", "Afiyet olsun", "Kolay gelsin"], answer: 0 },
      { kind: "choice", question: "«Ağzı kulaklarında» значит:", options: ["он очень зол", "он не слушает", "он очень рад"], answer: 2 },
      { kind: "write", task: "Составьте короткий диалог (3–4 реплики), где к месту звучат два выражения из урока." },
    ],
  },
];
