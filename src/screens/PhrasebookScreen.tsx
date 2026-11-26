import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { phrases, TOPICS } from "../data/phrasebook";
import { EMMA, EmmaPic } from "../emma";
import { useApp } from "../state";
import { Button, C, Card, Chip, PlayButton, s } from "../ui";
import { speak } from "../voice";

/** Разговорник для поездок: фразы по ситуациям, озвучка и добавление в словарь. */
export function PhrasebookScreen({ onBack }: { onBack: () => void }) {
  const { lang, addWords } = useApp();
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [slow, setSlow] = useState(false);
  const [added, setAdded] = useState<Record<string, number>>({});
  const list = phrases(lang.id, topic);

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={EMMA.planning} size={84} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Разговорник</Text>
          <Text style={s.muted}>{lang.name}. Фразы для поездки, работают без интернета.</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TOPICS.map((t) => <Chip key={t.id} label={`${t.emoji} ${t.title}`} active={topic === t.id} onPress={() => setTopic(t.id)} />)}
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Chip label="Медленно" active={slow} onPress={() => setSlow(!slow)} />
      </View>
      {list.map((ph) => (
        <Card key={ph.text} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <PlayButton onPress={() => speak(ph.text, lang, { rate: slow ? 0.6 : 0.9 })} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[s.p, { fontWeight: "700", fontSize: 17 }]}>{ph.text}</Text>
            <Text style={{ color: C.primary }}>{ph.reading}</Text>
            <Text style={s.muted}>{ph.ru}</Text>
          </View>
        </Card>
      ))}
      <Button title={added[topic] === undefined ? "Добавить фразы в словарь" : added[topic] ? `Добавлено: ${added[topic]} ✓` : "Уже в словаре"}
        kind="ghost" disabled={added[topic] !== undefined}
        onPress={() => setAdded({ ...added, [topic]: addWords(list.map((p) => ({ word: p.text, translation: p.ru, reading: p.reading }))) })} />
    </ScrollView>
  );
}
