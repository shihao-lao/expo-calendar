import "react-native-gesture-handler";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color : string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
        // 统一设置右上角按钮
        headerRight: () => (
          // 修改 href 指向一个新的 modal 页面，而不是 "/"
          <Link href="/add-event" asChild>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 15,
              }}
            >
              {({ pressed }) => (
                <FontAwesome
                  name="plus" // 简化图标
                  size={20}
                  color={Colors[colorScheme ?? "light"].text}
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      {/* 调整顺序：年 -> 月 -> 日，符合逻辑流 */}
      <Tabs.Screen
        name="year"
        options={{
          title: "年视图",
          tabBarIcon: ({ color }) => <TabBarIcon name="th" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "月视图",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="day"
        options={{
          title: "日视图",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="list-alt" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
