import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { askJson } from "../ai";
import { isBeginner } from "../lang";
import { EMMA, EmmaPic } from "../emma";
import { useApp } from "../state";
import { bump } from "../storage";
import { Button, C, Card, Chip, MicButton, s } from "../ui";
import { speak, stopSpeaking } from "../voice";

type Story = { title: string; text: string; reading: string; translation: string; questions: { q: string; options: string[]; answer: number }[] };

const TOPICS = ["в кафе", "путешествие", "работа", "выходные", "семья", "покупки", "погода", "хобби"];

export function ListeningScreen({ onBack }: { onBack: () => void }) {
  const { lang, level, gainXp, update } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [showText, setShowText] = useState(false);
  const [picked, setPicked] = useState<Record<number, number>>({});

  async function load() {
    setBusy(true); setError(null); setStory(null); setPicked({}); setShowText(false); stopSpeaking();
    try {
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const ruQuestions = lang.id === "ja" || isBeginner(lang.id, level);
      const r = await askJson<Story>(
        `You write listening exercises for Russian-speaking learners of ${lang.nameEn}.`,
        `Write a short story or dialogue (${isBeginner(lang.id, level) ? "4-5 very simple sentences" : "6-8 sentences"}) in ${lang.nameEn} for level ${level}, topic: ${topic}. ` +
          (lang.id === "ja" ? "Use kana (and only very common kanji for N4+). " : "") +
          `Then 3 multiple-choice comprehension questions ${ruQuestions ? "in Russian" : `in ${lang.nameEn}`}. ` +
          `Return {"title": "short title in Russian", "text": "the story", "reading": "${lang.id === "ja" ? "romaji of the story" : lang.id === "tr" && ruQuestions ? "reading of the story in Russian letters" : ""}", "translation": "Russian translation", ` +
          `"questions": [{"q": string, "options": [3 strings], "answer": index}]}`,
      );
      setStory(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function play() {
    if (!story) return;
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    setPlaying(true);
    speak(story.text, lang, { rate, onDone: () => setPlaying(false), onStop: () => setPlaying(false) });
  }

  const answered = story ? Object.keys(picked).length : 0;
  const correct = story ? story.questions.filter((q, i) => picked[i] === q.answer).length : 0;
  const finished = story && answered === story.questions.length;

  function pick(qi: number, oi: number) {
    if (picked[qi] !== undefined || !story) return;
    const next = { ...picked, [qi]: oi };
    setPicked(next);
    if (Object.keys(next).length === story.questions.length) {
      const c = story.questions.filter((q, i) => next[i] === q.answer).length;
      gainXp(c * 3);
      if (c === story.questions.length) update((p) => bump(p, "perfectListening"));
    }
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={() => { stopSpeaking(); onBack(); }} />
      <Text style={s.h1}>Аудирование</Text>
      {!story && !busy && (
        <Card>
          <Text style={s.p}>Emma придумает короткую историю вашего уровня и прочитает её вслух. Слушайте без текста, потом ответьте на вопросы.</Text>
          <Button title="Новая история" onPress={load} />
        </Card>
      )}
      {busy && <View style={{ alignItems: "center" }}><EmmaPic source={EMMA.focus} size={120} /><ActivityIndicator color={C.primary} /></View>}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      {story && (
        <>
          <Card style={{ alignItems: "center", gap: 12 }}>
            <Text style={s.h2}>{story.title}</Text>
            <MicButton onPress={play} active={playing} size={72} />
            <Text style={s.muted}>{playing ? "Звучит… нажмите, чтобы остановить" : "Нажмите, чтобы прослушать"}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip label="Медленно" active={rate === 0.6} onPress={() => setRate(0.6)} />
              <Chip label="Обычно" active={rate === 0.9} onPress={() => setRate(0.9)} />
            </View>
          </Card>
          {story.questions.map((q, qi) => (
            <Card key={qi}>
              <Text style={s.h2}>{q.q}</Text>
              {q.options.map((o, oi) => {
                const done = picked[qi] !== undefined;
                return (
                  <Pressable key={oi} onPress={() => pick(qi, oi)} style={[s.option,
                    done && oi === q.answer && { borderColor: C.good },
                    done && picked[qi] === oi && oi !== q.answer && { borderColor: C.danger }]}>
                    <Text style={s.p}>{o}</Text>
                  </Pressable>
                );
              })}
            </Card>
          ))}
          {finished && (
            <Card style={{ alignItems: "center" }}>
              <EmmaPic source={correct === story.questions.length ? EMMA.achievement : correct ? EMMA.approval : EMMA.support} size={110} />
              <Text style={s.h2}>Правильно: {correct} из {story.questions.length}</Text>
            </Card>
          )}
          <Button title={showText ? "Скрыть текст" : "Показать текст и перевод"} kind="ghost" onPress={() => setShowText(!showText)} />
          {showText && (
            <Card>
              <Text style={[s.p, { fontSize: 17 }]}>{story.text}</Text>
              {story.reading ? <Text style={{ color: C.primary }}>{story.reading}</Text> : null}
              <Text style={s.muted}>{story.translation}</Text>
            </Card>
          )}
          <Button title="Новая история" onPress={load} />
        </>
      )}
    </ScrollView>
  );
}
