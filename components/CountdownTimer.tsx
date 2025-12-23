import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { calculateTimeDifference } from "@/utils/time"; // 确保路径正确

interface Props {
  targetDate: string;
  title?: string;
}

export default function CountdownTimer({ targetDate, title = "日程" }: Props) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const hasAlerted = useRef(false);

  function calculateTimeLeft() {
    try {
      const difference = calculateTimeDifference(targetDate);

      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    // 立即计算一次
    if (!calculateTimeLeft()) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (!remaining) {
        clearInterval(timer);
        if (!hasAlerted.current) {
          hasAlerted.current = true;
          // 倒计时结束时的弹窗（仅在前台触发）
          // 后台通知由 NotificationService 负责，这里不重复处理
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <View style={[styles.container, styles.expiredContainer]}>
        <Text style={styles.expiredText}>🔴 已结束</Text>
      </View>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");
  const isUrgent =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 10;

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <Text style={[styles.label, isUrgent && styles.urgentText]}>
        {isUrgent ? "即将开始:" : "距离开始:"}
      </Text>

      <View style={styles.timeBlock}>
        {timeLeft.days > 0 && (
          <Text style={[styles.digit, isUrgent && styles.urgentText]}>
            {timeLeft.days}天{" "}
          </Text>
        )}
        <Text style={[styles.digit, isUrgent && styles.urgentText]}>
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  label: { fontSize: 12, color: "#666", marginRight: 6, fontWeight: "600" },
  timeBlock: { flexDirection: "row" },
  digit: {
    fontFamily: "SpaceMono-Regular",
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  expiredContainer: { backgroundColor: "#fee2e2" },
  expiredText: { color: "#dc2626", fontWeight: "bold", fontSize: 12 },
  urgentContainer: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
  },
  urgentText: { color: "#ea580c" },
});
