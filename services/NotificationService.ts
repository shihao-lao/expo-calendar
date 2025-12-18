import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 配置通知处理器
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // 必须字段
    shouldShowList: true, // 必须字段
  }),
});

export const NotificationService = {
  // 初始化：请求权限并设置 Android 通道
  setup: async () => {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("用户拒绝了通知权限");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("calendar-reminders", {
        name: "日程提醒",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    return true;
  },

  // 安排提醒
  scheduleReminder: async (title: string, triggerDate: Date) => {
    const hasPermission = await NotificationService.setup();
    if (!hasPermission) return null;

    // 计算距离现在还有多少秒
    const now = Date.now();
    const triggerTimestamp = triggerDate.getTime();
    const seconds = Math.floor((triggerTimestamp - now) / 1000);

    // 如果时间已经过了，或者是过去的时间，就不设置提醒
    if (seconds <= 0) {
      console.log("时间已过，不安排提醒");
      return null;
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📅 日程提醒",
          body: `即将开始: ${title}`,
          sound: "default",
        },
        // 【关键修复】使用 seconds (时间间隔) 而不是 Date 对象
        // 这是最兼容的写法，避免类型报错
        trigger: {
          seconds: seconds,
          channelId: "calendar-reminders", // 确保 Android 使用我们配置的通道
        },
      });
      console.log(`提醒已设置, 将在 ${seconds} 秒后触发, ID: ${id}`);
      return id;
    } catch (e) {
      console.error("设置提醒失败:", e);
      return null;
    }
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
