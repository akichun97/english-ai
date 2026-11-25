import React, { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, ScrollViewInstance, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { askTeacher, ChatMessage, teacherPrompt } from "../ai";
import { Button, C, s } from "../ui";

const MODES = [
  { id: "free", label: "Свободный разговор", mode: "free conversation on any topic the student likes" },
  { id: "roleplay", label: "Ролевая игра", mode: "role-play: you are a café waiter, the student is a customer" },
  { id: "interview", label: "Собеседование", mode: "job interview practice; you are the interviewer" },
  { id: "ielts", label: "IELTS Speaking", mode: "IELTS Speaking test simulation (Parts 1-3); at the end give an estimated band score with explanation in Russian" },
];

export function ChatScreen({ level, onXp }: { level: string; onXp: (xp: number) => void }) {
  const [mode, setMode] = useState(MODES[0]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ScrollViewInstance>(null);

  async function send(text: string, history = msgs) {
    const next: ChatMessage[] = [...history, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const reply = await askTeacher(teacherPrompt(level, mode.mode), next);
      setMsgs([...next, { role: "assistant", content: reply }]);
      onXp(2);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd(), 100);
    }
  }

  function start(m: (typeof MODES)[number]) {
    setMode(m);
    setMsgs([]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }} style={{ flexGrow: 0 }}>
        {MODES.map((m) => (
          <Pressable key={m.id} onPress={() => start(m)}
            style={[s.option, { paddingVertical: 8 }, m.id === mode.id && { borderColor: C.primary, backgroundColor: C.primaryLight }]}>
            <Text>{m.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView ref={scroll} contentContainerStyle={s.pad}>
        {msgs.length === 0 && (
          <View style={{ gap: 12 }}>
            <Text style={s.p}>Это ваш преподаватель Emma. Пишите ей по-английски, она поправит ошибки и объяснит их по-русски.</Text>
            <Button title="Начать урок" onPress={() => send("Hi! Let's start.", [])} disabled={busy} />
          </View>
        )}
        {msgs.map((m, n) => (
          <Pressable key={n} onLongPress={() => m.role === "assistant" && Speech.speak(m.content.split("✏️")[0], { language: "en-US" })}
            style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%",
              backgroundColor: m.role === "user" ? C.primary : C.card, borderRadius: 16, padding: 12,
              borderWidth: m.role === "user" ? 0 : 1, borderColor: C.border }}>
            <Text style={{ color: m.role === "user" ? "#fff" : C.text, fontSize: 16, lineHeight: 22 }}>{m.content}</Text>
          </Pressable>
        ))}
        {busy && <ActivityIndicator />}
        {error && <Text style={{ color: C.danger }}>{error}</Text>}
        {msgs.length > 0 && <Text style={s.muted}>Совет: долгое нажатие на сообщение — прослушать произношение.</Text>}
      </ScrollView>
      <View style={{ flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
        <TextInput style={[s.input, { flex: 1 }]} value={input} onChangeText={setInput} placeholder="Type in English…" multiline />
        <Button title="➤" onPress={() => input.trim() && send(input.trim())} disabled={busy || !input.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}
