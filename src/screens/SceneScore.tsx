import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { askJson, ChatMessage } from "../ai";
import { Scene } from "../data/scenes";
import { EMMA, EmmaPic } from "../emma";
import { useApp } from "../state";
import { Button, C, Card, s } from "../ui";

type Score = {
  score: number; // 0–100
  goals: { goal: string; done: boolean }[];
  good: string;
  mistakes: { topic: string; wrong: string; right: string; why: string }[];
  tip: string;
};

/** Оценка ролевой сценки: какие цели выполнены, ошибки и совет. */
export function SceneScore({ scene, messages, onClose }: { scene: Scene; messages: ChatMessage[]; onClose: () => void }) {
  const { lang, level, gainXp, addMistakes } = useApp();
  const [r, setR] = useState<Score | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = messages.filter((m) => !m.content.startsWith("(The student is ready"))
      .map((m) => `${m.role === "user" ? "Ученик" : "Emma"}: ${m.content}`).join("\n");
    askJson<Score>(
      `Ты Emma, преподаватель (${lang.name.toLowerCase()}). Оцени ролевую сценку ученика уровня ${level}. Пиши по-русски, тепло и честно.`,
      `Сценка: «${scene.title}». Цели ученика: ${scene.goals.join("; ")}.\nДиалог:\n${dialog}\n\n` +
        `Верни {"score": число 0-100 (выполнение целей, понятность и правильность речи с учётом уровня), ` +
        `"goals": [{"goal": "цель как в списке", "done": true/false}], "good": "что получилось хорошо, 1-2 предложения", ` +
        `"mistakes": [{"topic": "тема ошибки", "wrong": "фраза ученика", "right": "как правильно", "why": "почему"}] (до 4), "tip": "совет на следующий раз"}`,
    ).then((x) => {
      setR(x);
      gainXp(Math.max(3, Math.round(x.score / 10)));
      addMistakes(x.mistakes ?? []);
    }).catch((e) => setError((e as Error).message));
  }, []);

  const mood = !r ? (error ? EMMA.sorry : EMMA.focus) : r.score >= 85 ? EMMA.achievement : r.score >= 60 ? EMMA.approval : EMMA.support;

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <EmmaPic source={mood} size={150} />
        <Text style={s.h1}>{scene.emoji} {scene.title}</Text>
        {r && <Text style={{ fontSize: 44, fontWeight: "800", color: r.score >= 85 ? C.good : r.score >= 60 ? C.primary : C.danger }}>{r.score}/100</Text>}
      </View>
      {!r && !error && <><ActivityIndicator color={C.primary} /><Text style={[s.muted, { textAlign: "center" }]}>Emma оценивает сценку…</Text></>}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      {r && (
        <>
          <Card>
            <Text style={s.h2}>Цели</Text>
            {r.goals.map((g) => (
              <Text key={g.goal} style={[s.p, { color: g.done ? C.good : C.muted }]}>{g.done ? "✓" : "○"} {g.goal}</Text>
            ))}
          </Card>
          <Card><Text style={s.p}>{r.good}</Text></Card>
          {r.mistakes.length > 0 && <Text style={s.h2}>Что поправить</Text>}
          {r.mistakes.map((m, i) => (
            <Card key={i}>
              <Text style={{ color: C.danger, textDecorationLine: "line-through" }}>{m.wrong}</Text>
              <Text style={[s.p, { color: C.good, fontWeight: "600" }]}>{m.right}</Text>
              <Text style={s.muted}>{m.why}</Text>
            </Card>
          ))}
          <Card style={{ backgroundColor: C.cream }}><Text style={s.p}>Совет: {r.tip}</Text></Card>
        </>
      )}
      <Button title="Готово" onPress={onClose} />
    </ScrollView>
  );
}
