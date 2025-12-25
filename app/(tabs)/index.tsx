import EventList from "@/components/calendar/EventList";
import MonthGrid from "@/components/calendar/MonthGrid";
import { getAllEvents } from "@/services/StorageDebugger";
import { CalendarEvent } from "@/types/calendar";
import { useLocalSearchParams, useFocusEffect } from "expo-router"; // 1. 引入 useFocusEffect
import React, { useEffect, useState, useCallback } from "react"; // 2. 引入 useCallback
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MonthScreen() {
  const params = useLocalSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 动画值
  const translateX = useSharedValue(0);

  // 初始化参数
  const yearParam = parseInt(params.year as string);
  const monthParam = parseInt(params.month as string);

  useEffect(() => {
    if (!isNaN(yearParam) && !isNaN(monthParam)) {
      const newDate = new Date(yearParam, monthParam, 1);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    }
  }, [yearParam, monthParam]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 3. 【核心修改】定义加载数据的函数
  const loadEvents = useCallback(async () => {
    console.log("正在刷新日程列表...");
    const allEvents = await getAllEvents();
    setEvents(allEvents);
  }, []);

  // 4. 【核心修改】页面获得焦点时自动刷新 (解决添加/删除后返回不更新的问题)
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  // 初始加载
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // --- 核心切换逻辑 ---
  const updateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // --- 进场动画 ---
  const animateIn = (direction: "prev" | "next") => {
    if (direction === "prev") {
      translateX.value = -SCREEN_WIDTH;
    } else {
      translateX.value = SCREEN_WIDTH;
    }

    setTimeout(() => {
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }, 16);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== currentDate.getMonth()) {
      setCurrentDate(date);
    }
  };

  // --- 手势定义 ---
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(updateMonth)("prev");
              runOnJS(animateIn)("prev");
            }
          }
        );
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SCREEN_WIDTH,
          { duration: 200 },
          (finished) => {
            if (finished) {
              runOnJS(updateMonth)("next");
              runOnJS(animateIn)("next");
            }
          }
        );
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.calendarWrapper, animatedStyle]}>
            <View style={styles.monthGridContainer}>
              <MonthGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={events} // 确保 MonthGrid 也能拿到最新数据显示圆点
                onDateSelect={handleDateSelect}
                onMonthChange={(dir) => {
                  if (dir === "prev") {
                    translateX.value = withTiming(
                      SCREEN_WIDTH,
                      { duration: 200 },
                      () => {
                        runOnJS(updateMonth)("prev");
                        runOnJS(animateIn)("prev");
                      }
                    );
                  } else {
                    translateX.value = withTiming(
                      -SCREEN_WIDTH,
                      { duration: 200 },
                      () => {
                        runOnJS(updateMonth)("next");
                        runOnJS(animateIn)("next");
                      }
                    );
                  }
                }}
              />
            </View>
          </Animated.View>
        </GestureDetector>

        <View style={styles.listContainer}>
          {/* 5. 【关键】将 loadEvents 作为 onRefresh 传给 EventList */}
          <EventList
            events={events}
            selectedDate={selectedDate}
            onRefresh={loadEvents}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  calendarWrapper: {
    backgroundColor: "#F9FAFB",
    zIndex: 1,
  },
  monthGridContainer: {
    width: "100%",
  },
  listContainer: {
    flex: 1,
    zIndex: 0,
  },
});
