import React, { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { askJson } from "../ai";
import { EMMA, EmmaPic } from "../emma";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { lessonsFor } from "../data/lessons";
import { useApp } from "../state";
import { bump } from "../storage";
import { Button, C, Card, Chip, MicButton, PlayButton, s } from "../ui";
import { speak } from "../voice";

type Phrase = { text: string; reading?: string; ru: string };
type Sounds = { sounds: { sound: string; word: string; tip: string }[]; general: string };

const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Сравнение по словам (английский) или по знакам (японский). */
function compare(target: string, heard: string, ja: boolean): { parts: { t: string; ok: boolean }[]; score: number } {
  if (ja) {
    const tt = norm(target).replace(/\s/g, ""), hh = norm(heard).replace(/\s/g, "");
    const score = tt.length ? Math.max(0, Math.round((1 - editDistance(tt, hh) / tt.length) * 100)) : 0;
    const parts = [...tt].map((ch) => ({ t: ch, ok: hh.includes(ch) }));
    return { parts, score };
  }
  const heardWords = norm(heard).split(" ");
  const parts = target.split(/\s+/).map((w) => {
    const n = norm(w);
    const ok = heardWords.some((h) => h === n || (n.length > 3 && editDistance(h, n) <= 1));
    return { t: w, ok };
  });
  const score = parts.length ? Math.round((parts.filter((x) => x.ok).length / parts.length) * 100) : 0;
  return { parts, score };
}

export function PronunciationScreen({ onBack }: { onBack: () => void }) {
  const { lang, level, langWords, gainXp, update } = useApp();
  const phrases = useMemo<Phrase[]>(() => {
    const myLevel = lang.levels.indexOf(level);
    const fromLessons = lessonsFor(lang.id).filter((l) => lang.levels.indexOf(l.level) <= myLevel)
      .flatMap((l) => l.examples.map((e) => ({ text: e.en, reading: e.ipa, ru: e.ru })));
    const fromWords = langWords.slice(-20).map((w) => ({ text: w.word, reading: w.reading, ru: w.translation }));
    const seen = new Set<string>();
    return [...fromLessons, ...fromWords].filter((x) => !seen.has(x.text) && (seen.add(x.text), true));
  }, [lang.id, level]);
  const [i, setI] = useState(0);
  const [heard, setHeard] = useState("");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof compare> | null>(null);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sounds, setSounds] = useState<Sounds | null>(null);
  const [soundsBusy, setSoundsBusy] = useState(false);
  const phrase = phrases[i % Math.max(1, phrases.length)];

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (e) => {
    const t = e.results[0]?.transcript ?? "";
    setHeard(t);
    if (e.isFinal && phrase) {
      const r = compare(phrase.text, t, lang.id === "ja");
      setResult(r);
      gainXp(r.score >= 80 ? 3 : 1);
      update((p) => bump(p, "bestPron", r.score));
      if (r.score < 100) analyze(phrase, t);
    }
  });
  useSpeechRecognitionEvent("error", (e) => {
    setListening(false);
    if (e.error !== "no-speech" && e.error !== "aborted") setError(e.error === "not-allowed" ? "Разрешите доступ к микрофону в настройках телефона." : e.message);
  });

  /** Emma смотрит, что распознал телефон, и называет звуки, которые стоит поправить. */
  async function analyze(ph: Phrase, said: string) {
    setSoundsBusy(true);
    try {
      const r = await askJson<Sounds>(
        `Ты Emma, преподаватель произношения (${lang.name.toLowerCase()}) для русскоговорящего ученика. Пиши по-русски, коротко и по делу.`,
        `Ученик читал фразу: "${ph.text}"${ph.reading ? ` (${ph.reading})` : ""}. Распознавание речи услышало: "${said}". ` +
          `По расхождениям определи конкретные звуки, которые ученик произнёс неверно (типичные трудности русскоговорящих: ${lang.id === "ja" ? "долгие гласные, удвоенные согласные っ, ら-ряд, ん, ふ" : "th, w/v, r, h, долгие и краткие гласные, æ, оглушение конечных согласных"}). ` +
          `Верни {"sounds": [{"sound": "${lang.id === "ja" ? "кана и ромадзи" : "звук в IPA, например /θ/"}", "word": "слово из фразы с этим звуком", "tip": "как поставить язык и губы, 1-2 предложения"}] (1-3 пункта, только реальные проблемы), "general": "одно ободряющее предложение"}`,
      );
      setSounds(r);
    } catch {
      setSounds(null);
    } finally {
      setSoundsBusy(false);
    }
  }

  async function record() {
    if (listening) { ExpoSpeechRecognitionModule.stop(); return; }
    setError(null); setResult(null); setHeard(""); setSounds(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) { setError("Разрешите доступ к микрофону в настройках телефона."); return; }
    ExpoSpeechRecognitionModule.start({ lang: lang.speech, interimResults: true, continuous: false });
  }

  if (!phrase) {
    return (
      <ScrollView contentContainerStyle={s.pad}>
        <Button title="← Практика" kind="ghost" onPress={onBack} />
        <Text style={s.p}>Пройдите первый урок, и здесь появятся фразы для тренировки.</Text>
      </ScrollView>
    );
  }

  const verdict = !result ? null : result.score >= 85 ? "Отлично! Очень похоже 🎉" : result.score >= 60 ? "Хорошо! Поработайте над отмеченными частями." : "Попробуйте ещё раз, послушав фразу медленно.";

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <Text style={s.h1}>Произношение</Text>
      <Text style={s.muted}>Фраза {(i % phrases.length) + 1} из {phrases.length}. Послушайте, затем нажмите на микрофон и повторите.</Text>
      <Card style={{ alignItems: "center", gap: 10, paddingVertical: 24 }}>
        {result ? (
          <Text style={{ fontSize: 24, textAlign: "center" }}>
            {result.parts.map((x, n) => (
              <Text key={n} style={{ color: x.ok ? C.good : C.danger, fontWeight: "700" }}>{x.t}{lang.id === "ja" ? "" : " "}</Text>
            ))}
          </Text>
        ) : <Text style={{ fontSize: 24, fontWeight: "700", color: C.text, textAlign: "center" }}>{phrase.text}</Text>}
        {phrase.reading ? <Text style={{ color: C.primary, fontSize: 16 }}>{phrase.reading}</Text> : null}
        <Text style={s.muted}>{phrase.ru}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <PlayButton onPress={() => speak(phrase.text, lang, { rate: slow ? 0.6 : 0.9 })} />
          <Chip label="Медленно" active={slow} onPress={() => setSlow(!slow)} />
        </View>
      </Card>
      <View style={{ alignItems: "center", gap: 6 }}>
        <MicButton onPress={record} active={listening} size={80} />
        <Text style={s.muted}>{listening ? "Говорите…" : "Повторить фразу"}</Text>
      </View>
      {heard ? <Text style={[s.p, { textAlign: "center", fontStyle: "italic" }]}>Услышала: {heard}</Text> : null}
      {result && (
        <Card style={{ alignItems: "center" }}>
          <EmmaPic source={result.score >= 95 ? EMMA.delight : result.score >= 85 ? EMMA.joy : result.score >= 60 ? EMMA.approval : EMMA.support} size={110} />
          <Text style={{ fontSize: 36, fontWeight: "700", color: result.score >= 85 ? C.good : result.score >= 60 ? C.primary : C.danger }}>{result.score}%</Text>
          <Text style={s.p}>{verdict}</Text>
        </Card>
      )}
      {soundsBusy && <View style={{ alignItems: "center", gap: 4 }}><ActivityIndicator color={C.primary} /><Text style={s.muted}>Emma разбирает звуки…</Text></View>}
      {sounds && sounds.sounds.length > 0 && (
        <Card style={{ gap: 10 }}>
          <Text style={s.h2}>Над чем поработать</Text>
          {sounds.sounds.map((x, n) => (
            <View key={n} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <View style={{ minWidth: 52, paddingHorizontal: 8, height: 40, borderRadius: 12, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.primary, fontWeight: "700", fontSize: 16 }}>{x.sound}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[s.p, { fontWeight: "700" }]}>{x.word}</Text>
                  <PlayButton onPress={() => speak(x.word, lang, { rate: 0.6 })} />
                </View>
                <Text style={s.muted}>{x.tip}</Text>
              </View>
            </View>
          ))}
          {sounds.general ? <Text style={s.p}>{sounds.general}</Text> : null}
          <Text style={[s.muted, { fontSize: 12 }]}>Разбор основан на том, что распознал телефон, поэтому он примерный.</Text>
        </Card>
      )}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      <Button title="Следующая фраза" kind="ghost" onPress={() => { setI(i + 1); setResult(null); setHeard(""); setSounds(null); }} />
    </ScrollView>
  );
}
