import { calculateTimeDifference } from "@/utils/time"; // 确保路径正确
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";

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
        sound: "alarm.wav", // 确保这里和你的音频文件匹配
      });
    }

    // 添加通知接收监听器，用于调试时间同步
    Notifications.addNotificationReceivedListener(notification => {
      const now = new Date();
      console.log("\n📢 [NotificationService] 通知已接收:");
      console.log(`- 实际接收时间: ${now.toLocaleString()}`);
      console.log(`- 通知标题: ${notification.request.content.title}`);
      console.log(`- 通知内容: ${notification.request.content.body}`);
    });

    return true;
  },

  scheduleReminder: async (title: string, targetDate: string | Date) => {
    const hasPermission = await NotificationService.setup();
    if (!hasPermission) return null;

    // --- 调试日志：验证时间同步性 ---
    try {
      // 统一转换为 Date 对象
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const diff = calculateTimeDifference(target);
      
      console.log(
        `[NotificationService] 接收到的触发时间: ${target.toLocaleString()}`
      );
      console.log(
        `[NotificationService] 距离触发还有: ${Math.floor(diff / 1000)} 秒`
      );

      if (diff < 3000) {
        console.warn("时间太近或已过期，跳过提醒");
        return null;
      }
    } catch (error) {
      console.error("[NotificationService] 时间参数无效:", error);
      return null;
    }

    try {
      // 统一转换为 Date 对象并确保使用 UTC 时间
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      
      // 关键修复：使用 UTC 时间计算，避免时区差异
      const utcTarget = new Date(target.toUTCString());
      
      console.log(
        `[NotificationService] UTC 触发时间: ${utcTarget.toUTCString()}`
      );
      console.log(
        `[NotificationService] 本地触发时间: ${utcTarget.toLocaleString()}`
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ 倒计时结束",
          body: `"${title}" 的时间到了！`,
          sound: "alarm.wav",
          ...(Platform.OS === "android"
            ? { channelId: "calendar-reminders" }
            : {}),
        },
        // 使用 DATE 触发器：系统将在该精确时刻唤醒 App
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: utcTarget,
        },
      });

      console.log(`✅ [NotificationService] 提醒已设定 (ID: ${id})`);
      return id;
    } catch (e) {
      console.error("❌ 设置提醒失败:", e);
      return null;
    }
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
