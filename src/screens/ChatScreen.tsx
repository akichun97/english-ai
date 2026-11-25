import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Pressable, ScrollView, ScrollViewInstance, Text, TextInput, View } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { askTeacher, ChatMessage, teacherPrompt } from "../ai";
import { EMMA, EmmaMood, EmmaPic, outfit } from "../emma";
import { isBeginner } from "../lang";
import { useApp } from "../state";
import { addVoiceTime, bump } from "../storage";
import { speak, stopSpeaking } from "../voice";
import { Button, C, Chip, MicButton, s } from "../ui";
import { EmmaProfile } from "./EmmaProfile";
import { SessionReview } from "./SessionReview";

const MODES = [
  { id: "free", label: "Свободный разговор", mode: "free conversation on any topic the student likes" },
  { id: "roleplay", label: "Ролевая игра", mode: "role-play: you are a café waiter, the student is a customer" },
  { id: "interview", label: "Собеседование", mode: "job interview practice; you are the interviewer" },
  { id: "exam", label: "Устный экзамен", mode: "speaking exam simulation (IELTS Speaking for English, JLPT-style oral practice for Japanese); at the end give an estimated score with explanation in Russian" },
];

/** Основная часть ответа и строка с исправлением отдельно. */
function splitReply(text: string): { main: string; fix: string | null } {
  const [main, ...rest] = text.split("✏️");
  return { main: main.trim(), fix: rest.length ? rest.join("").trim() : null };
}

export function ChatScreen() {
  const { p, lang, level, update, gainXp, weakSpots } = useApp();
  const [mode, setMode] = useState(MODES[0]);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState(false);
  const [review, setReview] = useState<ChatMessage[] | null>(null);
  // Голосовой урок: Emma на экране, её ответы звучат вслух, после ответа микрофон включается снова.
  const [voice, setVoice] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // На каком языке ученик говорит в микрофон. Новичку в японском удобнее по-русски.
  const [micLang, setMicLang] = useState(lang.id === "ja" && isBeginner(lang.id, level) ? "ru-RU" : lang.speech);
  const scroll = useRef<ScrollViewInstance>(null);
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;
  const voiceStart = useRef(0);

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

  useEffect(() => () => { stopSpeaking(); ExpoSpeechRecognitionModule.abort(); }, []);
  // Новый язык — новый разговор.
  useEffect(() => { setMsgs([]); setVoice(false); setMicLang(lang.id === "ja" && isBeginner(lang.id, level) ? "ru-RU" : lang.speech); }, [lang.id]);

  async function listen() {
    setError(null);
    stopSpeaking();
    setSpeaking(false);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError("Разрешите приложению доступ к микрофону в настройках телефона.");
      return;
    }
    ExpoSpeechRecognitionModule.start({ lang: micLang, interimResults: true, continuous: false });
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
    speak(splitReply(text).main, lang, {
      onDone: () => {
        setSpeaking(false);
        if (voiceRef.current) listen();
      },
      onStop: () => setSpeaking(false),
    });
  }

  async function send(text: string, history = msgsRef.current) {
    const next: ChatMessage[] = [...history, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const reply = await askTeacher(teacherPrompt(lang.id, level, mode.mode, weakSpots), next);
      setMsgs([...next, { role: "assistant", content: reply }]);
      gainXp(2);
      if (voiceRef.current) say(reply);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setTimeout(() => scroll.current?.scrollToEnd(), 100);
    }
  }

  function start(m: (typeof MODES)[number]) {
    stopSpeaking();
    ExpoSpeechRecognitionModule.abort();
    setMode(m);
    setMsgs([]);
  }

  function startVoice() {
    setProfile(false);
    setVoice(true);
    voiceRef.current = true;
    voiceStart.current = Date.now();
    if (msgsRef.current.length === 0) send("Hi! Let's start a spoken conversation.", []);
    else listen();
  }

  /** Завершение голосового урока: считаем время и показываем разбор. */
  function stopVoice() {
    setVoice(false);
    voiceRef.current = false;
    stopSpeaking();
    ExpoSpeechRecognitionModule.abort();
    const sec = (Date.now() - voiceStart.current) / 1000;
    const spoke = msgs.filter((m) => m.role === "user").length > 1;
    update((x) => (spoke ? bump(addVoiceTime(x, sec), "voiceLessons") : addVoiceTime(x, sec)));
    if (spoke) setReview(msgs);
  }

  if (review) {
    return <SessionReview messages={review} onClose={() => setReview(null)} />;
  }

  if (profile) {
    return <EmmaProfile onBack={() => setProfile(false)} onVoice={startVoice} onChat={() => setProfile(false)} />;
  }

  const lastReply = [...msgs].reverse().find((m) => m.role === "assistant");
  const userTurns = msgs.filter((m) => m.role === "user").length;

  const modeChips = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, gap: 8 }} style={{ flexGrow: 0 }}>
      {MODES.map((m) => <Chip key={m.id} label={m.label} active={m.id === mode.id} onPress={() => start(m)} />)}
    </ScrollView>
  );

  if (voice) {
    const mood: EmmaMood = error ? "sleep" : listening ? "surprised" : busy ? "thinking"
      : lastReply && splitReply(lastReply.content).fix ? "calm" : speaking ? "happy" : lastReply ? "love" : "happy";
    const status = error ? "Что-то пошло не так" : listening ? "Слушаю…" : busy ? "Emma думает…"
      : speaking ? "Emma говорит" : "Нажмите на микрофон и говорите";
    const micOptions = [{ code: lang.speech, label: lang.id === "ja" ? "Говорю по-японски" : "Говорю по-английски" }, { code: "ru-RU", label: "По-русски" }];
    return (
      <VoiceCall mood={mood} status={status} active={listening || speaking} header={modeChips}
        caption={lastReply ? splitReply(lastReply.content) : null} transcript={listening ? input : ""}
        error={error} listening={listening} busy={busy}
        micChips={micOptions.map((o) => <Chip key={o.code} label={o.label} active={micLang === o.code} onPress={() => setMicLang(o.code)} />)}
        onMic={micPress} onEnd={stopVoice} onReplay={() => lastReply && say(lastReply.content)} />
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <Pressable onPress={() => setProfile(true)} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
        <EmmaPic source={outfit(p.outfit).face} size={48} circle />
        <View style={{ flex: 1 }}>
          <Text style={s.h2}>Emma</Text>
          <Text style={s.muted}>{lang.name} · профиль</Text>
        </View>
        {userTurns >= 2 && (
          <Pressable onPress={() => setReview(msgs)} style={{ backgroundColor: C.primaryLight, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ color: C.primary, fontWeight: "600" }}>Итог</Text>
          </Pressable>
        )}
        <Pressable onPress={startVoice} style={{ backgroundColor: C.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ color: C.onPrimary, fontWeight: "600" }}>Голосом</Text>
        </Pressable>
      </Pressable>
      {modeChips}
      <ScrollView ref={scroll} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scroll.current?.scrollToEnd()}>
        {msgs.length === 0 && (
          <View style={{ gap: 12, alignItems: "center" }}>
            <EmmaPic source={EMMA.reading} size={170} height={275} />
            <Text style={[s.p, { textAlign: "center" }]}>
              {lang.id === "ja"
                ? "Привет! Я Emma. Отвечай как удобно: по-японски, латиницей или по-русски. Я покажу, как сказать правильно."
                : "Привет! Я Emma. Пиши мне по-английски или поговорим голосом. Я поправлю ошибки и объясню их по-русски."}
            </Text>
            <View style={{ alignSelf: "stretch", gap: 12 }}>
              <Button title="Голосовой урок" onPress={startVoice} disabled={busy} />
              <Button title="Начать переписку" kind="ghost" onPress={() => send("Hi! Let's start.", [])} disabled={busy} />
            </View>
          </View>
        )}
        {msgs.map((m, n) => (
          <View key={n} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
            {m.role === "assistant" && <EmmaPic source={outfit(p.outfit).face} size={30} circle />}
            <Pressable onLongPress={() => m.role === "assistant" && say(m.content)}
              style={{ flexShrink: 1, backgroundColor: m.role === "user" ? C.primary : C.card, borderRadius: 18, padding: 12,
                borderWidth: m.role === "user" ? 0 : 1, borderColor: C.border }}>
              <Text style={{ color: m.role === "user" ? C.onPrimary : C.text, fontSize: 16, lineHeight: 22 }}>{m.content}</Text>
            </Pressable>
          </View>
        ))}
        {busy && <ActivityIndicator color={C.primary} />}
        {error && <Text style={{ color: C.danger }}>{error}</Text>}
        {msgs.length > 0 && <Text style={s.muted}>Совет: долгое нажатие на сообщение Emma — прослушать произношение.</Text>}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
        <TextInput style={[s.input, { flex: 1, maxHeight: 120 }]} value={input} onChangeText={setInput}
          placeholder={lang.placeholder} placeholderTextColor={C.muted} multiline />
        {input.trim() && !listening ? (
          <Pressable onPress={() => send(input.trim())} disabled={busy}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1 }}>
            <View style={{ width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 13,
              borderTopColor: "transparent", borderBottomColor: "transparent", borderLeftColor: C.onPrimary, marginLeft: 3 }} />
          </Pressable>
        ) : (
          <MicButton onPress={micPress} active={listening} disabled={busy} size={48} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

/** Экран голосового урока: Emma в центре, её настроение меняется по ходу разговора. */
function VoiceCall({ mood, status, active, header, caption, transcript, error, listening, busy, micChips, onMic, onEnd, onReplay }: {
  mood: EmmaMood; status: string; active: boolean; header: React.ReactNode;
  caption: { main: string; fix: string | null } | null; transcript: string; error: string | null;
  listening: boolean; busy: boolean; micChips: React.ReactNode; onMic: () => void; onEnd: () => void; onReplay: () => void;
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
          <EmmaPic source={EMMA[mood]} size={230} />
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
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>{micChips}</View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, paddingVertical: 16 }}>
        <Pressable onPress={onEnd} style={{ alignItems: "center", gap: 6 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.peach, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: C.danger }} />
          </View>
          <Text style={s.muted}>Завершить</Text>
        </Pressable>
        <View style={{ alignItems: "center", gap: 6 }}>
          <MicButton onPress={onMic} active={listening} disabled={busy} size={80} />
          <Text style={s.muted}>{listening ? "Готово" : "Говорить"}</Text>
        </View>
      </View>
    </View>
  );
}
