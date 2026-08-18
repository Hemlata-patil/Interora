export type DeadlineStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'DEADLINE_NEAR'
  | 'LAST_DAY'
  | 'EXPIRED'
  | 'UNAVAILABLE';

export interface CountdownResult {
  status: DeadlineStatus;
  statusLabel: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  formattedCountdown: string;
  badgeVariant: 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral';
}

export const calculateInternshipCountdown = (deadlineIso?: string): CountdownResult => {
  if (!deadlineIso) {
    return {
      status: 'UNAVAILABLE',
      statusLabel: 'Deadline not available',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      formattedCountdown: 'Deadline unavailable',
      badgeVariant: 'neutral',
    };
  }

  const deadlineTime = new Date(deadlineIso).getTime();
  if (isNaN(deadlineTime)) {
    return {
      status: 'UNAVAILABLE',
      statusLabel: 'Invalid deadline date',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      formattedCountdown: 'Deadline unavailable',
      badgeVariant: 'neutral',
    };
  }

  const now = new Date().getTime();
  const diff = deadlineTime - now;

  if (diff <= 0) {
    return {
      status: 'EXPIRED',
      statusLabel: 'Applications Closed',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      formattedCountdown: 'Applications Closed',
      badgeVariant: 'rose',
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const totalHours = Math.floor(diff / (1000 * 60 * 60));

  let status: DeadlineStatus = 'OPEN';
  let statusLabel = 'Open';
  let badgeVariant: 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral' = 'emerald';

  if (totalHours < 24) {
    status = 'LAST_DAY';
    statusLabel = 'Last Day';
    badgeVariant = 'rose';
  } else if (totalHours <= 72) {
    status = 'DEADLINE_NEAR';
    statusLabel = 'Deadline Near';
    badgeVariant = 'amber';
  } else if (days <= 7) {
    status = 'CLOSING_SOON';
    statusLabel = 'Closing Soon';
    badgeVariant = 'amber';
  } else {
    status = 'OPEN';
    statusLabel = 'Open';
    badgeVariant = 'indigo';
  }

  const formattedCountdown = `${days}d ${hours}h ${minutes}m remaining`;

  return {
    status,
    statusLabel,
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: diff,
    formattedCountdown,
    badgeVariant,
  };
};

export const calculateWindowProgress = (startDateIso?: string, deadlineIso?: string): number => {
  if (!startDateIso || !deadlineIso) return 0;
  const start = new Date(startDateIso).getTime();
  const end = new Date(deadlineIso).getTime();
  const now = new Date().getTime();

  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  if (now >= end) return 100;
  if (now <= start) return 0;

  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};