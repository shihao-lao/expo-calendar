import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string; // 格式建议 "HH:mm"
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

const STORAGE_KEY_PREFIX = "schedule_";

export const ScheduleService = {
  // 生成存储 Key: schedule_2023-12-10
  getKey: (date: string) => `${STORAGE_KEY_PREFIX}${date}`,

  // 获取某天的日程 (按需加载的核心)
  getEvents: async (date: string): Promise<ScheduleEvent[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(
        ScheduleService.getKey(date)
      );
      // 如果没有数据，返回空数组
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("读取日程失败", e);
      return [];
    }
  },

  // 添加日程
  addEvent: async (date: string, newEvent: ScheduleEvent) => {
    try {
      const key = ScheduleService.getKey(date);
      console.log("准备添加日程:", { date, newEvent, key });

      // 1. 读取旧数据
      const existingEvents = await ScheduleService.getEvents(date);

      // 2. 追加新数据
      const updatedEvents = [...existingEvents, newEvent];

      // 3. 排序 (可选：按时间排序)
      updatedEvents.sort((a, b) => a.time.localeCompare(b.time));

      // 4. 存回 Storage
      const jsonData = JSON.stringify(updatedEvents);
      await AsyncStorage.setItem(key, jsonData);
      console.log("日程添加成功");
      return updatedEvents;
    } catch (e) {
      console.error("添加日程失败", e);
      throw e;
    }
  },

  // 删除日程 (核心修改：确保逻辑清晰)
  deleteEvent: async (date: string, eventId: string) => {
    try {
      const key = ScheduleService.getKey(date);
      // 1. 获取现有事件
      const existingEvents = await ScheduleService.getEvents(date);
      // 2. 过滤掉要删除的事件
      const updatedEvents = existingEvents.filter((e) => e.id !== eventId);
      
      console.log(`正在删除日程: ${date} - ID: ${eventId}`);
      
      // 3. 存回 Storage
      await AsyncStorage.setItem(key, JSON.stringify(updatedEvents));
      return updatedEvents;
    } catch (e) {
      console.error("删除日程失败", e);
      throw e; // 抛出错误以便 UI 层捕获
    }
  },
};