import 'react-native-gesture-handler';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { NotificationService } from "@/services/NotificationService";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  useEffect(() => {
    NotificationService.setup();
  }, []);
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Modal screen is commented out as it doesn't exist in the project */}
        {/* <Stack.Screen name="modal" options={{ presentation: 'modal' }} /> */}
        {/* add-event页面导航栏配置 */}
        <Stack.Screen
          name="add-event"
          options={{
            title: "添加日程", // 自定义页面标题
            headerTintColor: "#333", // 返回箭头颜色
            headerStyle: {
              backgroundColor: "#fff", // 导航栏背景色
            },
            headerTitleStyle: {
              fontSize: 18, // 标题字体大小
              fontWeight: "600", // 标题字体粗细
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
