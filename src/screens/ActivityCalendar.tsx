import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dayKey, dayMinutes, DayStats, goalStatus, Progress } from "../storage";
import { C, Card, s } from "../ui";

const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const active = (d?: DayStats) => !!d && (d.xp > 0 || dayMinutes(d) > 0);

/** Календарь занятий: в какие дни занимались, и что сделали в каждый день. */
export function ActivityCalendar({ p }: { p: Progress }) {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [sel, setSel] = useState(dayKey());

  const y = month.getFullYear(), m = month.getMonth();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const shift = (new Date(y, m, 1).getDay() + 6) % 7; // понедельник первый
  const cells: (number | null)[] = [...Array(shift).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const key = (d: number) => dayKey(new Date(y, m, d));

  const monthDays = Array.from({ length: daysIn }, (_, i) => p.history[key(i + 1)]).filter(active) as DayStats[];
  const sum = (f: (d: DayStats) => number) => monthDays.reduce((a, d) => a + f(d), 0);
  const d = p.history[sel];
  const selDate = new Date(sel + "T12:00:00");

  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => setMonth(new Date(y, m - 1, 1))} style={{ padding: 8 }}><Text style={[s.h2, { color: C.primary }]}>‹</Text></Pressable>
        <Text style={[s.h2, { flex: 1, textAlign: "center" }]}>{MONTHS[m]} {y}</Text>
        <Pressable onPress={() => setMonth(new Date(y, m + 1, 1))} style={{ padding: 8 }}><Text style={[s.h2, { color: C.primary }]}>›</Text></Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {WEEK.map((w) => <Text key={w} style={{ flex: 1, textAlign: "center", fontSize: 12, color: C.muted }}>{w}</Text>)}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={{ flexDirection: "row" }}>
          {cells.slice(r * 7, r * 7 + 7).map((c, i) => {
            if (c === null) return <View key={i} style={{ flex: 1, aspectRatio: 1 }} />;
            const k = key(c), st = p.history[k];
            const done = st && goalStatus(p, st).done, was = active(st);
            const isSel = k === sel, isToday = k === dayKey();
            return (
              <Pressable key={i} onPress={() => setSel(k)} style={{ flex: 1, aspectRatio: 1, padding: 3 }}>
                <View style={{ flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center",
                  backgroundColor: done ? C.primary : was ? C.lilac : "transparent",
                  borderWidth: isSel ? 2 : isToday ? 1 : 0, borderColor: isSel ? C.text : C.primary }}>
                  <Text style={{ fontSize: 13, color: done || was ? C.onPrimary : C.text, fontWeight: isToday ? "700" : "400" }}>{c}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Legend color={C.primary} label="цель выполнена" />
        <Legend color={C.lilac} label="занимались" />
      </View>
      <View style={{ backgroundColor: C.primaryLight, borderRadius: 14, padding: 12, gap: 4 }}>
        <Text style={[s.p, { fontWeight: "700" }]}>{selDate.getDate()} {MONTHS_GEN[selDate.getMonth()]}</Text>
        {active(d) ? (
          <>
            <Row label="Опыт" value={`${d!.xp} XP`} />
            <Row label="Время занятий" value={`${dayMinutes(d!)} мин`} />
            <Row label="Разговор с Emma" value={`${Math.round(d!.voiceSec / 60)} мин`} />
            <Row label="Уроков пройдено" value={`${d!.lessons ?? 0}`} />
            <Row label="Новых слов" value={`${d!.words ?? 0}`} />
            <Row label="Слов выучено" value={`${d!.learned ?? 0}`} />
          </>
        ) : <Text style={s.muted}>В этот день занятий не было.</Text>}
      </View>
      <Text style={s.muted}>
        За месяц: {monthDays.length} дн. занятий · {sum((x) => x.lessons ?? 0)} уроков · {Math.round(sum((x) => x.voiceSec) / 60)} мин разговора · {sum((x) => x.learned ?? 0)} слов выучено
      </Text>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 12, color: C.muted }}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={s.p}>{label}</Text>
      <Text style={[s.p, { fontWeight: "600" }]}>{value}</Text>
    </View>
  );
}
