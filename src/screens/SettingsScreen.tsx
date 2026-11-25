import React, { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, TextInput } from "react-native";
import { getApiKey, saveApiKey } from "../ai";
import { Button, C, Card, s } from "../ui";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export function SettingsScreen({ level, onLevel }: { level: string; onLevel: (l: string) => void }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { getApiKey().then((k) => setKey(k ?? "")); }, []);

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Text style={s.h1}>Настройки</Text>
      <Card>
        <Text style={s.h2}>Ключ ИИ (Anthropic API)</Text>
        <Text style={s.muted}>
          Ключ хранится только в защищённой памяти этого телефона. Оплата за разговоры идёт с аккаунта владельца ключа.
        </Text>
        <TextInput style={s.input} value={key} onChangeText={(t) => { setKey(t); setSaved(false); }}
          placeholder="sk-ant-…" autoCapitalize="none" autoCorrect={false} secureTextEntry />
        <Button title={saved ? "Сохранено ✓" : "Сохранить ключ"} onPress={async () => { await saveApiKey(key); setSaved(true); }} />
        <Button title="Где взять ключ?" kind="ghost" onPress={() => Linking.openURL("https://platform.claude.com/settings/keys")} />
      </Card>
      <Card>
        <Text style={s.h2}>Мой уровень</Text>
        {LEVELS.map((l) => (
          <Pressable key={l} onPress={() => onLevel(l)}
            style={[s.option, l === level && { borderColor: C.primary, backgroundColor: C.primaryLight }]}>
            <Text style={s.p}>{l}</Text>
          </Pressable>
        ))}
      </Card>
    </ScrollView>
  );
}
