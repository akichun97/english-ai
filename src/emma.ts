// Изображения Emma по наброску пользователя.
export const EMMA = {
  portrait: require("../assets/emma/portrait.png"),
  reading: require("../assets/emma/reading.png"),
  happy: require("../assets/emma/happy.png"),
  surprised: require("../assets/emma/surprised.png"),
  thinking: require("../assets/emma/thinking.png"),
  love: require("../assets/emma/love.png"),
  calm: require("../assets/emma/calm.png"),
  sleep: require("../assets/emma/sleep.png"),
};

export type EmmaMood = "happy" | "surprised" | "thinking" | "love" | "calm" | "sleep";

export const EMMA_TRAITS = [
  "объясняет простым языком",
  "подбирает задания под тебя",
  "исправляет ошибки",
  "помогает говорить увереннее",
  "поддерживает и мотивирует",
];
