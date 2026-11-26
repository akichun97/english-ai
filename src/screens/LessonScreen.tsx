import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { askJson, askTeacher } from "../ai";
import { useApp } from "../state";
import { EMMA, EmmaPic } from "../emma";
import { speak as speakText } from "../voice";
import { Exercise, Lesson } from "../data/lessons";
import { Button, C, Card, PlayButton, s } from "../ui";



type Check = { correct: boolean; feedback: string; corrected?: string };

export function LessonScreen({
  lesson, onFinish, onBack,
}: { lesson: Lesson; onFinish: (xp: number) => void; onBack: () => void }) {
  const { lang, level, addMistakes } = useApp();
  const speak = (t: string) => speakText(t, lang, { rate: 0.85 });
  const [i, setI] = useState(-1); // -1 = теория
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [why, setWhy] = useState<string | null>(null);
  const [whyBusy, setWhyBusy] = useState(false);

  const ex: Exercise | undefined = lesson.exercises[i];
  const answered = check !== null;

  /** Правильное предложение для текущего задания (для озвучки и объяснения). */
  function rightSentence(): string | null {
    if (!ex) return null;
    if (ex.kind === "choice") return ex.question.replace(/___|＿/, ex.options[ex.answer]);
    if (ex.kind === "translate") return check?.corrected || ex.example;
    return check?.corrected || null;
  }

  async function explain() {
    if (!ex) return;
    setWhyBusy(true);
    try {
      const task = ex.kind === "choice" ? `${ex.question} (варианты: ${ex.options.join(", ")}; верный: ${ex.options[ex.answer]})`
        : ex.kind === "translate" ? `Перевод «${ex.ru}» → ${ex.example}` : ex.task;
      const answer = ex.kind === "choice" ? (picked !== null ? ex.options[picked] : "") : text;
      const reply = await askTeacher(
        `Ты Emma, преподаватель языка (${lang.name.toLowerCase()}) для русскоговорящего ученика уровня ${level}. Тема урока: ${lesson.title}. ` +
          "Объясняй по-русски, просто и коротко (до 6 строк), без markdown.",
        [{ role: "user", content:
          `Задание: ${task}\nМой ответ: ${answer}\nПравильный вариант: ${rightSentence() ?? "-"}\n` +
          `Объясни: 1) почему правильно именно так (правило), 2) как это читается: ${lang.readingHint} для всей фразы и на что обратить внимание в произношении.` }],
        1500,
      );
      setWhy(reply);
    } catch (e) {
      setWhy((e as Error).message);
    } finally {
      setWhyBusy(false);
    }
  }

  async function submitText() {
    if (!ex || ex.kind === "choice") return;
    setBusy(true);
    try {
      const task = ex.kind === "translate" ? `Translate into ${lang.nameEn}: "${ex.ru}" (reference: "${ex.example}")` : ex.task;
      const r = await askJson<Check>(
        `You check answers of a ${level} ${lang.nameEn} learner (native Russian). Feedback in Russian, 1-2 sentences, kind tone.` + (lang.id === "ja" ? " Accept answers written in kana, kanji or romaji. In \"corrected\" give Japanese with romaji in parentheses." : lang.id === "tr" ? " Accept answers typed without Turkish letters (s for ş, i for ı, g for ğ, c for ç, o for ö, u for ü) as correct, but show the proper spelling in \"corrected\"." : ""),
        `Task: ${task}\nStudent answer: "${text}"\nReturn {"correct": boolean, "feedback": string, "corrected": string}. Minor typos are acceptable.`,
      );
      setCheck(r);
      if (r.correct) setScore((x) => x + 1);
      else if (r.corrected) addMistakes([{ topic: lesson.title, wrong: text, right: r.corrected, why: r.feedback }]);
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
    else addMistakes([{ topic: lesson.title, wrong: ex.question.replace(/___|＿/, ex.options[n]), right: ex.question.replace(/___|＿/, ex.options[ex.answer]), why: ex.hint ?? "" }]);
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
    setWhy(null);
  }

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Button title="← Назад к темам" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>{lesson.emoji} {lesson.title}</Text>
      {i === -1 ? (
        <>
          <Card>
            <Text style={s.h2}>Правило</Text>
            <Text style={s.p}>{lesson.theory}</Text>
          </Card>
          <Card>
            <Text style={s.h2}>Почему так и как читается</Text>
            <Text style={s.p}>{lesson.why}</Text>
          </Card>
          <Text style={s.h2}>Примеры</Text>
          {lesson.examples.map((e) => (
            <Card key={e.en} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <PlayButton onPress={() => speak(e.en)} />
              <View style={{ flex: 1 }}>
                <Text style={[s.p, { fontWeight: "600" }]}>{e.en}</Text>
                <Text style={{ color: C.primary, fontSize: 15 }}>{e.ipa}</Text>
                <Text style={s.muted}>{e.ru}</Text>
              </View>
            </Card>
          ))}
          <Text style={s.muted}>Примеры попадут в ваш словарь после урока. Остались вопросы? Спросите Emma во вкладке «Разговор».</Text>
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
                placeholder={lang.placeholder} placeholderTextColor={C.muted} editable={!answered} />
              {!answered && <Button title={busy ? "ИИ проверяет…" : "Проверить с ИИ"} onPress={submitText} disabled={busy || !text.trim()} />}
              {busy && <ActivityIndicator />}
            </>
          )}
          {check && (
            <Card style={{ borderColor: check.correct ? C.primary : C.danger }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <EmmaPic source={check.correct ? (score >= 3 ? EMMA.delight : EMMA.joy) : EMMA.support} size={64} />
                <Text style={[s.p, { flex: 1 }]}>{check.feedback}</Text>
              </View>
              {check.corrected ? <Text style={s.muted}>Вариант: {check.corrected}</Text> : null}
              {rightSentence() && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <PlayButton onPress={() => speak(rightSentence()!)} />
                  <Text style={[s.p, { flex: 1 }]}>{rightSentence()}</Text>
                </View>
              )}
              {!why && <Button title={whyBusy ? "Emma объясняет…" : "Почему так?"} kind="ghost" onPress={explain} disabled={whyBusy} />}
            </Card>
          )}
          {why && (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <EmmaPic source={EMMA.explaining} size={64} />
                <Text style={s.h2}>Объяснение Emma</Text>
              </View>
              <Text style={s.p}>{why}</Text>
            </Card>
          )}
          {answered && <Button title={i + 1 >= lesson.exercises.length ? "Завершить урок" : "Дальше"} onPress={next} />}
        </>
      ) : null}
    </ScrollView>
  );
}
