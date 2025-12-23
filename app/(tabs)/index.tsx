import EventList from "@/components/calendar/EventList";
import MonthGrid from "@/components/calendar/MonthGrid";
import { getAllEvents } from "@/services/StorageDebugger";
import { CalendarEvent } from "@/types/calendar";
import { useFocusEffect, useLocalSearchParams } from "expo-router"; // 1. 引入 useFocusEffect
import React, { useCallback, useEffect, useState } from "react"; // 2. 引入 useCallback
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
  const [events, setEvents] = useState<CalendarEvent[]>([]); // 初始化为空数组

  // 动画值
  const translateX = useSharedValue(0);

  // 初始化参数 (保持不变)
  const yearParam = parseInt(params.year as string);
  const monthParam = parseInt(params.month as string);

  useEffect(() => {
    if (!isNaN(yearParam) && !isNaN(monthParam)) {
      const newDate = new Date(yearParam, monthParam, 1);
      setCurrentDate(newDate);
      setSelectedDate(newDate);
    }
  }, [yearParam, monthParam]);

  // --- 核心修复：使用 useFocusEffect 自动刷新数据 ---
  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
        console.log("正在刷新日程列表...");
        try {
          const allEvents = await getAllEvents();
          console.log(`刷新完成，共获取到 ${allEvents.length} 条数据`);
          setEvents(allEvents);
        } catch (e) {
          console.error("刷新失败", e);
        }
      };

      loadEvents();
    }, []) // 空依赖数组表示每次聚焦都会执行
  );

  // --- 以下逻辑保持不变 ---
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

  // 手势定义
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
                events={events} // 传递最新的事件数据
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
          <EventList events={events} selectedDate={selectedDate} />
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
