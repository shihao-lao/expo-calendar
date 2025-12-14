import { CalendarEvent } from "@/types/calendar";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface EventDetailsProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
}

export default function EventDetails({
  visible,
  event,
  onClose,
}: EventDetailsProps) {
  if (!event) return null;

  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const formattedDate = startTime.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const formattedStartTime = startTime.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedEndTime = endTime.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 背景遮罩和内容容器 */}
      <View style={styles.container}>
        {/* 背景遮罩 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* 详情卡片 */}
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            {/* 头部 */}
            <View style={styles.header}>
              <Text style={styles.title}>事件详情</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={18} color="#888" />
              </TouchableOpacity>
            </View>

            {/* 事件内容 */}
            <View style={styles.eventInfo}>
              {/* 标题 */}
              <Text style={styles.eventTitle}>{event.title}</Text>

              {/* 日期和时间 */}
              <View style={styles.dateTimeSection}>
                <View style={styles.dateTimeRow}>
                  <FontAwesome
                    name="calendar"
                    size={16}
                    color="#666"
                    style={styles.icon}
                  />
                  <Text style={styles.infoText}>{formattedDate}</Text>
                </View>

                <View style={styles.dateTimeRow}>
                  <FontAwesome
                    name="clock-o"
                    size={16}
                    color="#666"
                    style={styles.icon}
                  />
                  <Text style={styles.infoText}>
                    {formattedStartTime} - {formattedEndTime}
                  </Text>
                </View>
              </View>

              {/* 地点 */}
              {event.location && (
                <View style={styles.locationSection}>
                  <FontAwesome
                    name="map-marker"
                    size={16}
                    color="#666"
                    style={styles.icon}
                  />
                  <Text style={styles.infoText}>{event.location}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "85%",
    maxWidth: 360,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 6,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  dateTimeSection: {
    marginBottom: 15,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
});
