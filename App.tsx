import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LESSONS, Lesson } from "./src/data/lessons";
import { LEVELS } from "./src/data/tests";
import { addXp, loadProgress, maybeLevelUp, Progress, saveProgress } from "./src/storage";
import { C, s } from "./src/ui";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { TestsScreen } from "./src/screens/TestsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

type Tab = "home" | "chat" | "tests" | "settings";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Уроки", icon: "📚" },
  { id: "chat", label: "Разговор", icon: "💬" },
  { id: "tests", label: "Тесты", icon: "📝" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => { loadProgress().then(setProgress); }, []);

  function update(fn: (p: Progress) => Progress) {
    setProgress((p) => {
      if (!p) return p;
      const n = fn(p);
      saveProgress(n);
      return n;
    });
  }
  const gainXp = (xp: number) => update((p) => addXp(p, xp));
  const setLevel = (level: string) => update((p) => ({ ...p, level }));

  if (!progress) return null;

  if (!progress.placementDone) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
          <StatusBar style="dark" />
          <OnboardingScreen onFinish={(level) => update((p) => ({ ...p, level, placementDone: true }))} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {tab === "home" && !lesson && <HomeScreen progress={progress} onOpen={setLesson} />}
          {tab === "home" && lesson && (
            <LessonScreen lesson={lesson} level={progress.level} onBack={() => setLesson(null)}
              onFinish={(xp) => {
                update((p) => maybeLevelUp({ ...addXp(p, xp), doneLessons: [...new Set([...p.doneLessons, lesson.id])] }, LESSONS, LEVELS));
                setLesson(null);
              }} />
          )}
          {tab === "chat" && <ChatScreen level={progress.level} onXp={gainXp} />}
          {tab === "tests" && <TestsScreen level={progress.level} onLevel={setLevel} onXp={gainXp} />}
          {tab === "settings" && <SettingsScreen level={progress.level} onLevel={setLevel} />}
        </View>
        <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          {TABS.map((t) => (
            <Pressable key={t.id} onPress={() => setTab(t.id)} style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}>
              <Text style={{ fontSize: 22 }}>{t.icon}</Text>
              <Text style={{ fontSize: 12, color: tab === t.id ? C.primary : C.muted, fontWeight: tab === t.id ? "700" : "400" }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
