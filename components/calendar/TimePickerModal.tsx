import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
interface TimePickerModalProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export default function TimePickerModal({
  label,
  value,
  onChange,
}: TimePickerModalProps) {
  // === Android 状态管理 ===
  const [showAndroid, setShowAndroid] = useState(false);
  const [androidMode, setAndroidMode] = useState<"date" | "time">("date");

  // === iOS 状态管理 ===
  const [showIos, setShowIos] = useState(false);
  // iOS 临时变量，点击“完成”才生效
  const [iosTempDate, setIosTempDate] = useState(value);

  // 格式化显示时间：YYYY-MM-DD HH:mm
  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  // 触发选择
  const handlePress = () => {
    if (Platform.OS === "android") {
      setAndroidMode("date"); // Android 先选日期
      setShowAndroid(true);
    } else {
      setIosTempDate(value); // iOS 初始化临时时间
      setShowIos(true);
    }
  };

  // Android 处理逻辑：日期 -> 时间 -> 完成
  const onAndroidChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type !== "set" || !selectedDate) {
      setShowAndroid(false);
      return;
    }

    if (androidMode === "date") {
      // 1. 用户选完了日期，现在更新日期部分
      const newDate = new Date(value);
      newDate.setFullYear(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      onChange(newDate); // 实时更新父组件，防止丢失

      // 2. 立即关闭当前弹窗，并切换到时间模式
      setShowAndroid(false);
      // 使用 setTimeout 确保上一个弹窗完全关闭后再打开下一个
      setTimeout(() => {
        setAndroidMode("time");
        setShowAndroid(true);
      }, 100);
    } else {
      // 3. 用户选完了时间
      const newDate = new Date(value);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      onChange(newDate);
      setShowAndroid(false); // 全部结束
    }
  };

  // iOS 处理逻辑
  const onIosConfirm = () => {
    onChange(iosTempDate);
    setShowIos(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formatDateTime(value)}</Text>
        </View>
      </TouchableOpacity>

      {/* Android 渲染逻辑：根据 mode 渲染不同选择器 */}
      {Platform.OS === "android" && showAndroid && (
        <DateTimePicker
          value={value}
          mode={androidMode}
          display="default"
          onChange={onAndroidChange}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal
          visible={showIos}
          transparent
          animationType="slide"
          onRequestClose={() => setShowIos(false)}
        >
          <View style={styles.iosOverlay}>
            <View style={styles.iosContent}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setShowIos(false)}>
                  <Text style={styles.iosCancel}>取消</Text>
                </TouchableOpacity>
                <Text style={styles.iosTitle}>选择{label}</Text>
                <TouchableOpacity onPress={onIosConfirm}>
                  <Text style={styles.iosConfirm}>完成</Text>
                </TouchableOpacity>
              </View>
              {/* iOS 原生支持 mode="datetime"，可以同时选日期和时间 */}
              <DateTimePicker
                value={iosTempDate}
                mode="datetime"
                display="spinner" // 或者 "inline" (iOS 14+ 风格)
                onChange={(_, date) => date && setIosTempDate(date)}
                locale="zh-CN"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  button: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
    fontVariant: ["tabular-nums"], // 等宽数字，防止时间跳动时抖动
  },
  // iOS 样式
  iosOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  iosContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  iosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fafafa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosTitle: { fontSize: 16, fontWeight: "600" },
  iosCancel: { fontSize: 16, color: "#888" },
  iosConfirm: { fontSize: 16, color: "#007AFF", fontWeight: "bold" },
});
