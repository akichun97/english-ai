import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Lesson, lessonsFor } from "../data/lessons";
import { EmmaPic, outfit } from "../emma";
import { useApp } from "../state";
import { goalStatus } from "../storage";
import { dailyPick } from "../vocab";
import { Bar, C, Card, s } from "../ui";

export function HomeScreen({ onOpen }: { onOpen: (l: Lesson) => void }) {
  const { p, lang, level, langWords } = useApp();
  const lessons = lessonsFor(lang.id);
  const myLevel = lang.levels.indexOf(level);
  const levelLessons = lessons.filter((l) => l.level === level);
  const doneHere = levelLessons.filter((l) => p.doneLessons.includes(l.id)).length;
  const goal = goalStatus(p);
  const goalDone = goal.done;
  const due = dailyPick(langWords).list.length;

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={outfit(p.outfit).face} size={64} circle />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.h2}>{goalDone ? "Цель дня выполнена!" : "Привет! Позанимаемся?"}</Text>
          <Text style={s.muted}>{lang.name} · уровень {level} · 🔥 {p.streak} дн.</Text>
        </View>
      </Card>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.h2}>Цель дня</Text>
          <Text style={[s.h2, { color: goalDone ? C.good : C.primary }]}>{goal.value} / {goal.goal} {goal.unit}</Text>
        </View>
        <Bar value={goal.value / goal.goal} color={goalDone ? C.good : C.primary} />
        {due > 0 && <Text style={s.muted}>Emma подобрала {due} слов на сегодня. Загляните во вкладку «Практика».</Text>}
      </Card>
      <Card>
        <Text style={s.h2}>Уровень {level} · {lang.levelNames[level]}</Text>
        <Text style={s.muted}>Пройдено тем: {doneHere} из {levelLessons.length}. Пройдите все, чтобы открыть следующий уровень.</Text>
        <Bar value={levelLessons.length ? doneHere / levelLessons.length : 0} />
      </Card>
      {lang.levels.map((lvl, li) => {
        const list = lessons.filter((l) => l.level === lvl);
        if (!list.length) return null;
        const locked = li > myLevel;
        return (
          <View key={lvl} style={{ gap: 12 }}>
            <Text style={[s.h2, locked && { color: C.muted }]}>
              {locked ? "🔒 " : ""}{lvl} · {lang.levelNames[lvl]}{li === myLevel ? " — ваш уровень" : ""}
            </Text>
            {list.map((l) => {
              const done = p.doneLessons.includes(l.id);
              return (
                <Pressable key={l.id} onPress={() => !locked && onOpen(l)} disabled={locked}>
                  <Card style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: locked ? 0.5 : 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: done ? C.primary : C.primaryLight,
                      alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 20, color: done ? C.onPrimary : C.primary }}>{done ? "✓" : l.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.h2}>{l.title}</Text>
                      <Text style={s.muted}>{locked ? "Откроется позже" : `${l.exercises.length} заданий`}</Text>
                    </View>
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
