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

// Образы Emma: открываются за достижения.
export const OUTFITS: { id: string; title: string; face: any; full: any }[] = [
  { id: "default", title: "Наушники", face: require("../assets/emma/face_default.png"), full: require("../assets/emma/portrait.png") },
  { id: "glasses", title: "Книжный вечер", face: require("../assets/emma/face_glasses.png"), full: require("../assets/emma/outfit_glasses.png") },
  { id: "beret", title: "Прогулка", face: require("../assets/emma/face_beret.png"), full: require("../assets/emma/outfit_beret.png") },
  { id: "jacket", title: "Праздничный", face: require("../assets/emma/face_jacket.png"), full: require("../assets/emma/outfit_jacket.png") },
];

export function outfit(id: string) {
  return OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
}

// Emma без рамок: прозрачная картинка, при желании на мягком круге цвета темы.
import React from "react";
import { Image, View } from "react-native";
import { C } from "./ui";

export function EmmaPic({ source, size, circle = false, ring = false, height }: {
  source: any; size: number; circle?: boolean; ring?: boolean; height?: number;
}) {
  const img = React.createElement(Image, { source, resizeMode: "contain",
    style: { width: circle ? size * 0.92 : size, height: circle ? size * 0.92 : height ?? size, marginTop: circle ? size * 0.08 : 0 } });
  if (!circle) return img;
  return React.createElement(View, { style: { width: size, height: size, borderRadius: size / 2, backgroundColor: C.primaryLight,
    overflow: "hidden", alignItems: "center", justifyContent: "flex-start",
    borderWidth: ring ? 2 : 0, borderColor: C.primary } }, img);
}
