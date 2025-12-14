import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
// 引入修改后的组件
import TimePickerModal from "@/components/calendar/TimePickerModal";
import { ScheduleService } from "@/services/ScheduleService";
import { clearStorage, debugStorage, getAllEvents } from "@/services/StorageDebugger";

export default function AddEventScreen() {
  const router = useRouter();

  // 表单状态
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  // 默认时间设置
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1); // 默认一小时后
    return d;
  });
  // 提交方案
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("提示", "请输入日程标题");
      return;
    }
    if (endDate < startDate) {
      Alert.alert("提示", "结束时间不能早于开始时间");
      return;
    }

    // 构造数据
    const newEvent = {
      id: Date.now().toString(),
      title: title,
      time: `${startDate.getHours().toString().padStart(2, "0")}:${startDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      location: location,
    };

    try {
      console.log("准备保存事件:", { title, location, startDate, endDate }); // 调试日志
      const dateStr = startDate.toISOString().split("T")[0]; // 获取 YYYY-MM-DD 格式
      console.log("日期字符串:", dateStr); // 调试日志
      await ScheduleService.addEvent(dateStr, newEvent);
      console.log("事件保存成功"); // 调试日志
      router.back();
    } catch (error) {
      console.error("保存事件失败:", error); // 更详细的错误日志
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
            placeholder="例如: 团队周会"
            value={title}
            onChangeText={setTitle}
            autoFocus // 自动聚焦
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>地点 (可选)</Text>
          <TextInput
            style={styles.input}
            placeholder="例如: 会议室 A"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={{ marginTop: 10 }}>
          {/* 开始时间选择器 */}
          <TimePickerModal
            label="开始时间"
            value={startDate}
            onChange={(date) => {
              setStartDate(date);
              // 智能联动：如果开始时间晚于结束时间，自动推迟结束时间
              if (date > endDate) {
                const newEnd = new Date(date);
                newEnd.setHours(newEnd.getHours() + 1);
                setEndDate(newEnd);
              }
            }}
          />

          {/* 结束时间选择器 */}
          <TimePickerModal
            label="结束时间"
            value={endDate}
            onChange={setEndDate}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="取消" color="#888" onPress={() => router.back()} />
        <View style={{ width: 20 }} />
        <Button title="保存事件" onPress={handleSave} />
      </View>

      {/* 调试按钮 - 仅在开发时使用 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 20,
          backgroundColor: "#f0f0f0",
        }}
      >
        <Button title="查看存储数据" onPress={debugStorage} color="#007AFF" />
        <Button title="获取所有事件" onPress={getAllEvents} color="#007AFF" />
        <Button title="清空存储" onPress={clearStorage} color="#FF3B30" />
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
