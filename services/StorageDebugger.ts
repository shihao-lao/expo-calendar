import { CalendarEvent } from "@/types/calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { compareByStartTime } from "@/utils/time";

const isCalendarEvent = (event: unknown): event is CalendarEvent => {
  if (!event || typeof event !== "object") return false;

  const candidate = event as Partial<CalendarEvent>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.startTime === "string" &&
    typeof candidate.endTime === "string"
  );
};

// 获取所有事件数据
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  try {
    // 1. 获取所有键
    const keys = await AsyncStorage.getAllKeys();
    // 2. 过滤出以 "schedule_" 开头的键
    const scheduleKeys = keys.filter((key) => key.startsWith("schedule_"));

    // 3. 批量获取数据
    const scheduleData = await AsyncStorage.multiGet(scheduleKeys);

    let allEvents: CalendarEvent[] = [];

    scheduleData.forEach(([key, value]) => {
      if (value) {
        try {
          // 解析存储的数据
          const events: unknown = JSON.parse(value || "[]");
          const safeEvents = Array.isArray(events) ? events : [];

          // 转换为标准 CalendarEvent 格式
          const convertedEvents = safeEvents.filter(isCalendarEvent);

          allEvents = [...allEvents, ...convertedEvents];
        } catch (e) {
          console.error(`解析 ${key} 出错:`, e);
        }
      }
    });

    // 4. 按开始时间排序 (从小到大)
    allEvents.sort(compareByStartTime);

    return allEvents;
  } catch (error) {
    console.error("获取所有事件数据时出错:", error);
    return [];
  }
};

export const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const result = await AsyncStorage.multiGet(keys);
  if (__DEV__) {
    console.log("Storage Dump:", JSON.stringify(result, null, 2));
  }
  return result;
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
  if (__DEV__) {
    console.log("Storage 已清空");
  }
};
