import dayjs from 'dayjs';

/** YYYY-MM-DD for "today", used consistently across the app. */
export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function nowIso(): string {
  return dayjs().toISOString();
}

export function formatDateJa(date: string): string {
  return dayjs(date).format('YYYY年M月D日');
}

export function formatShort(date: string): string {
  return dayjs(date).format('M/D');
}

export function daysAgo(n: number): string {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD');
}

/** Inclusive range filter helper: is `date` within the last `n` days (including today)? */
export function isWithinLastDays(date: string, n: number): boolean {
  const cutoff = dayjs().subtract(n - 1, 'day').startOf('day');
  return !dayjs(date).isBefore(cutoff);
}

export type RangeKey = '7d' | '30d' | '90d' | 'all';

export const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': '7日間',
  '30d': '30日間',
  '90d': '90日間',
  all: '全期間',
};

export function filterByRange<T extends { date: string }>(items: T[], range: RangeKey): T[] {
  if (range === 'all') return items;
  const n = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return items.filter((item) => isWithinLastDays(item.date, n));
}
