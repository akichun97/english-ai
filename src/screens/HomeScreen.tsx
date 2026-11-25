import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LESSONS, Lesson } from "../data/lessons";
import { LEVEL_NAMES, LEVELS, levelIndex } from "../data/tests";
import { Progress } from "../storage";
import { C, Card, s } from "../ui";

export function HomeScreen({ progress, onOpen }: { progress: Progress; onOpen: (l: Lesson) => void }) {
  const myLevel = levelIndex(progress.level);
  const levelLessons = LESSONS.filter((l) => l.level === progress.level);
  const doneHere = levelLessons.filter((l) => progress.doneLessons.includes(l.id)).length;

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.h1}>Учим английский</Text>
      <Card style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Stat label="Опыт" value={`${progress.xp} XP`} />
        <Stat label="Дней подряд" value={`🔥 ${progress.streak}`} />
        <Stat label="Уровень" value={progress.level} />
      </Card>
      <Card>
        <Text style={s.h2}>Уровень {progress.level} · {LEVEL_NAMES[progress.level]}</Text>
        <Text style={s.muted}>Пройдено тем: {doneHere} из {levelLessons.length}. Пройдите все, чтобы открыть следующий уровень.</Text>
        <View style={{ height: 8, backgroundColor: C.border, borderRadius: 4 }}>
          <View style={{ height: 8, width: `${levelLessons.length ? (doneHere / levelLessons.length) * 100 : 0}%`, backgroundColor: C.primary, borderRadius: 4 }} />
        </View>
      </Card>
      {LEVELS.map((lvl, li) => {
        const lessons = LESSONS.filter((l) => l.level === lvl);
        if (!lessons.length) return null;
        const locked = li > myLevel;
        return (
          <View key={lvl} style={{ gap: 12 }}>
            <Text style={[s.h2, locked && { color: C.muted }]}>
              {locked ? "🔒 " : ""}{lvl} · {LEVEL_NAMES[lvl]}{li === myLevel ? " — ваш уровень" : ""}
            </Text>
            {lessons.map((l) => {
              const done = progress.doneLessons.includes(l.id);
              return (
                <Pressable key={l.id} onPress={() => !locked && onOpen(l)} disabled={locked}>
                  <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: locked ? 0.5 : 1 }}>
                    <Text style={{ fontSize: 32 }}>{l.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.h2}>{l.title}</Text>
                      <Text style={s.muted}>{locked ? "Откроется позже" : `${l.exercises.length} заданий`}</Text>
                    </View>
                    {done && <Text style={{ color: C.primary, fontSize: 22 }}>✓</Text>}
                  </Card>
                </Pressable>
              );
            })}
          </View>
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
