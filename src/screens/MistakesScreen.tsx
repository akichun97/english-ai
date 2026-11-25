import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { askJson } from "../ai";
import { EMMA, EmmaPic } from "../emma";
import { Mistake } from "../mistakes";
import { useApp } from "../state";
import { Button, C, Card, PlayButton, s } from "../ui";
import { speak } from "../voice";

type Lesson = {
  what: string; // что было не так
  why: string; // почему
  right: string; // как правильно
  example: { text: string; reading: string; ru: string };
  exercise: { question: string; options: string[]; answer: number };
};

/** Мои ошибки: повторяющиеся ошибки ученика и разбор каждой с Emma. */
export function MistakesScreen({ onBack }: { onBack: () => void }) {
  const { mistakes } = useApp();
  const [open, setOpen] = useState<Mistake | null>(null);
  const list = [...mistakes].sort((a, b) => b.count - (b.fixed ?? 0) - (a.count - (a.fixed ?? 0)) || b.last.localeCompare(a.last));

  if (open) return <MistakeDetail m={open} onBack={() => setOpen(null)} />;

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={list.length ? EMMA.understanding : EMMA.relief} size={84} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Мои ошибки</Text>
          <Text style={s.muted}>Я запоминаю ошибки из уроков и разговоров. Сверху те, что повторяются чаще.</Text>
        </View>
      </View>
      {list.length === 0 && (
        <Card><Text style={s.p}>Пока ошибок нет. Они появятся после уроков и итогов разговора с Emma.</Text></Card>
      )}
      {list.map((m) => (
        <Pressable key={m.id} onPress={() => setOpen(m)}>
          <Card style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[s.h2, { flex: 1 }]}>{m.topic}</Text>
              <View style={{ backgroundColor: m.count >= 3 ? C.peach : C.primaryLight, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: m.count >= 3 ? C.danger : C.primary, fontWeight: "700" }}>×{m.count}</Text>
              </View>
            </View>
            <Text style={{ color: C.danger, textDecorationLine: "line-through" }}>{m.wrong}</Text>
            <Text style={{ color: C.good, fontWeight: "600" }}>{m.right}</Text>
            <Text style={s.muted}>Нажмите, чтобы разобрать с Emma{m.fixed ? ` · исправлено ${m.fixed} раз` : ""}</Text>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function MistakeDetail({ m, onBack }: { m: Mistake; onBack: () => void }) {
  const { lang, level, setMistakes, gainXp } = useApp();
  const [l, setL] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    askJson<Lesson>(
      `Ты Emma, преподаватель (${lang.name.toLowerCase()}) для русскоговорящего ученика уровня ${level}. Пиши по-русски, просто и тепло.` +
        (lang.id === "ja" ? " Японский пиши каной с ромадзи в скобках." : ""),
      `Ученик несколько раз (${m.count}) ошибся в теме «${m.topic}». Последний случай: «${m.wrong}» вместо «${m.right}». ` +
        `Верни {"what": "что именно было не так, 1-2 предложения", "why": "правило простыми словами, 2-3 предложения", ` +
        `"right": "правильный вариант", "example": {"text": "ещё один пример на ${lang.nameEn}", "reading": "${lang.id === "ja" ? "ромадзи" : "транскрипция IPA"}", "ru": "перевод"}, ` +
        `"exercise": {"question": "короткое задание на это правило, с пропуском ___ если подходит", "options": ["3 варианта"], "answer": индекс верного}}`,
    ).then(setL).catch((e) => setError((e as Error).message));
  }, []);

  function pick(n: number) {
    if (!l || picked !== null) return;
    setPicked(n);
    if (n === l.exercise.answer) {
      gainXp(3);
      setMistakes((all) => all.map((x) => (x.id === m.id ? { ...x, fixed: (x.fixed ?? 0) + 1 } : x)));
    }
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Мои ошибки" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>{m.topic}</Text>
      {!l && !error && (
        <View style={{ alignItems: "center", gap: 8 }}>
          <EmmaPic source={EMMA.pondering} size={130} />
          <ActivityIndicator color={C.primary} />
          <Text style={s.muted}>Emma готовит разбор…</Text>
        </View>
      )}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      {l && (
        <>
          <View style={{ alignItems: "center" }}>
            <EmmaPic source={picked === null ? EMMA.explaining : picked === l.exercise.answer ? EMMA.delight : EMMA.support} size={140} />
          </View>
          <Card>
            <Text style={[s.muted, { fontWeight: "600" }]}>Что было не так</Text>
            <Text style={{ color: C.danger, textDecorationLine: "line-through", fontSize: 16 }}>{m.wrong}</Text>
            <Text style={s.p}>{l.what}</Text>
          </Card>
          <Card>
            <Text style={[s.muted, { fontWeight: "600" }]}>Почему</Text>
            <Text style={s.p}>{l.why}</Text>
          </Card>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <PlayButton onPress={() => speak(l.right, lang, { rate: 0.85 })} />
            <View style={{ flex: 1 }}>
              <Text style={[s.muted, { fontWeight: "600" }]}>Как правильно</Text>
              <Text style={[s.p, { color: C.good, fontWeight: "700" }]}>{l.right}</Text>
            </View>
          </Card>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <PlayButton onPress={() => speak(l.example.text, lang, { rate: 0.85 })} />
            <View style={{ flex: 1 }}>
              <Text style={[s.muted, { fontWeight: "600" }]}>Ещё пример</Text>
              <Text style={[s.p, { fontWeight: "600" }]}>{l.example.text}</Text>
              {l.example.reading ? <Text style={{ color: C.primary }}>{l.example.reading}</Text> : null}
              <Text style={s.muted}>{l.example.ru}</Text>
            </View>
          </Card>
          <Text style={s.h2}>Проверь себя</Text>
          <Card>
            <Text style={[s.p, { fontSize: 18 }]}>{l.exercise.question}</Text>
            {l.exercise.options.map((o, n) => {
              const right = picked !== null && n === l.exercise.answer;
              const wrong = picked === n && n !== l.exercise.answer;
              return (
                <Pressable key={n} onPress={() => pick(n)} style={{ borderWidth: 2, borderRadius: 14, padding: 12,
                  borderColor: right ? C.good : wrong ? C.danger : C.border, backgroundColor: right ? C.primaryLight : C.card }}>
                  <Text style={s.p}>{o}</Text>
                </Pressable>
              );
            })}
            {picked !== null && (
              <Text style={[s.p, { color: picked === l.exercise.answer ? C.good : C.danger }]}>
                {picked === l.exercise.answer ? "Верно! Эта ошибка уходит 🎉" : `Правильно: ${l.exercise.options[l.exercise.answer]}`}
              </Text>
            )}
          </Card>
          <Button title="Я понял(а), убрать из списка" kind="ghost"
            onPress={() => { setMistakes((all) => all.filter((x) => x.id !== m.id)); onBack(); }} />
        </>
      )}
    </ScrollView>
  );
}
