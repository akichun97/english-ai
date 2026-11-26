import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { askPhotoJson } from "../ai";
import { EMMA, EmmaPic } from "../emma";
import { useOnline } from "../network";
import { useApp } from "../state";
import { Button, C, Card, PlayButton, s } from "../ui";
import { speak } from "../voice";

type Result = {
  found: string; // текст на фото
  translation: string;
  explanation: string; // что это и как пользоваться
  words: { word: string; reading: string; translation: string }[];
};

/** Перевод с фото: вывеска, меню, этикетка. Emma объясняет и предлагает слова в словарь. */
export function PhotoScreen({ onBack }: { onBack: () => void }) {
  const { lang, level, addWords, gainXp } = useApp();
  const online = useOnline();
  const [uri, setUri] = useState<string | null>(null);
  const [r, setR] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<number | null>(null);

  async function pick(camera: boolean) {
    setError(null);
    const perm = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError(camera ? "Разрешите доступ к камере в настройках телефона." : "Разрешите доступ к фото в настройках телефона."); return; }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.4, base64: true, allowsEditing: true };
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled || !res.assets[0]?.base64) return;
    const a = res.assets[0];
    setUri(a.uri); setR(null); setAdded(null); setBusy(true);
    try {
      const x = await askPhotoJson<Result>(
        `Ты Emma, преподаватель (${lang.name.toLowerCase()}) для русскоговорящего ученика уровня ${level}. Пиши по-русски, просто.`,
        `На фото может быть вывеска, меню, этикетка или текст на ${lang.nameEn} (или другом языке). ` +
          `Верни {"found": "текст с фото как есть (если текста нет — опиши, что на фото, по-${lang.id === "en" ? "английски" : lang.id === "ja" ? "японски" : "турецки"})", ` +
          `"translation": "перевод на русский", "explanation": "что это значит и что делать, 1-3 предложения", ` +
          `"words": [{"word": "полезное слово с фото на ${lang.nameEn}", "reading": "${lang.readingHint}", "translation": "перевод"}] (3-6 слов)}`,
        a.base64!, a.mimeType ?? "image/jpeg",
      );
      setR(x);
      gainXp(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={busy ? EMMA.focus : r ? EMMA.understanding : EMMA.curious} size={84} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Перевод с фото</Text>
          <Text style={s.muted}>Сфотографируйте вывеску, меню или этикетку. Emma переведёт и объяснит.</Text>
        </View>
      </View>
      {!online && <Text style={{ color: C.danger }}>Для перевода с фото нужен интернет.</Text>}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}><Button title="Сфотографировать" onPress={() => pick(true)} disabled={busy || !online} /></View>
        <View style={{ flex: 1 }}><Button title="Из галереи" kind="ghost" onPress={() => pick(false)} disabled={busy || !online} /></View>
      </View>
      {uri && <Image source={{ uri }} style={{ width: "100%", height: 220, borderRadius: 16 }} resizeMode="cover" />}
      {busy && <ActivityIndicator color={C.primary} />}
      {error && <Text style={{ color: C.danger }}>{error}</Text>}
      {r && (
        <>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <PlayButton onPress={() => speak(r.found, lang, { rate: 0.85 })} />
              <Text style={[s.p, { flex: 1, fontWeight: "700" }]}>{r.found}</Text>
            </View>
            <Text style={[s.p, { color: C.primary }]}>{r.translation}</Text>
            <Text style={s.muted}>{r.explanation}</Text>
          </Card>
          {r.words.length > 0 && <Text style={s.h2}>Слова</Text>}
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
            <Button title={added === null ? "Добавить слова в словарь" : added ? `Добавлено: ${added} ✓` : "Эти слова уже в словаре"}
              disabled={added !== null} onPress={() => setAdded(addWords(r.words))} />
          )}
        </>
      )}
    </ScrollView>
  );
}
