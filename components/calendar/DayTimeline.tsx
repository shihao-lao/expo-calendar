import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function DayTimeline() {
  return (
    <ScrollView style={styles.container}>
      {HOURS.map((hour) => (
        <View key={hour} style={styles.timeRow}>
          <View style={styles.timeLabelContainer}>
            <Text style={styles.timeLabel}>{`${hour}:00`}</Text>
          </View>
          <View style={styles.timeContent}>
            {/* 分割线 */}
            <View style={styles.separator} />
            {/* 这里可以根据传入的 events 渲染具体的日程块 */}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    height: 60, // 每小时的高度
  },
  timeLabelContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
  },
  timeContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
});