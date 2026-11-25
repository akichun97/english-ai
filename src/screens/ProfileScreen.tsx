import React, { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import { ACHIEVEMENTS, OUTFIT_RULES, unlockedOutfits } from "../achievements";
import { getApiKey, saveApiKey } from "../ai";
import { EmmaPic, OUTFITS, outfit } from "../emma";
import { LANG_LIST } from "../lang";
import { askPermission } from "../reminders";
import { useApp } from "../state";
import { dayMinutes, goalStatus, lastDays, setLevel, ThemeMode } from "../storage";
import { LEARNED_BOX } from "../vocab";
import { Button, C, Card, Chip, s } from "../ui";
import { OnboardingScreen } from "./OnboardingScreen";
import { ActivityCalendar } from "./ActivityCalendar";

const GOALS = [10, 20, 30, 50];
const MINUTES = [5, 10, 15, 30];
const HOURS: (number | null)[] = [null, 9, 13, 19, 21];
const THEMES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "Как в системе" },
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
];

export function ProfileScreen() {
  const { p, update, lang, level, words } = useApp();
  const [look, setLook] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const [newLang, setNewLang] = useState(false);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { getApiKey().then((k) => setKey(k ?? "")); }, []);

  if (newLang) return <OnboardingScreen onCancel={() => setNewLang(false)} />;

  const days = lastDays(p, 7);
  const minMode = p.goalType === "min";
  const val = (d: (typeof days)[number]) => (minMode ? dayMinutes(d.stats) : d.stats.xp);
  const maxVal = Math.max(minMode ? p.dailyMinutes : p.dailyGoal, ...days.map(val));
  const voiceMin = Math.round(Object.values(p.history).reduce((a, d) => a + d.voiceSec, 0) / 60);
  const learned = words.filter((w) => w.box >= LEARNED_BOX).length;
  const outfits = unlockedOutfits(p);
  const tile = (width - 64 - 36) / 4;

  return (
    <ScrollView contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={outfit(p.outfit).face} size={72} circle />
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
        <Text style={[s.muted, { marginTop: 8 }]}>{minMode ? "Минуты занятий за 7 дней" : "Опыт за 7 дней"}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: 110, gap: 8 }}>
          {days.map((d) => (
            <View key={d.key} style={{ flex: 1, alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>{val(d) || ""}</Text>
              <View style={{ width: "70%", height: Math.max(4, (val(d) / maxVal) * 70), borderRadius: 6,
                backgroundColor: goalStatus(p, d.stats).done ? C.good : val(d) ? C.primary : C.border }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.muted}>Уроков пройдено: {p.doneLessons.length} · голосовых уроков: {p.counters.voiceLessons} · лучшее произношение: {p.counters.bestPron}%</Text>
      </Card>

      <Text style={s.h2}>Календарь занятий</Text>
      <ActivityCalendar p={p} />

      <Card>
        <Text style={s.h2}>Цель дня</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label="В очках XP" active={!minMode} onPress={() => update((x) => ({ ...x, goalType: "xp" }))} />
          <Chip label="В минутах" active={minMode} onPress={() => update((x) => ({ ...x, goalType: "min" }))} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {minMode
            ? MINUTES.map((g) => <Chip key={g} label={`${g} мин`} active={p.dailyMinutes === g} onPress={() => update((x) => ({ ...x, dailyMinutes: g }))} />)
            : GOALS.map((g) => <Chip key={g} label={`${g} XP`} active={p.dailyGoal === g} onPress={() => update((x) => ({ ...x, dailyGoal: g }))} />)}
        </View>
        {minMode && <Text style={s.muted}>Считается время, пока приложение открыто, и голосовые уроки с Emma.</Text>}
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
            return (
              <Pressable key={o.id} onPress={() => (open ? update((x) => ({ ...x, outfit: o.id })) : setLook(look === o.id ? null : o.id))}
                style={{ width: tile, alignItems: "center", gap: 4 }}>
                <View style={{ opacity: open ? 1 : 0.35, borderRadius: tile / 2, borderWidth: 3, borderColor: p.outfit === o.id ? C.primary : "transparent" }}>
                  <EmmaPic source={o.face} size={tile - 6} circle />
                </View>
                <Text style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>{open ? o.title : `🔒 ${o.title}`}</Text>
              </Pressable>
            );
          })}
        </View>
        {OUTFIT_RULES.filter((r) => !outfits.includes(r.outfit) && (look === null || look === r.outfit)).map((r) => (
          <View key={r.outfit} style={{ backgroundColor: C.primaryLight, borderRadius: 14, padding: 12, gap: 6 }}>
            <Text style={[s.p, { fontWeight: "700" }]}>Как открыть «{outfit(r.outfit).title}»</Text>
            {r.conds.map((c) => {
              const v = Math.min(c.value(p, words), c.need), ok = v >= c.need;
              return (
                <View key={c.label} style={{ gap: 3 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[s.p, { fontSize: 14, color: ok ? C.good : C.text }]}>{ok ? "✓ " : ""}{c.label}</Text>
                    <Text style={[s.p, { fontSize: 14, fontWeight: "600" }]}>{v} / {c.need}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: C.border }}>
                    <View style={{ width: `${(v / c.need) * 100}%`, height: 6, borderRadius: 3, backgroundColor: ok ? C.good : C.primary }} />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
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
                <Text style={s.muted}>{a.desc}</Text>
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
