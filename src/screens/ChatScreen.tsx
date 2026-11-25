import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, ScrollViewInstance, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { askTeacher, ChatMessage, teacherPrompt } from "../ai";
import { Button, C, s } from "../ui";

const MODES = [
  { id: "free", label: "Свободный разговор", mode: "free conversation on any topic the student likes" },
  { id: "roleplay", label: "Ролевая игра", mode: "role-play: you are a café waiter, the student is a customer" },
  { id: "interview", label: "Собеседование", mode: "job interview practice; you are the interviewer" },
  { id: "ielts", label: "IELTS Speaking", mode: "IELTS Speaking test simulation (Parts 1-3); at the end give an estimated band score with explanation in Russian" },
];

/** Озвучиваем только английскую часть ответа, без строки с исправлением. */
function speakable(text: string): string {
  return text.split("✏️")[0].trim();
}

export function ChatScreen({ level, onXp }: { level: string; onXp: (xp: number) => void }) {
  const [mode, setMode] = useState(MODES[0]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Голосовой режим: ответы Emma звучат вслух, после ответа микрофон включается снова.
  const [voice, setVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    setInput(text);
    if (event.isFinal && text.trim()) send(text.trim());
  });
  useSpeechRecognitionEvent("error", (event) => {
    setListening(false);
    if (event.error === "no-speech" || event.error === "aborted") return;
    if (event.error === "not-allowed") setError("Разрешите приложению доступ к микрофону в настройках телефона.");
    else setError(`Не удалось распознать речь: ${event.message}`);
  });

  useEffect(() => () => { Speech.stop(); ExpoSpeechRecognitionModule.abort(); }, []);

  async function listen() {
    setError(null);
    Speech.stop();
    setSpeaking(false);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError("Разрешите приложению доступ к микрофону в настройках телефона.");
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: false });
  }

  function micPress() {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    setVoice(true);
    listen();
  }

  function say(text: string) {
    setSpeaking(true);
    Speech.speak(speakable(text), {
      language: "en-US",
      rate: 0.95,
      onDone: () => {
        setSpeaking(false);
        if (voiceRef.current) listen();
      },
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  async function send(text: string, history = msgsRef.current) {
    const next: ChatMessage[] = [...history, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const reply = await askTeacher(teacherPrompt(level, mode.mode), next);
      setMsgs([...next, { role: "assistant", content: reply }]);
      onXp(2);
      if (voiceRef.current) say(reply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd(), 100);
    }
  }

  function start(m: (typeof MODES)[number]) {
    Speech.stop();
    ExpoSpeechRecognitionModule.abort();
    setMode(m);
    setMsgs([]);
  }

  function stopVoice() {
    setVoice(false);
    Speech.stop();
    ExpoSpeechRecognitionModule.abort();
  }

  const status = listening ? "Слушаю… говорите по-английски" : speaking ? "Emma говорит…" : busy ? "Emma думает…" : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12, gap: 8 }} style={{ flexGrow: 0 }}>
        {MODES.map((m) => (
          <Pressable key={m.id} onPress={() => start(m)}
            style={[s.option, { paddingVertical: 8 }, m.id === mode.id && { borderColor: C.primary, backgroundColor: C.primaryLight }]}>
            <Text>{m.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView ref={scroll} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd()}>
        {msgs.length === 0 && (
          <View style={{ gap: 12 }}>
            <Text style={s.p}>Это ваш преподаватель Emma. Пишите ей или нажмите на круглую кнопку микрофона и говорите по-английски. Она поправит ошибки и объяснит их по-русски.</Text>
            <Button title="Начать урок" onPress={() => send("Hi! Let's start.", [])} disabled={busy} />
            <Button title="Начать голосом" kind="ghost" onPress={() => { setVoice(true); send("Hi! Let's start a spoken conversation.", []); }} disabled={busy} />
          </View>
        )}
        {msgs.map((m, n) => (
          <Pressable key={n} onLongPress={() => m.role === "assistant" && say(m.content)}
            style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%",
              backgroundColor: m.role === "user" ? C.primary : C.card, borderRadius: 16, padding: 12,
              borderWidth: m.role === "user" ? 0 : 1, borderColor: C.border }}>
            <Text style={{ color: m.role === "user" ? "#fff" : C.text, fontSize: 16, lineHeight: 22 }}>{m.content}</Text>
          </Pressable>
        ))}
        {busy && <ActivityIndicator />}
        {error && <Text style={{ color: C.danger }}>{error}</Text>}
        {msgs.length > 0 && !voice && <Text style={s.muted}>Совет: долгое нажатие на сообщение — прослушать произношение.</Text>}
      </ScrollView>
      {(status || voice) && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 6, backgroundColor: C.primaryLight }}>
          <Text style={{ color: C.primary, fontWeight: "600" }}>{status ?? "Голосовой режим включён"}</Text>
          {voice && (
            <Pressable onPress={stopVoice} hitSlop={8}>
              <Text style={{ color: C.primary, textDecorationLine: "underline" }}>Выключить голос</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
        <TextInput style={[s.input, { flex: 1, maxHeight: 120 }]} value={input} onChangeText={setInput}
          placeholder="Type in English…" placeholderTextColor={C.muted} multiline />
        {input.trim() && !listening ? (
          <RoundButton onPress={() => send(input.trim())} disabled={busy} filled>
            <View style={{ width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 13,
              borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: "#fff", marginLeft: 3 }} />
          </RoundButton>
        ) : (
          <RoundButton onPress={micPress} disabled={busy} filled={listening}>
            {/* Микрофон: круг, который заполняется, пока идёт запись */}
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: listening ? "#fff" : C.primary }} />
          </RoundButton>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function RoundButton({ children, onPress, disabled, filled }: { children: React.ReactNode; onPress: () => void; disabled?: boolean; filled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
        backgroundColor: filled ? C.primary : C.primaryLight, borderWidth: 2, borderColor: C.primary,
        opacity: pressed || disabled ? 0.6 : 1 })}>
      {children}
    </Pressable>
  );
}
