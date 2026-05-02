import { CalendarEvent } from "@/types/calendar";
import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;
const LABEL_WIDTH = 58;
const EVENT_GAP = 6;

interface DayTimelineProps {
  selectedDate: Date;
  events: CalendarEvent[];
}

interface TimedEvent {
  event: CalendarEvent;
  start: Date;
  end: Date;
  top: number;
  height: number;
  column: number;
  columnCount: number;
}

function isSameLocalDay(date: Date, selectedDate: Date) {
  return (
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate()
  );
}

function layoutOverlapGroup(group: TimedEvent[]) {
  const columnEndTimes: number[] = [];

  group.forEach((item) => {
    const startTime = item.start.getTime();
    const reusableColumn = columnEndTimes.findIndex((endTime) => endTime <= startTime);
    const column = reusableColumn === -1 ? columnEndTimes.length : reusableColumn;

    item.column = column;
    columnEndTimes[column] = item.end.getTime();
  });

  group.forEach((item) => {
    item.columnCount = columnEndTimes.length;
  });
}

export default function DayTimeline({ selectedDate, events }: DayTimelineProps) {
  const { width } = useWindowDimensions();
  const eventAreaWidth = Math.max(160, width - LABEL_WIDTH - 12);

  const positionedEvents = useMemo(() => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const timedEvents = events
      .map<TimedEvent | null>((event) => {
      const start = new Date(event.startTime);
        const rawEnd = new Date(event.endTime);

        if (isNaN(start.getTime()) || !isSameLocalDay(start, selectedDate)) {
          return null;
        }

        const fallbackEnd = new Date(start.getTime() + 30 * 60 * 1000);
        const end =
          isNaN(rawEnd.getTime()) || rawEnd <= start
            ? fallbackEnd
            : new Date(Math.min(rawEnd.getTime(), dayEnd.getTime()));

        const top =
          start.getHours() * HOUR_HEIGHT +
          (start.getMinutes() / 60) * HOUR_HEIGHT;
        const durationHours = Math.max(
          0.5,
          (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      );

        return {
          event,
          start,
          end,
          top,
          height: Math.max(36, durationHours * HOUR_HEIGHT),
          column: 0,
          columnCount: 1,
        };
      })
      .filter((event): event is TimedEvent => event !== null)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    let group: TimedEvent[] = [];
    let groupEnd = 0;

    timedEvents.forEach((item) => {
      if (group.length > 0 && item.start.getTime() >= groupEnd) {
        layoutOverlapGroup(group);
        group = [];
      }

      group.push(item);
      groupEnd = Math.max(groupEnd, item.end.getTime());
    });

    if (group.length > 0) {
      layoutOverlapGroup(group);
    }

    return timedEvents;
  }, [events, selectedDate]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeline}>
        {HOURS.map((hour) => (
          <View key={hour} style={styles.timeRow}>
            <View style={styles.timeLabelContainer}>
              <Text style={styles.timeLabel}>{`${hour}:00`}</Text>
            </View>
            <View style={styles.timeContent}>
              <View style={styles.separator} />
            </View>
          </View>
        ))}

        {positionedEvents.map((item) => {
          const eventWidth =
            (eventAreaWidth - EVENT_GAP * (item.columnCount - 1)) /
            item.columnCount;
          const left = LABEL_WIDTH + item.column * (eventWidth + EVENT_GAP);

          return (
            <View
              key={item.event.id}
              style={[
                styles.eventBlock,
                {
                  top: item.top,
                  height: item.height,
                  left,
                  width: eventWidth,
                },
              ]}
            >
              <Text style={styles.eventTitle} numberOfLines={1}>
                {item.event.title}
              </Text>
              <Text style={styles.eventMeta} numberOfLines={1}>
                {item.start.toLocaleTimeString("zh-CN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {item.event.location ? ` · ${item.event.location}` : ""}
              </Text>
            </View>
          );
        })}

        {positionedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>今天暂无日程</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeline: {
    minHeight: 24 * HOUR_HEIGHT,
    position: "relative",
  },
  timeRow: {
    flexDirection: 'row',
    height: HOUR_HEIGHT,
  },
  timeLabelContainer: {
    width: LABEL_WIDTH - 8,
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
  eventBlock: {
    position: "absolute",
    borderRadius: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  eventMeta: {
    color: "#DBEAFE",
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    position: "absolute",
    top: 110,
    left: 58,
    right: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  emptyText: {
    color: "#999",
    fontSize: 13,
  },
});
