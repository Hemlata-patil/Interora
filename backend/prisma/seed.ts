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
import {
  PrismaClient,
  AppRole,
  AccountStatus,
  CompanyStatus,
  Prisma,
  WorkMode,
  InternshipType,
  PostingStatus,
  ApplicationStatus,
  AssignmentStatus,
  TaskStatus,
  PriorityLevel,
  EvaluationStatus,
  EvaluationType,
  MilestoneStatus,
  AttendanceStatus,
} from '@prisma/client';

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
      resumeUrl: '/uploads/resumes/demo_student_resume.pdf',
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
      resumeUrl: '/uploads/resumes/demo_student_resume.pdf',
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
  // 8. Demo Internship Posting, Application, and Active Assignment for Student
  let demoPosting = await prisma.internshipPosting.findFirst({
    where: { companyId: companyProfileRecord.id, title: 'Full Stack Software Engineering Intern' },
  });
  if (!demoPosting) {
    demoPosting = await prisma.internshipPosting.create({
      data: {
        companyId: companyProfileRecord.id,
        title: 'Full Stack Software Engineering Intern',
        description: 'Design and develop full-stack cloud applications using TypeScript, React, Node.js, and PostgreSQL.',
        industryDomain: 'Software Development',
        location: 'Bengaluru, India (Hybrid)',
        workMode: WorkMode.hybrid,
        internshipType: InternshipType.full_time,
        duration: '6 Months',
        stipend: 'INR 25,000 / Month',
        eligibility: 'B.Tech CSE / IT 6th Semester',
        vacancies: 2,
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs'],
        status: PostingStatus.open,
      },
    });
    console.log('[Seed] Demo internship posting created.');
  }

  let demoApplication = await prisma.studentApplication.findUnique({
    where: {
      internshipId_studentId: {
        internshipId: demoPosting.id,
        studentId: studentProfile.id,
      },
    },
  });
  if (!demoApplication) {
    demoApplication = await prisma.studentApplication.create({
      data: {
        internshipId: demoPosting.id,
        studentId: studentProfile.id,
        status: ApplicationStatus.selected,
        coverLetter: 'Passionate full-stack developer eager to contribute to cloud and enterprise solutions.',
        facultyRating: new Prisma.Decimal('4.8'),
        facultyFeedback: 'Strong academic record and solid project experience in modern web stacks.',
        companyRemarks: 'Exceptional performance in technical screening.',
      },
    });
    console.log('[Seed] Demo student application created.');
  }

  let demoAssignment = await prisma.internshipAssignment.findFirst({
    where: { studentId: studentProfile.id, companyId: companyProfileRecord.id },
  });
  const now = new Date();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const oneTwentyDaysLater = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

  if (!demoAssignment) {
    demoAssignment = await prisma.internshipAssignment.create({
      data: {
        applicationId: demoApplication.id,
        studentId: studentProfile.id,
        companyId: companyProfileRecord.id,
        internshipId: demoPosting.id,
        facultyMentorId: facultyProfile.id,
        industryMentorId: mentorUser.id,
        startDate: sixtyDaysAgo,
        endDate: oneTwentyDaysLater,
        status: AssignmentStatus.active,
      },
    });
    console.log('[Seed] Demo active internship assignment created.');

    await prisma.task.createMany({
      data: [
        {
          assignmentId: demoAssignment.id,
          assignedById: mentorUser.id,
          title: 'Implement AI Career Analysis Integration',
          description: 'Integrate Groq AI SDK with backend services and connect frontend career guidance dashboard.',
          requiredSkills: ['TypeScript', 'React', 'Node.js'],
          priority: PriorityLevel.high,
          status: TaskStatus.reviewed,
        },
        {
          assignmentId: demoAssignment.id,
          assignedById: mentorUser.id,
          title: 'PostgreSQL Database Schema & Prisma Optimization',
          description: 'Design and verify relational constraints, foreign keys, and indexes.',
          requiredSkills: ['PostgreSQL', 'Prisma'],
          priority: PriorityLevel.medium,
          status: TaskStatus.reviewed,
        },
        {
          assignmentId: demoAssignment.id,
          assignedById: mentorUser.id,
          title: 'Build Notification System & WebSockets',
          description: 'Implement real-time notification alerts for assignment milestones and task reviews.',
          requiredSkills: ['Node.js', 'WebSocket'],
          priority: PriorityLevel.high,
          status: TaskStatus.in_progress,
        },
      ],
    });

    await prisma.milestone.createMany({
      data: [
        {
          assignmentId: demoAssignment.id,
          title: 'Onboarding & Architecture Walkthrough',
          description: 'Complete codebase review and local environment configuration.',
          targetDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 44 * 24 * 60 * 60 * 1000),
          status: MilestoneStatus.completed,
        },
        {
          assignmentId: demoAssignment.id,
          title: 'Core Backend API Development',
          description: 'Deliver core CRUD endpoints, role guards, and data validation.',
          targetDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          status: MilestoneStatus.completed,
        },
        {
          assignmentId: demoAssignment.id,
          title: 'Final Project Deployment & Review',
          description: 'Deploy production release and conduct capstone demo.',
          targetDate: oneTwentyDaysLater,
          status: MilestoneStatus.in_progress,
        },
      ],
    });

    await prisma.evaluation.create({
      data: {
        assignmentId: demoAssignment.id,
        evaluatorId: mentorUser.id,
        evaluatorRole: AppRole.mentor,
        evaluationType: EvaluationType.mid_term,
        evaluationPeriod: 'Mid-Term Review (Month 2)',
        technicalSkills: 9,
        qualityOfWork: 9,
        problemSolving: 9,
        communication: 8,
        teamwork: 9,
        professionalism: 9,
        timeManagement: 8,
        initiative: 9,
        overallRating: new Prisma.Decimal('8.8'),
        strengths: 'Outstanding problem solving, clean TypeScript architecture, proactive team communication.',
        improvementAreas: 'Deepen knowledge of distributed caching and microservice patterns.',
        comments: 'Consistently delivers high quality features ahead of deadlines.',
        status: EvaluationStatus.verified,
      },
    });

    const attendanceDates: Date[] = [];
    for (let i = 1; i <= 10; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        attendanceDates.push(d);
      }
    }
    for (const d of attendanceDates) {
      await prisma.attendanceRecord.create({
        data: {
          assignmentId: demoAssignment.id,
          attendanceDate: d,
          status: AttendanceStatus.present,
          workingHours: new Prisma.Decimal('8.00'),
          geoVerified: true,
        },
      });
    }

    console.log('[Seed] Demo assignment tasks, milestones, evaluation, and attendance seeded.');
  }

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
