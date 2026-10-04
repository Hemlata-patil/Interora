/*
  Warnings:

  - The values [industry_mentor] on the enum `AppRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [inactive] on the enum `CompanyStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `internship_id` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `location_address` on the `attendance_records` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `attendance_records` table. All the data in the column will be lost.
  - The `status` column on the `attendance_records` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `joined_at` on the `chat_participants` table. All the data in the column will be lost.
  - You are about to alter the column `company_name` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `contact_person` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `official_email` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `industry_domain` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `website` on the `company_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `category` on the `faculty_guidance_notes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `status` on the `faculty_student_assignments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `title` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `industry_domain` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `location` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - The `internship_type` column on the `internship_postings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `duration` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `stipend` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `eligibility` on the `internship_postings` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `status` column on the `internship_postings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `department` on the `profiles` table. All the data in the column will be lost.
  - You are about to alter the column `full_name` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `phone` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `password_hash` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The `status` column on the `student_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assigned_faculty_id` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `resume_path` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `year_semester` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to alter the column `student_id` on the `student_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `course` on the `student_profiles` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the `career_progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `company_mentor_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `company_task_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `internship_milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `internship_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_certificates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_evaluations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_tasks` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[assignment_id,attendance_date]` on the table `attendance_records` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[official_email]` on the table `company_profiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignment_id` to the `attendance_records` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `company_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `internship_postings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `internship_postings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stipend` on table `internship_postings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `eligibility` on table `internship_postings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `department_id` to the `student_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('on_site', 'remote', 'hybrid');

-- CreateEnum
CREATE TYPE "InternshipType" AS ENUM ('full_time', 'part_time');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('draft', 'open', 'closed', 'archived');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('submitted', 'faculty_review', 'faculty_approved', 'faculty_rejected', 'shortlisted', 'selected', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('upcoming', 'active', 'completed', 'terminated', 'suspended');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'half_day', 'leave');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('assigned', 'in_progress', 'submitted', 'reviewed', 'closed');

-- CreateEnum
CREATE TYPE "SubmissionReviewStatus" AS ENUM ('pending', 'verified', 'correction_required', 'rejected');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('pending', 'in_progress', 'delayed', 'completed');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'submitted', 'reviewed');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('mid_term', 'final');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('draft', 'submitted', 'pending_verification', 'verified', 'correction_required');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('on_track', 'needs_attention', 'high_risk');

-- CreateEnum
CREATE TYPE "PPOStatus" AS ENUM ('draft', 'offered', 'under_consideration', 'not_converted');

-- CreateEnum
CREATE TYPE "AdminApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "StudentResponseStatus" AS ENUM ('pending', 'accepted', 'declined');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('active', 'revoked', 'reissued');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('applications', 'interns', 'tasks', 'milestones', 'evaluations', 'ppo', 'certificates', 'risk', 'system');

-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'suspended';

-- AlterEnum
BEGIN;
CREATE TYPE "AppRole_new" AS ENUM ('student', 'faculty', 'company', 'mentor', 'admin');
ALTER TABLE "profiles" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "profiles" ALTER COLUMN "role" TYPE "AppRole_new" USING ("role"::text::"AppRole_new");
ALTER TYPE "AppRole" RENAME TO "AppRole_old";
ALTER TYPE "AppRole_new" RENAME TO "AppRole";
DROP TYPE "AppRole_old";
ALTER TABLE "profiles" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CompanyStatus_new" AS ENUM ('pending', 'approved', 'rejected');
ALTER TABLE "company_profiles" ALTER COLUMN "approval_status" DROP DEFAULT;
ALTER TABLE "company_profiles" ALTER COLUMN "approval_status" TYPE "CompanyStatus_new" USING ("approval_status"::text::"CompanyStatus_new");
ALTER TYPE "CompanyStatus" RENAME TO "CompanyStatus_old";
ALTER TYPE "CompanyStatus_new" RENAME TO "CompanyStatus";
DROP TYPE "CompanyStatus_old";
ALTER TABLE "company_profiles" ALTER COLUMN "approval_status" SET DEFAULT 'pending';
COMMIT;

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_records_student_id_fkey";

-- DropForeignKey
ALTER TABLE "career_progress" DROP CONSTRAINT "career_progress_student_id_fkey";

-- DropForeignKey
ALTER TABLE "company_mentor_assignments" DROP CONSTRAINT "company_mentor_assignments_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_mentor_assignments" DROP CONSTRAINT "company_mentor_assignments_mentor_id_fkey";

-- DropForeignKey
ALTER TABLE "company_mentor_assignments" DROP CONSTRAINT "company_mentor_assignments_student_id_fkey";

-- DropForeignKey
ALTER TABLE "company_task_reviews" DROP CONSTRAINT "company_task_reviews_mentor_id_fkey";

-- DropForeignKey
ALTER TABLE "company_task_reviews" DROP CONSTRAINT "company_task_reviews_task_id_fkey";

-- DropForeignKey
ALTER TABLE "faculty_guidance_notes" DROP CONSTRAINT "faculty_guidance_notes_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "faculty_guidance_notes" DROP CONSTRAINT "faculty_guidance_notes_student_id_fkey";

-- DropForeignKey
ALTER TABLE "faculty_student_assignments" DROP CONSTRAINT "faculty_student_assignments_faculty_id_fkey";

-- DropForeignKey
ALTER TABLE "faculty_student_assignments" DROP CONSTRAINT "faculty_student_assignments_student_id_fkey";

-- DropForeignKey
ALTER TABLE "internship_milestones" DROP CONSTRAINT "internship_milestones_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "internship_tasks" DROP CONSTRAINT "internship_tasks_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "student_certificates" DROP CONSTRAINT "student_certificates_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "student_certificates" DROP CONSTRAINT "student_certificates_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_evaluations" DROP CONSTRAINT "student_evaluations_evaluator_id_fkey";

-- DropForeignKey
ALTER TABLE "student_evaluations" DROP CONSTRAINT "student_evaluations_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "student_evaluations" DROP CONSTRAINT "student_evaluations_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_milestones" DROP CONSTRAINT "student_milestones_internship_id_fkey";

-- DropForeignKey
ALTER TABLE "student_milestones" DROP CONSTRAINT "student_milestones_student_id_fkey";

-- DropForeignKey
ALTER TABLE "student_tasks" DROP CONSTRAINT "student_tasks_student_id_fkey";

-- DropIndex
DROP INDEX "idx_attendance_student";

-- DropIndex
DROP INDEX "idx_chat_messages_conv";

-- DropIndex
DROP INDEX "idx_chat_participants_user";

-- DropIndex
DROP INDEX "idx_faculty_notes_faculty";

-- DropIndex
DROP INDEX "idx_faculty_assignments_faculty";

-- DropIndex
DROP INDEX "idx_faculty_assignments_student";

-- AlterTable
ALTER TABLE "attendance_records" DROP COLUMN "internship_id",
DROP COLUMN "location_address",
DROP COLUMN "student_id",
ADD COLUMN     "assignment_id" UUID NOT NULL,
ADD COLUMN     "check_in_address" TEXT,
ADD COLUMN     "check_out_address" TEXT,
ADD COLUMN     "faculty_override" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "geo_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "override_by_id" UUID,
ADD COLUMN     "override_reason" TEXT,
ADD COLUMN     "working_hours" DECIMAL(4,2) DEFAULT 0.00,
ALTER COLUMN "attendance_date" SET DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'present';

-- AlterTable
ALTER TABLE "chat_participants" DROP COLUMN "joined_at",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_read_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "company_profiles" ADD COLUMN     "geo_fence_radius_m" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN     "geo_lat" DOUBLE PRECISION,
ADD COLUMN     "geo_lng" DOUBLE PRECISION,
ALTER COLUMN "company_name" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "contact_person" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "official_email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "industry_domain" SET DEFAULT 'Software & Cloud Services',
ALTER COLUMN "industry_domain" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "website" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "faculty_guidance_notes" ALTER COLUMN "category" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "faculty_student_assignments" ALTER COLUMN "status" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "internship_postings" ADD COLUMN     "vacancies" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "work_mode" "WorkMode" NOT NULL DEFAULT 'hybrid',
ALTER COLUMN "title" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "industry_domain" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "location" SET DATA TYPE VARCHAR(150),
DROP COLUMN "internship_type",
ADD COLUMN     "internship_type" "InternshipType" NOT NULL DEFAULT 'full_time',
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "duration" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "stipend" SET NOT NULL,
ALTER COLUMN "stipend" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "eligibility" SET NOT NULL,
ALTER COLUMN "eligibility" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "status",
ADD COLUMN     "status" "PostingStatus" NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "department",
ADD COLUMN     "avatar_url" TEXT,
ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "student_applications" ADD COLUMN     "allocator_match_score" DECIMAL(5,2),
ADD COLUMN     "allocator_score_breakdown" JSONB,
ADD COLUMN     "company_remarks" TEXT,
ADD COLUMN     "faculty_feedback" TEXT,
ADD COLUMN     "faculty_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "faculty_reviewed_by_id" UUID,
ADD COLUMN     "resume_url" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'submitted';

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "assigned_faculty_id",
DROP COLUMN "bio",
DROP COLUMN "department",
DROP COLUMN "phone",
DROP COLUMN "resume_path",
DROP COLUMN "year_semester",
ADD COLUMN     "batch_division" VARCHAR(10) NOT NULL DEFAULT 'CS1',
ADD COLUMN     "batch_year" VARCHAR(10) NOT NULL DEFAULT '2026',
ADD COLUMN     "cgpa" DECIMAL(3,2),
ADD COLUMN     "current_semester" VARCHAR(20) NOT NULL DEFAULT '6th Semester',
ADD COLUMN     "department_id" UUID NOT NULL,
ADD COLUMN     "resume_analysis" JSONB,
ADD COLUMN     "resume_url" TEXT,
ALTER COLUMN "student_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "course" SET DATA TYPE VARCHAR(100);

-- DropTable
DROP TABLE "career_progress";

-- DropTable
DROP TABLE "company_mentor_assignments";

-- DropTable
DROP TABLE "company_task_reviews";

-- DropTable
DROP TABLE "internship_milestones";

-- DropTable
DROP TABLE "internship_tasks";

-- DropTable
DROP TABLE "student_certificates";

-- DropTable
DROP TABLE "student_evaluations";

-- DropTable
DROP TABLE "student_milestones";

-- DropTable
DROP TABLE "student_tasks";

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "program" VARCHAR(50) NOT NULL DEFAULT 'B.Tech',
    "head_of_department_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_profiles" (
    "id" UUID NOT NULL,
    "faculty_id" VARCHAR(50) NOT NULL,
    "department_id" UUID NOT NULL,
    "designation" VARCHAR(100) NOT NULL DEFAULT 'Assistant Professor',
    "cabin_location" VARCHAR(100),
    "office_phone" VARCHAR(30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industry_mentor_profiles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "designation" VARCHAR(100) NOT NULL,
    "corporate_department" VARCHAR(100),
    "expertise_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "industry_mentor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_task_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'medium',
    "expected_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_task_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_milestone_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sequence_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_milestone_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocator_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "internship_id" UUID NOT NULL,
    "run_by_id" UUID NOT NULL,
    "candidate_count" INTEGER NOT NULL,
    "weights_used" JSONB NOT NULL,
    "results_summary" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocator_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "internship_id" UUID NOT NULL,
    "faculty_mentor_id" UUID NOT NULL,
    "industry_mentor_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "actual_completion_date" DATE,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'upcoming',
    "termination_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "template_id" UUID,
    "assigned_by_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" "PriorityLevel" NOT NULL DEFAULT 'medium',
    "due_date" DATE,
    "status" "TaskStatus" NOT NULL DEFAULT 'assigned',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_submissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "submitted_by_id" UUID NOT NULL,
    "submission_text" TEXT,
    "proof_url" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_status" "SubmissionReviewStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by_id" UUID,
    "feedback" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "template_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "target_date" DATE NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" "MilestoneStatus" NOT NULL DEFAULT 'pending',
    "verified_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "log_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hours_worked" DECIMAL(4,2) NOT NULL DEFAULT 8.00,
    "task_title" VARCHAR(200) NOT NULL,
    "completed_work" TEXT NOT NULL,
    "blockers" TEXT NOT NULL DEFAULT 'None',
    "next_plan" TEXT NOT NULL DEFAULT 'Continue deliverables',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "ai_draft_content" TEXT NOT NULL,
    "final_content" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "mentor_feedback" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,
    "evaluator_role" "AppRole" NOT NULL,
    "evaluation_type" "EvaluationType" NOT NULL,
    "evaluation_period" VARCHAR(50) NOT NULL,
    "technical_skills" INTEGER NOT NULL,
    "quality_of_work" INTEGER NOT NULL,
    "problem_solving" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "teamwork" INTEGER NOT NULL,
    "professionalism" INTEGER NOT NULL,
    "time_management" INTEGER NOT NULL,
    "initiative" INTEGER NOT NULL,
    "overall_rating" DECIMAL(3,1) NOT NULL,
    "strengths" TEXT,
    "improvement_areas" TEXT,
    "comments" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'draft',
    "cross_verified" BOOLEAN NOT NULL DEFAULT false,
    "cross_verified_by_id" UUID,
    "cross_verified_at" TIMESTAMP(3),
    "discrepancy_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_score_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendance_score" DECIMAL(5,2) NOT NULL,
    "task_completion_score" DECIMAL(5,2) NOT NULL,
    "milestone_score" DECIMAL(5,2) NOT NULL,
    "work_log_score" DECIMAL(5,2) NOT NULL,
    "composite_score" DECIMAL(5,2) NOT NULL,
    "risk_status" "RiskLevel" NOT NULL DEFAULT 'on_track',

    CONSTRAINT "health_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "risk_level" "RiskLevel" NOT NULL,
    "signal_reason" TEXT NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "intervention_notes" TEXT,

    CONSTRAINT "risk_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "skill_tag" VARCHAR(100) NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_learning_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'recommended',
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "student_learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_readiness_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "readiness_score" INTEGER NOT NULL,
    "skill_score" INTEGER NOT NULL,
    "internship_score" INTEGER NOT NULL,
    "evaluation_score" INTEGER NOT NULL,
    "recommendations" JSONB NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_readiness_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ppo_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "position_title" VARCHAR(150) NOT NULL,
    "salary_package" VARCHAR(100) NOT NULL,
    "joining_date" DATE,
    "location" VARCHAR(150),
    "bond_terms" TEXT,
    "offer_letter_url" TEXT,
    "status" "PPOStatus" NOT NULL DEFAULT 'draft',
    "admin_approval_status" "AdminApprovalStatus" NOT NULL DEFAULT 'pending',
    "approved_by_id" UUID,
    "student_response" "StudentResponseStatus" NOT NULL DEFAULT 'pending',
    "response_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppo_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "certificate_number" VARCHAR(100) NOT NULL,
    "qr_token" VARCHAR(100) NOT NULL,
    "certificate_url" TEXT,
    "issue_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signatory_name" VARCHAR(150) NOT NULL,
    "signatory_title" VARCHAR(150) NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'active',
    "revocation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_verification_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "certificate_id" UUID NOT NULL,
    "qr_token" VARCHAR(100) NOT NULL,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "certificate_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" UUID NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "PriorityLevel" NOT NULL DEFAULT 'medium',
    "action_url" VARCHAR(255),
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "category" VARCHAR(50) NOT NULL DEFAULT 'general',
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by_id" UUID,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_profiles_faculty_id_key" ON "faculty_profiles"("faculty_id");

-- CreateIndex
CREATE INDEX "idx_faculty_profiles_dept" ON "faculty_profiles"("department_id");

-- CreateIndex
CREATE INDEX "idx_industry_mentors_company" ON "industry_mentor_profiles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "internship_assignments_application_id_key" ON "internship_assignments"("application_id");

-- CreateIndex
CREATE INDEX "idx_assign_student" ON "internship_assignments"("student_id");

-- CreateIndex
CREATE INDEX "idx_assign_company" ON "internship_assignments"("company_id");

-- CreateIndex
CREATE INDEX "idx_assign_faculty" ON "internship_assignments"("faculty_mentor_id");

-- CreateIndex
CREATE INDEX "idx_assign_industry" ON "internship_assignments"("industry_mentor_id");

-- CreateIndex
CREATE INDEX "idx_assign_status" ON "internship_assignments"("status");

-- CreateIndex
CREATE INDEX "idx_tasks_assignment" ON "tasks"("assignment_id");

-- CreateIndex
CREATE INDEX "idx_tasks_status" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "idx_milestones_assign" ON "milestones"("assignment_id");

-- CreateIndex
CREATE INDEX "idx_work_logs_date" ON "work_logs"("assignment_id", "log_date");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_reports_assignment_id_week_number_key" ON "weekly_reports"("assignment_id", "week_number");

-- CreateIndex
CREATE INDEX "idx_evals_assign" ON "evaluations"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_score_snapshots_assignment_id_snapshot_date_key" ON "health_score_snapshots"("assignment_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "idx_resources_skill" ON "learning_resources"("skill_tag");

-- CreateIndex
CREATE UNIQUE INDEX "student_learning_progress_student_id_resource_id_key" ON "student_learning_progress"("student_id", "resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "ppo_offers_assignment_id_key" ON "ppo_offers"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_assignment_id_key" ON "certificates"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_qr_token_key" ON "certificates"("qr_token");

-- CreateIndex
CREATE INDEX "idx_certs_qr" ON "certificates"("qr_token");

-- CreateIndex
CREATE INDEX "idx_notif_user" ON "notifications"("recipient_id", "read");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_assignment_id_attendance_date_key" ON "attendance_records"("assignment_id", "attendance_date");

-- CreateIndex
CREATE INDEX "idx_chat_msg_time" ON "chat_messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_official_email_key" ON "company_profiles"("official_email");

-- CreateIndex
CREATE INDEX "idx_company_profiles_approval" ON "company_profiles"("approval_status");

-- CreateIndex
CREATE INDEX "idx_fac_stu_assign" ON "faculty_student_assignments"("faculty_id", "student_id");

-- CreateIndex
CREATE INDEX "idx_postings_status" ON "internship_postings"("status");

-- CreateIndex
CREATE INDEX "idx_profiles_role" ON "profiles"("role");

-- CreateIndex
CREATE INDEX "idx_apps_status" ON "student_applications"("status");

-- CreateIndex
CREATE INDEX "idx_student_profiles_dept" ON "student_profiles"("department_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_of_department_id_fkey" FOREIGN KEY ("head_of_department_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_profiles" ADD CONSTRAINT "faculty_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_mentor_profiles" ADD CONSTRAINT "industry_mentor_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "industry_mentor_profiles" ADD CONSTRAINT "industry_mentor_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_student_assignments" ADD CONSTRAINT "faculty_student_assignments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_student_assignments" ADD CONSTRAINT "faculty_student_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_guidance_notes" ADD CONSTRAINT "faculty_guidance_notes_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_guidance_notes" ADD CONSTRAINT "faculty_guidance_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_task_templates" ADD CONSTRAINT "internship_task_templates_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_milestone_templates" ADD CONSTRAINT "internship_milestone_templates_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_faculty_reviewed_by_id_fkey" FOREIGN KEY ("faculty_reviewed_by_id") REFERENCES "faculty_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocator_runs" ADD CONSTRAINT "allocator_runs_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocator_runs" ADD CONSTRAINT "allocator_runs_run_by_id_fkey" FOREIGN KEY ("run_by_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "student_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internship_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_faculty_mentor_id_fkey" FOREIGN KEY ("faculty_mentor_id") REFERENCES "faculty_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_assignments" ADD CONSTRAINT "internship_assignments_industry_mentor_id_fkey" FOREIGN KEY ("industry_mentor_id") REFERENCES "industry_mentor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_override_by_id_fkey" FOREIGN KEY ("override_by_id") REFERENCES "faculty_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "internship_task_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "internship_milestone_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_cross_verified_by_id_fkey" FOREIGN KEY ("cross_verified_by_id") REFERENCES "faculty_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_score_snapshots" ADD CONSTRAINT "health_score_snapshots_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_flags" ADD CONSTRAINT "risk_flags_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_learning_progress" ADD CONSTRAINT "student_learning_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_learning_progress" ADD CONSTRAINT "student_learning_progress_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "learning_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_readiness_snapshots" ADD CONSTRAINT "placement_readiness_snapshots_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppo_offers" ADD CONSTRAINT "ppo_offers_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppo_offers" ADD CONSTRAINT "ppo_offers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppo_offers" ADD CONSTRAINT "ppo_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ppo_offers" ADD CONSTRAINT "ppo_offers_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "internship_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verification_logs" ADD CONSTRAINT "certificate_verification_logs_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_faculty_notes_student" RENAME TO "idx_guidance_student";

-- RenameIndex
ALTER INDEX "idx_internship_postings_company" RENAME TO "idx_postings_company";

-- RenameIndex
ALTER INDEX "idx_student_applications_internship" RENAME TO "idx_apps_internship";

-- RenameIndex
ALTER INDEX "idx_student_applications_student" RENAME TO "idx_apps_student";
