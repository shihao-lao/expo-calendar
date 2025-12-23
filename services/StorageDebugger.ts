import { CalendarEvent } from "@/types/calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
          const events: any[] = JSON.parse(value || "[]");

          // 转换为标准 CalendarEvent 格式
          const convertedEvents: CalendarEvent[] = events.map((event) => ({
            id: event.id || Math.random().toString(), // 确保有 ID
            title: event.title || "无标题",
            startTime: event.startTime, // 关键：这是 ISO 字符串
            endTime: event.endTime,
            location: event.location || undefined,
            color: event.color,
          }));

          allEvents = [...allEvents, ...convertedEvents];
        } catch (e) {
          console.error(`解析 ${key} 出错:`, e);
        }
      }
    });

    // 4. 按开始时间排序 (从小到大)
    allEvents.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    return allEvents;
  } catch (error) {
    console.error("获取所有事件数据时出错:", error);
    return [];
  }
};

export const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const result = await AsyncStorage.multiGet(keys);
  console.log("Storage Dump:", JSON.stringify(result, null, 2));
  return result;
};

export const clearStorage = async () => {
  await AsyncStorage.clear();
  console.log("Storage 已清空");
};
