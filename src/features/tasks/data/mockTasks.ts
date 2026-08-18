export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  actualHours: number;
  category: string;
  internshipId: string;
  assignedBy: string;
  completedAt?: string;
  notes?: string;
}

export interface WorkLogRecord {
  id: string;
  date: string;
  taskId: string;
  taskTitle: string;
  hoursWorked: number;
  summary: string;
  completedWork: string;
  blockers?: string;
  nextPlan?: string;
}

export const initialMockTasks: TaskRecord[] = [
  {
    id: 'task_01',
    title: 'Understand Project Architecture & Guidelines',
    description: 'Review Interora PRD, TRD, and architecture diagrams. Understand component boundaries and coding conventions.',
    assignedDate: '2026-08-01',
    dueDate: '2026-08-03',
    status: 'Completed',
    priority: 'High',
    estimatedHours: 6,
    actualHours: 5,
    category: 'Architecture',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    completedAt: '2026-08-03 04:30 PM',
    notes: 'Reviewed all PRD documentation and verified folder taxonomy.',
  },
  {
    id: 'task_02',
    title: 'Set Up Development Environment & Tailwind Config',
    description: 'Configure Vite build tools, Tailwind CSS v4 imports, path aliases (@/*), and base UI component primitives.',
    assignedDate: '2026-08-03',
    dueDate: '2026-08-05',
    status: 'Completed',
    priority: 'High',
    estimatedHours: 8,
    actualHours: 8,
    category: 'Setup',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    completedAt: '2026-08-05 05:00 PM',
    notes: 'Configured Tailwind CSS v4 and confirmed alias resolution.',
  },
  {
    id: 'task_03',
    title: 'Implement Student Dashboard & Profile Components',
    description: 'Build responsive Student Dashboard layout with quick key metrics, active internship card, and profile form.',
    assignedDate: '2026-08-05',
    dueDate: '2026-08-08',
    status: 'Completed',
    priority: 'Medium',
    estimatedHours: 12,
    actualHours: 11,
    category: 'Frontend UI',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    completedAt: '2026-08-08 06:15 PM',
    notes: 'Completed view and edit modes for student profile.',
  },
  {
    id: 'task_04',
    title: 'Build Internship Discovery Marketplace & Filter System',
    description: 'Develop marketplace search bar and multi-select filters for location, work mode, stipend, and duration.',
    assignedDate: '2026-08-08',
    dueDate: '2026-08-11',
    status: 'Completed',
    priority: 'High',
    estimatedHours: 10,
    actualHours: 10,
    category: 'Frontend UI',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    completedAt: '2026-08-11 05:30 PM',
    notes: 'Audited and verified 6 combined search & filter controls.',
  },
  {
    id: 'task_05',
    title: 'Create Applications Management & Step Timeline',
    description: 'Build applications portal with status badges (Pending, Approved, Selected, Rejected) and withdrawal modal.',
    assignedDate: '2026-08-11',
    dueDate: '2026-08-13',
    status: 'Completed',
    priority: 'Medium',
    estimatedHours: 10,
    actualHours: 9,
    category: 'Frontend UI',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    completedAt: '2026-08-13 04:45 PM',
    notes: 'Wired step timeline and application status progression.',
  },
  {
    id: 'task_06',
    title: 'Build Student Daily Tasks & Work Logs Module',
    description: 'Implement task list, filter controls, state transitions (To Do -> In Progress -> Completed), and work log modal form.',
    assignedDate: '2026-08-14',
    dueDate: '2026-08-18',
    status: 'In Progress',
    priority: 'High',
    estimatedHours: 14,
    actualHours: 6,
    category: 'Frontend UI',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    notes: 'Currently working on task status transitions and log modal form.',
  },
  {
    id: 'task_07',
    title: 'Integrate API Validation & Error Handling Bounds',
    description: 'Add error boundary components and input sanitization routines for form controls across student modules.',
    assignedDate: '2026-08-15',
    dueDate: '2026-08-20',
    status: 'To Do',
    priority: 'Medium',
    estimatedHours: 8,
    actualHours: 0,
    category: 'Quality Assurance',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
  },
  {
    id: 'task_08',
    title: 'Write Integration Test Suites & Accessibility Audit',
    description: 'Execute automated unit tests and audit color contrast ratios, keyboard navigation, and aria attributes.',
    assignedDate: '2026-08-16',
    dueDate: '2026-08-22',
    status: 'To Do',
    priority: 'Low',
    estimatedHours: 10,
    actualHours: 0,
    category: 'Testing',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
  },
  {
    id: 'task_09',
    title: 'Refactor OAuth Callback & Supabase Schema Hooks',
    description: 'Prepare frontend types for Supabase Row Level Security policy binding (Blocked until Supabase phase).',
    assignedDate: '2026-08-12',
    dueDate: '2026-08-25',
    status: 'Blocked',
    priority: 'High',
    estimatedHours: 12,
    actualHours: 2,
    category: 'Backend Architecture',
    internshipId: 'int_01',
    assignedBy: 'Sarah Jenkins (Lead Engineer)',
    notes: 'Blocked pending backend database schema deployment in future phase.',
  },
];

export const initialMockWorkLogs: WorkLogRecord[] = [
  {
    id: 'log_01',
    date: '2026-08-03',
    taskId: 'task_01',
    taskTitle: 'Understand Project Architecture & Guidelines',
    hoursWorked: 5.0,
    summary: 'Studied PRD & TRD documents and verified codebase directory taxonomy.',
    completedWork: 'Read all architectural documentation and verified file layout.',
    blockers: 'None',
    nextPlan: 'Set up development environment and path aliases.',
  },
  {
    id: 'log_02',
    date: '2026-08-05',
    taskId: 'task_02',
    taskTitle: 'Set Up Development Environment & Tailwind Config',
    hoursWorked: 8.0,
    summary: 'Configured Vite, Tailwind CSS v4, and base UI component primitives.',
    completedWork: 'Built Button, Card, Badge, Input, Select, and Modal primitives.',
    blockers: 'None',
    nextPlan: 'Build Student Dashboard and Profile interfaces.',
  },
  {
    id: 'log_03',
    date: '2026-08-08',
    taskId: 'task_03',
    taskTitle: 'Implement Student Dashboard & Profile Components',
    hoursWorked: 7.5,
    summary: 'Implemented dashboard layout, key stats banner, and profile editor.',
    completedWork: 'Created StudentDashboard.tsx and StudentProfile.tsx with view/edit state.',
    blockers: 'None',
    nextPlan: 'Build Internship Marketplace page.',
  },
  {
    id: 'log_04',
    date: '2026-08-11',
    taskId: 'task_04',
    taskTitle: 'Build Internship Discovery Marketplace & Filter System',
    hoursWorked: 8.0,
    summary: 'Created marketplace UI with 6 combined search and filter controls.',
    completedWork: 'Built MarketplacePage, InternshipCard, InternshipSearch, and InternshipFilters.',
    blockers: 'None',
    nextPlan: 'Develop Applications Management portal.',
  },
  {
    id: 'log_05',
    date: '2026-08-13',
    taskId: 'task_05',
    taskTitle: 'Create Applications Management & Step Timeline',
    hoursWorked: 6.5,
    summary: 'Built applications portal with status filters and step timeline.',
    completedWork: 'Created ApplicationsPage, ApplicationDetailsPage, and withdrawal modal.',
    blockers: 'None',
    nextPlan: 'Implement Student Tasks & Work Logs module.',
  },
  {
    id: 'log_06',
    date: '2026-08-14',
    taskId: 'task_06',
    taskTitle: 'Build Student Daily Tasks & Work Logs Module',
    hoursWorked: 6.0,
    summary: 'Started building tasks list view, filter controls, and task status buttons.',
    completedWork: 'Designed task card component and defined TypeScript interfaces.',
    blockers: 'None',
    nextPlan: 'Complete Work Logs view and Add Log modal form.',
  },
];