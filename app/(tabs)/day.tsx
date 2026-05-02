import DayTimeline from "@/components/calendar/DayTimeline";
import { WeatherService, WeatherSummary } from "@/services/WeatherService";
import { getAllEvents } from "@/services/StorageDebugger";
import { CalendarEvent } from "@/types/calendar";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function DayScreen() {
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取当前日期
  const formattedDate = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;

  // 获取天气数据
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherResponse = await WeatherService.getCurrentWeather();
        setWeather(weatherResponse);
      } catch (err) {
        setError("获取天气失败");
        if (__DEV__) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setCurrentDate(new Date());
      getAllEvents().then(setEvents).catch((err) => {
        if (__DEV__) {
          console.error("刷新日程失败:", err);
        }
      });
    }, [])
  );

  // 祝福语
  const getBlessing = () => {
    const hour = currentDate.getHours();
    if (hour < 6) return "夜深了，早点休息吧";
    if (hour < 12) return "早上好，新的一天加油！";
    if (hour < 18) return "下午好，继续努力！";
    return "晚上好，辛苦了一天！";
  };

  return (
    <View style={styles.container}>
      {/* 顶部信息栏 */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.blessingText}>{getBlessing()}</Text>
        </View>

        {/* 天气信息 */}
        <View style={styles.weatherContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : error ? (
            <Text style={styles.weatherText}>{error}</Text>
          ) : (
            <View style={styles.weatherContent}>
              <Text style={styles.cityText}>{weather?.city || "当前位置"}</Text>
              <Text style={styles.weatherText}>
                {weather?.text || "未知"}
              </Text>
              <Text style={styles.tempText}>
                {weather?.temp || "--"}°C
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 时间轴 */}
      <DayTimeline events={events} selectedDate={currentDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  blessingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  weatherContainer: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  weatherContent: {
    alignItems: "center",
  },
  cityText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  weatherText: {
    fontSize: 14,
    color: "#666",
  },
  tempText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
});
