import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { NotificationService } from "@/services/NotificationService";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import TimePickerModal from "@/components/calendar/TimePickerModal";
import { ScheduleService } from "@/services/ScheduleService";

export default function AddEventScreen() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  // 初始化：默认时间设为“当前时间 + 2分钟”，方便测试
  // 注意：这只是初始值，之后的一切操作都应基于 startDate 状态
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes());
    return d;
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  });

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("提示", "请输入日程标题");
      return;
    }

    // --- 1. 时间同步校验 (Debug 专用) ---
    console.log("============= 保存操作开始 =============");
    console.log("1. 用户选择的时间 (UI):", startDate.toLocaleString());
    console.log("2. 当前系统时间:", new Date().toLocaleString());

    // 严格校验：确保时间在未来
    if (startDate.getTime() < Date.now() + 5000) {
      Alert.alert("时间无效", "请选择至少 1 分钟以后的未来时间。");
      return;
    }

    if (endDate < startDate) {
      Alert.alert("提示", "结束时间不能早于开始时间");
      return;
    }

    // --- 2. 设置提醒 (关键修复：直接传 startDate) ---
    // 不要在这里 new Date() 或做加减法，直接用状态里的时间
    const notificationId = await NotificationService.scheduleReminder(
      title,
      startDate
    );

    // --- 3. 保存数据 (关键修复：使用同一个 startDate) ---
    const newEvent = {
      id: Date.now().toString(),
      title: title,
      time: `${startDate.getHours().toString().padStart(2, "0")}:${startDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      startTime: startDate.toISOString(), // 存入数据库的时间
      endTime: endDate.toISOString(),
      location: location,
    };

    try {
      const dateStr = startDate.toISOString().split("T")[0];
      await ScheduleService.addEvent(dateStr, newEvent);

      const diffSeconds = Math.floor((startDate.getTime() - Date.now()) / 1000);

      Alert.alert(
        "设置成功",
        `时间已同步！\n\n设定触发时间: ${startDate.toLocaleTimeString()}\n倒计时: ${diffSeconds} 秒`,
        [{ text: "好的", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("保存事件失败:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>新建日程</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>标题</Text>
          <TextInput
            style={styles.input}
            placeholder="例如: 时间同步测试"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>地点 (可选)</Text>
          <TextInput
            style={styles.input}
            placeholder="例如: 办公室"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={{ marginTop: 10 }}>
          <TimePickerModal
            label="开始时间 (触发提醒)"
            value={startDate}
            onChange={(date) => {
              setStartDate(date);
              // 自动调整结束时间，保持逻辑连贯
              if (date > endDate) {
                const newEnd = new Date(date);
                newEnd.setHours(newEnd.getHours() + 1);
                setEndDate(newEnd);
              }
            }}
          />

          <TimePickerModal
            label="结束时间"
            value={endDate}
            onChange={setEndDate}
          />
        </View>

        <Text
          style={{
            marginTop: 20,
            color: "#e67e22",
            fontSize: 13,
            lineHeight: 20,
          }}
        >
          调试说明：{"\n"}
          系统当前时间: {new Date().toLocaleTimeString()}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="取消" color="#888" onPress={() => router.back()} />
        <View style={{ width: 20 }} />
        <Button title="保存事件" onPress={handleSave} />
      </View>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20, paddingTop: 40 },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#888", marginBottom: 8, fontWeight: "600" },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontSize: 18,
    paddingVertical: 8,
    color: "#333",
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
  },
});
