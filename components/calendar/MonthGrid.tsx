import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { CalendarEvent } from '@/types/calendar';

interface MonthGridProps {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

export default function MonthGrid({ 
  currentDate, 
  selectedDate, 
  events, 
  onDateSelect, 
  onMonthChange 
}: MonthGridProps) {
  
  // 日期计算逻辑
  const daysArray = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

    const arr = [];
    // 填充空白
    for (let i = 0; i < firstDayWeek; i++) arr.push(null);
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    return arr;
  }, [currentDate]);

  // 检查某天是否有事件
  const hasEventOnDay = (day: number) => {
    return events.some(e => {
      const d = new Date(e.startTime);
      return (
        d.getDate() === day &&
        d.getMonth() === currentDate.getMonth() &&
        d.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  return (
    <View style={styles.card}>
      {/* 1. 头部：月份切换 */}
      <View style={styles.header}>
        <Pressable onPress={() => onMonthChange('prev')} style={styles.arrowBtn}>
          <FontAwesome name="chevron-left" size={16} color="#666" />
        </Pressable>
        <Text style={styles.monthTitle}>
          {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
        </Text>
        <Pressable onPress={() => onMonthChange('next')} style={styles.arrowBtn}>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </Pressable>
      </View>

      {/* 2. 星期表头 */}
      <View style={styles.weekRow}>
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
          <Text key={d} style={styles.weekText}>{d}</Text>
        ))}
      </View>

      {/* 3. 日期网格 */}
      <View style={styles.grid}>
        {daysArray.map((day, index) => {
          if (!day) return <View key={index} style={styles.dayCell} />;

          const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isSelected = isSameDay(thisDate, selectedDate);
          const isToday = isSameDay(thisDate, new Date());
          const hasEvent = hasEventOnDay(day);

          return (
            <Pressable 
              key={index} 
              style={styles.dayCell} 
              onPress={() => onDateSelect(thisDate)}
            >
              <View style={[
                styles.dayCircle,
                isSelected && styles.selectedCircle,
                (!isSelected && isToday) && styles.todayCircle
              ]}>
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedText,
                  (!isSelected && isToday) && styles.todayText
                ]}>
                  {day}
                </Text>
              </View>
              {/* 事件小圆点 */}
              <View style={styles.dotContainer}>
                 {hasEvent && <View style={[styles.dot, isSelected && styles.selectedDot]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    margin: 15,
    // 阴影效果
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowBtn: {
    padding: 10,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekText: {
    flex: 1,
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100% / 7
    aspectRatio: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  // 选中样式
  selectedCircle: {
    backgroundColor: '#2563EB', // Tailwind blue-600
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 2,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  // 今天样式
  todayCircle: {
    backgroundColor: '#EFF6FF', // Tailwind blue-50
  },
  todayText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  // 事件点样式
  dotContainer: {
    height: 6,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563EB',
  },
  selectedDot: {
    backgroundColor: '#fff',
  }
});