import type { StudentProfileDomain } from '@/features/student/types/student';
import { mockStudentProfiles } from '@/features/student/data/mockStudentProfiles';
import { initialMockInternships, type Internship } from '@/features/internships/data/mockInternships';
import { mockApplications, type ApplicationRecord } from '@/features/applications/data/mockApplications';
import { mockAttendanceHistory, calculateAttendanceMetrics, type AttendanceRecord } from '@/features/attendance/data/mockAttendance';
import { initialMockTasks } from '@/features/tasks/data/mockTasks';
import { initialMockMilestones, type MilestoneRecord } from '@/features/milestones/data/mockMilestones';
import { calculateCertificateData, type CertificateRecord } from '@/features/certificates/data/mockCertificates';

class MockStudentServiceAdapter {
  private activeStudentIndex: number = 0;

  // Student Profile Domain
  async getStudentProfile(): Promise<StudentProfileDomain> {
    await new Promise((r) => setTimeout(r, 100));
    const p = mockStudentProfiles[this.activeStudentIndex] || mockStudentProfiles[0];
    return {
      id: p.id,
      fullName: p.name,
      email: p.email,
      mobile: '+91 98765 43210',
      profileCompletionPercentage: 100,
      education: {
        institution: 'GHR Institute of Technology & Engineering',
        degree: 'Bachelor of Technology (B.Tech)',
        fieldOfStudy: 'Computer Science & Engineering',
        graduationYear: '2027',
        cgpa: '8.85',
      },
      skills: ['React.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'SQL', 'Git'],
      careerGoals: ['Full Stack Web Developer', 'Frontend Architect'],
      resumeUrl: '/resumes/Alex_Johnson_Resume.pdf',
      resumeFileName: 'Alex_Johnson_Resume_2026.pdf',
      linkedinUrl: 'https://linkedin.com/in/alex-johnson-dev',
      githubUrl: 'https://github.com/alexjohnson-dev',
      portfolioUrl: 'https://alexjohnson.dev',
      lifecycleStatus: p.status,
      facultyMentorId: 'faculty_mentor_01',
      facultyMentorName: 'Dr. Rajesh Sharma',
      activeInternships: p.activeInternships,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-17T12:00:00Z',
    };
  }

  // Switch Student Profile for QA testing
  async switchStudentProfile(index: number): Promise<StudentProfileDomain> {
    if (index >= 0 && index < mockStudentProfiles.length) {
      this.activeStudentIndex = index;
    }
    return this.getStudentProfile();
  }

  // Internship Discovery
  async getDiscoverableInternships(): Promise<Internship[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...initialMockInternships];
  }

  // Applications
  async getStudentApplications(): Promise<ApplicationRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...mockApplications];
  }

  // Attendance
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...mockAttendanceHistory];
  }

  // Productivity & Tasks
  async getTasks() {
    await new Promise((r) => setTimeout(r, 100));
    return [...initialMockTasks];
  }

  // Milestones & Evaluations
  async getMilestones(): Promise<MilestoneRecord[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...initialMockMilestones];
  }

  // Certificates
  async getCertificateData(): Promise<CertificateRecord | null> {
    await new Promise((r) => setTimeout(r, 100));
    return calculateCertificateData();
  }
}

export const studentService = new MockStudentServiceAdapter();