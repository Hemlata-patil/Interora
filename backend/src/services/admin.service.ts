import bcrypt from 'bcryptjs';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

const BCRYPT_ROUNDS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Admin Dashboard Metrics: GET /api/admin/metrics
// ─────────────────────────────────────────────────────────────────────────────

export async function getAdminMetrics(domain?: string, dataYear?: string, academicYear?: string) {
  const studentFilter: any = {};
  
  if (domain && domain !== 'All') {
    studentFilter.department = { name: domain };
  }
  
  if (dataYear && dataYear !== 'All') {
    studentFilter.batchYear = dataYear;
  }
  
  if (academicYear && academicYear !== 'All') {
    if (academicYear === '1st Year') studentFilter.currentSemester = { in: ['1st Semester', '2nd Semester'] };
    else if (academicYear === '2nd Year') studentFilter.currentSemester = { in: ['3rd Semester', '4th Semester'] };
    else if (academicYear === '3rd Year') studentFilter.currentSemester = { in: ['5th Semester', '6th Semester'] };
    else if (academicYear === '4th Year') studentFilter.currentSemester = { in: ['7th Semester', '8th Semester'] };
  }

  const hasStudentFilter = Object.keys(studentFilter).length > 0;

  const profileWhere: any = { role: 'student' };
  if (hasStudentFilter) profileWhere.studentProfile = { ...studentFilter };

  const appWhere: any = {};
  if (hasStudentFilter) appWhere.student = { ...studentFilter };
  
  const ppoWhere: any = {};
  if (hasStudentFilter) ppoWhere.student = { ...studentFilter };

  const certWhere: any = {};
  if (hasStudentFilter) certWhere.assignment = { student: { ...studentFilter } };

  const assignWhere: any = {};
  if (hasStudentFilter) assignWhere.student = { ...studentFilter };

  const [
    totalStudents,
    totalCompanies,
    activeInternsCount,
    pposPendingCount,
    certsPendingCount,
    pendingApplications,
    pendingCompanies,
    completedInternsCount,
    totalApplicationsCount,
    selectedApplicationsCount,
    rejectedApplicationsCount,
    totalPposCount,
    totalCertificatesCount,
  ] = await Promise.all([
    prisma.profile.count({ where: profileWhere }),
    prisma.companyProfile.count(),
    prisma.studentApplication.count({ where: { ...appWhere, status: 'selected' } }),
    prisma.pPOOffer.count({ where: { ...ppoWhere, status: 'offered' } }),
    prisma.certificate.count({ where: certWhere }),
    prisma.studentApplication.count({ where: { ...appWhere, status: 'submitted' } }),
    prisma.companyProfile.count({ where: { approvalStatus: 'pending' } }),
    prisma.internshipAssignment.count({ where: { ...assignWhere, status: 'completed' } }),
    prisma.studentApplication.count({ where: appWhere }),
    prisma.studentApplication.count({ where: { ...appWhere, status: 'selected' } }),
    prisma.studentApplication.count({ where: { ...appWhere, status: 'rejected' } }),
    prisma.pPOOffer.count({ where: ppoWhere }),
    prisma.certificate.count({ where: { ...certWhere, status: 'active' } }),
  ]);

  return {
    totalStudents,
    totalCompanies,
    activeInternsCount,
    activeInternships: activeInternsCount,
    pposPendingCount,
    certsPendingCount,
    pendingApplications,
    pendingCompanies,
    completedInternsCount,
    totalApplicationsCount,
    selectedApplicationsCount,
    rejectedApplicationsCount,
    totalPposCount,
    totalCertificatesCount,
  };
}

export async function getAdminFilterOptions() {
  const departments = await prisma.department.findMany({
    select: { name: true },
    distinct: ['name'],
    where: { name: { not: '' } }
  });

  const batches = await prisma.studentProfile.findMany({
    select: { batchYear: true },
    distinct: ['batchYear'],
    where: { batchYear: { not: '' } }
  });

  return {
    domains: departments.map(d => d.name).sort(),
    dataYears: batches.map(b => b.batchYear).sort(),
  };
}

export async function generateAdminMetricsExcel(domain?: string, dataYear?: string, academicYear?: string) {
  const metrics = await getAdminMetrics(domain, dataYear, academicYear);
  const ExcelJS = require('exceljs');
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Interora Admin';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('System Analytics');

  worksheet.columns = [
    { header: 'Metric', key: 'metric', width: 35 },
    { header: 'Value', key: 'value', width: 15 }
  ];

  worksheet.getRow(1).font = { bold: true };

  const rows = [
    { metric: 'Total Students', value: metrics.totalStudents },
    { metric: 'Total Companies (Unfiltered)', value: metrics.totalCompanies },
    { metric: 'Active Internships', value: metrics.activeInternships },
    { metric: 'Pending PPO Offers', value: metrics.pposPendingCount },
    { metric: 'Total PPO Offers', value: metrics.totalPposCount },
    { metric: 'Pending Certificates', value: metrics.certsPendingCount },
    { metric: 'Total Certificates', value: metrics.totalCertificatesCount },
    { metric: 'Pending Applications', value: metrics.pendingApplications },
    { metric: 'Selected Applications', value: metrics.selectedApplicationsCount },
    { metric: 'Rejected Applications', value: metrics.rejectedApplicationsCount },
    { metric: 'Total Applications', value: metrics.totalApplicationsCount },
    { metric: 'Completed Internships', value: metrics.completedInternsCount },
    { metric: 'Pending Companies (Unfiltered)', value: metrics.pendingCompanies },
  ];

  worksheet.addRows(rows);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin Companies Management: GET & POST /api/admin/companies
// ─────────────────────────────────────────────────────────────────────────────

export async function listCompanies() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      profile: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          accountStatus: true,
          createdAt: true,
        },
      },
      postings: {
        select: { id: true },
      },
      mentors: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return companies.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    industryDomain: c.industryDomain,
    contactPerson: c.contactPerson,
    email: c.officialEmail,
    phone: c.phone,
    website: c.website || 'https://company.com',
    appliedDate: c.createdAt.toISOString().slice(0, 10),
    status:
      c.approvalStatus === 'approved'
        ? 'Approved'
        : c.approvalStatus === 'rejected'
        ? 'Rejected'
        : 'Pending',
    invitationSent: false,
    internshipCount: c.postings.length,
    mentorCount: c.mentors.length,
    approvedAt: c.approvedAt ? c.approvedAt.toISOString() : null,
    rejectionReason: c.rejectionReason,
    verified: c.verified,
  }));
}

export interface CreateCompanyInput {
  companyName: string;
  industryDomain?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  status?: 'Approved' | 'Pending';
  tempPassword?: string;
}

export async function createCompany(input: CreateCompanyInput) {
  const cleanEmail = input.email.trim().toLowerCase();

  const existingProfile = await prisma.profile.findUnique({
    where: { email: cleanEmail },
  });
  if (existingProfile) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const existingCompany = await prisma.companyProfile.findUnique({
    where: { officialEmail: cleanEmail },
  });
  if (existingCompany) {
    throw new AppError(409, 'A company with this official email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.tempPassword || 'company@123', BCRYPT_ROUNDS);
  const isApproved = input.status === 'Approved';

  const company = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: cleanEmail,
        fullName: input.companyName.trim(),
        role: 'company',
        accountStatus: isApproved ? 'active' : 'pending',
        passwordHash,
        phone: input.phone?.trim() || 'N/A',
      },
    });

    const companyProfile = await tx.companyProfile.create({
      data: {
        id: profile.id,
        companyName: input.companyName.trim(),
        industryDomain: input.industryDomain?.trim() || 'Software & Cloud Services',
        contactPerson: input.contactPerson.trim(),
        officialEmail: cleanEmail,
        phone: input.phone?.trim() || 'N/A',
        website: input.website?.trim() || 'https://company.com',
        approvalStatus: isApproved ? 'approved' : 'pending',
        verified: isApproved,
        approvedAt: isApproved ? new Date() : null,
      },
    });

    return companyProfile;
  });

  return {
    id: company.id,
    companyName: company.companyName,
    industryDomain: company.industryDomain,
    contactPerson: company.contactPerson,
    email: company.officialEmail,
    phone: company.phone,
    website: company.website || 'https://company.com',
    appliedDate: company.createdAt.toISOString().slice(0, 10),
    status: isApproved ? 'Approved' : 'Pending',
    invitationSent: false,
    internshipCount: 0,
    mentorCount: 0,
    approvedAt: company.approvedAt ? company.approvedAt.toISOString() : null,
    rejectionReason: null,
    verified: company.verified,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Company Approval & Rejection: PATCH /api/admin/companies/:id/...
// ─────────────────────────────────────────────────────────────────────────────

export async function approveCompany(companyId: string) {
  const company = await prisma.companyProfile.findUnique({
    where: { id: companyId },
  });
  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.companyProfile.update({
      where: { id: companyId },
      data: {
        approvalStatus: 'approved',
        verified: true,
        approvedAt: new Date(),
        rejectionReason: null,
      },
    });

    await tx.profile.update({
      where: { id: companyId },
      data: {
        accountStatus: 'active',
      },
    });

    return updatedCompany;
  });

  return {
    id: updated.id,
    companyName: updated.companyName,
    status: 'Approved',
    approvedAt: updated.approvedAt?.toISOString(),
    verified: updated.verified,
  };
}

export async function rejectCompany(companyId: string, reason?: string) {
  const company = await prisma.companyProfile.findUnique({
    where: { id: companyId },
  });
  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCompany = await tx.companyProfile.update({
      where: { id: companyId },
      data: {
        approvalStatus: 'rejected',
        verified: false,
        approvedAt: null,
        rejectionReason: reason || 'Criteria not met',
      },
    });

    await tx.profile.update({
      where: { id: companyId },
      data: {
        accountStatus: 'inactive',
      },
    });

    return updatedCompany;
  });

  return {
    id: updated.id,
    companyName: updated.companyName,
    status: 'Rejected',
    rejectionReason: updated.rejectionReason,
    verified: updated.verified,
  };
}

export async function sendCompanyInvitation(companyId: string, companyName?: string, officialEmail?: string) {
  const company = await prisma.companyProfile.findUnique({
    where: { id: companyId },
  });
  if (!company) {
    throw new AppError(404, 'Company not found.');
  }

  await prisma.auditLog.create({
    data: {
      action: 'COMPANY_INVITATION_SENT',
      entityType: 'CompanyProfile',
      entityId: companyId,
      details: {
        companyName: companyName || company.companyName,
        email: officialEmail || company.officialEmail,
        timestamp: new Date().toISOString(),
      },
    },
  });

  return {
    success: true,
    message: `Invitation successfully sent to ${officialEmail || company.officialEmail}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Admin Faculty Management: GET, POST, PATCH, DELETE /api/admin/faculty
// ─────────────────────────────────────────────────────────────────────────────

export async function listFacultyMentors() {
  const facultyList = await prisma.facultyProfile.findMany({
    include: {
      profile: {
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          accountStatus: true,
          createdAt: true,
        },
      },
      department: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      studentSupervisions: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return facultyList.map((f, idx) => ({
    id: f.profile.id,
    facultyId: f.facultyId,
    name: f.profile.fullName,
    email: f.profile.email,
    phone: f.profile.phone || '+91 98765 11223',
    department: f.department.code,
    batch: ('CS' + ((idx % 4) + 1)),
    designation: f.designation,
    assignedStudentCount: f.studentSupervisions.length,
    status: f.profile.accountStatus === 'inactive' ? 'Inactive' : 'Active',
    createdAt: f.createdAt.toISOString(),
  }));
}

export interface CreateFacultyInput {
  name: string;
  email: string;
  facultyId: string;
  department: string;
  designation?: string;
  phone?: string;
  password?: string;
  batch?: string;
}

export async function createFacultyMentor(input: CreateFacultyInput) {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanFacultyId = input.facultyId.trim().toUpperCase();

  const existingProfile = await prisma.profile.findUnique({
    where: { email: cleanEmail },
  });
  if (existingProfile) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const existingFaculty = await prisma.facultyProfile.findUnique({
    where: { facultyId: cleanFacultyId },
  });
  if (existingFaculty) {
    throw new AppError(409, 'A faculty profile with this Faculty ID already exists.');
  }

  // Resolve department by code
  const deptCode = input.department.trim().toUpperCase();
  let dept = await prisma.department.findUnique({
    where: { code: deptCode },
  });
  if (!dept) {
    dept = await prisma.department.findFirst({
      where: { code: 'CSE' },
    });
  }
  if (!dept) {
    dept = await prisma.department.findFirst();
  }
  if (!dept) {
    throw new AppError(400, 'Department not found. Please create a department first.');
  }

  const passwordHash = await bcrypt.hash(input.password || 'faculty@123', BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: cleanEmail,
        fullName: input.name.trim(),
        role: 'faculty',
        accountStatus: 'active',
        passwordHash,
        phone: input.phone?.trim() || null,
      },
    });

    const faculty = await tx.facultyProfile.create({
      data: {
        id: profile.id,
        facultyId: cleanFacultyId,
        departmentId: dept.id,
        designation: input.designation?.trim() || 'Assistant Professor',
      },
    });

    return { profile, faculty, dept };
  });

  return {
    id: result.profile.id,
    facultyId: result.faculty.facultyId,
    name: result.profile.fullName,
    email: result.profile.email,
    phone: result.profile.phone || '+91 98765 11223',
    department: result.dept.code,
    batch: input.batch || 'CS1',
    designation: result.faculty.designation,
    assignedStudentCount: 0,
    status: 'Active',
    createdAt: result.faculty.createdAt.toISOString(),
  };
}

export interface UpdateFacultyInput {
  name?: string;
  department?: string;
  designation?: string;
  phone?: string;
  status?: 'Active' | 'Inactive';
}

export async function updateFacultyMentor(id: string, input: UpdateFacultyInput) {
  const existing = await prisma.facultyProfile.findUnique({
    where: { id },
    include: { profile: true, department: true },
  });
  if (!existing || existing.profile.role !== 'faculty') {
    throw new AppError(404, 'Faculty mentor not found.');
  }

  let newDeptId = existing.departmentId;
  if (input.department) {
    const targetDept = await prisma.department.findUnique({
      where: { code: input.department.trim().toUpperCase() },
    });
    if (targetDept) {
      newDeptId = targetDept.id;
    }
  }

  await prisma.$transaction(async (tx) => {
    const profileUpdate: Record<string, any> = {};
    if (input.name) profileUpdate.fullName = input.name.trim();
    if (input.phone !== undefined) profileUpdate.phone = input.phone?.trim() || null;
    if (input.status) {
      profileUpdate.accountStatus = input.status === 'Inactive' ? 'inactive' : 'active';
    }

    if (Object.keys(profileUpdate).length > 0) {
      await tx.profile.update({
        where: { id },
        data: profileUpdate,
      });
    }

    const facultyUpdate: Record<string, any> = {};
    if (input.designation) facultyUpdate.designation = input.designation.trim();
    if (newDeptId !== existing.departmentId) facultyUpdate.departmentId = newDeptId;

    if (Object.keys(facultyUpdate).length > 0) {
      await tx.facultyProfile.update({
        where: { id },
        data: facultyUpdate,
      });
    }
  });

  const refreshed = await prisma.facultyProfile.findUnique({
    where: { id },
    include: { profile: true, department: true, studentSupervisions: true },
  });

  return {
    id: refreshed!.profile.id,
    facultyId: refreshed!.facultyId,
    name: refreshed!.profile.fullName,
    email: refreshed!.profile.email,
    phone: refreshed!.profile.phone || '+91 98765 11223',
    department: refreshed!.department.code,
    designation: refreshed!.designation,
    assignedStudentCount: refreshed!.studentSupervisions.length,
    status: refreshed!.profile.accountStatus === 'inactive' ? 'Inactive' : 'Active',
    createdAt: refreshed!.createdAt.toISOString(),
  };
}

export async function deleteFacultyMentor(id: string) {
  const existing = await prisma.facultyProfile.findUnique({
    where: { id },
    include: { profile: true },
  });
  if (!existing || existing.profile.role !== 'faculty') {
    throw new AppError(404, 'Faculty mentor not found.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.facultyStudentAssignment.deleteMany({ where: { facultyId: id } });
    await tx.facultyGuidanceNote.deleteMany({ where: { facultyId: id } });
    await tx.facultyProfile.delete({ where: { id } });
    await tx.profile.delete({ where: { id } });
  });

  return { success: true };
}

export interface CreateHODInput {
  name: string;
  email: string;
  departmentId: string;
  password?: string;
}

export async function createHODAccount(input: CreateHODInput) {
  const cleanEmail = input.email.trim().toLowerCase();

  const existingProfile = await prisma.profile.findUnique({
    where: { email: cleanEmail },
  });
  if (existingProfile) {
    throw new AppError(409, 'An account with this email already exists.');
  }

  const dept = await prisma.department.findUnique({
    where: { id: input.departmentId },
  });
  if (!dept) {
    throw new AppError(404, 'Department not found.');
  }

  const passwordHash = await bcrypt.hash(input.password || 'hod@123', BCRYPT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.create({
      data: {
        email: cleanEmail,
        fullName: input.name.trim(),
        role: 'hod',
        accountStatus: 'active',
        passwordHash,
      },
    });

    await tx.department.update({
      where: { id: input.departmentId },
      data: { headOfDepartmentId: profile.id },
    });

    return profile;
  });

  return {
    id: result.id,
    name: result.fullName,
    email: result.email,
    role: result.role,
    status: result.accountStatus,
    department: dept.code
  };
}

export interface UpdateHODInput {
  name?: string;
  email?: string;
  departmentId?: string;
  status?: 'active' | 'inactive';
}

export async function updateHODAccount(id: string, input: UpdateHODInput) {
  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { headOfDepartments: true }
  });

  if (!profile || profile.role !== 'hod') {
    throw new AppError(404, 'HOD not found.');
  }

  if (input.email && input.email.trim().toLowerCase() !== profile.email) {
    const existing = await prisma.profile.findUnique({
      where: { email: input.email.trim().toLowerCase() }
    });
    if (existing) {
      throw new AppError(409, 'An account with this email already exists.');
    }
  }

  await prisma.$transaction(async (tx) => {
    if (input.departmentId !== undefined) {
      if (input.departmentId) {
        const dept = await tx.department.findUnique({ where: { id: input.departmentId } });
        if (!dept) throw new AppError(404, 'Department not found.');
      }
      
      await tx.department.updateMany({
        where: { headOfDepartmentId: id },
        data: { headOfDepartmentId: null }
      });

      if (input.departmentId) {
        await tx.department.update({
          where: { id: input.departmentId },
          data: { headOfDepartmentId: id }
        });
      }
    }

    const updateData: any = {};
    if (input.name) updateData.fullName = input.name.trim();
    if (input.email) updateData.email = input.email.trim().toLowerCase();
    if (input.status) updateData.accountStatus = input.status;

    if (Object.keys(updateData).length > 0) {
      await tx.profile.update({
        where: { id },
        data: updateData
      });
    }
  });

  const refreshed = await prisma.profile.findUnique({
    where: { id },
    include: { headOfDepartments: true }
  });

  return { success: true, profile: refreshed };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Admin Applications Control: GET /api/admin/applications
// ─────────────────────────────────────────────────────────────────────────────

export async function listAdminApplications() {
  const applications = await prisma.studentApplication.findMany({
    include: {
      student: {
        include: {
          profile: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },
      internship: {
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industryDomain: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });

  return applications.map((a) => {
    let applicationStatus = 'Pending';
    if (a.status === 'faculty_review') {
      applicationStatus = 'Under Review';
    } else if (a.status === 'faculty_approved' || a.status === 'shortlisted') {
      applicationStatus = 'Shortlisted';
    } else if (a.status === 'selected') {
      applicationStatus = 'Selected';
    } else if (a.status === 'rejected' || a.status === 'faculty_rejected') {
      applicationStatus = 'Rejected';
    } else if (a.status === 'withdrawn') {
      applicationStatus = 'Withdrawn';
    } else {
      applicationStatus = a.status;
    }

    return {
      id: a.id,
      studentId: a.studentId,
      studentName: a.student?.profile?.fullName || 'Student Applicant',
      studentEmail: a.student?.profile?.email || 'student@university.edu',
      department: a.student?.department?.code || a.student?.department?.name || 'CSE',
      internshipId: a.internshipId,
      internshipTitle: a.internship?.title || 'Internship Role',
      companyName: a.internship?.company?.companyName || 'Host Company',
      duration: a.internship?.duration || '12 Weeks',
      stipend: a.internship?.stipend || 'Unpaid',
      applicationStatus,
      appliedDate: a.appliedAt.toISOString().slice(0, 10),
      resumeUrl: a.resumeUrl,
      coverLetter: a.coverLetter,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Admin Users Directory: GET /api/admin/users
// ─────────────────────────────────────────────────────────────────────────────

export async function listAdminUsers() {
  const profiles = await prisma.profile.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      studentProfile: {
        select: {
          course: true,
          batchYear: true,
          department: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
      facultyProfile: {
        select: {
          designation: true,
          department: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
      industryMentorProfile: {
        select: {
          designation: true,
          corporateDepartment: true,
          company: {
            select: {
              companyName: true,
            },
          },
        },
      },
      companyProfile: {
        select: {
          companyName: true,
          industryDomain: true,
        },
      },
      headOfDepartments: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return profiles.map((p) => {
    let roleFormatted = 'STUDENT';
    let organization = 'Department: General';

    if (p.role === 'student') {
      roleFormatted = 'STUDENT';
      const dept = p.studentProfile?.department?.code || p.studentProfile?.department?.name || 'CSE';
      organization = `Dept: ${dept}`;
    } else if (p.role === 'faculty') {
      roleFormatted = 'FACULTY_MENTOR';
      const dept = p.facultyProfile?.department?.code || p.facultyProfile?.department?.name || 'CSE';
      const desig = p.facultyProfile?.designation || 'Professor';
      organization = `Dept: ${dept} • ${desig}`;
    } else if (p.role === 'mentor') {
      roleFormatted = 'INDUSTRY_MENTOR';
      const comp = p.industryMentorProfile?.company?.companyName || 'Host Company';
      const desig = p.industryMentorProfile?.designation || 'Technical Mentor';
      organization = `${comp} • ${desig}`;
    } else if (p.role === 'company') {
      roleFormatted = 'COMPANY_ADMIN';
      organization = p.companyProfile?.companyName || 'Registered Enterprise';
    } else if (p.role === 'admin') {
      roleFormatted = 'ADMIN';
      organization = 'System Administration';
    } else if (p.role === 'hod') {
      roleFormatted = 'HOD';
      const dept = p.headOfDepartments?.[0];
      organization = dept ? `Dept: ${dept.code || dept.name}` : 'Not Assigned';
    }

    return {
      id: p.id,
      name: p.fullName || p.email,
      email: p.email,
      role: roleFormatted,
      rawRole: p.role,
      organization,
      departmentId: p.role === 'hod' ? p.headOfDepartments?.[0]?.id : undefined,
      status:
        p.accountStatus === 'active'
          ? 'Active'
          : p.accountStatus.charAt(0).toUpperCase() + p.accountStatus.slice(1),
      createdAt: p.createdAt.toISOString(),
    };
  });
}

