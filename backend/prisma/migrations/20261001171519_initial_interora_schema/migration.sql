-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('student', 'company', 'faculty', 'industry_mentor', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('pending', 'approved', 'rejected', 'inactive');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'student',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'active',
    "phone" TEXT,
    "department" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "student_id" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT NOT NULL DEFAULT 'CSE',
    "course" TEXT NOT NULL DEFAULT 'B.Tech Computer Science',
    "year_semester" TEXT NOT NULL DEFAULT '3rd Year / 6th Sem',
    "assigned_faculty_id" UUID,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resume_path" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "official_email" TEXT NOT NULL,
    "phone" TEXT,
    "industry_domain" TEXT NOT NULL,
    "website" TEXT,
    "company_address" TEXT,
    "approval_status" "CompanyStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "approved_at" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_postings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "industry_domain" TEXT NOT NULL,
    "location" TEXT DEFAULT 'Remote / On-site',
    "internship_type" TEXT DEFAULT 'Full-time',
    "duration" TEXT DEFAULT '3 Months',
    "stipend" TEXT DEFAULT 'Unpaid / Paid',
    "eligibility" TEXT DEFAULT 'All Eligible',
    "skills" TEXT[],
    "application_deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "cover_letter" TEXT,
    "faculty_rating" DECIMAL(3,1),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "internship_id" UUID,
    "attendance_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "status" TEXT NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "check_in_photo_url" TEXT,
    "check_in_lat" DOUBLE PRECISION,
    "check_in_lng" DOUBLE PRECISION,
    "check_out_photo_url" TEXT,
    "check_out_lat" DOUBLE PRECISION,
    "check_out_lng" DOUBLE PRECISION,
    "location_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "module_key" TEXT NOT NULL,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" DATE,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "internship_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" DATE,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "internship_id" UUID,
    "evaluator_id" UUID,
    "rating" DECIMAL(3,2),
    "feedback" TEXT,
    "score" DECIMAL(5,2),
    "remarks" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "internship_id" UUID,
    "certificate_number" TEXT NOT NULL,
    "certificate_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_student_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faculty_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "faculty_student_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_guidance_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "faculty_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_guidance_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_mentor_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Active',

    CONSTRAINT "company_mentor_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_task_reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "mentor_id" UUID NOT NULL,
    "review_status" TEXT NOT NULL DEFAULT 'Verified',
    "feedback" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_task_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT,
    "due_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_student_id_key" ON "student_profiles"("student_id");

-- CreateIndex
CREATE INDEX "idx_internship_postings_company" ON "internship_postings"("company_id");

-- CreateIndex
CREATE INDEX "idx_internship_postings_status" ON "internship_postings"("status");

-- CreateIndex
CREATE INDEX "idx_student_applications_internship" ON "student_applications"("internship_id");

-- CreateIndex
CREATE INDEX "idx_student_applications_student" ON "student_applications"("student_id");

-- CreateIndex
CREATE INDEX "idx_student_applications_status" ON "student_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "student_applications_internship_id_student_id_key" ON "student_applications"("internship_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_attendance_student" ON "attendance_records"("student_id");

-- CreateIndex
CREATE INDEX "idx_attendance_date" ON "attendance_records"("attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "career_progress_student_id_module_key_key" ON "career_progress"("student_id", "module_key");

-- CreateIndex
CREATE INDEX "idx_tasks_student" ON "student_tasks"("student_id");

-- CreateIndex
CREATE INDEX "idx_milestones_student" ON "student_milestones"("student_id");

-- CreateIndex
CREATE INDEX "idx_evaluations_student" ON "student_evaluations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_certificates_certificate_number_key" ON "student_certificates"("certificate_number");

-- CreateIndex
CREATE INDEX "idx_certificates_student" ON "student_certificates"("student_id");

-- CreateIndex
CREATE INDEX "idx_chat_participants_user" ON "chat_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_conversation_id_user_id_key" ON "chat_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_chat_messages_conv" ON "chat_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_faculty_assignments_faculty" ON "faculty_student_assignments"("faculty_id");

-- CreateIndex
CREATE INDEX "idx_faculty_assignments_student" ON "faculty_student_assignments"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_student_assignments_faculty_id_student_id_key" ON "faculty_student_assignments"("faculty_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_faculty_notes_faculty" ON "faculty_guidance_notes"("faculty_id");

-- CreateIndex
CREATE INDEX "idx_faculty_notes_student" ON "faculty_guidance_notes"("student_id");

-- CreateIndex
CREATE INDEX "idx_company_mentor_assignments_mentor" ON "company_mentor_assignments"("mentor_id");

-- CreateIndex
CREATE INDEX "idx_company_mentor_assignments_student" ON "company_mentor_assignments"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_mentor_assignments_mentor_id_student_id_key" ON "company_mentor_assignments"("mentor_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_company_task_reviews_task" ON "company_task_reviews"("task_id");

-- CreateIndex
CREATE INDEX "idx_company_task_reviews_mentor" ON "company_task_reviews"("mentor_id");

-- CreateIndex
CREATE INDEX "idx_internship_tasks_internship" ON "internship_tasks"("internship_id");

-- CreateIndex
CREATE INDEX "idx_internship_milestones_internship" ON "internship_milestones"("internship_id");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_postings" ADD CONSTRAINT "internship_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_progress" ADD CONSTRAINT "career_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_milestones" ADD CONSTRAINT "student_milestones_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_milestones" ADD CONSTRAINT "student_milestones_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_evaluations" ADD CONSTRAINT "student_evaluations_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_certificates" ADD CONSTRAINT "student_certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_certificates" ADD CONSTRAINT "student_certificates_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_student_assignments" ADD CONSTRAINT "faculty_student_assignments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_student_assignments" ADD CONSTRAINT "faculty_student_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_guidance_notes" ADD CONSTRAINT "faculty_guidance_notes_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_guidance_notes" ADD CONSTRAINT "faculty_guidance_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_mentor_assignments" ADD CONSTRAINT "company_mentor_assignments_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_mentor_assignments" ADD CONSTRAINT "company_mentor_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_mentor_assignments" ADD CONSTRAINT "company_mentor_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_task_reviews" ADD CONSTRAINT "company_task_reviews_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "student_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_task_reviews" ADD CONSTRAINT "company_task_reviews_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_tasks" ADD CONSTRAINT "internship_tasks_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_milestones" ADD CONSTRAINT "internship_milestones_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
