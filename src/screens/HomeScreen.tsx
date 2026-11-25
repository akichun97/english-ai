import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LESSONS, Lesson } from "../data/lessons";
import { Progress } from "../storage";
import { C, Card, s } from "../ui";

export function HomeScreen({ progress, onOpen }: { progress: Progress; onOpen: (l: Lesson) => void }) {
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.h1}>Учим английский</Text>
      <Card style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Stat label="Опыт" value={`${progress.xp} XP`} />
        <Stat label="Дней подряд" value={`🔥 ${progress.streak}`} />
        <Stat label="Уровень" value={progress.level} />
      </Card>
      <Text style={s.h2}>Темы</Text>
      {LESSONS.map((l) => {
        const done = progress.doneLessons.includes(l.id);
        return (
          <Pressable key={l.id} onPress={() => onOpen(l)}>
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={{ fontSize: 32 }}>{l.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.h2}>{l.title}</Text>
                <Text style={s.muted}>Уровень {l.level} · {l.exercises.length} заданий</Text>
              </View>
              {done && <Text style={{ color: C.primary, fontSize: 22 }}>✓</Text>}
            </Card>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={s.h2}>{value}</Text>
      <Text style={s.muted}>{label}</Text>
    </View>
  );
}
