export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO 8601 string, e.g., '2023-10-01T10:00:00'
  endTime: string;
  color?: string;
  location?: string;
}

export type ViewType = 'year' | 'month' | 'day';