// components/calendar/EventList.tsx
import { CalendarEvent } from "@/types/calendar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, // 引入 Alert 用于确认
} from "react-native";
import EventDetails from "./EventDetails";
import CountdownTimer from "@/components/CountdownTimer";
// 引入 Service 用于执行删除
import { ScheduleService } from "@/services/ScheduleService";

interface EventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
  // 新增回调：当发生删除操作时通知父组件刷新数据
  onRefresh?: () => void;
}

export default function EventList({
  selectedDate,
  events,
  onRefresh,
}: EventListProps) {
  // 详情模态框状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // 处理事件点击
  const handleEventPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  // 关闭详情模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  // 处理删除逻辑
  const handleDelete = (event: CalendarEvent) => {
    Alert.alert("确认删除", `确定要删除日程 "${event.title}" 吗？`, [
      {
        text: "取消",
        style: "cancel",
      },
      {
        text: "删除",
        style: "destructive", // iOS 上显示为红色
        onPress: async () => {
          try {
            // 1. 获取存储用的日期字符串 YYYY-MM-DD
            // 注意：这里要确保使用的是存入时的同一日期key
            const dateStr = new Date(event.startTime)
              .toISOString()
              .split("T")[0];

            // 2. 调用 Service 删除
            await ScheduleService.deleteEvent(dateStr, event.id);

            // 3. 通知父组件刷新列表 (实现实时更新)
            if (onRefresh) {
              onRefresh();
            }
          } catch (error) {
            Alert.alert("错误", "删除失败，请重试");
            console.error(error);
          }
        },
      },
    ]);
  };

  // 过滤出当天的事件
  const dayEvents = events.filter((e) => {
    const d = new Date(e.startTime);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  });

  const dateStr = selectedDate.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <View style={styles.container}>
      {/* 列表头 */}
      <View style={styles.header}>
        <Text style={styles.dateTitle}>{dateStr}</Text>
        <Text style={styles.countText}>{dayEvents.length} 个日程</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {dayEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="calendar-o" size={40} color="#ddd" />
            <Text style={styles.emptyText}>暂无日程</Text>
          </View>
        ) : (
          dayEvents.map((item) => {
            const timeStr = new Date(item.startTime).toLocaleTimeString(
              "zh-CN",
              { hour: "2-digit", minute: "2-digit" }
            );

            const now = new Date().getTime();
            const startTime = new Date(item.startTime).getTime();
            const isPast = startTime < now;
            const isFuture = startTime > now;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.eventCard, isPast && styles.pastCard]}
                activeOpacity={0.7}
                onPress={() => handleEventPress(item)}
              >
                <View
                  style={[
                    styles.colorBar,
                    isPast ? styles.pastBar : styles.activeBar,
                  ]}
                />

                {/* 中间内容区域 - 设置 flex: 1 占据剩余空间 */}
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, isPast && styles.pastText]}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <FontAwesome
                      name="clock-o"
                      size={12}
                      color={isPast ? "#999" : "#666"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.timeText}>{timeStr}</Text>
                    {item.location ? (
                      <>
                        <Text style={{ marginHorizontal: 6, color: "#ccc" }}>
                          |
                        </Text>
                        <FontAwesome
                          name="map-marker"
                          size={12}
                          color="#999"
                          style={{ marginRight: 2 }}
                        />
                        <Text style={styles.timeText}>{item.location}</Text>
                      </>
                    ) : null}
                  </View>

                  {isFuture && (
                    <CountdownTimer
                      targetDate={item.startTime}
                      title={item.title}
                    />
                  )}
                </View>

                {/* 右侧删除按钮 */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item)}
                  // 防止点击删除时触发卡片的点击事件
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <FontAwesome name="trash-o" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 事件详情模态框 */}
      <EventDetails
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 5,
  },
  dateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
  },
  countText: {
    fontSize: 12,
    color: "#999",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
    alignItems: "center", // 确保子元素垂直居中
  },
  pastCard: {
    opacity: 0.7,
    backgroundColor: "#fafafa",
  },
  colorBar: {
    width: 4,
    height: "100%", // 确保高度撑满
    borderRadius: 2,
    marginRight: 12,
  },
  activeBar: {
    backgroundColor: "#2563EB",
  },
  pastBar: {
    backgroundColor: "#ccc",
  },
  eventContent: {
    flex: 1, // 关键：让内容占据中间大部分空间
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  pastText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  // 新增：删除按钮样式
  deleteBtn: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
});
