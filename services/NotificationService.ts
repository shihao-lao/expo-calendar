import { calculateTimeDifference } from "@/utils/time"; // 确保路径正确
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_CHANNEL_ID = "calendar-reminders";
let setupPromise: Promise<boolean> | null = null;
let receivedSubscription: Notifications.EventSubscription | null = null;

// 配置前台通知行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  setup: async () => {
    if (setupPromise) {
      return setupPromise;
    }

    setupPromise = NotificationService.configure();
    return setupPromise;
  },

  configure: async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      if (__DEV__) {
        console.log("用户拒绝了通知权限");
      }
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
        name: "日程提醒",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "alarm.wav",
      });
    }

    if (!receivedSubscription) {
      receivedSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          if (__DEV__) {
            console.log("[NotificationService] 通知已接收:", {
              receivedAt: new Date().toLocaleString(),
              title: notification.request.content.title,
              body: notification.request.content.body,
            });
          }
        }
      );
    }

    return true;
  },

  scheduleReminder: async (title: string, targetDate: string | Date) => {
    const hasPermission = await NotificationService.setup();
    if (!hasPermission) return null;

    try {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const diff = calculateTimeDifference(target);

      if (diff < 3000) {
        if (__DEV__) {
          console.warn("时间太近或已过期，跳过提醒");
        }
        return null;
      }
    } catch (error) {
      console.error("[NotificationService] 时间参数无效:", error);
      return null;
    }

    try {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ 倒计时结束",
          body: `"${title}" 的时间到了！`,
          sound: "alarm.wav",
          ...(Platform.OS === "android"
            ? { channelId: REMINDER_CHANNEL_ID }
            : {}),
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: target,
        },
      });

      if (__DEV__) {
        console.log(`[NotificationService] 提醒已设定 (ID: ${id})`);
      }
      return id;
    } catch (e) {
      console.error("❌ 设置提醒失败:", e);
      return null;
    }
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  cancelReminder: async (notificationId?: string | null) => {
    if (!notificationId) return;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  cleanup: () => {
    receivedSubscription?.remove();
    receivedSubscription = null;
    setupPromise = null;
  },
};
