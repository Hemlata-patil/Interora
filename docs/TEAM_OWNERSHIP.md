# TEAM OWNERSHIP & CODEBASE BOUNDARIES — INTERORA

Product Name: **Interora**  
Tagline: **Learn • Intern • Grow**  
Team: **AlphaStack**

---

## 1. Overview & Architecture Strategy
Interora is maintained as a **single, unified React + Vite application**. To support efficient multi-developer collaboration across a 3-member development team without merge conflicts, the codebase is structured into modular feature domains and shared core layers.

---

## 2. Developer Domain Ownership

### DEVELOPER 1: Student Portal & Core Internship Journey
**Primary Responsibilities:**
- Student Dashboard & Profile Management
- Internship Discovery, Search, Filtering, & Applications
- Attendance Check-in / Tracking
- Work Logs & Task Submissions

**Directory Ownership:**
- `src/features/student/`
- `src/features/internships/`
- `src/features/applications/`
- `src/features/attendance/`
- `src/features/tasks/`
- `src/features/worklogs/`

---

### DEVELOPER 2: Faculty Portal & Company / Industry Mentor Portal
**Primary Responsibilities:**
- Faculty Mentor Dashboard & Approval Workflows
- Student Progress & Risk Monitoring
- Company Portal, Internship Creation, & Applicant Management
- Task Assignments, Milestones & Evaluations

**Directory Ownership:**
- `src/features/faculty/`
- `src/features/company/`
- `src/features/milestones/`
- `src/features/evaluations/`

---

### DEVELOPER 3: Admin Portal, AI Intelligence & Completion / Certificates
**Primary Responsibilities:**
- Platform Admin Dashboard, User & Department Management
- AI Module Foundations (Recommendation, Skill Gap, Report Generation, Readiness)
- Certificate Generation, Verification & Public QR Verification Route
- Analytics & System Oversight

**Directory Ownership:**
- `src/features/admin/`
- `src/features/ai/`
- `src/features/certificates/`
- `src/features/analytics/`

---

## 3. Shared Architectural Layer (Collaborative Zone)
The following directories contain shared utilities, UI primitives, types, and routing configs. **Changes to these areas must be coordinated carefully to avoid breaking other developer workflows.**

- `src/components/ui/` — Base design system primitives (Button, Card, Input, Badge, Modal, etc.)
- `src/components/common/` — Reusable domain-agnostic UI widgets (EmptyState, LoadingState, PageHeader)
- `src/components/navigation/` — Layout headers, sidebars, and drawer navigation
- `src/app/` — Router definitions, layouts, and global providers
- `src/services/` — API abstractions and Supabase client placeholders
- `src/types/` — Global domain types and interfaces
- `src/constants/` — System-wide constants, menu structures, and enum definitions
- `src/hooks/` — Custom React hooks
- `src/lib/` & `src/utils/` — Utility functions, styling helpers, and class mergers

---

## 4. Git & Branching Strategy
- `main` branch is **protected**. No direct pushes.
- Feature branches to create:
  - `feature/student-portal` (Developer 1)
  - `feature/faculty-company` (Developer 2)
  - `feature/admin-ai` (Developer 3)
- Always run `npm run build` before opening a Pull Request.
