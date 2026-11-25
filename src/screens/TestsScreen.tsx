import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { EMMA, EmmaPic } from "../emma";
import { askJson } from "../ai";
import { EXAMS, levelFromScore, PLACEMENT, TestQuestion } from "../data/tests";
import { useApp } from "../state";
import { setLevel } from "../storage";
import { Button, C, Card, s } from "../ui";
import { Quiz } from "./Quiz";

type Mode = { kind: "menu" } | { kind: "quiz"; title: string; questions: TestQuestion[]; placement: boolean };

export function TestsScreen({ onBack }: { onBack: () => void }) {
  const { lang, level, gainXp, update } = useApp();
  const [mode, setMode] = useState<Mode>({ kind: "menu" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startExam(title: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await askJson<{ questions: { q: string; options: string[]; answer: number }[] }>(
        `You write ${lang.nameEn} exam questions for Russian-speaking learners.`,
        `Create 8 multiple-choice questions in the style of "${title}" for a ${level} student (grammar, vocabulary, reading micro-texts). ` +
          (lang.id === "ja" ? "Write Japanese in kana with common kanji only; task instructions in Russian. " : "") +
          `Return {"questions":[{"q": string, "options": [4 strings], "answer": index of correct option}]}`,
      );
      setMode({ kind: "quiz", title, placement: false, questions: r.questions.map((q) => ({ ...q, level })) });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (mode.kind === "quiz") {
    return (
      <Quiz title={mode.title} questions={mode.questions}
        onDone={(correct, byLevel) => {
          gainXp(correct * 3);
          if (mode.placement) update((p) => setLevel(p, levelFromScore(byLevel, lang.id)));
        }}
        onExit={() => setMode({ kind: "menu" })}
        renderResult={(correct, byLevel) => (
          <Card>
            <Text style={s.h2}>Результат: {correct} из {mode.questions.length}</Text>
            {mode.placement && <Text style={s.p}>Ваш уровень: {levelFromScore(byLevel, lang.id)}. Уроки и разговор подстроятся под него.</Text>}
          </Card>
        )} />
    );
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>Тесты и экзамены</Text>
      <Card>
        <Text style={s.h2}>Пройти тест на уровень заново</Text>
        <Text style={s.muted}>{PLACEMENT[lang.id].length} вопросов. Ваш текущий уровень: {level}</Text>
        <Button title="Пройти тест" onPress={() => setMode({ kind: "quiz", title: "Тест на уровень", questions: PLACEMENT[lang.id], placement: true })} />
      </Card>
      <Text style={s.h2}>Экзамены (задания создаёт ИИ)</Text>
      {EXAMS[lang.id].map((e) => (
        <Pressable key={e.id} onPress={() => !busy && startExam(e.title)}>
          <Card>
            <Text style={s.h2}>{e.title}</Text>
            <Text style={s.muted}>{e.desc}</Text>
          </Card>
        </Pressable>
      ))}
      {busy && <View style={{ alignItems: "center" }}><EmmaPic source={EMMA.focus} size={120} /><ActivityIndicator color={C.primary} /></View>}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
    </ScrollView>
  );
}
