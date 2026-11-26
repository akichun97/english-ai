import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SCENES } from "../data/scenes";
import { EMMA, EmmaPic } from "../emma";
import { useApp } from "../state";
import { Button, C, Card, s } from "../ui";

/** Список ролевых сценок. Выбранная открывается во вкладке «Разговор». */
export function ScenesScreen({ onBack }: { onBack: () => void }) {
  const { lang, setScene } = useApp();
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Button title="← Практика" kind="ghost" onPress={onBack} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <EmmaPic source={EMMA.motivated} size={84} />
        <View style={{ flex: 1 }}>
          <Text style={s.h1}>Сценки</Text>
          <Text style={s.muted}>Emma играет роль, а вы выполняете цели ({lang.name.toLowerCase()}). Можно голосом. В конце оценка.</Text>
        </View>
      </View>
      {SCENES.map((sc) => (
        <Pressable key={sc.id} onPress={() => setScene({ ...sc })}>
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 20 }}>{sc.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>{sc.title}</Text>
              <Text style={s.muted}>{sc.goals.length} цели · {sc.goals[0].toLowerCase()}…</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
