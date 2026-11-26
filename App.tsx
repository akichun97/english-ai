import React, { useEffect, useState } from "react";
import { Appearance, Keyboard, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Lesson, lessonsFor } from "./src/data/lessons";
import { AppProvider, useApp } from "./src/state";
import { addDay, addXp, maybeLevelUp } from "./src/storage";
import { applyTheme, C, isDark, s } from "./src/ui";
import { EMMA, EmmaPic } from "./src/emma";
import { useOnline } from "./src/network";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { PracticeScreen } from "./src/screens/PracticeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";

type Tab = "home" | "chat" | "practice" | "profile";
const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Уроки" },
  { id: "chat", label: "Разговор" },
  { id: "practice", label: "Практика" },
  { id: "profile", label: "Профиль" },
];

export default function App() {
  const [system, setSystem] = useState(Appearance.getColorScheme());
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystem(colorScheme));
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        {(p) => {
          const dark = p.theme === "dark" || (p.theme === "system" && system === "dark");
          applyTheme(dark);
          // key заставляет перерисовать все экраны с новыми цветами.
          return (
            <SafeAreaView key={dark ? "dark" : "light"} style={s.screen} edges={["top", "bottom"]}>
              <StatusBar style={isDark ? "light" : "dark"} />
              {p.onboarded ? <Main /> : <OnboardingScreen />}
            </SafeAreaView>
          );
        }}
      </AppProvider>
    </SafeAreaProvider>
  );
}

// Помним вкладку между перерисовками (например, при смене темы).
let lastTab: Tab = "home";

function Main() {
  const { update, unlocked, p } = useApp();
  const [tab, setTabState] = useState<Tab>(lastTab);
  const setTab = (t: Tab) => { lastTab = t; setTabState(t); };
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const { addWords } = useApp();
  const online = useOnline();
  const { scene } = useApp();
  // Сценку из «Практики» играем во вкладке «Разговор».
  useEffect(() => { if (scene) setTab("chat"); }, [scene]);

  // Пока открыта клавиатура, нижнее меню прячем, чтобы поле ввода было видно.
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboard(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboard(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // При смене языка закрываем открытый урок.
  useEffect(() => setLesson(null), [p.lang]);

  return (
    <View style={{ flex: 1 }}>
      {!online && (
        <View style={{ backgroundColor: C.cream, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: C.text, fontSize: 13 }}>Нет интернета. Работают уроки, словарь, разговорник и тесты. Разговор с Emma вернётся, когда появится связь.</Text>
        </View>
      )}
      {unlocked && (
        <View style={{ position: "absolute", top: 8, left: 16, right: 16, zIndex: 10, backgroundColor: C.primary, borderRadius: 16, padding: 10,
          flexDirection: "row", alignItems: "center", gap: 10 }}>
          <EmmaPic source={EMMA.achievement} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.onPrimary, fontWeight: "700", fontSize: 16 }}>{unlocked.title}</Text>
            <Text style={{ color: C.onPrimary }}>{unlocked.desc}</Text>
          </View>
        </View>
      )}
      <View style={{ flex: 1 }}>
        {tab === "home" && !lesson && <HomeScreen onOpen={setLesson} />}
        {tab === "home" && lesson && (
          <LessonScreen lesson={lesson} onBack={() => setLesson(null)}
            onFinish={(xp) => {
              const id = lesson.id;
              update((x) => maybeLevelUp({ ...addDay(addXp(x, xp), { lessons: 1 }), doneLessons: [...new Set([...x.doneLessons, id])] }, lessonsFor(x.lang)));
              // Фразы из примеров урока попадают в словарь.
              addWords(lesson.examples.map((e) => ({ word: e.en, translation: e.ru, reading: e.ipa })));
              setLesson(null);
            }} />
        )}
        {tab === "chat" && <ChatScreen />}
        {tab === "practice" && <PracticeScreen />}
        {tab === "profile" && <ProfileScreen />}
      </View>
      {!keyboard && (
        <View style={{ flexDirection: "row", borderTopWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
          {TABS.map((t) => (
            <Pressable key={t.id} onPress={() => setTab(t.id)} style={{ flex: 1, alignItems: "center", paddingVertical: 10, gap: 4 }}>
              {/* Одинаковые круги: активная вкладка закрашена */}
              <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                borderColor: tab === t.id ? C.primary : C.muted, backgroundColor: tab === t.id ? C.primary : "transparent" }} />
              <Text style={{ fontSize: 12, color: tab === t.id ? C.primary : C.muted, fontWeight: tab === t.id ? "700" : "400" }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
