import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
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

import YearGrid from "@/components/calendar/YearGrid";
import Colors from "@/constants/Colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

/**
 * 屏幕组件：年视图主屏幕 (核心修改部分)
 */
export default function YearScreen() {
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Reanimated 共享值
  const translateX = useSharedValue(0);

  // --- 1. 数据更新逻辑 ---
  const updateYear = (direction: "prev" | "next") => {
    setCurrentYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  // --- 2. 进场动画逻辑 ---
  const animateIn = (direction: "prev" | "next") => {
    // 瞬间移动到屏幕另一侧
    if (direction === "prev") {
      translateX.value = -SCREEN_WIDTH; // 看上一年，新视图从左边飞入
    } else {
      translateX.value = SCREEN_WIDTH; // 看下一年，新视图从右边飞入
    }

    // 稍作延迟后滑回中间
    setTimeout(() => {
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    }, 16);
  };

  // --- 3. 统一的触发器 (供手势和点击按钮共用) ---
  const triggerChange = (direction: "prev" | "next") => {
    const targetValue = direction === "prev" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    // 执行离场动画
    translateX.value = withTiming(
      targetValue,
      { duration: 200 },
      (finished) => {
        if (finished) {
          // 动画结束：更新数据 -> 触发进场
          runOnJS(updateYear)(direction);
          runOnJS(animateIn)(direction);
        }
      }
    );
  };

  // --- 4. 手势定义 ---
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // 仅水平滑动激活
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2; // 滑动阈值

      if (e.translationX > SWIPE_THRESHOLD) {
        // 向右滑 -> 上一年
        runOnJS(triggerChange)("prev");
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        // 向左滑 -> 下一年
        runOnJS(triggerChange)("next");
      } else {
        // 回弹
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleMonthSelect = (monthIndex: number) => {
    router.push({
      pathname: "/",
      params: { year: currentYear, month: monthIndex },
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.screenContainer}>
        {/* 头部：包含左右切换按钮 */}
        {/* 注意：我们把 Header 放在动画容器外面，这样标题只变数字，不会跟着乱飞。
            如果你希望整个标题栏也飞走，可以把它移到 GestureDetector 里面去。 */}
        <View style={styles.header}>
          <Pressable
            onPress={() => triggerChange("prev")}
            style={styles.arrowButton}
            hitSlop={20} // 增加点击区域
          >
            <FontAwesome
              name="chevron-left"
              size={20}
              color={Colors.light.text}
            />
          </Pressable>

          <Text style={styles.yearTitle}>{currentYear}年</Text>

          <Pressable
            onPress={() => triggerChange("next")}
            style={styles.arrowButton}
            hitSlop={20}
          >
            <FontAwesome
              name="chevron-right"
              size={20}
              color={Colors.light.text}
            />
          </Pressable>
        </View>

        {/* 手势监听区域：只包裹网格部分 */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.contentWrapper, animatedStyle]}>
            <YearGrid year={currentYear} onMonthSelect={handleMonthSelect} />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: "#f5f5f5", // 背景色保持一致避免穿帮
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15, // 稍微减小高度
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    zIndex: 10, // 确保头部在最上层
  },
  yearTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  arrowButton: {
    padding: 10,
  },
  // 原 container 改名为 gridContainer 避免混淆
});
