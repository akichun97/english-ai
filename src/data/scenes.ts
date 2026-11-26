// Ролевые сценки: Emma играет роль, у ученика есть цели. В конце — оценка.
import { LangId } from "../lang";

export type Scene = { id: string; title: string; emoji: string; role: string; goals: string[] };

export const SCENES: Scene[] = [
  { id: "cafe", title: "Заказ в кафе", emoji: "☕", role: "a friendly waiter in a café",
    goals: ["Поздороваться и попросить столик", "Заказать напиток и еду", "Спросить, острое ли блюдо", "Попросить счёт"] },
  { id: "hotel", title: "Заселение в отель", emoji: "🏨", role: "a hotel receptionist",
    goals: ["Сказать, что у вас бронь", "Узнать время завтрака", "Попросить пароль от Wi-Fi"] },
  { id: "taxi", title: "Поездка на такси", emoji: "🚕", role: "a taxi driver",
    goals: ["Назвать, куда ехать", "Узнать цену", "Спросить про оплату картой", "Попросить остановиться"] },
  { id: "shop", title: "Покупка одежды", emoji: "🛍️", role: "a shop assistant in a clothes shop",
    goals: ["Попросить другой размер", "Спросить, можно ли примерить", "Узнать цену и купить"] },
  { id: "directions", title: "Спросить дорогу", emoji: "🗺️", role: "a helpful passer-by on the street",
    goals: ["Вежливо обратиться к прохожему", "Спросить, как пройти к станции", "Переспросить, если непонятно", "Поблагодарить"] },
  { id: "doctor", title: "У врача", emoji: "🩺", role: "a doctor at a clinic",
    goals: ["Описать, что болит", "Сказать, как давно", "Спросить, как принимать лекарство"] },
  { id: "interview", title: "Собеседование", emoji: "💼", role: "an interviewer for an office job",
    goals: ["Коротко рассказать о себе", "Описать свой опыт", "Задать вопрос о работе"] },
];

const CITY: Record<LangId, string> = { en: "London", ja: "Tokyo", tr: "Istanbul" };

/** Описание сценки для Emma. */
export function scenePrompt(sc: Scene, lang: LangId): string {
  return `role-play scene "${sc.title}" in ${CITY[lang]}. You play ${sc.role}. Stay in character and start the scene yourself with your first line. ` +
    `The student's goals: ${sc.goals.join("; ")}. Guide the student gently towards each goal. ` +
    `When all goals are done, end the scene politely and add one line in Russian: «Сценка пройдена! Нажмите «Оценить»».`;
}
