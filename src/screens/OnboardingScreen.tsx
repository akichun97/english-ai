import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { levelFromScore, PLACEMENT } from "../data/tests";
import { EMMA } from "../emma";
import { LangId, LANG_LIST, LANGS } from "../lang";
import { askPermission } from "../reminders";
import { useApp } from "../state";
import { setLevel } from "../storage";
import { Button, C, Card, s } from "../ui";
import { Quiz } from "./Quiz";

/** Первый запуск (и выбор нового языка): язык → тест уровня → результат. */
export function OnboardingScreen({ onCancel }: { onCancel?: () => void }) {
  const { update } = useApp();
  const [lang, setLang] = useState<LangId | null>(null);
  const [step, setStep] = useState<"lang" | "intro" | "test">("lang");

  function finish(level: string) {
    update((p) => ({ ...setLevel({ ...p, lang: lang! }, level), onboarded: true }));
    askPermission().catch(() => {}); // разрешение на напоминания от Emma
    onCancel?.();
  }

  if (step === "test" && lang) {
    const L = LANGS[lang];
    const questions = PLACEMENT[lang];
    return (
      <Quiz
        title="Определяем ваш уровень"
        questions={questions}
        onDone={() => {}}
        renderResult={(correct, byLevel) => {
          const level = levelFromScore(byLevel, lang);
          return (
            <Card>
              <Image source={EMMA.love} style={{ width: 120, height: 120, borderRadius: 60, alignSelf: "center" }} />
              <Text style={s.h2}>Ваш уровень: {level} · {L.levelNames[level]}</Text>
              <Text style={s.p}>Правильных ответов: {correct} из {questions.length}.</Text>
              <Text style={s.p}>Уроки, разговор с Emma и экзамены будут подобраны под этот уровень. Когда вы пройдёте все темы уровня, откроется следующий.</Text>
              <Button title="Начать учиться" onPress={() => finish(level)} />
            </Card>
          );
        }}
      />
    );
  }

  if (step === "intro" && lang) {
    const L = LANGS[lang];
    return (
      <ScrollView contentContainerStyle={[s.pad, { flexGrow: 1, justifyContent: "center" }]}>
        <Image source={EMMA.happy} style={{ width: 160, height: 160, borderRadius: 80, alignSelf: "center" }} />
        <Text style={[s.h1, { textAlign: "center" }]}>{L.name}</Text>
        <Text style={[s.p, { textAlign: "center" }]}>
          Короткий тест: {PLACEMENT[lang].length} вопросов, несколько минут. По результату я подберу уроки вашего уровня.
        </Text>
        <Button title="Пройти тест" onPress={() => setStep("test")} />
        <Button title={`Я новичок, начать с нуля (${L.levels[0]})`} kind="ghost" onPress={() => finish(L.levels[0])} />
        <Button title="← Выбрать другой язык" kind="ghost" onPress={() => setStep("lang")} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[s.pad, { flexGrow: 1, justifyContent: "center" }]}>
      <Image source={EMMA.happy} style={{ width: 160, height: 160, borderRadius: 80, alignSelf: "center" }} />
      <Text style={[s.h1, { textAlign: "center" }]}>Привет! Я Emma, твой AI-наставник</Text>
      <Text style={[s.p, { textAlign: "center" }]}>Какой язык будем учить?</Text>
      {LANG_LIST.map((L) => (
        <Pressable key={L.id} onPress={() => { setLang(L.id); setStep("intro"); }}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: C.primary }}>{L.id === "ja" ? "あ" : "Aa"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>{L.name}</Text>
              <Text style={s.muted}>{L.id === "ja" ? "С нуля: азбука, приветствия, первые фразы" : "От A1 до C1, разговор и экзамены"}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
      {onCancel && <Button title="Отмена" kind="ghost" onPress={onCancel} />}
    </ScrollView>
  );
}
