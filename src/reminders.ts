// Напоминания от Emma. Ставим уведомления на ближайшую неделю в выбранный час.
// Если дневная цель сегодня уже выполнена, сегодня не напоминаем.
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { goalStatus, Progress } from "./storage";

const MESSAGES = [
  "Emma ждёт тебя! Пять минут занятий сегодня? 🔥",
  "Не потеряй серию дней! Заглянешь на короткий урок?",
  "Я приготовила для тебя новые слова. Повторим? ✨",
  "Поговорим немного? Я соскучилась 💜",
];

export async function askPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Напоминания",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const res = await Notifications.requestPermissionsAsync();
  return res.granted;
}

export async function scheduleReminders(p: Progress): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (p.reminderHour === null) return;
    const goalDone = goalStatus(p).done;
    for (let d = 0; d < 7; d++) {
      if (d === 0 && goalDone) continue;
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(p.reminderHour, 0, 0, 0);
      if (date.getTime() <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: "Emma", body: MESSAGES[(date.getDate() + d) % MESSAGES.length] },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: "reminders" },
      });
    }
  } catch {
    // Без разрешения на уведомления просто ничего не ставим.
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});
