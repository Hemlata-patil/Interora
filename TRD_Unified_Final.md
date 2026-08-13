# TRD.md — Unified Internship Ecosystem Platform

**Project:** Unified Internship Ecosystem (merged InternIQ + AI-Powered Ecosystem + InternHub)
**Frontend:** React.js + Vite
**Backend:** Supabase
**Database:** PostgreSQL

> This TRD translates `InternHub_Unified_PRD_Final.md` (v1.0) and `InternHub_Architecture_v2.md` into implementation-level requirements. The merged PRD is the product source of truth; the architecture doc is the schema/system source of truth; this document defines how V1 should be implemented without adding functionality beyond either. Every module below is tagged with its PRD section reference.

---

## 1. Technical Stack

| Technology | Use |
|---|---|
| React.js | Frontend |
| Vite | Build/development |
| TypeScript | Preferred application language |
| React Router | Routing/protected routes |
| Tailwind CSS | Responsive UI |
| Supabase Auth | Authentication |
| PostgreSQL | Application database |
| Supabase RLS | Database authorization |
| Supabase Storage | Resumes, task proof attachments, certificates, company logos |
| Supabase Edge Functions | Secure AI/server-side operations, all scoring logic |
| Supabase Realtime | Live application/task/attendance/notification/leaderboard updates |
| Supabase Cron (pg_cron) | Nightly/weekly recomputation jobs |
| Browser Geolocation API | Geo-fenced attendance check-in/check-out |
| AI API | Recommendations, skill-gap, allocator scoring, resume analysis, report drafting |
| QR library | Certificate QR generation |

No separate Express/Node backend or second database is required for V1.

---

## 2. Project Structure

```text
interniq/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── dashboards/
│   │   └── common/
│   ├── pages/
│   │   ├── auth/
│   │   ├── student/
│   │   ├── faculty/
│   │   ├── company/
│   │   ├── admin/
│   │   └── public/            # /verify/:token
│   ├── features/
│   │   ├── profiles/
│   │   ├── departments/
│   │   ├── internships/
│   │   ├── applications/
│   │   ├── allocator/          # NEW — AI Intern Allocator
│   │   ├── attendance/         # geo-fence aware
│   │   ├── tasks/
│   │   ├── taskProofs/         # NEW — proof attachments
│   │   ├── milestones/
│   │   ├── workLogs/
│   │   ├── reports/            # NEW — AI weekly report drafts (separate from work logs)
│   │   ├── feedback/
│   │   ├── evaluations/
│   │   ├── crossVerification/  # NEW — faculty verifies company ratings
│   │   ├── recommendations/
│   │   ├── skillGap/
│   │   ├── learningHub/        # NEW — AI Learning Hub
│   │   ├── resumeAnalyzer/     # NEW
│   │   ├── readiness/
│   │   ├── risk/
│   │   ├── leaderboard/        # NEW
│   │   ├── ppo/                # NEW — PPO/conversion flagging
│   │   ├── certificates/
│   │   ├── companyVerification/# NEW
│   │   └── notifications/
│   ├── layouts/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── contexts/
│   ├── utils/
│   └── lib/
│       └── supabaseClient.ts
├── supabase/
│   ├── migrations/
│   └── functions/
│       ├── compute-health-score/
│       ├── detect-risk-flags/
│       ├── compute-placement-readiness/
│       ├── run-intern-allocator/       # NEW
│       ├── compute-skill-gap/
│       ├── generate-weekly-report-draft/
│       ├── analyze-resume/             # NEW
│       ├── compute-leaderboard/        # NEW
│       ├── generate-certificate/
│       ├── verify-certificate/
│       └── recommend-internships/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── TRD.md
├── .env.example
├── package.json
└── README.md
```

---

## 3. Environment Configuration

Frontend:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

AI provider secrets must never be exposed in Vite/browser code. Store them, and any third-party geolocation keys, in Supabase Edge Function secrets.

---

## 4. Authentication and Roles

Supported roles:

```text
student
faculty
company
admin
```

Flow:

```text
Signup/Login
    ↓
Supabase Auth
    ↓
auth.users
    ↓
profiles.role
    ↓
Protected route/layout
```

Frontend route protection improves UX, but RLS is the actual security boundary (PRD Key Business Rules; Architecture §5).

Suggested routes:

```text
/student/*
/faculty/*
/company/*
/admin/*
/verify/:token          # public certificate verification, no auth required
```

---

## 5. Database Implementation

Use UUID primary keys and foreign keys throughout. Full column-level definitions live in `InternHub_Architecture_v2.md` §4 — this section lists table names and the constraints/notes engineers need while building migrations.

### 5.1 Core tables (baseline — matches original InternIQ scope)

```text
profiles
students
faculty_student_mapping
companies
internships
internship_skills
internship_applications
internship_assignments
attendance
tasks
milestones
work_logs
evaluations
recommendations
skill_gap_analysis
internship_health_snapshots
risk_flags
placement_readiness
certificates
certificate_verifications
notifications
audit_logs
```

### 5.2 New tables required for the merged PRD

```text
departments                    -- Admin > Department Management
industry_mentors               -- Company sub-role mapping
task_submissions               -- proof attachments on task work, InternHub §6.3
reports                        -- AI-drafted weekly/daily reports, separate from work_logs
allocator_runs                 -- AI Intern Allocator run log
leaderboard_scores             -- batch-wide composite ranking
ppo_flags                      -- Pre-Placement Offer / conversion flagging
learning_resources             -- AI Learning Hub catalog
student_learning_progress      -- AI Learning Hub per-student tracking
scoring_config                 -- tunable weights for Health Score / Readiness / Allocator / Leaderboard
attendance_config              -- geo-fence radius + time window, per-org configurable
admin_settings                 -- feature toggles (e.g. leaderboard_enabled)
```

### 5.3 Modified columns on existing tables

```text
students.resume_analysis           jsonb   -- AI Resume Analyzer output
companies.verification_status      text    -- pending | verified | rejected
internships.num_positions          int
internships.application_deadline   date
internship_applications.allocator_match_score       numeric
internship_applications.allocator_score_breakdown   jsonb
attendance.check_in_lat/lng, check_out_lat/lng       numeric
attendance.geo_verified            boolean
attendance.time_window_verified    boolean
attendance.class_id                text
attendance.working_hours           numeric
evaluations.cross_verified         boolean
evaluations.cross_verified_by      uuid
evaluations.cross_verified_at      timestamptz
evaluations.cross_verification_note text
```

### 5.4 Important constraints

```text
profiles.email UNIQUE
UNIQUE(internship_id, student_id) on applications
UNIQUE(assignment_id, date) on attendance
UNIQUE(assignment_id) on internship_assignments per application
certificates.certificate_number UNIQUE
certificates.qr_token UNIQUE
scoring_config.key UNIQUE (primary key)
admin_settings.key UNIQUE (primary key)
```

---

## 6. RLS Requirements

### Student
Own private profile, applications, assignment, attendance, tasks + proof submissions, work logs, reports, feedback, evaluations (read-only), recommendations, skill gaps, learning progress, readiness, leaderboard (own rank always; top-N only if `admin_settings.leaderboard_enabled`), certificates, notifications. Can browse published internships and apply. Cannot approve applications, create listings, edit evaluations, cross-verify, or modify risk flags.

### Faculty
Assigned students' internship/application/progress records (via `faculty_student_mapping`). Can approve/reject applications, assign tasks/milestones, give feedback, evaluate assigned students, **and cross-verify company-submitted ratings before they count as official** (new — Architecture §4.8). Can view batch-level placement analytics for their department.

### Company Mentor
Own company, listings, applications to those listings (including **AI Allocator ranked shortlist**), and own interns. Can create/manage listings, run/view the Allocator, make final selections, assign tasks/milestones (with proof review), give feedback, evaluate interns, and **flag interns for PPO conversion** (new — Architecture §4.14). Cannot see other companies' data.

### Admin
Platform-wide access. Manages Departments, Company verification, `scoring_config` weights, `admin_settings` toggles (including Leaderboard on/off), and geo-fence/attendance configuration. Can override selections/evaluations and reissue certificates. Every override writes to `audit_logs`.

RLS must enforce all of the above at database level — UI conditionals are a convenience only.

---

## 7. Module Specifications

### 7.1 Authentication
Pages: `/login` `/register` `/forgot-password`
Requirements: login, signup, session persistence, logout, role redirect, protected routes.

### 7.2 Student Profile
Page: `/student/profile`
Fields: `full_name, email, phone, college, course, branch, year, bio, skills, resume`
Student can edit profile, manage skills, upload/update resume. **On resume upload, trigger `analyze-resume` Edge Function → populate `students.resume_analysis`.**

### 7.3 Departments *(NEW — Admin)*
Page: `/admin/departments`
Fields: `name, program`. Admin maps faculty and students to departments. Feeds batch-level placement analytics.

### 7.4 Company Profile & Verification *(updated)*
Page: `/company/profile`
Fields: `company_name, description, industry, logo, contact_info, verification_status`
Admin reviews and sets `verification_status`. Unverified companies can save drafts but **cannot publish** listings (validation rule, §18).

### 7.5 Internship Marketplace
Pages: `/student/internships`, `/student/internships/:id`, `/company/internships`, `/company/internships/new`
Company fields: `title, description, required_skills, duration, stipend, eligibility, num_positions, application_deadline, status`
Companies create/publish/update/close listings (only if verified). Students search/filter published listings.

### 7.6 Applications
Flow:
```text
Student → Apply → internship_applications → Applied
→ Faculty review → Faculty Approved/Rejected
→ AI Intern Allocator ranks Faculty-Approved applicants   [NEW]
→ Company reviews ranked shortlist → Shortlisted → Selected/Rejected
→ Approved
```
Prevent duplicate applications with the unique constraint. Only faculty-approved applications reach the Allocator and company review.

### 7.7 AI Intern Allocator *(NEW — InternHub §6.3, flagship company feature)*
Page: `/company/internships/:id/applicants`
On Faculty approval (or manual re-run), call `run-intern-allocator`:
- Inputs: student skills/academic record/past evaluation scores vs. internship required_skills/domain/experience
- Output: weighted compatibility score (skills match, academic performance, past ratings, interest alignment) — implemented as cosine similarity between skill vectors for V1, **not a heavy ML model**
- Store on `internship_applications.allocator_match_score` + `allocator_score_breakdown` (explainable, per-factor)
- Company sees ranked shortlist; final selection decision always remains manual.

### 7.8 Internship Activation
When a company selects an approved candidate:
1. Verify faculty approval exists.
2. Set application to `Selected`.
3. Create `internship_assignments` (status `upcoming`).
4. Set assignment to `active` after confirmation.
5. Store student, company, faculty mentor, industry mentor, dates, status.
6. Create relevant notifications.

### 7.9 Attendance — Geo-Fenced *(updated — Architecture §4.5)*
Page: `/student/attendance`
Flow:
```text
Open Attendance
  → Capture device lat/lng (Geolocation API)
  → Compare to internship's registered location within attendance_config.geo_fence_radius_m
  → Validate against attendance_config.time_window_start/end
  → Optional Class ID + password check
  → Mark attendance, compute working_hours from check_in/check_out
```
One record per `(assignment_id, date)`. Mentors view read-only. Faculty override path exists for connectivity failures (PRD Risk mitigation). Facial recognition remains out of scope.

### 7.10 Tasks & Proof Submissions *(updated — Architecture §4.6)*
Mentors create tasks: `title, description, required_skills, deadline, priority, assigned_by, status`.
Students submit work via `task_submissions`: `content, proof_attachment_url` (uploaded to `task-proofs/` bucket), timestamped. **No self-reported-only completion — a proof attachment is required before a task can move to `submitted`.**
Mentors review, leave feedback, mark `reviewed`.
Statuses: `assigned → in_progress → submitted → reviewed`.

### 7.11 Milestones
Mentors create milestones: `title, description, due_date, status`. Tracked as a distinct entity from tasks (InternIQ requirement, preserved). Status: `pending / on_track / delayed / completed`, feeds Health Score's milestone-adherence component.

### 7.12 Work Logs
Students submit daily/weekly: `log_date, content, hours_logged`. Mentors view/comment. Feeds `reports` drafting and Health Score's work-log-consistency component.

### 7.13 Reports — AI-Drafted *(NEW as distinct table — Architecture §4.7)*
Page: `/student/reports`
On student trigger, call `generate-weekly-report-draft`: reads `work_logs`, `tasks`, `milestones` for the period → writes `reports.ai_draft_content`. Student edits into `final_content` before `submitted`. Mentors review submitted reports. This was previously conflated with work logs; it is now its own entity per the merged PRD.

### 7.14 Feedback
Faculty/company mentors provide feedback on tasks, milestones, or overall performance. Students read feedback for their own assignment.

### 7.15 Performance Evaluation & Cross-Verification *(updated — Architecture §4.8)*
Evaluation fields: `criteria (technical, communication, professionalism, problem_solving), overall_rating, written_feedback, rater_role, is_final`.
**New flow:** when `rater_role = 'company'`, the evaluation is written but `cross_verified = false` until the assigned Faculty Mentor reviews it against their own observations and sets `cross_verified = true` (or flags a discrepancy via `cross_verification_note`). Only cross-verified company evaluations count toward Placement Readiness and Leaderboard scoring.
Only authorized mentors can evaluate assigned interns.

### 7.16 AI Learning Hub *(NEW — Ecosystem PRD §6.2)*
Page: `/student/learning-hub`
Flow: `skill_gap_analysis.missing_skills` → match against `learning_resources.skill_tag` → seed `student_learning_progress` (status `recommended`) → student marks `in_progress`/`completed` → re-run `compute-skill-gap` to reflect updated skill state.

### 7.17 AI Resume Analyzer *(NEW — Ecosystem PRD §6.2)*
Triggered on resume upload (§7.2). Calls `analyze-resume` Edge Function; stores structured suggestions in `students.resume_analysis`; surfaced on Placement Readiness page ("Resume Insights").

---

## 8. Internship Health Score

Required inputs:
```text
Attendance %
Task Completion Rate
Milestone Adherence
Work-Log Consistency
```

V1 weights (configurable via `scoring_config.weights` where `key = 'health_score'`, not hardcoded in application code):

```text
Health Score =
Attendance × 0.30
+ Task Completion × 0.30
+ Milestone Adherence × 0.20
+ Work-Log Consistency × 0.20
```

All components are 0–100.

```text
80–100 = Healthy
60–79  = Needs Attention
0–59   = At Risk
```

Store historical results in `internship_health_snapshots` via the `compute-health-score` Edge Function on a nightly `pg_cron` schedule plus on-demand recompute after key events (task review, milestone update, attendance submission).

---

## 9. At-Risk Detection

V1 is transparent/rule-based, not predictive ML. `risk_flags.source` is hardcoded to `'rule_based'` to prevent this boundary being crossed later without a deliberate schema change.

Example signals:
```text
Health Score below threshold
OR low attendance
OR multiple overdue tasks
OR overdue milestones
OR poor work-log consistency
```

`risk_flags` columns: `assignment_id, signal, risk_level, source, detected_at, resolved_at, intervention_notes`.

The UI must explain why a student was flagged (surface `signal` + underlying values, not just a risk label).

---

## 10. AI Internship Recommendations

Inputs: student profile, student skills, internship required skills, eligibility.
V1 combines skill overlap, eligibility, and profile relevance; AI may generate a concise explanation.
Output: `internship_id, match_score, matched_skills, missing_skills, explanation`.
Transient — not persisted unless the PRD calls for history; do not claim a trained ML model exists.

---

## 11. AI Skill-Gap Analysis

Compare current `students.skills` against target `internships.required_skills`. Return `strengths, missing_skills, recommendations`. Store in `skill_gap_analysis`. Re-triggered whenever `student_learning_progress` marks a resource `completed`, so the Learning Hub loop closes.

---

## 12. AI Intern Allocator — Scoring Detail *(NEW)*

Weights live in `scoring_config` where `key = 'allocator'`. V1 implementation: cosine similarity between a normalized student skill-vector and the role's required-skill-vector, blended with normalized academic performance and average past evaluation rating. Output must include a per-factor breakdown (`allocator_score_breakdown`) so the company sees *why* a student ranked where they did — this is the "explainable, not black-box" requirement from InternHub PRD §5.

---

## 13. Leaderboard *(NEW)*

Weights live in `scoring_config` where `key = 'leaderboard'`. Computed weekly by `compute-leaderboard` from attendance, milestone completion, and cross-verified evaluation ratings. Visibility gated by `admin_settings.leaderboard_enabled`; only top-N ranks are publicly visible even when enabled — a student's own rank is always visible to them regardless of the setting (PRD Risk mitigation: "leaderboard could discourage lower performers").

---

## 14. AI Edge Functions — Secure Flow

```text
React
 ↓
Supabase Edge Function
 ↓
Authenticate + authorize
 ↓
Fetch minimum authorized data
 ↓
AI provider / scoring logic
 ↓
Validate response
 ↓
Store result if needed
 ↓
Return result
```

Never expose an AI API key in React/Vite code. Full function list: `compute-health-score`, `detect-risk-flags`, `compute-placement-readiness`, `run-intern-allocator`, `compute-skill-gap`, `generate-weekly-report-draft`, `analyze-resume`, `compute-leaderboard`, `generate-certificate`, `verify-certificate`, `recommend-internships`.

---

## 15. Placement Readiness

Combine: skill match, internship performance (from Health Score history), completed projects/internships, **cross-verified** evaluation scores. Store: `readiness_score, skill_score, internship_score, evaluation_score, recommendations`. Weights in `scoring_config` (`key = 'placement_readiness'`). Result must be understandable and show improvement areas — never an unexplained AI judgment.

---

## 16. PPO / Conversion Flagging *(NEW — InternHub §6.3)*

Page: `/company/interns/:id` → "Flag for PPO"
`ppo_flags` columns: `assignment_id, flagged_by, conversion_type (ppo | startup_pathway), status (flagged | offer_extended | converted | declined), notes`. Feeds the "Placement conversion" success metric.

---

## 17. Certificate + QR Verification

Certificate generation requires: `internship_assignments.status = 'completed' AND final evaluation exists AND (if company-rated) evaluation.cross_verified = true`.

Certificate contains: Student Name, Company, Internship, Duration, Evaluation Summary, Certificate Number, Issue Date, QR Code.

QR route: `/verify/:token` (public, read-only). May show: student name, internship, company, start/end dates, certificate status. Must never expose resume, phone, private evaluations, work logs, or attendance detail. Every verification hit logs to `certificate_verifications`.

---

## 18. Notifications

Required events:
```text
Application status changed
Faculty approval
Allocator shortlist ready              [NEW]
Company selection
Task assigned / reviewed
Proof submission required              [NEW]
Feedback added
Cross-verification requested/completed [NEW]
Risk detected
Learning resource recommended          [NEW]
PPO flag raised                        [NEW]
Certificate generated
```

Table: `notifications(recipient_id, type, payload, read, created_at)`. Users mark their own notifications read.

---

## 19. Dashboards

### Student
Application count, active internship, geo-fence attendance status, task progress + pending proofs, Health Score, AI recommendations, skill gaps, Learning Hub progress, resume insights, readiness score, leaderboard rank, certificate status, notifications.

### Faculty
Assigned students, pending approvals, pending cross-verifications, active internships, attendance, at-risk students, task/milestone progress, evaluations, batch/department placement analytics.

### Company
Listings, applicants + Allocator shortlist, selected interns, task progress + proof review queue, attendance, evaluations, PPO flags, verification status.

### Admin
Students, faculty, companies (+ verification queue), departments, internships, active/completed internships, at-risk students, certificates, leaderboard config, scoring weights, platform analytics, audit log.

All dashboard values must come from database data, not hard-coded demo values.

---

## 20. Service Layer

```text
authService
profileService
departmentService              [NEW]
companyService
internshipService
applicationService
allocatorService                [NEW]
assignmentService
attendanceService
taskService
taskProofService                [NEW]
milestoneService
workLogService
reportService                   [NEW]
feedbackService
evaluationService
crossVerificationService        [NEW]
recommendationService
skillGapService
learningHubService              [NEW]
resumeAnalyzerService           [NEW]
healthService
riskService
readinessService
leaderboardService               [NEW]
ppoService                       [NEW]
certificateService
notificationService
adminSettingsService              [NEW]
```

Keep Supabase operations in services rather than scattering database queries across page components.

---

## 21. Validation

### Internship
Required: `title, description, required_skills, duration`. Company must be `verified` to publish.

### Application
Authenticated student; published internship; eligibility satisfied; no duplicate application.

### Attendance
Active assignment; valid date; one record per assignment/date; within configured geo-fence radius and time window (or faculty override recorded).

### Tasks
Student belongs to the assignment; valid due date; **submission requires a proof attachment before status can move to `submitted`**.

### Evaluations
Rater is an authorized mentor for that assignment. Company-submitted evaluations are not final until faculty cross-verification.

### Certificate
Internship completed; final evaluation exists and is cross-verified where applicable; unique certificate number.

---

## 22. Error Handling

Every operation should handle: Loading, Success, Validation Error, Authorization Error, Database Error, Network Error, **Geolocation Denied/Unavailable** (attendance-specific). User-facing messages should be simple and should never expose secrets.

---

## 23. Security

- Enable RLS on every sensitive table, including all new tables in §5.2.
- Never trust frontend role checks alone.
- Keep AI keys in Edge Function secrets.
- Validate uploads (resumes, proof attachments, certificates) for type/size.
- Protect private storage buckets; certificates bucket only exposes signed URLs via the verification flow.
- Prevent duplicate applications.
- Restrict evaluations to authorized mentors; restrict cross-verification to the assigned faculty mentor only.
- Restrict company data to its own records; restrict faculty data to assigned students/department.
- Keep certificate verification read-only.
- Record important admin actions (overrides, reissues, deactivations, scoring weight changes) to `audit_logs`.
- Geolocation coordinates are sensitive — store only what's needed for verification, not a continuous location trail.

---

## 24. Performance

- Paginate large lists (applicants, leaderboard, at-risk lists).
- Query only needed data.
- Index common foreign keys, status, and date filters, plus `leaderboard_scores(period, rank)` and `internship_applications(allocator_match_score)`.
- Avoid loading entire datasets into dashboards.
- Compute Health Score, Leaderboard, and Risk Flags on schedule (pg_cron), not on every page load.
- Use Realtime selectively (applications, assignment activity, notifications, leaderboard — throttled).
- Limit expensive AI requests (Allocator re-runs, resume analysis) with debouncing/rate limits.

---

## 25. Implementation Order

### Phase 1 — Foundation
```text
React/Vite, Supabase, env vars, Auth, Profiles, Departments, Roles, RLS, Layouts, Protected routes
```

### Phase 2 — Core Internship Flow
```text
Company profile + verification
Create/publish internship
Marketplace
Student application
Faculty approval
Company selection
Internship activation
```

### Phase 3 — Internship Management
```text
Geo-fenced attendance
Tasks + proof submissions
Milestones
Work logs
Reports (AI draft)
Feedback
Evaluation + cross-verification
```

### Phase 4 — Intelligence (Core)
```text
Health Score
At-Risk Detection
Placement Readiness
Dashboard analytics
```

### Phase 5 — AI Differentiators
```text
AI Recommendations
Skill-gap analysis
AI Intern Allocator
AI Learning Hub
AI Resume Analyzer
```

### Phase 6 — Engagement & Conversion
```text
Leaderboard
PPO flagging
```

### Phase 7 — Completion
```text
Internship completion
Certificate generation
QR verification
Notifications
```

### Phase 8 — Testing/Demo
```text
RLS tests, Role tests, Workflow tests, Responsive tests, Error tests, AI tests, Allocator explainability tests, Certificate verification tests, Deployment
```

---

## 26. End-to-End Acceptance Tests

**Test 1 — Application & Allocator:** Verified company publishes → student sees → student applies → faculty approves → Allocator ranks applicant → company reviews shortlist and selects → active assignment created.

**Test 2 — Monitoring:** Active internship → geo-fenced attendance → mentor task → student submits with proof → mentor reviews → work log → weekly report AI-drafted and edited → feedback/evaluation → company rating cross-verified by faculty → health score update.

**Test 3 — Risk:** Poor attendance/tasks/logs → health recalculation → threshold crossed → risk flag with visible reason → faculty sees and intervenes.

**Test 4 — Learning Loop:** Skill-gap analysis flags missing skill → Learning Hub recommends resource → student completes it → skill-gap re-run shows improvement.

**Test 5 — Leaderboard & PPO:** Verified attendance/milestones/ratings feed leaderboard score → top performer surfaces → company flags for PPO → status progresses to `offer_extended`.

**Test 6 — Certificate:** Internship completed + final evaluation (cross-verified if company-rated) → certificate generated → unique token → QR → public verification page shows only authenticity data.

---

## 27. V1 Technical Boundaries

Do not implement:
```text
Advanced predictive ML (risk detection remains rule-based; PRD explicitly notes no historical dataset for training)
Facial-recognition attendance
Blockchain certificates (hash-based simulation only, if needed)
Digital Twin
Internship DNA
Voice assistant
Multilingual AI
Native mobile app
Payment/stipend/payroll processing
```

Note: unlike the original InternIQ-only TRD, **gamification (Leaderboard) is explicitly IN scope** for this merged build per project decision — do not re-exclude it during implementation.

AI Chatbot remains phase-gated/optional per the merged PRD, not a V1 requirement.

---

## 28. Definition of Done

- [ ] All four roles authenticate; RLS blocks unauthorized data access on every new table.
- [ ] Verified company can publish an internship.
- [ ] Student can discover and apply.
- [ ] Faculty can approve/reject.
- [ ] AI Intern Allocator produces an explainable ranked shortlist.
- [ ] Company can select from the shortlist.
- [ ] Active internship is created.
- [ ] Student can submit geo-fenced attendance (with faculty override path).
- [ ] Mentors can assign tasks/milestones; students submit tasks with proof attachments.
- [ ] Student can submit work logs and an AI-drafted weekly report they can edit.
- [ ] Mentors can provide feedback/evaluations; faculty can cross-verify company ratings.
- [ ] Health Score is calculated from defined, configurable inputs.
- [ ] Risk flags show understandable reasons and are explicitly rule-based.
- [ ] Recommendations, skill-gap analysis, and Learning Hub loop all work end-to-end.
- [ ] Resume Analyzer produces suggestions on upload.
- [ ] Placement readiness is displayed with visible contributing factors.
- [ ] Leaderboard displays top performers; individual rank stays private otherwise.
- [ ] Company can flag interns for PPO conversion and track status.
- [ ] Completed internships (with cross-verified evaluations where applicable) can generate certificates.
- [ ] QR verification works without exposing private data.
- [ ] Notifications work for all required events, including the new ones.
- [ ] Dashboards use real database data, not hard-coded demo values.
- [ ] Admin can manage departments, verify companies, tune scoring weights, and toggle the leaderboard.
- [ ] Every admin override/reissue/deactivation writes to `audit_logs`.
- [ ] Core workflow works end-to-end, including the new Allocator → Learning Hub → Leaderboard → PPO paths.
