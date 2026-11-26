// Разговорник для поездок: готовые фразы с чтением и переводом. Работает без интернета.
import { LangId } from "../lang";

export type Phrase = { text: string; reading: string; ru: string };
export type Topic = { id: string; title: string; emoji: string };

export const TOPICS: Topic[] = [
  { id: "airport", title: "Аэропорт", emoji: "✈️" },
  { id: "hotel", title: "Отель", emoji: "🏨" },
  { id: "cafe", title: "Кафе", emoji: "☕" },
  { id: "taxi", title: "Такси", emoji: "🚕" },
  { id: "shop", title: "Магазин", emoji: "🛍️" },
  { id: "help", title: "Помощь", emoji: "🆘" },
];

// [фраза, чтение, перевод]
type Row = [string, string, string];

const EN: Record<string, Row[]> = {
  airport: [
    ["Where is the check-in desk?", "уэр из зэ чек-ин деск", "Где стойка регистрации?"],
    ["I have one suitcase.", "ай хэв уан сьюткейс", "У меня один чемодан."],
    ["Which gate is it?", "уич гейт из ит", "Какой выход на посадку?"],
    ["My flight is delayed.", "май флайт из дилейд", "Мой рейс задерживается."],
    ["Where can I get a taxi?", "уэр кэн ай гет э тэкси", "Где можно взять такси?"],
  ],
  hotel: [
    ["I have a reservation.", "ай хэв э рэзэвейшн", "У меня бронь."],
    ["What time is breakfast?", "уот тайм из брекфаст", "Во сколько завтрак?"],
    ["Can I have the Wi-Fi password?", "кэн ай хэв зэ вай-фай пасвёд", "Можно пароль от Wi-Fi?"],
    ["The air conditioner doesn't work.", "зи эа кондишнэ дазнт вёк", "Кондиционер не работает."],
    ["I'd like to check out.", "айд лайк ту чек аут", "Я хочу выехать."],
  ],
  cafe: [
    ["A table for two, please.", "э тейбл фо ту, плиз", "Столик на двоих, пожалуйста."],
    ["Can I see the menu?", "кэн ай си зэ меню", "Можно меню?"],
    ["I'll have a coffee, please.", "айл хэв э кофи, плиз", "Мне кофе, пожалуйста."],
    ["Is it spicy?", "из ит спайси", "Это острое?"],
    ["The bill, please.", "зэ бил, плиз", "Счёт, пожалуйста."],
  ],
  taxi: [
    ["To this address, please.", "ту зис эдрес, плиз", "По этому адресу, пожалуйста."],
    ["How much is it to the airport?", "хау мач из ит ту зи эапорт", "Сколько стоит до аэропорта?"],
    ["Please stop here.", "плиз стоп хиэ", "Остановите здесь, пожалуйста."],
    ["Can I pay by card?", "кэн ай пэй бай кад", "Можно оплатить картой?"],
    ["Please turn on the meter.", "плиз тён он зэ митэ", "Включите, пожалуйста, счётчик."],
  ],
  shop: [
    ["How much is this?", "хау мач из зис", "Сколько это стоит?"],
    ["Do you have a smaller size?", "ду ю хэв э смолэ сайз", "Есть размер поменьше?"],
    ["Can I try it on?", "кэн ай трай ит он", "Можно примерить?"],
    ["I'm just looking.", "айм джаст лукинг", "Я просто смотрю."],
    ["I'll take it.", "айл тейк ит", "Я возьму это."],
  ],
  help: [
    ["Help!", "хэлп", "Помогите!"],
    ["Call an ambulance!", "кол эн эмбьюлэнс", "Вызовите скорую!"],
    ["I'm lost.", "айм лост", "Я заблудился."],
    ["Where is the nearest pharmacy?", "уэр из зэ ниэрист фамэси", "Где ближайшая аптека?"],
    ["I don't understand.", "ай доунт андэстэнд", "Я не понимаю."],
  ],
};

const JA: Record<string, Row[]> = {
  airport: [
    ["チェックインカウンターはどこですか。", "chekkuin kauntā wa doko desu ka", "Где стойка регистрации?"],
    ["スーツケースは一つです。", "sūtsukēsu wa hitotsu desu", "У меня один чемодан."],
    ["搭乗口は何番ですか。", "tōjōguchi wa nanban desu ka", "Какой выход на посадку?"],
    ["飛行機が遅れています。", "hikōki ga okurete imasu", "Рейс задерживается."],
    ["タクシー乗り場はどこですか。", "takushī noriba wa doko desu ka", "Где стоянка такси?"],
  ],
  hotel: [
    ["予約しています。", "yoyaku shite imasu", "У меня бронь."],
    ["朝ごはんは何時ですか。", "asagohan wa nanji desu ka", "Во сколько завтрак?"],
    ["Wi-Fiのパスワードを教えてください。", "waifai no pasuwādo o oshiete kudasai", "Скажите, пожалуйста, пароль от Wi-Fi."],
    ["エアコンが動きません。", "eakon ga ugokimasen", "Кондиционер не работает."],
    ["チェックアウトをお願いします。", "chekkuauto o onegai shimasu", "Я хочу выехать."],
  ],
  cafe: [
    ["二人です。", "futari desu", "Нас двое."],
    ["メニューをください。", "menyū o kudasai", "Меню, пожалуйста."],
    ["コーヒーをお願いします。", "kōhī o onegai shimasu", "Кофе, пожалуйста."],
    ["これは辛いですか。", "kore wa karai desu ka", "Это острое?"],
    ["お会計をお願いします。", "okaikei o onegai shimasu", "Счёт, пожалуйста."],
  ],
  taxi: [
    ["この住所までお願いします。", "kono jūsho made onegai shimasu", "До этого адреса, пожалуйста."],
    ["空港までいくらですか。", "kūkō made ikura desu ka", "Сколько стоит до аэропорта?"],
    ["ここで止めてください。", "koko de tomete kudasai", "Остановите здесь, пожалуйста."],
    ["カードで払えますか。", "kādo de haraemasu ka", "Можно оплатить картой?"],
    ["急いでいます。", "isoide imasu", "Я спешу."],
  ],
  shop: [
    ["これはいくらですか。", "kore wa ikura desu ka", "Сколько это стоит?"],
    ["もっと小さいサイズはありますか。", "motto chiisai saizu wa arimasu ka", "Есть размер поменьше?"],
    ["試着してもいいですか。", "shichaku shite mo ii desu ka", "Можно примерить?"],
    ["見ているだけです。", "mite iru dake desu", "Я просто смотрю."],
    ["これにします。", "kore ni shimasu", "Я возьму это."],
  ],
  help: [
    ["助けて！", "tasukete", "Помогите!"],
    ["救急車を呼んでください。", "kyūkyūsha o yonde kudasai", "Вызовите скорую!"],
    ["道に迷いました。", "michi ni mayoimashita", "Я заблудился."],
    ["一番近い薬局はどこですか。", "ichiban chikai yakkyoku wa doko desu ka", "Где ближайшая аптека?"],
    ["わかりません。", "wakarimasen", "Я не понимаю."],
  ],
};

const TR: Record<string, Row[]> = {
  airport: [
    ["Check-in bankosu nerede?", "чек-ин банкосу нереде", "Где стойка регистрации?"],
    ["Bir valizim var.", "бир вализим вар", "У меня один чемодан."],
    ["Hangi kapıdan biniyoruz?", "ханги капыдан бинийоруз", "С какого выхода посадка?"],
    ["Uçağım rötar yaptı.", "учаым рётар япты", "Мой рейс задерживается."],
    ["Taksi durağı nerede?", "такси дураы нереде", "Где стоянка такси?"],
  ],
  hotel: [
    ["Rezervasyonum var.", "резервасьйонум вар", "У меня бронь."],
    ["Kahvaltı saat kaçta?", "кахвалты саат качта", "Во сколько завтрак?"],
    ["Wi-Fi şifresi nedir?", "вай-фай шифреси недир", "Какой пароль от Wi-Fi?"],
    ["Klima çalışmıyor.", "клима чалышмыйор", "Кондиционер не работает."],
    ["Çıkış yapmak istiyorum.", "чыкыш япмак истийорум", "Я хочу выехать."],
  ],
  cafe: [
    ["İki kişilik bir masa lütfen.", "ики кишилик бир маса лютфен", "Столик на двоих, пожалуйста."],
    ["Menüyü alabilir miyim?", "менюйю алабилир мийим", "Можно меню?"],
    ["Bir kahve lütfen.", "бир кахве лютфен", "Кофе, пожалуйста."],
    ["Bu acı mı?", "бу аджы мы", "Это острое?"],
    ["Hesap lütfen.", "хесап лютфен", "Счёт, пожалуйста."],
  ],
  taxi: [
    ["Bu adrese lütfen.", "бу адресе лютфен", "По этому адресу, пожалуйста."],
    ["Havalimanına ne kadar?", "хавалиманына не кадар", "Сколько до аэропорта?"],
    ["Burada durun lütfen.", "бурада дурун лютфен", "Остановите здесь, пожалуйста."],
    ["Kartla ödeyebilir miyim?", "картла ёдейебилир мийим", "Можно оплатить картой?"],
    ["Taksimetreyi açar mısınız?", "таксиметрейи ачар мысыныз", "Включите, пожалуйста, счётчик."],
  ],
  shop: [
    ["Bu ne kadar?", "бу не кадар", "Сколько это стоит?"],
    ["Daha küçük beden var mı?", "даха кючюк беден вар мы", "Есть размер поменьше?"],
    ["Deneyebilir miyim?", "денейебилир мийим", "Можно примерить?"],
    ["Sadece bakıyorum.", "садедже бакыйорум", "Я просто смотрю."],
    ["Bunu alıyorum.", "буну алыйорум", "Я возьму это."],
  ],
  help: [
    ["İmdat!", "имдат", "Помогите!"],
    ["Ambulans çağırın!", "амбуланс чаырын", "Вызовите скорую!"],
    ["Kayboldum.", "кайболдум", "Я заблудился."],
    ["En yakın eczane nerede?", "эн якын эджзане нереде", "Где ближайшая аптека?"],
    ["Anlamıyorum.", "анламыйорум", "Я не понимаю."],
  ],
};

const ALL: Record<LangId, Record<string, Row[]>> = { en: EN, ja: JA, tr: TR };

export function phrases(lang: LangId, topic: string): Phrase[] {
  return (ALL[lang][topic] ?? []).map(([text, reading, ru]) => ({ text, reading, ru }));
}
