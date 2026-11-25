import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { askJson } from "../ai";
import { EXAMS, levelFromScore, PLACEMENT_TEST, TestQuestion } from "../data/tests";
import { Button, C, Card, s } from "../ui";
import { Quiz } from "./Quiz";

type Mode = { kind: "menu" } | { kind: "quiz"; title: string; questions: TestQuestion[]; placement: boolean };

export function TestsScreen({ level, onLevel, onXp }: { level: string; onLevel: (l: string) => void; onXp: (xp: number) => void }) {
  const [mode, setMode] = useState<Mode>({ kind: "menu" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startExam(id: string, title: string) {
    setBusy(true);
    setError(null);
    try {
      const r = await askJson<{ questions: { q: string; options: string[]; answer: number }[] }>(
        "You write English exam questions for Russian-speaking learners.",
        `Create 8 multiple-choice questions in the style of "${title}" for a ${level} student (grammar, vocabulary, reading micro-texts). ` +
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
          onXp(correct * 3);
          if (mode.placement) onLevel(levelFromScore(byLevel));
        }}
        onExit={() => setMode({ kind: "menu" })}
        renderResult={(correct, byLevel) => (
          <Card>
            <Text style={s.h2}>Результат: {correct} из {mode.questions.length}</Text>
            {mode.placement && <Text style={s.p}>Ваш уровень: {levelFromScore(byLevel)}. Уроки и разговор подстроятся под него.</Text>}
          </Card>
        )} />
    );
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.h1}>Тесты и экзамены</Text>
      <Card>
        <Text style={s.h2}>Пройти тест на уровень заново</Text>
        <Text style={s.muted}>15 вопросов, от A1 до C1. Ваш текущий уровень: {level}</Text>
        <Button title="Пройти тест" onPress={() => setMode({ kind: "quiz", title: "Тест на уровень", questions: PLACEMENT_TEST, placement: true })} />
      </Card>
      <Text style={s.h2}>Экзамены (задания создаёт ИИ)</Text>
      {EXAMS.map((e) => (
        <Pressable key={e.id} onPress={() => !busy && startExam(e.id, e.title)}>
          <Card>
            <Text style={s.h2}>{e.title}</Text>
            <Text style={s.muted}>{e.desc}</Text>
          </Card>
        </Pressable>
      ))}
      {busy && <ActivityIndicator />}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
    </ScrollView>
  );
}
