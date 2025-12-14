import { CalendarEvent } from "@/types/calendar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EventDetails from "./EventDetails";

interface EventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
}

export default function EventList({ selectedDate, events }: EventListProps) {
  console.log("selectedDate:", selectedDate);
  console.log("events:", events);

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
            // 简单的过期判断
            const isPast =
              new Date(item.startTime).getTime() < new Date().getTime();

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
                  </View>
                </View>
                {/* 可以放删除按钮 */}
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
  // 空状态
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
  },
  // 事件卡片
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    // 阴影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
  },
  pastCard: {
    opacity: 0.7,
    backgroundColor: "#fafafa",
  },
  colorBar: {
    width: 4,
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
    flex: 1,
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
});
