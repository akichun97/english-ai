import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { askJson, ChatMessage } from "../ai";
import { EMMA, EmmaPic } from "../emma";
import { useApp } from "../state";
import { Button, C, Card, PlayButton, s } from "../ui";
import { speak } from "../voice";

type Review = {
  summary: string;
  mistakes: { topic: string; wrong: string; right: string; why: string }[];
  words: { word: string; reading: string; translation: string }[];
  tip: string;
};

/** Разбор урока: что получилось, ошибки, новые слова. */
export function SessionReview({ messages, onClose }: { messages: ChatMessage[]; onClose: () => void }) {
  const { lang, level, addWords, gainXp, addMistakes } = useApp();
  const [r, setR] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    const dialog = messages.map((m) => `${m.role === "user" ? "Ученик" : "Emma"}: ${m.content}`).join("\n");
    askJson<Review>(
      `Ты Emma, преподаватель (${lang.name.toLowerCase()}). Разбери урок ученика уровня ${level}. Пиши по-русски, тепло и коротко.`,
      `Диалог:\n${dialog}\n\nВерни {"summary": "2-3 предложения: что получилось и над чем поработать", ` +
        `"mistakes": [{"topic": "короткое название темы ошибки по-русски, например: Артикли a/an, Время Past Simple, Частица は", "wrong": "фраза ученика", "right": "как правильно", "why": "коротко почему"}] (до 5, только реальные ошибки ученика), ` +
        `"words": [{"word": "слово или фраза на изучаемом языке из урока", "reading": "${lang.id === "ja" ? "ромадзи" : "транскрипция IPA"}", "translation": "перевод"}] (5-8 полезных слов), ` +
        `"tip": "один совет на следующий урок"}`,
    ).then((x) => { setR(x); addMistakes(x.mistakes ?? []); }).catch((e) => setError((e as Error).message));
  }, []);

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={!r ? (error ? EMMA.sorry : EMMA.focus) : r.mistakes.length === 0 ? EMMA.achievement : r.mistakes.length >= 4 ? EMMA.support : EMMA.approval} size={80} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Итог урока</Text>
          <Text style={s.muted}>{r ? "Вот что я заметила" : error ? "Не получилось подвести итог" : "Emma подводит итог…"}</Text>
        </View>
      </View>
      {!r && !error && <ActivityIndicator color={C.primary} />}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      {r && (
        <>
          <Card><Text style={s.p}>{r.summary}</Text></Card>
          {r.mistakes.length > 0 && <Text style={s.h2}>Ошибки</Text>}
          {r.mistakes.length > 0 && <Text style={s.muted}>Я запомнила их: повторить можно в «Практика → Мои ошибки».</Text>}
          {r.mistakes.map((m, i) => (
            <Card key={i}>
              {m.topic ? <Text style={[s.muted, { fontWeight: "600" }]}>{m.topic}</Text> : null}
              <Text style={{ color: C.danger, textDecorationLine: "line-through", fontSize: 15 }}>{m.wrong}</Text>
              <Text style={[s.p, { color: C.good, fontWeight: "600" }]}>{m.right}</Text>
              <Text style={s.muted}>{m.why}</Text>
            </Card>
          ))}
          {r.words.length > 0 && <Text style={s.h2}>Новые слова</Text>}
          {r.words.map((w) => (
            <Card key={w.word} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <PlayButton onPress={() => speak(w.word, lang, { rate: 0.85 })} />
              <View style={{ flex: 1 }}>
                <Text style={[s.p, { fontWeight: "600" }]}>{w.word}</Text>
                {w.reading ? <Text style={{ color: C.primary }}>{w.reading}</Text> : null}
                <Text style={s.muted}>{w.translation}</Text>
              </View>
            </Card>
          ))}
          {r.words.length > 0 && (
            <Button title={added === null ? "Добавить слова в словарь" : added > 0 ? `Добавлено: ${added} ✓` : "Эти слова уже в словаре"}
              disabled={added !== null}
              onPress={() => { const n = addWords(r.words); setAdded(n); if (n) gainXp(n); }} />
          )}
          <Card style={{ backgroundColor: C.cream }}><Text style={s.p}>Совет: {r.tip}</Text></Card>
        </>
      )}
      <Button title="Готово" kind="ghost" onPress={onClose} />
    </ScrollView>
  );
}
