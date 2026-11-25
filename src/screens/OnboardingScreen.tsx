import React, { useState } from "react";
import { Image, ScrollView, Text } from "react-native";
import { EMMA } from "../emma";
import { LEVEL_NAMES, levelFromScore, PLACEMENT_TEST } from "../data/tests";
import { Button, Card, s } from "../ui";
import { Quiz } from "./Quiz";

/** Первый запуск: приветствие → тест уровня → результат. */
export function OnboardingScreen({ onFinish }: { onFinish: (level: string) => void }) {
  const [step, setStep] = useState<"welcome" | "test">("welcome");

  if (step === "test") {
    return (
      <Quiz
        title="Определяем ваш уровень"
        questions={PLACEMENT_TEST}
        onDone={() => {}}
        renderResult={(correct, byLevel) => {
          const level = levelFromScore(byLevel);
          return (
            <Card>
              <Image source={EMMA.love} style={{ width: 120, height: 120, borderRadius: 60, alignSelf: "center" }} />
              <Text style={s.h2}>Ваш уровень: {level} · {LEVEL_NAMES[level]}</Text>
              <Text style={s.p}>Правильных ответов: {correct} из {PLACEMENT_TEST.length}.</Text>
              <Text style={s.p}>Уроки, разговор с ИИ и экзамены будут подобраны под этот уровень. Когда вы пройдёте все темы уровня, откроется следующий.</Text>
              <Button title="Начать учиться" onPress={() => onFinish(level)} />
            </Card>
          );
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={[s.pad, { flexGrow: 1, justifyContent: "center" }]}>
      <Image source={EMMA.happy} style={{ width: 160, height: 160, borderRadius: 80, alignSelf: "center" }} />
      <Text style={[s.h1, { textAlign: "center" }]}>Привет! Я Emma, твой AI-наставник</Text>
      <Text style={[s.p, { textAlign: "center" }]}>
        Сначала короткий тест: 15 вопросов, около 5 минут. По результату мы подберём уроки вашего уровня.
      </Text>
      <Button title="Пройти тест" onPress={() => setStep("test")} />
      <Button title="Я новичок, начать с нуля (A1)" kind="ghost" onPress={() => onFinish("A1")} />
    </ScrollView>
  );
}
