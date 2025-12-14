import React from "react";
import { StyleSheet } from "react-native";
import DayTimeline from "@/components/calendar/DayTimeline";
import { View } from "@/components/Themed";

export default function DayScreen() {
  return (
    <View style={styles.container}>
      <DayTimeline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});