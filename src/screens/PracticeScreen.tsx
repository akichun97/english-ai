import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../state";
import { dailyPick } from "../vocab";
import { C, Card, s } from "../ui";
import { VocabScreen } from "./VocabScreen";
import { PronunciationScreen } from "./PronunciationScreen";
import { ListeningScreen } from "./ListeningScreen";
import { TestsScreen } from "./TestsScreen";
import { MistakesScreen } from "./MistakesScreen";
import { PhrasebookScreen } from "./PhrasebookScreen";
import { ScenesScreen } from "./ScenesScreen";
import { PhotoScreen } from "./PhotoScreen";
import { useOnline } from "../network";

type View_ = "menu" | "vocab" | "pron" | "listen" | "tests" | "mistakes" | "phrases" | "scenes" | "photo";

export function PracticeScreen() {
  const { langWords, lang, mistakes } = useApp();
  const [view, setView] = useState<View_>("menu");
  const back = () => setView("menu");
  const online = useOnline();

  if (view === "vocab") return <VocabScreen onBack={back} />;
  if (view === "pron") return <PronunciationScreen onBack={back} />;
  if (view === "listen") return <ListeningScreen onBack={back} />;
  if (view === "tests") return <TestsScreen onBack={back} />;
  if (view === "mistakes") return <MistakesScreen onBack={back} />;
  if (view === "phrases") return <PhrasebookScreen onBack={back} />;
  if (view === "scenes") return <ScenesScreen onBack={back} />;
  if (view === "photo") return <PhotoScreen onBack={back} />;

  const due = dailyPick(langWords).list.length;
  const repeat = mistakes.filter((m) => m.count >= 2).length;
  const items: { id: View_; title: string; desc: string; badge?: string; ai?: boolean }[] = [
    { id: "vocab", title: "Словарь и карточки", desc: `${langWords.length} слов. Подборка дня от Emma: сложные, к повторению и новые.`, badge: due ? `${due}` : undefined },
    { id: "mistakes", title: "Мои ошибки", desc: mistakes.length ? `${mistakes.length} тем. Emma объяснит и даст упражнение.` : "Emma запоминает ошибки и помогает их исправить.", badge: repeat ? `${repeat}` : undefined },
    { id: "scenes", title: "Сценки с Emma", desc: "Кафе, отель, такси, врач… Emma играет роль, в конце оценка.", ai: true },
    { id: "phrases", title: "Разговорник для поездок", desc: "Аэропорт, отель, кафе, такси, магазин, помощь. Работает без интернета." },
    { id: "photo", title: "Перевод с фото", desc: "Вывеска, меню или этикетка: Emma переведёт и объяснит.", ai: true },
    { id: "pron", title: "Произношение", desc: "Emma говорит фразу, вы повторяете, приложение проверяет." },
    { id: "listen", title: "Аудирование", desc: "Короткие истории на слух с вопросами. Можно замедлить.", ai: true },
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
              {it.ai && !online && <Text style={{ color: C.danger, fontSize: 12 }}>Нужен интернет</Text>}
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
