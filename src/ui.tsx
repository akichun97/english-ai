import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

// Палитра из наброска Emma: тёмно-фиолетовый, лавандовый, кремовый, персиковый.
const LIGHT = {
  bg: "#F7F2F8",
  card: "#FFFFFF",
  text: "#2E2747",
  muted: "#7C7396",
  primary: "#5B4B8A",
  onPrimary: "#FFFFFF",
  primaryLight: "#ECE6F6",
  lilac: "#A99BD6",
  cream: "#F7EBD9",
  peach: "#F2CFC4",
  danger: "#C2556A",
  good: "#3F8F6B",
  border: "#E6DEF0",
};

// Тёмная тема: та же палитра в ночном варианте.
const DARK: typeof LIGHT = {
  bg: "#1B1726",
  card: "#262036",
  text: "#F1ECFA",
  muted: "#A79FC2",
  primary: "#B9AAF0",
  onPrimary: "#1B1726",
  primaryLight: "#362E4F",
  lilac: "#7F6FBF",
  cream: "#3B3250",
  peach: "#563844",
  danger: "#F08CA0",
  good: "#7FD1A8",
  border: "#372F4D",
};

/** Текущие цвета. Меняются функцией applyTheme, после чего экраны перерисовываются. */
export const C = { ...LIGHT };
export let isDark = false;

function makeStyles() {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    pad: { padding: 16, gap: 12 },
    h1: { fontSize: 26, fontWeight: "700", color: C.text },
    h2: { fontSize: 18, fontWeight: "700", color: C.text },
    p: { fontSize: 16, color: C.text, lineHeight: 22 },
    muted: { fontSize: 14, color: C.muted },
    card: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8 },
    btn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
    ghost: { backgroundColor: C.primaryLight },
    btnText: { color: C.onPrimary, fontSize: 16, fontWeight: "600" },
    input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, fontSize: 16, color: C.text },
    option: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, backgroundColor: C.card },
  });
}

export let s = makeStyles();

export function applyTheme(dark: boolean) {
  isDark = dark;
  Object.assign(C, dark ? DARK : LIGHT);
  s = makeStyles();
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Button({
  title, onPress, kind = "primary", disabled,
}: { title: string; onPress: () => void; kind?: "primary" | "ghost"; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        kind === "ghost" && s.ghost,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[s.btnText, kind === "ghost" && { color: C.primary }]}>{title}</Text>
    </Pressable>
  );
}

/** Маленькая кнопка-«таблетка» для выбора варианта. */
export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}
      style={{ borderWidth: 1, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
        borderColor: active ? C.primary : C.border, backgroundColor: active ? C.primaryLight : C.card }}>
      <Text style={{ color: active ? C.primary : C.text, fontWeight: active ? "700" : "400" }}>{label}</Text>
    </Pressable>
  );
}

/** Полоса прогресса. */
export function Bar({ value, color }: { value: number; color?: string }) {
  return (
    <View style={{ height: 8, backgroundColor: C.border, borderRadius: 4, overflow: "hidden" }}>
      <View style={{ height: 8, width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color ?? C.primary, borderRadius: 4 }} />
    </View>
  );
}

/** Круглая кнопка «прослушать» с треугольником. */
export function PlayButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6}
      style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryLight,
        borderWidth: 2, borderColor: C.primary, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 0, height: 0, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 10,
        borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: C.primary, marginLeft: 3 }} />
    </Pressable>
  );
}

/** Круглая кнопка микрофона: закрашенный круг, пока идёт запись. */
export function MicButton({ onPress, active, disabled, size = 64 }: { onPress: () => void; active: boolean; disabled?: boolean; size?: number }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: C.primary,
        backgroundColor: active ? C.primary : C.card, alignItems: "center", justifyContent: "center", opacity: pressed || disabled ? 0.6 : 1 })}>
      <View style={{ width: size / 3.3, height: size / 3.3, borderRadius: size / 6.6, backgroundColor: active ? C.onPrimary : C.primary }} />
    </Pressable>
  );
}
