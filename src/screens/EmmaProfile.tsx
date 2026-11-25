import React from "react";
import { Image, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { EMMA, EMMA_TRAITS, EmmaMood } from "../emma";
import { Button, C, Card, s } from "../ui";

const MOODS: { mood: EmmaMood; label: string }[] = [
  { mood: "happy", label: "Радуется" },
  { mood: "surprised", label: "Слушает" },
  { mood: "thinking", label: "Думает" },
  { mood: "love", label: "Хвалит" },
  { mood: "calm", label: "Спокойна" },
  { mood: "sleep", label: "Отдыхает" },
];

export function EmmaProfile({ onBack, onVoice, onChat }: { onBack: () => void; onVoice: () => void; onChat: () => void }) {
  const { width } = useWindowDimensions();
  const tile = (width - 32 - 24) / 3;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={{ backgroundColor: C.primaryLight }}>
        <Image source={EMMA.portrait} style={{ width, height: Math.min(width * 590 / 520, 420) }} resizeMode="cover" />
      </View>
      <View style={[s.pad, { marginTop: -40 }]}>
        <Card style={{ alignItems: "flex-start" }}>
          <Text style={{ fontSize: 40, fontWeight: "300", fontStyle: "italic", color: C.primary }}>Emma ✦</Text>
          <Text style={s.h2}>Твой AI-наставник по языкам</Text>
          {EMMA_TRAITS.map((t) => (
            <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.lilac, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>✓</Text>
              </View>
              <Text style={s.p}>{t}</Text>
            </View>
          ))}
        </Card>
        <Button title="Голосовой урок с Emma" onPress={onVoice} />
        <Button title="Написать Emma" kind="ghost" onPress={onChat} />
        <Text style={s.h2}>Эмоции и реакции</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          {MOODS.map((m) => (
            <View key={m.mood} style={{ width: tile, alignItems: "center", gap: 4 }}>
              <Image source={EMMA[m.mood]} style={{ width: tile, height: tile, borderRadius: 20 }} />
              <Text style={s.muted}>{m.label}</Text>
            </View>
          ))}
        </View>
        <Button title="← Назад" kind="ghost" onPress={onBack} />
      </View>
    </ScrollView>
  );
}
