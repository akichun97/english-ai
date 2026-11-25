import React, { useEffect, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ACHIEVEMENTS, unlockedOutfits } from "../achievements";
import { getApiKey, saveApiKey } from "../ai";
import { OUTFITS, outfit } from "../emma";
import { LANG_LIST } from "../lang";
import { askPermission } from "../reminders";
import { useApp } from "../state";
import { lastDays, setLevel, ThemeMode } from "../storage";
import { LEARNED_BOX } from "../vocab";
import { Button, C, Card, Chip, s } from "../ui";
import { OnboardingScreen } from "./OnboardingScreen";

const GOALS = [10, 20, 30, 50];
const HOURS: (number | null)[] = [null, 9, 13, 19, 21];
const THEMES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "Как в системе" },
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
];

export function ProfileScreen() {
  const { p, update, lang, level, words } = useApp();
  const { width } = useWindowDimensions();
  const [newLang, setNewLang] = useState(false);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { getApiKey().then((k) => setKey(k ?? "")); }, []);

  if (newLang) return <OnboardingScreen onCancel={() => setNewLang(false)} />;

  const days = lastDays(p, 7);
  const maxXp = Math.max(p.dailyGoal, ...days.map((d) => d.stats.xp));
  const voiceMin = Math.round(Object.values(p.history).reduce((a, d) => a + d.voiceSec, 0) / 60);
  const learned = words.filter((w) => w.box >= LEARNED_BOX).length;
  const outfits = unlockedOutfits(p);
  const tile = (width - 64 - 36) / 4;

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Image source={outfit(p.outfit).face} style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: C.lilac }} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Профиль</Text>
          <Text style={s.muted}>{lang.name} · {level} · {p.xp} XP</Text>
        </View>
      </View>

      <Card>
        <Text style={s.h2}>Язык</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {LANG_LIST.map((L) => (
            <Chip key={L.id} label={`${L.name}${p.langs[L.id] ? ` · ${p.langs[L.id]!.level}` : ""}`} active={L.id === lang.id}
              onPress={() => (p.langs[L.id] ? update((x) => ({ ...x, lang: L.id })) : setNewLang(true))} />
          ))}
        </View>
        <Text style={s.muted}>Прогресс по каждому языку хранится отдельно, опыт и серия дней общие.</Text>
      </Card>

      <Card>
        <Text style={s.h2}>Статистика</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Stat value={`${p.xp}`} label="XP всего" />
          <Stat value={`🔥 ${p.streak}`} label="дней подряд" />
          <Stat value={`${learned}/${words.length}`} label="слов выучено" />
          <Stat value={`${voiceMin}`} label="мин. разговора" />
        </View>
        <Text style={[s.muted, { marginTop: 8 }]}>Опыт за 7 дней</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 110, gap: 8 }}>
          {days.map((d) => (
            <View key={d.key} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>{d.stats.xp || ""}</Text>
              <View style={{ width: "70%", height: Math.max(4, (d.stats.xp / maxXp) * 70), borderRadius: 6,
                backgroundColor: d.stats.xp >= p.dailyGoal ? C.good : d.stats.xp ? C.primary : C.border }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.muted}>Уроков пройдено: {p.doneLessons.length} · голосовых уроков: {p.counters.voiceLessons} · лучшее произношение: {p.counters.bestPron}%</Text>
      </Card>

      <Card>
        <Text style={s.h2}>Цель дня</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {GOALS.map((g) => <Chip key={g} label={`${g} XP`} active={p.dailyGoal === g} onPress={() => update((x) => ({ ...x, dailyGoal: g }))} />)}
        </View>
        <Text style={s.h2}>Напоминание от Emma</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {HOURS.map((h) => (
            <Chip key={String(h)} label={h === null ? "Выкл." : `${h}:00`} active={p.reminderHour === h}
              onPress={async () => { if (h !== null) await askPermission(); update((x) => ({ ...x, reminderHour: h })); }} />
          ))}
        </View>
        <Text style={s.muted}>Если цель дня уже выполнена, в этот день напоминания не будет.</Text>
      </Card>

      <Card>
        <Text style={s.h2}>Образ Emma</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {OUTFITS.map((o) => {
            const open = outfits.includes(o.id);
            const ach = ACHIEVEMENTS.find((a) => a.outfit === o.id);
            return (
              <Pressable key={o.id} disabled={!open} onPress={() => update((x) => ({ ...x, outfit: o.id }))} style={{ width: tile, alignItems: "center", gap: 4 }}>
                <Image source={o.face} style={{ width: tile, height: tile, borderRadius: tile / 2, opacity: open ? 1 : 0.3,
                  borderWidth: 3, borderColor: p.outfit === o.id ? C.primary : "transparent" }} />
                <Text style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>{open ? o.title : `🔒 ${ach?.title ?? ""}`}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={s.h2}>Достижения · {p.achievements.length} из {ACHIEVEMENTS.length}</Text>
        {ACHIEVEMENTS.map((a) => {
          const got = p.achievements.includes(a.id);
          return (
            <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, opacity: got ? 1 : 0.5 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: got ? C.primary : C.border, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: C.onPrimary, fontWeight: "700" }}>{got ? "✓" : ""}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.p, { fontWeight: "600" }]}>{a.title}</Text>
                <Text style={s.muted}>{a.desc}{a.outfit ? " · открывает образ Emma" : ""}</Text>
              </View>
            </View>
          );
        })}
      </Card>

      <Card>
        <Text style={s.h2}>Оформление</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {THEMES.map((t) => <Chip key={t.id} label={t.label} active={p.theme === t.id} onPress={() => update((x) => ({ ...x, theme: t.id }))} />)}
        </View>
      </Card>

      <Card>
        <Text style={s.h2}>Уровень ({lang.name.toLowerCase()})</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {lang.levels.map((l) => <Chip key={l} label={l} active={l === level} onPress={() => update((x) => setLevel(x, l))} />)}
        </View>
      </Card>

      <Card>
        <Text style={s.h2}>Ключ ИИ (Anthropic API)</Text>
        <Text style={s.muted}>Ключ хранится только в защищённой памяти этого телефона. Оплата за разговоры идёт с аккаунта владельца ключа.</Text>
        <TextInput style={s.input} value={key} onChangeText={(t) => { setKey(t); setSaved(false); }}
          placeholder="sk-ant-…" placeholderTextColor={C.muted} autoCapitalize="none" autoCorrect={false} secureTextEntry />
        <Button title={saved ? "Сохранено ✓" : "Сохранить ключ"} onPress={async () => { await saveApiKey(key); setSaved(true); }} />
        <Button title="Где взять ключ?" kind="ghost" onPress={() => Linking.openURL("https://platform.claude.com/settings/keys")} />
      </Card>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={s.h2}>{value}</Text>
      <Text style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>{label}</Text>
    </View>
  );
}
