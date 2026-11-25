import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { TestQuestion } from "../data/tests";
import { Button, C, Card, s } from "../ui";

/** Общий экран теста: вопросы с вариантами, в конце — итог. */
export function Quiz({ title, questions, onDone, onExit, renderResult }: {
  title: string;
  questions: TestQuestion[];
  onDone: (correct: number, byLevel: Record<string, number>) => void;
  onExit?: () => void;
  renderResult: (correct: number, byLevel: Record<string, number>) => React.ReactNode;
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
      {onExit && <Button title="← Назад" kind="ghost" onPress={onExit} />}
      <Text style={s.h1}>{title}</Text>
      {finished ? (
        renderResult(correct, byLevel)
      ) : (
        <>
          <View style={{ height: 8, backgroundColor: C.border, borderRadius: 4 }}>
            <View style={{ height: 8, width: `${(i / questions.length) * 100}%`, backgroundColor: C.primary, borderRadius: 4 }} />
          </View>
          <Text style={s.muted}>Вопрос {i + 1} из {questions.length}</Text>
          <Card><Text style={s.h2}>{q.q}</Text></Card>
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
