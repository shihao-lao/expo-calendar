import EventList from "@/components/calendar/EventList";
import MonthGrid from "@/components/calendar/MonthGrid";
import { getAllEvents } from "@/services/StorageDebugger";
import { CalendarEvent } from "@/types/calendar";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // 加载所有事件数据
    const loadEvents = async () => {
      const allEvents = await getAllEvents();
      console.log("index:allEvents", allEvents);
      setEvents(allEvents);
    };
    loadEvents();
  }, []);

  // --- 核心切换逻辑 ---
  // 这个函数现在只负责更新数据，不负责动画
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
  // 数据更新后，执行"从另一侧飞入"的动画
  const animateIn = (direction: "prev" | "next") => {
    // 1. 瞬移到起始位置
    if (direction === "prev") {
      // 如果是看上个月，新视图应该从左边(-SCREEN_WIDTH)进来
      translateX.value = -SCREEN_WIDTH;
    } else {
      // 如果是看下个月，新视图应该从右边(SCREEN_WIDTH)进来
      translateX.value = SCREEN_WIDTH;
    }

    // 2. 只有瞬移完成后，才开始缓动回到中间 (0)
    // 使用 requestAnimationFrame 确保 React 渲染周期已完成
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
    .activeOffsetX([-10, 10]) // 只有水平滑动才激活
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 滑动超过 1/4 屏幕触发

      if (e.translationX > SWIPE_THRESHOLD) {
        // ---> 向右滑 (想看上个月 prev)
        // 1. 先把当前视图完全滑出屏幕右侧
        translateX.value = withTiming(
          SCREEN_WIDTH,
          { duration: 200 },
          (finished) => {
            if (finished) {
              // 2. 动画结束后，JS 线程更新数据
              runOnJS(updateMonth)("prev");
              // 3. JS 线程触发进场动画
              runOnJS(animateIn)("prev");
            }
          }
        );
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // <--- 向左滑 (想看下个月 next)
        // 1. 先把当前视图完全滑出屏幕左侧
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
        // 滑动距离不够，弹回原位
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 手势监听层 */}
        <GestureDetector gesture={panGesture}>
          {/* 注意：这里移除了 key, entering, exiting。
            现在这是一个纯粹受 translateX 控制的 View。
            当数据改变时，View 依然在，只是内容变了。
          */}
          <Animated.View style={[styles.calendarWrapper, animatedStyle]}>
            <View style={styles.monthGridContainer}>
              <MonthGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                events={events}
                onDateSelect={handleDateSelect}
                // 注意：这里不要直接传 handleMonthChange 给子组件用来动画
                // 如果子组件有点左右箭头，需要另外处理点击事件调用 animateIn 逻辑
                onMonthChange={(dir) => {
                  // 这里处理点击箭头切换的逻辑，模拟手势效果
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
