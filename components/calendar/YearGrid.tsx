import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

interface YearGridProps {
  year: number;
  onMonthSelect: (monthIndex: number) => void;
}

/**
 * 迷你月份组件
 */
export const MiniMonth = ({
  year,
  monthIndex,
  onPress,
}: {
  year: number;
  monthIndex: number;
  onPress: () => void;
}) => {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayWeek = new Date(year, monthIndex, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDayWeek; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;
  const currentDay = today.getDate();

  return (
    <Pressable style={styles.monthContainer} onPress={onPress}>
      <Text
        style={[styles.monthTitle, isCurrentMonth && styles.currentMonthTitle]}
      >
        {MONTHS[monthIndex]}
      </Text>
      <View style={styles.daysGrid}>
        {daysArray.map((day, idx) => (
          <View key={idx} style={styles.dayCell}>
            {day !== null && (
              <View
                style={[
                  styles.dayTextContainer,
                  isCurrentMonth && day === currentDay && styles.todayIndicator,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isCurrentMonth && day === currentDay && styles.todayText,
                  ]}
                >
                  {day}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </Pressable>
  );
};

/**
 * 主组件：年视图网格
 */
export default function YearGrid({ year, onMonthSelect }: YearGridProps) {
  return (
    <View style={styles.gridContainer}>
      {MONTHS.map((_, index) => (
        <MiniMonth
          key={index}
          year={year}
          monthIndex={index}
          onPress={() => onMonthSelect(index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 10,
    backgroundColor: "#fff", // 网格背景
    flex: 1, // 撑满
  },
  monthContainer: {
    width: "33.33%",
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    marginLeft: 2,
  },
  currentMonthTitle: {
    color: "#007AFF",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayTextContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 9,
    color: "#555",
    fontWeight: "500",
  },
  todayIndicator: {
    backgroundColor: "#007AFF",
  },
  todayText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
