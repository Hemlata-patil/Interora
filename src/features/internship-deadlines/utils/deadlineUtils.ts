import type { DeadlineStatus, InternshipDeadlineRecord } from '../types/deadline';

export interface CalculatedCountdown {
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

export const calculateDeadlineCountdown = (
  registrationStartIso: string,
  registrationDeadlineIso: string,
  isApplied: boolean = false
): CalculatedCountdown => {
  const now = new Date().getTime();
  const startTime = new Date(registrationStartIso).getTime();
  const deadlineTime = new Date(registrationDeadlineIso).getTime();

  // 1. Check if student already applied
  if (isApplied) {
    return {
      status: 'APPLIED',
      statusLabel: 'Application Submitted',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: Math.max(0, deadlineTime - now),
      formattedCountdown: 'Submitted âœ“',
      badgeVariant: 'emerald',
    };
  }

  // 2. Check if before registration start
  if (now < startTime) {
    return {
      status: 'UPCOMING',
      statusLabel: 'Opening Soon',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: startTime - now,
      formattedCountdown: 'Registration Opens Soon',
      badgeVariant: 'indigo',
    };
  }

  // 3. Check if deadline passed
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

  if (totalHours <= 72) {
    status = 'CLOSING_SOON';
    statusLabel = totalHours <= 24 ? 'Closing Today' : `Closing in ${days} days`;
    badgeVariant = totalHours <= 24 ? 'rose' : 'amber';
  } else {
    status = 'OPEN';
    statusLabel = `Open (${days}d left)`;
    badgeVariant = 'emerald';
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formattedCountdown = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

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