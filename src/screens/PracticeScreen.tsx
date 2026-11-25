import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../state";
import { isDue } from "../vocab";
import { C, Card, s } from "../ui";
import { VocabScreen } from "./VocabScreen";
import { PronunciationScreen } from "./PronunciationScreen";
import { ListeningScreen } from "./ListeningScreen";
import { TestsScreen } from "./TestsScreen";

type View_ = "menu" | "vocab" | "pron" | "listen" | "tests";

export function PracticeScreen() {
  const { langWords, lang } = useApp();
  const [view, setView] = useState<View_>("menu");
  const back = () => setView("menu");

  if (view === "vocab") return <VocabScreen onBack={back} />;
  if (view === "pron") return <PronunciationScreen onBack={back} />;
  if (view === "listen") return <ListeningScreen onBack={back} />;
  if (view === "tests") return <TestsScreen onBack={back} />;

  const due = langWords.filter(isDue).length;
  const items: { id: View_; title: string; desc: string; badge?: string }[] = [
    { id: "vocab", title: "Словарь и карточки", desc: `${langWords.length} слов. Повторение по расписанию, чтобы запомнить надолго.`, badge: due ? `${due}` : undefined },
    { id: "pron", title: "Произношение", desc: "Emma говорит фразу, вы повторяете, приложение проверяет." },
    { id: "listen", title: "Аудирование", desc: "Короткие истории на слух с вопросами. Можно замедлить." },
    { id: "tests", title: "Тесты и экзамены", desc: "Тест на уровень и экзамены, задания для которых придумывает ИИ." },
  ];

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.h1}>Практика</Text>
      <Text style={s.muted}>{lang.name}</Text>
      {items.map((it) => (
        <Pressable key={it.id} onPress={() => setView(it.id)}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: C.primary }} />
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>{it.title}</Text>
              <Text style={s.muted}>{it.desc}</Text>
            </View>
            {it.badge && (
              <View style={{ minWidth: 28, height: 28, borderRadius: 14, backgroundColor: C.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{it.badge}</Text>
              </View>
            )}
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
