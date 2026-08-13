# Product Requirements Document — Interora

**Team:** AlphaStack  
**Product Type:** AI-Powered Internship Intelligence & Management Platform

---

## 1. Product Overview

Interora is a platform that connects students, faculty mentors, and companies to manage the full internship lifecycle — from discovery and application to tracking, evaluation, career readiness, and certification. It replaces scattered spreadsheets, emails, paper records, and manual approvals with one system for monitoring internship progress and outcomes.

**Problem it solves:** Colleges and companies often manage internships through disconnected channels, making it difficult to track student performance, identify struggling students early, coordinate approvals, and verify internship completion.

**Value proposition:** Interora provides a single source of truth for every stakeholder, combining internship management with AI-assisted recommendations, skill-gap analysis, weekly reporting, actionable dashboard insights, transparent risk detection, placement readiness scoring, and QR-verifiable certificates.

---

## 2. Target Users

- **Student** — Needs to build a profile, discover relevant internships, apply, track attendance/tasks/progress, receive feedback, identify skill gaps, understand placement readiness, and obtain a verifiable certificate.
- **Faculty Mentor** — Needs to review applications, monitor assigned students, approve internships, provide feedback, identify at-risk students, and evaluate performance.
- **Company / Industry Mentor** — Needs to create internships, review/select applicants, assign tasks and milestones, monitor interns, provide feedback, and complete evaluations.
- **Admin** — Needs platform-wide oversight of users, internships, applications, certificates, analytics, roles, and exceptions.

---

## 3. Core Features for Version 1 (MUST-HAVE)

### Authentication & Access
- Role-based signup/login for Student, Faculty, Company Mentor, and Admin.
- Role-based routing and access control.

### Student Profile & Resume
- Profile containing education, skills, interests, projects, and resume.
- Editable skills used for recommendations and skill-gap analysis.
- Resume upload and basic resume information.

### Internship Marketplace
- Company mentors create internship listings with title, description, required skills, duration, stipend, eligibility, and other essential details.
- Students browse, search, filter, and view available internships.

### AI Internship Recommendation
- Recommend internships using transparent profile/skill matching.
- Show relevant matched skills and missing/less-matched skills.
- No claim of a trained ML model in V1.

### Internship Applications
- Students apply to internships.
- Students track application status.
- Supported statuses include Applied, Under Review, Rejected, Selected, and Approved.

### Faculty / Company Approval Workflow
- Student submits application.
- Faculty reviews the application.
- Approved applications proceed to Company Mentor review.
- Company Mentor selects the final candidate.
- The exact approval flow can be configured according to institutional requirements.

### Internship Management
- Selected and confirmed students receive an Active internship record.
- Record includes student, company, mentors, dates, status, and internship details.
- Internship progresses through Upcoming, Active, and Completed states.

### Attendance
- Daily student attendance submission.
- Basic check-in/check-out or present/absent tracking.
- Attendance percentage is available for monitoring and health scoring.

### Tasks
- Faculty/company mentors assign tasks.
- Students view, update, and submit tasks.
- Mentors can review task completion.

### Milestones
- Mentors define key internship milestones.
- Milestone status and progress are tracked against deadlines.

### Work Logs
- Students submit daily or weekly work logs.
- Mentors can view and comment on submitted logs.

### AI Weekly Report Generation
- Generate a draft weekly internship report from work logs, completed tasks, milestones, and learning activities.
- Student reviews and edits the generated report before submission.
- Faculty/company mentors can review the submitted report.

### Mentor Feedback
- Faculty and company mentors provide feedback on tasks, milestones, reports, or overall performance.

### Performance Evaluation
- Mentors evaluate students using defined criteria at milestones and/or internship completion.

### Internship Health Score
- Calculate a transparent score using defined signals such as attendance percentage, task completion, milestone adherence, and work-log consistency.
- Display the current health status and contributing factors.

### At-Risk Student Detection
- Identify students/internships at risk using transparent threshold/rule-based signals such as low attendance, overdue tasks, delayed milestones, and low activity.
- No predictive ML model is required for V1.

### AI Skill-Gap Analysis
- Compare student skills against required skills for target/applied internships.
- Identify missing or weak skills.
- Provide practical improvement recommendations.

### Placement Readiness Score
- Provide a transparent readiness score based on relevant factors such as skill match, internship performance, completed projects/internships, and evaluation results.
- Provide recommendations for improving readiness.
- V1 does not require a trained ML model.

### AI Insights
- Provide actionable insights on role-specific dashboards using available internship data.
- Examples include declining attendance, overdue tasks, delayed milestones, low activity, students requiring intervention, and completion trends.
- Insights should support decisions rather than replace human judgment.

### Certificate Generation
- After successful internship completion and final evaluation/completion approval, the system generates a certificate.
- Certificate contains essential completion information and a unique certificate identifier.

### QR Certificate Verification
- Certificate contains a QR code linking to a public verification page.
- Verification page confirms authenticity and shows only appropriate certificate information.
- Private student information must not be exposed.

### Notifications
- In-app notifications for application status changes, approvals, task assignments, feedback, report reviews, risk alerts, and certificate availability.

### UX & Navigation Organization
- All required capabilities remain available, but they should not all appear as separate top-level sidebar tabs.
- The interface should use a small number of task-oriented navigation groups so users can understand what to do next.
- Student navigation groups: **Home**, **Internship Journey**, **My Work**, **AI & Career**, **Completion**, **Profile & Settings**.
- Faculty navigation groups: **Home**, **Approvals**, **Students & Internships**, **Monitoring**, **Insights & Analytics**, **Completion & Notifications**.
- Company navigation groups: **Home**, **Internships**, **Applicants & Allocator**, **My Interns**, **Internship Operations**, **Evaluations & Conversion**, **Company Profile**.
- Admin navigation groups: **Home**, **People**, **Internships & Applications**, **Departments & Companies**, **Certificates**, **Analytics & AI**, **System**.
- Features such as Attendance, Tasks, Milestones, Work Logs, Reports, Feedback, Health/Risk, Learning Hub, Resume Analyzer, Leaderboard, PPO, and QR verification remain accessible inside the appropriate group or workflow; they are not deleted.
- The dashboard is the role-specific starting point and should show the most important pending actions, current status, alerts, and shortcuts rather than duplicating every module.
- Optional/phase-gated capabilities, including AI Chatbot where present in the technical scope, must be clearly labeled as optional and must not block the core internship lifecycle.

**Retained differentiators:** The implementation may also expose the AI Intern Allocator, AI Learning Hub, AI Resume Analyzer, proof attachments, faculty cross-verification, Leaderboard, PPO/conversion tracking, company/partner quality analytics, configurable scoring, and company verification where required by the current technical scope. These are retained capabilities; the UX grouping above controls where they appear, not whether they exist.

### Dashboard Analytics
- **Student Dashboard:** personal internship progress, tasks, attendance, recommendations, skill gaps, readiness, and relevant AI insights.
- **Faculty Dashboard:** assigned students, applications, internship progress, risk alerts, analytics, and relevant AI insights.
- **Company Dashboard:** internships, applications, interns, tasks, milestones, evaluations, analytics, and relevant AI insights.
- **Admin Dashboard:** platform-wide users, internships, applications, completion, certificates, analytics, and AI insights.

---

## 4. Out of Scope for Version 1

- Advanced machine-learning models requiring historical training datasets.
- Facial-recognition attendance.
- Blockchain-based certificates.
- Digital Twin of a student/internship.
- “Internship DNA” profiling.
- Voice assistant.
- Advanced gamification such as badges, leaderboards, and streak rewards.
- Multilingual AI support.
- AI chatbot support.
- Advanced predictive analytics requiring large historical datasets.
- Any other advanced feature not explicitly required for V1.

---

## 5. User Roles and Permissions

| Action | Student | Faculty Mentor | Company Mentor | Admin |
|---|---|---|---|---|
| View own profile/data | Yes | Yes, assigned students | Yes, own interns | Yes, all |
| Create internship listing | No | No | Yes | Yes |
| Apply to internship | Yes | No | No | No |
| Review application | No | Yes | Yes, after faculty review | Yes |
| Final candidate selection | No | No | Yes | Yes, override |
| Assign tasks/milestones | No | Yes, assigned students | Yes, own interns | Override if needed |
| Submit attendance/work logs | Yes, own records | No | No | No |
| Give feedback | No | Yes | Yes | No |
| Evaluate performance | No | Yes | Yes | Override if needed |
| Approve internship completion | No | Yes, where assigned | Yes, where assigned | Yes |
| Trigger certificate process | No | Yes, after required approval | Yes, after required approval | Yes |
| View own certificate | Yes | No | No | Yes |
| Verify certificate | Yes, through public page | Yes, through public page | Yes, through public page | Yes |
| Delete users/records | No | No | No | Yes |
| View platform-wide analytics | No | No | No | Yes |

---

## 6. Key Business Rules

- Only Company Mentors and Admins acting on their behalf can create internship listings.
- Only Students can apply for internships.
- The standard V1 application flow is: **Student applies → Faculty review → Company review → Company selection → Internship activated**.
- The institution may configure the approval flow if its process differs.
- An internship becomes **Active** only after the Company Mentor selects/confirms the student and required approval is complete.
- Only the assigned Faculty Mentor or Company Mentor can assign tasks and milestones for that internship.
- Only the enrolled Student can submit their own attendance and work logs.
- Internship Health Score uses a fixed, transparent formula based on defined indicators; it is not a black-box model.
- Risk levels (Low/Medium/High) are determined using transparent rule-based thresholds for V1.
- AI recommendations, skill-gap analysis, weekly reports, and dashboard insights must be presented as assistance, not as guaranteed decisions.
- AI Weekly Reports are drafts; students must review/edit them before submission.
- Placement Readiness Score must show understandable contributing factors rather than being presented as an unexplained AI judgment.
- A certificate can be generated only after the internship is marked Completed, required evaluation is submitted, and completion is approved.
- The system generates the certificate after all certificate conditions are satisfied; Faculty/Company Mentors approve or trigger the completion process rather than manually creating certificate files.
- Admin can override or reissue a certificate when necessary.
- QR verification opens a read-only verification page showing certificate authenticity data such as student name, internship, dates, issuing company, and certificate ID, without exposing private information.
- Faculty can access only assigned student data; Company Mentors can access only their own internship/intern data; Admin has platform-wide access.
- Role-based access must be enforced at the system/data level, not only by hiding UI elements.

---

## 7. Success Criteria

- A student can register, log in, and complete their profile.
- A company can create and publish an internship listing.
- A student can search, view, and apply for an internship.
- Faculty can review and approve/reject an application.
- A company can review approved applicants, select a candidate, and activate the internship.
- Students can record attendance, complete tasks, submit work logs, and track milestones.
- Faculty and company mentors can monitor assigned students and provide feedback/evaluations.
- The system calculates an Internship Health Score using defined transparent rules.
- The system flags at-risk students/internships using defined threshold signals.
- The system generates relevant internship recommendations and skill-gap analysis.
- The system generates a draft weekly report from available internship activity data, and the student can edit it before submission.
- The system generates a Placement Readiness Score with understandable contributing factors and improvement recommendations.
- Role-specific dashboards display relevant analytics and actionable AI Insights.
- A completed internship can generate a certificate only after the required completion and evaluation conditions are satisfied.
- The generated certificate contains a working QR verification link.
- The public verification page confirms certificate authenticity without exposing private student data.
- Each role can access only the data and actions permitted by the permission rules.
