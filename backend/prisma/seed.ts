/**
 * Interora — Development & Demo Database Seed Script
 *
 * Idempotent seed script to populate baseline departments and demo accounts
 * for the PostgreSQL + Express + Prisma architecture.
 *
 * Safe to execute multiple times against Neon PostgreSQL without duplicating rows.
 */

import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient, AppRole, AccountStatus, CompanyStatus, Prisma } from '@prisma/client';

// Ensure environment variables are loaded from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const DEMO_PASSWORD = 'Interora@123';

interface SeedSummary {
  departmentsCreated: number;
  departmentsUpdated: number;
  profilesCreated: number;
  profilesUpdated: number;
}

export async function main(): Promise<SeedSummary> {
  console.log('[Seed] Starting Interora database seed...');

  const summary: SeedSummary = {
    departmentsCreated: 0,
    departmentsUpdated: 0,
    profilesCreated: 0,
    profilesUpdated: 0,
  };

  // 1. Hash the demo password with bcryptjs (12 rounds)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  console.log('[Seed] Password hash generated with bcrypt (12 rounds).');

  // 2. Baseline Departments (CSE, IT, ECE)
  const departmentsData = [
    { code: 'CSE', name: 'Computer Science & Engineering', program: 'B.Tech' },
    { code: 'IT', name: 'Information Technology', program: 'B.Tech' },
    { code: 'ECE', name: 'Electronics & Communication Engineering', program: 'B.Tech' },
  ];

  const departmentMap = new Map<string, { id: string; code: string; name: string }>();

  for (const dept of departmentsData) {
    const existing = await prisma.department.findUnique({
      where: { code: dept.code },
    });

    const record = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        program: dept.program,
      },
      create: {
        code: dept.code,
        name: dept.name,
        program: dept.program,
      },
      select: { id: true, code: true, name: true },
    });

    if (existing) {
      summary.departmentsUpdated++;
      console.log(`[Seed] Department ${dept.code} updated / confirmed.`);
    } else {
      summary.departmentsCreated++;
      console.log(`[Seed] Department ${dept.code} created.`);
    }

    departmentMap.set(dept.code, record);
  }

  const cseDept = departmentMap.get('CSE');
  if (!cseDept) {
    throw new Error('[Seed] Failed to resolve CSE department record.');
  }

  // 3. Demo Admin Account
  const adminEmail = 'admin.demo@interora.local';
  const existingAdmin = await prisma.profile.findUnique({ where: { email: adminEmail } });
  await prisma.profile.upsert({
    where: { email: adminEmail },
    update: {
      fullName: 'Interora Demo Admin',
      role: AppRole.admin,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
    create: {
      email: adminEmail,
      fullName: 'Interora Demo Admin',
      role: AppRole.admin,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
  });
  if (existingAdmin) {
    summary.profilesUpdated++;
    console.log(`[Seed] Admin profile ${adminEmail} updated / confirmed.`);
  } else {
    summary.profilesCreated++;
    console.log(`[Seed] Admin profile ${adminEmail} created.`);
  }

  // 4. Demo Student Account + StudentProfile
  const studentEmail = 'student.demo@interora.local';
  const existingStudent = await prisma.profile.findUnique({ where: { email: studentEmail } });
  const studentProfile = await prisma.profile.upsert({
    where: { email: studentEmail },
    update: {
      fullName: 'Interora Demo Student',
      role: AppRole.student,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
    create: {
      email: studentEmail,
      fullName: 'Interora Demo Student',
      role: AppRole.student,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
  });
  if (existingStudent) {
    summary.profilesUpdated++;
    console.log(`[Seed] Student profile ${studentEmail} updated / confirmed.`);
  } else {
    summary.profilesCreated++;
    console.log(`[Seed] Student profile ${studentEmail} created.`);
  }

  await prisma.studentProfile.upsert({
    where: { id: studentProfile.id },
    update: {
      studentId: 'DEMO-STU-001',
      departmentId: cseDept.id,
      course: 'B.Tech Computer Science',
      batchYear: '2026',
      batchDivision: 'CS1',
      currentSemester: '6th Semester',
      cgpa: new Prisma.Decimal('8.50'),
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    },
    create: {
      id: studentProfile.id,
      studentId: 'DEMO-STU-001',
      departmentId: cseDept.id,
      course: 'B.Tech Computer Science',
      batchYear: '2026',
      batchDivision: 'CS1',
      currentSemester: '6th Semester',
      cgpa: new Prisma.Decimal('8.50'),
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    },
  });
  console.log('[Seed] Student sub-profile (DEMO-STU-001) linked to CSE.');

  // 5. Demo Faculty Account + FacultyProfile
  const facultyEmail = 'faculty.demo@interora.local';
  const existingFaculty = await prisma.profile.findUnique({ where: { email: facultyEmail } });
  const facultyProfile = await prisma.profile.upsert({
    where: { email: facultyEmail },
    update: {
      fullName: 'Interora Demo Faculty',
      role: AppRole.faculty,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
    create: {
      email: facultyEmail,
      fullName: 'Interora Demo Faculty',
      role: AppRole.faculty,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
  });
  if (existingFaculty) {
    summary.profilesUpdated++;
    console.log(`[Seed] Faculty profile ${facultyEmail} updated / confirmed.`);
  } else {
    summary.profilesCreated++;
    console.log(`[Seed] Faculty profile ${facultyEmail} created.`);
  }

  await prisma.facultyProfile.upsert({
    where: { id: facultyProfile.id },
    update: {
      facultyId: 'DEMO-FAC-001',
      departmentId: cseDept.id,
      designation: 'Associate Professor',
      cabinLocation: 'Block A - 302',
      officePhone: '+91 80 1234 5678',
    },
    create: {
      id: facultyProfile.id,
      facultyId: 'DEMO-FAC-001',
      departmentId: cseDept.id,
      designation: 'Associate Professor',
      cabinLocation: 'Block A - 302',
      officePhone: '+91 80 1234 5678',
    },
  });
  console.log('[Seed] Faculty sub-profile (DEMO-FAC-001) linked to CSE.');

  // 6. Demo Company Account + CompanyProfile
  const companyEmail = 'company.demo@interora.local';
  const existingCompany = await prisma.profile.findUnique({ where: { email: companyEmail } });
  const companyUser = await prisma.profile.upsert({
    where: { email: companyEmail },
    update: {
      fullName: 'Interora Demo Company',
      role: AppRole.company,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
    create: {
      email: companyEmail,
      fullName: 'Interora Demo Company',
      role: AppRole.company,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
  });
  if (existingCompany) {
    summary.profilesUpdated++;
    console.log(`[Seed] Company profile ${companyEmail} updated / confirmed.`);
  } else {
    summary.profilesCreated++;
    console.log(`[Seed] Company profile ${companyEmail} created.`);
  }

  const companyProfileRecord = await prisma.companyProfile.upsert({
    where: { id: companyUser.id },
    update: {
      companyName: 'Interora Technologies Demo Ltd',
      industryDomain: 'Software & Cloud Services',
      contactPerson: 'Interora Demo HR',
      officialEmail: companyEmail,
      phone: '+91 98765 43210',
      website: 'https://interora.demo',
      companyAddress: '100 Tech Park, Whitefield, Bengaluru, Karnataka 560066',
      geoLat: 12.9716,
      geoLng: 77.5946,
      geoFenceRadiusM: 500,
      approvalStatus: CompanyStatus.approved,
      verified: true,
      approvedAt: new Date('2026-01-15T00:00:00.000Z'),
      rejectionReason: null,
    },
    create: {
      id: companyUser.id,
      companyName: 'Interora Technologies Demo Ltd',
      industryDomain: 'Software & Cloud Services',
      contactPerson: 'Interora Demo HR',
      officialEmail: companyEmail,
      phone: '+91 98765 43210',
      website: 'https://interora.demo',
      companyAddress: '100 Tech Park, Whitefield, Bengaluru, Karnataka 560066',
      geoLat: 12.9716,
      geoLng: 77.5946,
      geoFenceRadiusM: 500,
      approvalStatus: CompanyStatus.approved,
      verified: true,
      approvedAt: new Date('2026-01-15T00:00:00.000Z'),
    },
  });
  console.log('[Seed] Company sub-profile (Interora Technologies Demo Ltd) approved and verified.');

  // 7. Demo Industry Mentor Account + IndustryMentorProfile
  const mentorEmail = 'mentor.demo@interora.local';
  const existingMentor = await prisma.profile.findUnique({ where: { email: mentorEmail } });
  const mentorUser = await prisma.profile.upsert({
    where: { email: mentorEmail },
    update: {
      fullName: 'Interora Demo Mentor',
      role: AppRole.mentor,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
    create: {
      email: mentorEmail,
      fullName: 'Interora Demo Mentor',
      role: AppRole.mentor,
      accountStatus: AccountStatus.active,
      passwordHash,
    },
  });
  if (existingMentor) {
    summary.profilesUpdated++;
    console.log(`[Seed] Mentor profile ${mentorEmail} updated / confirmed.`);
  } else {
    summary.profilesCreated++;
    console.log(`[Seed] Mentor profile ${mentorEmail} created.`);
  }

  await prisma.industryMentorProfile.upsert({
    where: { id: mentorUser.id },
    update: {
      companyId: companyProfileRecord.id,
      designation: 'Lead Software Architect',
      corporateDepartment: 'Engineering',
      expertiseAreas: ['Software Architecture', 'Cloud Services', 'TypeScript'],
    },
    create: {
      id: mentorUser.id,
      companyId: companyProfileRecord.id,
      designation: 'Lead Software Architect',
      corporateDepartment: 'Engineering',
      expertiseAreas: ['Software Architecture', 'Cloud Services', 'TypeScript'],
    },
  });
  console.log('[Seed] Industry mentor sub-profile linked to Interora Technologies Demo Ltd.');

  console.log('[Seed] Database seed completed successfully.');
  console.log(
    `[Seed Summary] Departments (Created: ${summary.departmentsCreated}, Updated/Confirmed: ${summary.departmentsUpdated}) | ` +
      `Profiles (Created: ${summary.profilesCreated}, Updated/Confirmed: ${summary.profilesUpdated})`
  );

  return summary;
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('[Seed Error] Database seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
