import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { askJson } from "../ai";
import { EXAMS, levelFromScore, PLACEMENT_TEST, TestQuestion } from "../data/tests";
import { Button, C, Card, s } from "../ui";

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
      <Quiz {...mode} onDone={(correct, byLevel) => {
        onXp(correct * 3);
        if (mode.placement) onLevel(levelFromScore(byLevel));
      }} onExit={() => setMode({ kind: "menu" })} />
    );
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.h1}>Тесты и экзамены</Text>
      <Card>
        <Text style={s.h2}>Тест на уровень</Text>
        <Text style={s.muted}>10 вопросов, от A1 до C1. Ваш текущий уровень: {level}</Text>
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

function Quiz({ title, questions, placement, onDone, onExit }: {
  title: string; questions: TestQuestion[]; placement: boolean;
  onDone: (correct: number, byLevel: Record<string, number>) => void; onExit: () => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [byLevel, setByLevel] = useState<Record<string, number>>({});
  const [correct, setCorrect] = useState(0);
  const finished = i >= questions.length;
  const q = questions[i];

  function pick(n: number) {
    if (picked !== null) return;
    setPicked(n);
    if (n === q.answer) {
      setCorrect((c) => c + 1);
      setByLevel((b) => ({ ...b, [q.level]: (b[q.level] ?? 0) + 1 }));
    }
  }
  function next() {
    const ni = i + 1;
    setI(ni);
    setPicked(null);
    if (ni >= questions.length) onDone(correct, byLevel);
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← К списку тестов" kind="ghost" onPress={onExit} />
      <Text style={s.h1}>{title}</Text>
      {finished ? (
        <Card>
          <Text style={s.h2}>Результат: {correct} из {questions.length}</Text>
          {placement && <Text style={s.p}>Ваш уровень: {levelFromScore(byLevel)}. Уроки и разговор подстроятся под него.</Text>}
        </Card>
      ) : (
        <>
          <Text style={s.muted}>Вопрос {i + 1} из {questions.length}</Text>
          <Text style={s.h2}>{q.q}</Text>
          {q.options.map((o, n) => (
            <Pressable key={n} onPress={() => pick(n)} style={[s.option,
              picked !== null && n === q.answer && { borderColor: C.primary, backgroundColor: C.primaryLight },
              picked === n && n !== q.answer && { borderColor: C.danger }]}>
              <Text style={s.p}>{o}</Text>
            </Pressable>
          ))}
          {picked !== null && <Button title="Дальше" onPress={next} />}
        </>
      )}
    </ScrollView>
  );
}
