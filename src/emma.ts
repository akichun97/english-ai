// Палитра эмоций Emma (30 реакций) по рисунку пользователя. Фон вырезан, картинки увеличены.
export const EMMA = {
  joy: require("../assets/emma/moods/joy.png"),
  delight: require("../assets/emma/moods/delight.png"),
  tender: require("../assets/emma/moods/tender.png"),
  proud: require("../assets/emma/moods/proud.png"),
  determined: require("../assets/emma/moods/determined.png"),
  motivated: require("../assets/emma/moods/motivated.png"),
  curious: require("../assets/emma/moods/curious.png"),
  pondering: require("../assets/emma/moods/pondering.png"),
  understanding: require("../assets/emma/moods/understanding.png"),
  surprised: require("../assets/emma/moods/surprised.png"),
  scared: require("../assets/emma/moods/scared.png"),
  confused: require("../assets/emma/moods/confused.png"),
  focus: require("../assets/emma/moods/focus.png"),
  explaining: require("../assets/emma/moods/explaining.png"),
  support: require("../assets/emma/moods/support.png"),
  approval: require("../assets/emma/moods/approval.png"),
  relief: require("../assets/emma/moods/relief.png"),
  calm: require("../assets/emma/moods/calm.png"),
  tired: require("../assets/emma/moods/tired.png"),
  sleepy: require("../assets/emma/moods/sleepy.png"),
  sad: require("../assets/emma/moods/sad.png"),
  anxious: require("../assets/emma/moods/anxious.png"),
  embarrassed: require("../assets/emma/moods/embarrassed.png"),
  sorry: require("../assets/emma/moods/sorry.png"),
  planning: require("../assets/emma/moods/planning.png"),
  achievement: require("../assets/emma/moods/achievement.png"),
  hello: require("../assets/emma/moods/hello.png"),
  bye: require("../assets/emma/moods/bye.png"),
  love: require("../assets/emma/moods/love.png"),
  overload: require("../assets/emma/moods/overload.png"),
  portrait: require("../assets/emma/portrait.png"),
};

export type EmmaMood = Exclude<keyof typeof EMMA, "portrait">;

/** Подписи эмоций для галереи в профиле Emma. */
export const MOOD_LABELS: { mood: EmmaMood; label: string }[] = [
  { mood: "joy", label: "Радость" },
  { mood: "delight", label: "Восторг" },
  { mood: "tender", label: "Умиление" },
  { mood: "proud", label: "Гордость" },
  { mood: "determined", label: "Решимость" },
  { mood: "motivated", label: "Мотивация" },
  { mood: "curious", label: "Любопытство" },
  { mood: "pondering", label: "Задумчивость" },
  { mood: "understanding", label: "Понимание" },
  { mood: "surprised", label: "Удивление" },
  { mood: "scared", label: "Испуг" },
  { mood: "confused", label: "Замешательство" },
  { mood: "focus", label: "Концентрация" },
  { mood: "explaining", label: "Объяснение" },
  { mood: "support", label: "Поддержка" },
  { mood: "approval", label: "Одобрение" },
  { mood: "relief", label: "Облегчение" },
  { mood: "calm", label: "Спокойствие" },
  { mood: "tired", label: "Усталость" },
  { mood: "sleepy", label: "Сонливость" },
  { mood: "sad", label: "Грусть" },
  { mood: "anxious", label: "Тревога" },
  { mood: "embarrassed", label: "Смущение" },
  { mood: "sorry", label: "Извинение" },
  { mood: "planning", label: "Планирование" },
  { mood: "achievement", label: "Достижение" },
  { mood: "hello", label: "Приветствие" },
  { mood: "bye", label: "Прощание" },
  { mood: "love", label: "Любовь к обучению" },
  { mood: "overload", label: "Перегрузка" },
];

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
