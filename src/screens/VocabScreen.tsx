import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { askJson } from "../ai";
import { useApp } from "../state";
import { bump } from "../storage";
import { isDue, LEARNED_BOX, review, Word } from "../vocab";
import { Bar, Button, C, Card, PlayButton, s } from "../ui";
import { speak } from "../voice";

export function VocabScreen({ onBack }: { onBack: () => void }) {
  const { lang, langWords, setWords, addWords, gainXp, update } = useApp();
  const [queue, setQueue] = useState<Word[] | null>(null);
  const [shown, setShown] = useState(false);
  const [retried, setRetried] = useState<Set<string>>(new Set());
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [reading, setReading] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const due = langWords.filter(isDue);
  const learned = langWords.filter((w) => w.box >= LEARNED_BOX).length;

  function answer(w: Word, remembered: boolean) {
    setWords((all) => all.map((x) => (x.id === w.id ? review(x, remembered) : x)));
    gainXp(1);
    update((p) => bump(p, "reviews"));
    let rest = queue!.slice(1);
    // Забытое слово показываем ещё раз в конце, но только один раз.
    if (!remembered && !retried.has(w.id)) {
      rest = [...rest, w];
      setRetried(new Set(retried).add(w.id));
    }
    setQueue(rest);
    setShown(false);
  }

  async function translate() {
    if (!word.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await askJson<{ word: string; reading: string; translation: string }>(
        `Ты словарь для русскоговорящего ученика (${lang.name.toLowerCase()}).`,
        `Слово или фраза: "${word}". Если это по-русски, переведи на ${lang.nameEn}. ` +
          `Верни {"word": "на изучаемом языке", "reading": "${lang.id === "ja" ? "ромадзи" : "транскрипция IPA"}", "translation": "по-русски"}`,
      );
      setWord(r.word);
      setReading(r.reading);
      setTranslation(r.translation);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (queue) {
    const w = queue[0];
    return (
      <ScrollView contentContainerStyle={[s.pad, { flexGrow: 1 }]}>
        <Button title="← Закончить" kind="ghost" onPress={() => setQueue(null)} />
        {!w ? (
          <Card style={{ alignItems: "center" }}>
            <Text style={s.h2}>Всё повторили!</Text>
            <Text style={s.p}>Следующее повторение я подскажу сама.</Text>
          </Card>
        ) : (
          <>
            <Text style={s.muted}>Осталось: {queue.length}</Text>
            <Card style={{ alignItems: "center", paddingVertical: 32, gap: 12 }}>
              <Text style={{ fontSize: 28, fontWeight: "700", color: C.text, textAlign: "center" }}>{w.word}</Text>
              <PlayButton onPress={() => speak(w.word, lang, { rate: 0.85 })} />
              {shown ? (
                <>
                  {w.reading ? <Text style={{ color: C.primary, fontSize: 16 }}>{w.reading}</Text> : null}
                  <Text style={[s.p, { fontSize: 20, textAlign: "center" }]}>{w.translation}</Text>
                </>
              ) : <Text style={s.muted}>Вспомните перевод</Text>}
            </Card>
            {shown ? (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}><Button title="Не помню" kind="ghost" onPress={() => answer(w, false)} /></View>
                <View style={{ flex: 1 }}><Button title="Помню" onPress={() => answer(w, true)} /></View>
              </View>
            ) : <Button title="Показать перевод" onPress={() => setShown(true)} />}
          </>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>Словарь</Text>
      <Card>
        <Text style={s.h2}>Выучено {learned} из {langWords.length}</Text>
        <Bar value={langWords.length ? learned / langWords.length : 0} />
        <Text style={s.muted}>Слово считается выученным, когда вы вспомнили его 3 раза подряд с перерывами в несколько дней.</Text>
        <Button title={due.length ? `Повторить (${due.length})` : "Сегодня всё повторено"} disabled={!due.length}
          onPress={() => { setRetried(new Set()); setQueue(due); }} />
      </Card>
      <Card>
        <Text style={s.h2}>Добавить слово</Text>
        <TextInput style={s.input} value={word} onChangeText={setWord} placeholder="Слово (на любом из двух языков)" placeholderTextColor={C.muted} />
        <TextInput style={s.input} value={translation} onChangeText={setTranslation} placeholder="Перевод" placeholderTextColor={C.muted} />
        <TextInput style={s.input} value={reading} onChangeText={setReading} placeholder={lang.readingLabel + " (необязательно)"} placeholderTextColor={C.muted} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}><Button title={busy ? "…" : "Заполнить с ИИ"} kind="ghost" onPress={translate} disabled={busy || !word.trim()} /></View>
          <View style={{ flex: 1 }}>
            <Button title="Добавить" disabled={!word.trim() || !translation.trim()}
              onPress={() => { const n = addWords([{ word, translation, reading }]); setMsg(n ? "Добавлено ✓" : "Такое слово уже есть"); setWord(""); setTranslation(""); setReading(""); }} />
          </View>
        </View>
        {busy && <ActivityIndicator color={C.primary} />}
        {msg && <Text style={s.muted}>{msg}</Text>}
      </Card>
      <Text style={s.h2}>Все слова</Text>
      {langWords.length === 0 && <Text style={s.muted}>Слова появятся после уроков и разговоров с Emma.</Text>}
      {[...langWords].reverse().map((w) => (
        <Card key={w.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <PlayButton onPress={() => speak(w.word, lang, { rate: 0.85 })} />
          <View style={{ flex: 1 }}>
            <Text style={[s.p, { fontWeight: "600" }]}>{w.word}</Text>
            <Text style={s.muted}>{w.translation}{w.reading ? ` · ${w.reading}` : ""}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={{ width: 6, height: 14, borderRadius: 3, backgroundColor: w.box >= i ? C.primary : C.border }} />
            ))}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}
