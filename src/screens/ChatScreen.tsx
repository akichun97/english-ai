import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, KeyboardAvoidingView, Pressable, ScrollView, ScrollViewInstance, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { askTeacher, ChatMessage, teacherPrompt } from "../ai";
import { EMMA, EmmaMood } from "../emma";
import { Button, C, s } from "../ui";
import { EmmaProfile } from "./EmmaProfile";

const MODES = [
  { id: "free", label: "Свободный разговор", mode: "free conversation on any topic the student likes" },
  { id: "roleplay", label: "Ролевая игра", mode: "role-play: you are a café waiter, the student is a customer" },
  { id: "interview", label: "Собеседование", mode: "job interview practice; you are the interviewer" },
  { id: "ielts", label: "IELTS Speaking", mode: "IELTS Speaking test simulation (Parts 1-3); at the end give an estimated band score with explanation in Russian" },
];

/** Английская часть ответа и строка с исправлением отдельно. */
function splitReply(text: string): { main: string; fix: string | null } {
  const [main, ...rest] = text.split("✏️");
  return { main: main.trim(), fix: rest.length ? rest.join("").trim() : null };
}

export function ChatScreen({ level, onXp }: { level: string; onXp: (xp: number) => void }) {
  const [mode, setMode] = useState(MODES[0]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);
  // Голосовой урок: на экране Emma, её ответы звучат вслух, после ответа микрофон включается снова.
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
    listen();
  }

  function say(text: string) {
    setSpeaking(true);
    Speech.speak(splitReply(text).main, {
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

  function startVoice() {
    setProfile(false);
    setVoice(true);
    voiceRef.current = true;
    if (msgsRef.current.length === 0) send("Hi! Let's start a spoken conversation.", []);
    else listen();
  }

  function stopVoice() {
    setVoice(false);
    Speech.stop();
    ExpoSpeechRecognitionModule.abort();
  }

  if (profile) {
    return <EmmaProfile onBack={() => setProfile(false)} onVoice={startVoice} onChat={() => setProfile(false)} />;
  }

  const lastReply = [...msgs].reverse().find((m) => m.role === "assistant");

  const modeChips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 8 }} style={{ flexGrow: 0 }}>
      {MODES.map((m) => (
        <Pressable key={m.id} onPress={() => start(m)}
          style={[s.option, { paddingVertical: 6, borderRadius: 20 }, m.id === mode.id && { borderColor: C.primary, backgroundColor: C.primaryLight }]}>
          <Text style={{ color: C.text }}>{m.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const header = (
    <Pressable onPress={() => setProfile(true)}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
      <Image source={EMMA.happy} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: C.lilac }} />
      <View style={{ flex: 1 }}>
        <Text style={s.h2}>Emma</Text>
        <Text style={s.muted}>Твой AI-наставник · профиль</Text>
      </View>
      {!voice && (
        <Pressable onPress={startVoice} style={{ backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>Голосом</Text>
        </Pressable>
      )}
    </Pressable>
  );

  if (voice) {
    const mood: EmmaMood = error ? "sleep" : listening ? "surprised" : busy ? "thinking"
      : lastReply && splitReply(lastReply.content).fix ? "calm" : speaking ? "happy" : lastReply ? "love" : "happy";
    const status = error ? "Что-то пошло не так" : listening ? "Слушаю… говорите по-английски" : busy ? "Emma думает…"
      : speaking ? "Emma говорит" : "Нажмите на микрофон и говорите";
    return (
      <VoiceCall mood={mood} status={status} active={listening || speaking} header={modeChips}
        caption={lastReply ? splitReply(lastReply.content) : null} transcript={listening ? input : ""}
        error={error} listening={listening} busy={busy}
        onMic={micPress} onEnd={stopVoice} onReplay={() => lastReply && say(lastReply.content)} />
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      {header}
      {modeChips}
      <ScrollView ref={scroll} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd()}>
        {msgs.length === 0 && (
          <View style={{ gap: 12, alignItems: "center" }}>
            <Image source={EMMA.reading} style={{ width: 160, height: 250, borderRadius: 24 }} resizeMode="cover" />
            <Text style={[s.p, { textAlign: "center" }]}>Привет! Я Emma. Пиши мне по-английски или поговорим голосом. Я поправлю ошибки и объясню их по-русски.</Text>
            <View style={{ alignSelf: "stretch", gap: 12 }}>
              <Button title="Голосовой урок" onPress={startVoice} disabled={busy} />
              <Button title="Начать переписку" kind="ghost" onPress={() => send("Hi! Let's start.", [])} disabled={busy} />
            </View>
          </View>
        )}
        {msgs.map((m, n) => (
          <View key={n} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            {m.role === "assistant" && <Image source={EMMA.happy} style={{ width: 28, height: 28, borderRadius: 14 }} />}
            <Pressable onLongPress={() => m.role === "assistant" && say(m.content)}
              style={{ flexShrink: 1, backgroundColor: m.role === "user" ? C.primary : C.card, borderRadius: 18, padding: 12,
                borderWidth: m.role === "user" ? 0 : 1, borderColor: C.border }}>
              <Text style={{ color: m.role === "user" ? "#fff" : C.text, fontSize: 16, lineHeight: 22 }}>{m.content}</Text>
            </Pressable>
          </View>
        ))}
        {busy && <ActivityIndicator color={C.primary} />}
        {error && <Text style={{ color: C.danger }}>{error}</Text>}
        {msgs.length > 0 && <Text style={s.muted}>Совет: долгое нажатие на сообщение Emma — прослушать произношение.</Text>}
      </ScrollView>
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
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: listening ? "#fff" : C.primary }} />
          </RoundButton>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/** Экран голосового урока: Emma в центре, её настроение меняется по ходу разговора. */
function VoiceCall({ mood, status, active, header, caption, transcript, error, listening, busy, onMic, onEnd, onReplay }: {
  mood: EmmaMood; status: string; active: boolean; header: React.ReactNode;
  caption: { main: string; fix: string | null } | null; transcript: string; error: string | null;
  listening: boolean; busy: boolean; onMic: () => void; onEnd: () => void; onReplay: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { pulse.stopAnimation(); pulse.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] });

  return (
    <View style={{ flex: 1, backgroundColor: C.primaryLight }}>
      <View style={{ paddingTop: 12 }}>{header}</View>
      <ScrollView contentContainerStyle={{ alignItems: "center", padding: 16, gap: 12 }}>
        <View style={{ width: 260, height: 260, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={{ position: "absolute", width: 260, height: 260, borderRadius: 130,
            backgroundColor: C.lilac, opacity: ringOpacity, transform: [{ scale }] }} />
          <Image source={EMMA[mood]} style={{ width: 230, height: 230, borderRadius: 115, borderWidth: 4, borderColor: "#fff" }} />
        </View>
        <Text style={{ fontSize: 32, fontStyle: "italic", color: C.primary }}>Emma</Text>
        <Text style={[s.muted, { fontSize: 15 }]}>{status}</Text>
        {busy && <ActivityIndicator color={C.primary} />}
        {caption && (
          <Pressable onPress={onReplay} style={{ alignSelf: "stretch", backgroundColor: C.card, borderRadius: 20, padding: 16, gap: 8 }}>
            <Text style={[s.p, { fontSize: 17 }]}>{caption.main}</Text>
            {caption.fix && <Text style={{ color: C.primary, backgroundColor: C.cream, borderRadius: 12, padding: 10, fontSize: 15 }}>✏️ {caption.fix}</Text>}
            <Text style={s.muted}>Нажмите, чтобы прослушать ещё раз</Text>
          </Pressable>
        )}
        {transcript ? <Text style={{ alignSelf: "flex-end", color: C.text, fontStyle: "italic", fontSize: 16 }}>Вы: {transcript}</Text> : null}
        {error && <Text style={{ color: C.danger, textAlign: "center" }}>{error}</Text>}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, paddingVertical: 20 }}>
        <Pressable onPress={onEnd} style={{ alignItems: "center", gap: 6 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.peach, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: C.danger }} />
          </View>
          <Text style={s.muted}>Завершить</Text>
        </Pressable>
        <Pressable onPress={onMic} disabled={busy} style={{ alignItems: "center", gap: 6, opacity: busy ? 0.5 : 1 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: listening ? C.primary : C.card,
            borderWidth: 3, borderColor: C.primary, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: listening ? "#fff" : C.primary }} />
          </View>
          <Text style={s.muted}>{listening ? "Готово" : "Говорить"}</Text>
        </Pressable>
      </View>
    </View>
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
