import type { StudentInternshipStatus } from '../types/studentJourneyTypes';

export interface StudentFeaturePermissions {
  canDiscoverInternships: boolean;
  canApplyInternships: boolean;
  canAccessFacultyChat: boolean;
  canAccessIndustryChat: boolean;
  canAccessInternshipJourney: boolean;
  canAccessAttendance: boolean;
  canAccessProductivity: boolean;
  canAccessMilestones: boolean;
  canAccessCertificates: boolean;
  canAccessCareerPrep: boolean;
  canAccessProfile: boolean;
  isAttendanceActive: boolean;
  isProductivityActive: boolean;
}

export const getStudentFeatureAvailability = (status: StudentInternshipStatus): StudentFeaturePermissions => {
  switch (status) {
    case 'NOT_INTERN':
      return {
        canDiscoverInternships: true,
        canApplyInternships: true,
        canAccessFacultyChat: true,
        canAccessIndustryChat: false,
        canAccessInternshipJourney: false,
        canAccessAttendance: false,
        canAccessProductivity: false,
        canAccessMilestones: false,
        canAccessCertificates: false,
        canAccessCareerPrep: true,
        canAccessProfile: true,
        isAttendanceActive: false,
        isProductivityActive: false,
      };

    case 'APPLICATION_PENDING':
      return {
        canDiscoverInternships: true,
        canApplyInternships: true,
        canAccessFacultyChat: true,
        canAccessIndustryChat: false,
        canAccessInternshipJourney: false,
        canAccessAttendance: false,
        canAccessProductivity: false,
        canAccessMilestones: false,
        canAccessCertificates: false,
        canAccessCareerPrep: true,
        canAccessProfile: true,
        isAttendanceActive: false,
        isProductivityActive: false,
      };

    case 'SELECTED':
      return {
        canDiscoverInternships: true,
        canApplyInternships: true,
        canAccessFacultyChat: true,
        canAccessIndustryChat: true,
        canAccessInternshipJourney: true,
        canAccessAttendance: false, // Start date not reached
        canAccessProductivity: false,
        canAccessMilestones: true,
        canAccessCertificates: false,
        canAccessCareerPrep: true,
        canAccessProfile: true,
        isAttendanceActive: false,
        isProductivityActive: false,
      };

    case 'ACTIVE':
    case 'COMPLETED':
      return {
        canDiscoverInternships: true,
        canApplyInternships: true,
        canAccessFacultyChat: true,
        canAccessIndustryChat: true,
        canAccessInternshipJourney: true,
        canAccessAttendance: true,
        canAccessProductivity: true,
        canAccessMilestones: true,
        canAccessCertificates: true,
        canAccessCareerPrep: true,
        canAccessProfile: true,
        isAttendanceActive: true,
        isProductivityActive: true,
      };

    default:
      return {
        canDiscoverInternships: true,
        canApplyInternships: true,
        canAccessFacultyChat: true,
        canAccessIndustryChat: false,
        canAccessInternshipJourney: false,
        canAccessAttendance: false,
        canAccessProductivity: false,
        canAccessMilestones: false,
        canAccessCertificates: false,
        canAccessCareerPrep: true,
        canAccessProfile: true,
        isAttendanceActive: false,
        isProductivityActive: false,
      };
  }
};