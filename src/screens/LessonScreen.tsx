import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput } from "react-native";
import { askJson } from "../ai";
import { Exercise, Lesson } from "../data/lessons";
import { Button, C, Card, s } from "../ui";

type Check = { correct: boolean; feedback: string; corrected?: string };

export function LessonScreen({
  lesson, level, onFinish, onBack,
}: { lesson: Lesson; level: string; onFinish: (xp: number) => void; onBack: () => void }) {
  const [i, setI] = useState(-1); // -1 = теория
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);

  const ex: Exercise | undefined = lesson.exercises[i];
  const answered = check !== null;

  async function submitText() {
    if (!ex || ex.kind === "choice") return;
    setBusy(true);
    try {
      const task = ex.kind === "translate" ? `Translate into English: "${ex.ru}" (reference: "${ex.example}")` : ex.task;
      const r = await askJson<Check>(
        `You check answers of a ${level} English learner. Feedback in Russian, 1-2 sentences, kind tone.`,
        `Task: ${task}\nStudent answer: "${text}"\nReturn {"correct": boolean, "feedback": string, "corrected": string}. Minor typos are acceptable.`,
      );
      setCheck(r);
      if (r.correct) setScore((x) => x + 1);
    } catch (e) {
      setCheck({ correct: false, feedback: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function pick(n: number) {
    if (!ex || ex.kind !== "choice" || answered) return;
    setPicked(n);
    const ok = n === ex.answer;
    if (ok) setScore((x) => x + 1);
    setCheck({ correct: ok, feedback: ok ? "Верно! 🎉" : `Правильно: ${ex.options[ex.answer]}${ex.hint ? ` (${ex.hint})` : ""}` });
  }

  function next() {
    if (i + 1 >= lesson.exercises.length) {
      onFinish(10 + score * 5);
      return;
    }
    setI(i + 1);
    setPicked(null);
    setText("");
    setCheck(null);
  }

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Button title="← Назад к темам" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>{lesson.emoji} {lesson.title}</Text>
      {i === -1 ? (
        <>
          <Card><Text style={s.p}>{lesson.theory}</Text></Card>
          <Button title="Начать задания" onPress={next} />
        </>
      ) : ex ? (
        <>
          <Text style={s.muted}>Задание {i + 1} из {lesson.exercises.length}</Text>
          {ex.kind === "choice" && (
            <>
              <Text style={s.h2}>{ex.question}</Text>
              {ex.options.map((o, n) => (
                <Pressable key={o} onPress={() => pick(n)} style={[s.option,
                  answered && n === ex.answer && { borderColor: C.primary, backgroundColor: C.primaryLight },
                  answered && n === picked && n !== ex.answer && { borderColor: C.danger }]}>
                  <Text style={s.p}>{o}</Text>
                </Pressable>
              ))}
            </>
          )}
          {ex.kind !== "choice" && (
            <>
              <Text style={s.h2}>{ex.kind === "translate" ? `Переведите: «${ex.ru}»` : ex.task}</Text>
              <TextInput style={[s.input, { minHeight: 80 }]} multiline value={text} onChangeText={setText}
                placeholder="Ваш ответ по-английски" editable={!answered} />
              {!answered && <Button title={busy ? "ИИ проверяет…" : "Проверить с ИИ"} onPress={submitText} disabled={busy || !text.trim()} />}
              {busy && <ActivityIndicator />}
            </>
          )}
          {check && (
            <Card style={{ borderColor: check.correct ? C.primary : C.danger }}>
              <Text style={s.p}>{check.feedback}</Text>
              {check.corrected ? <Text style={s.muted}>Вариант: {check.corrected}</Text> : null}
            </Card>
          )}
          {answered && <Button title={i + 1 >= lesson.exercises.length ? "Завершить урок" : "Дальше"} onPress={next} />}
        </>
      ) : null}
    </ScrollView>
  );
}
