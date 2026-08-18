import type {
  InternshipDeadlineService,
  InternshipDeadlineRecord,
  InternshipDeadlineSummary,
} from '../types/deadline';
import { initialMockDeadlineRecords } from '../data/mockDeadlineData';
import { calculateDeadlineCountdown } from '../utils/deadlineUtils';

class MockInternshipDeadlineProvider implements InternshipDeadlineService {
  private records: InternshipDeadlineRecord[] = [...initialMockDeadlineRecords];

  async getInternshipDeadlines(): Promise<InternshipDeadlineRecord[]> {
    await new Promise((r) => setTimeout(r, 150));
    return [...this.records];
  }

  async getSummaryMetrics(): Promise<InternshipDeadlineSummary> {
    await new Promise((r) => setTimeout(r, 100));

    let totalOpen = 0;
    let closingSoon = 0;
    let appliedCount = 0;
    let expiredCount = 0;

    this.records.forEach((rec) => {
      if (rec.isApplied) {
        appliedCount++;
      }
      const countdown = calculateDeadlineCountdown(rec.registrationStart, rec.registrationDeadline, rec.isApplied);
      if (countdown.status === 'EXPIRED') {
        expiredCount++;
      } else if (countdown.status === 'CLOSING_SOON') {
        closingSoon++;
        totalOpen++;
      } else if (countdown.status === 'OPEN') {
        totalOpen++;
      }
    });

    return {
      totalOpen,
      closingSoon,
      appliedCount,
      expiredCount,
    };
  }

  async applyForInternship(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 300));
    const index = this.records.findIndex((r) => r.id === id);
    if (index !== -1) {
      this.records[index] = {
        ...this.records[index],
        isApplied: true,
        applicationStatus: 'Submitted',
      };
      return true;
    }
    return false;
  }
}

export const deadlineService: InternshipDeadlineService = new MockInternshipDeadlineProvider();