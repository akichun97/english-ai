import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

// Палитра из наброска Emma: тёмно-фиолетовый, лавандовый, кремовый, персиковый.
export const C = {
  bg: "#F7F2F8",
  card: "#FFFFFF",
  text: "#2E2747",
  muted: "#7C7396",
  primary: "#5B4B8A",
  primaryLight: "#ECE6F6",
  lilac: "#A99BD6",
  cream: "#F7EBD9",
  peach: "#F2CFC4",
  danger: "#C2556A",
  border: "#E6DEF0",
};

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
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

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 16, gap: 12 },
  h1: { fontSize: 26, fontWeight: "700", color: C.text },
  h2: { fontSize: 18, fontWeight: "700", color: C.text },
  p: { fontSize: 16, color: C.text, lineHeight: 22 },
  muted: { fontSize: 14, color: C.muted },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8 },
  btn: { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  ghost: { backgroundColor: C.primaryLight },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, fontSize: 16, color: C.text },
  option: { borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, backgroundColor: C.card },
});

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
