import { CalendarEvent } from "@/types/calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 查看所有存储的数据
export const debugStorage = async () => {
  try {
    // 1. 获取所有的 Key
    const keys = await AsyncStorage.getAllKeys();
    console.log("所有 Key:", keys);
    if (keys.length === 0) {
      console.log("--- AsyncStorage 是空的 ---");
      return [];
    }

    // 2. 根据 Key 获取所有的 Value
    const stores = await AsyncStorage.multiGet(keys);

    // 3. 打印结果
    console.log("--- 开始打印 AsyncStorage 数据 ---");
    stores.forEach((item) => {
      console.log("Key:", item[0]);
      console.log("Raw Value:", item[1]);
      try {
        const parsed = JSON.parse(item[1] || "[]");
        console.log("Parsed Value:", parsed);
      } catch (e) {
        console.log("无法解析的值:", item[1]);
      }
      console.log("---------------------------");
    });
    console.log("--- 结束打印 ---");
    return stores;
  } catch (error) {
    console.error("读取 Storage 失败", error);
    return [];
  }
};

// 获取所有事件数据
export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  try {
    // 获取所有键
    const keys = await AsyncStorage.getAllKeys();
    // 过滤出以 "schedule_" 开头的键
    const scheduleKeys = keys.filter((key) => key.startsWith("schedule_"));
    // 获取这些键对应的值
    const scheduleData = await AsyncStorage.multiGet(scheduleKeys);
    console.log("scheduleData", scheduleData);
    // 将所有日程数据合并到一个数组中
    let allEvents: CalendarEvent[] = [];
    scheduleData.forEach(([key, value]) => {
      if (value) {
        try {
          // 解析存储的数据，这应该是 ScheduleEvent[] 类型
          const events: any[] = JSON.parse(value || "[]");
          console.log("events", events);
          // 转换为 CalendarEvent 格式
          const convertedEvents: CalendarEvent[] = events.map((event) => ({
            id: event.id || "",
            title: event.title || "",
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            location: event.location || undefined,
            // color 字段是可选的，如果原始数据中有可以保留
            ...(event.color && { color: event.color }),
          }));
          // 合并到总数组
          allEvents = [...allEvents, ...convertedEvents];
          console.log("allEvents", allEvents);
        } catch (e) {
          console.error(`解析 ${key} 的数据时出错:`, e);
        }
      }
    });

    return allEvents;
  } catch (error) {
    console.error("获取所有事件数据时出错:", error);
    return [];
  }
};

// 如果你想一键清空（慎用）：
export const clearStorage = async () => {
  await AsyncStorage.clear();
  console.log("Storage 已清空");
};
