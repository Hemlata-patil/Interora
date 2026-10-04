import { Prisma } from '@prisma/client';
import prisma from './prisma.service';
import { AppError } from '../middleware/errorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface MarketplaceFilters {
  industryDomain?: string;
  workMode?: 'on_site' | 'remote' | 'hybrid';
  internshipType?: 'full_time' | 'part_time';
  search?: string;
  companyId?: string;
  scope?: 'mine' | 'all';
  status?: 'draft' | 'open' | 'closed' | 'archived' | 'all';
}

export interface CreatePostingInput {
  title: string;
  description: string;
  industryDomain: string;
  location?: string;
  workMode: 'on_site' | 'remote' | 'hybrid';
  internshipType: 'full_time' | 'part_time';
  duration: string;
  stipend?: string;
  eligibility?: string;
  vacancies: number;
  skills?: string[];
  applicationDeadline?: string | null;
  status?: 'draft' | 'open' | 'closed' | 'archived';
  companyId?: string; // only used if created by admin
}

export interface UpdatePostingInput {
  title?: string;
  description?: string;
  industryDomain?: string;
  location?: string;
  workMode?: 'on_site' | 'remote' | 'hybrid';
  internshipType?: 'full_time' | 'part_time';
  duration?: string;
  stipend?: string;
  eligibility?: string;
  vacancies?: number;
  skills?: string[];
  applicationDeadline?: string | null;
  status?: 'draft' | 'open' | 'closed' | 'archived';
  companyId?: string; // only admin may reassign company
}

export interface CreateTaskTemplateInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expectedDays?: number;
}

export interface UpdateTaskTemplateInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expectedDays?: number;
}

export interface CreateMilestoneTemplateInput {
  title: string;
  description?: string;
  sequenceOrder: number;
}

export interface UpdateMilestoneTemplateInput {
  title?: string;
  description?: string;
  sequenceOrder?: number;
}

export interface UserContext {
  id: string;
  role: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Safe Select Projections
// ─────────────────────────────────────────────────────────────────────────────

const COMPANY_BASIC_SELECT = {
  id: true,
  companyName: true,
  industryDomain: true,
  website: true,
} as const;

const TASK_TEMPLATE_SELECT = {
  id: true,
  internshipId: true,
  title: true,
  description: true,
  priority: true,
  expectedDays: true,
  createdAt: true,
} as const;

const MILESTONE_TEMPLATE_SELECT = {
  id: true,
  internshipId: true,
  title: true,
  description: true,
  sequenceOrder: true,
  createdAt: true,
} as const;

const POSTING_MARKETPLACE_SELECT = {
  id: true,
  companyId: true,
  title: true,
  description: true,
  industryDomain: true,
  location: true,
  workMode: true,
  internshipType: true,
  duration: true,
  stipend: true,
  eligibility: true,
  vacancies: true,
  skills: true,
  applicationDeadline: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: COMPANY_BASIC_SELECT,
  },
  taskTemplates: {
    select: TASK_TEMPLATE_SELECT,
    orderBy: { createdAt: 'asc' },
  },
  milestoneTemplates: {
    select: MILESTONE_TEMPLATE_SELECT,
    orderBy: { sequenceOrder: 'asc' },
  },
  _count: {
    select: {
      applications: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Marketplace Listing: GET /api/postings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns postings according to scope:
 * - Public marketplace (scope !== 'mine'):
 *   - status = 'open'
 *   - applicationDeadline is either null or >= current timestamp
 * - Company management (scope === 'mine' or companyId filtered with company auth):
 *   - companyId = authenticated company's ID
 *   - includes all statuses (draft, open, closed)
 * - ordered newest first
 */
export async function listMarketplacePostings(
  filters: MarketplaceFilters = {},
  user?: UserContext
) {
  const where: Prisma.InternshipPostingWhereInput = {};

  if (filters.scope === 'mine' || (filters.companyId && user?.role === 'company')) {
    if (!user) {
      throw new AppError(401, 'Authentication required to view company postings.');
    }
    if (user.role === 'company') {
      where.companyId = user.id;
    } else if (user.role === 'admin') {
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }
    } else {
      throw new AppError(403, 'Forbidden. Only companies and administrators can view company postings.');
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status as any;
    }
  } else {
    // Public / Student marketplace view:
    const now = new Date();
    where.status = 'open';
    where.OR = [
      { applicationDeadline: null },
      { applicationDeadline: { gte: now } },
    ];
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
  }

  if (filters.industryDomain) {
    where.industryDomain = {
      equals: filters.industryDomain,
      mode: 'insensitive',
    };
  }

  if (filters.workMode) {
    where.workMode = filters.workMode;
  }

  if (filters.internshipType) {
    where.internshipType = filters.internshipType;
  }

  if (filters.search) {
    const term = filters.search.trim();
    if (term.length > 0) {
      where.AND = [
        {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { company: { companyName: { contains: term, mode: 'insensitive' } } },
          ],
        },
      ];
    }
  }

  return prisma.internshipPosting.findMany({
    where,
    select: POSTING_MARKETPLACE_SELECT,
    orderBy: { createdAt: 'desc' },
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. Single Posting: GET /api/postings/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieves a single posting with basic company info, task templates,
 * and milestone templates.
 *
 * If the posting is not 'open', only an authorized company owner or admin
 * can view it. Otherwise returns HTTP 404.
 */
export async function getPostingById(id: string, user?: UserContext) {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      title: true,
      description: true,
      industryDomain: true,
      location: true,
      workMode: true,
      internshipType: true,
      duration: true,
      stipend: true,
      eligibility: true,
      vacancies: true,
      skills: true,
      applicationDeadline: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: COMPANY_BASIC_SELECT,
      },
      taskTemplates: {
        select: TASK_TEMPLATE_SELECT,
        orderBy: { createdAt: 'asc' },
      },
      milestoneTemplates: {
        select: MILESTONE_TEMPLATE_SELECT,
        orderBy: { sequenceOrder: 'asc' },
      },
    },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (posting.status !== 'open') {
    const isOwner = user && user.role === 'company' && user.id === posting.companyId;
    const isAdmin = user && user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw new AppError(404, 'Internship posting not found.');
    }
  }

  return posting;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Create Posting: POST /api/postings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new internship posting.
 *
 * - For company users: companyId is derived from authenticated profile.
 * - For admin: companyId may be selected explicitly.
 * - Verified company existence & approval status.
 * - Defaults to 'draft' for companies, 'open' for admin (unless explicitly specified).
 */
export async function createPosting(input: CreatePostingInput, user: UserContext) {
  let targetCompanyId: string;

  if (user.role === 'company') {
    targetCompanyId = user.id;
  } else if (user.role === 'admin') {
    if (!input.companyId) {
      throw new AppError(400, 'companyId is required when creating a posting as admin.');
    }
    targetCompanyId = input.companyId;
  } else {
    throw new AppError(403, 'Only companies and administrators can create internship postings.');
  }

  const company = await prisma.companyProfile.findUnique({
    where: { id: targetCompanyId },
    select: { id: true, companyName: true, approvalStatus: true },
  });

  if (!company) {
    throw new AppError(404, 'Target company profile not found.');
  }

  if (user.role === 'company' && company.approvalStatus !== 'approved') {
    throw new AppError(
      403,
      'Your company registration must be approved before you can create internship postings.'
    );
  }

  const defaultStatus = user.role === 'admin' ? 'open' : 'draft';
  const finalStatus = input.status ?? defaultStatus;

  const applicationDeadline = input.applicationDeadline
    ? new Date(input.applicationDeadline)
    : null;

  try {
    return await prisma.internshipPosting.create({
      data: {
        companyId: targetCompanyId,
        title: input.title,
        description: input.description,
        industryDomain: input.industryDomain,
        location: input.location ?? 'Remote / On-site',
        workMode: input.workMode,
        internshipType: input.internshipType,
        duration: input.duration,
        stipend: input.stipend ?? 'Unpaid / Paid',
        eligibility: input.eligibility ?? 'All Eligible',
        vacancies: input.vacancies,
        skills: input.skills ?? [],
        applicationDeadline,
        status: finalStatus,
      },
      select: {
        ...POSTING_MARKETPLACE_SELECT,
        companyId: true,
        updatedAt: true,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(409, 'An identical internship posting already exists.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Update Posting: PATCH /api/postings/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates an existing internship posting.
 * Company owners can only update their own company's postings.
 * Admins can update any posting and optionally reassign companyId.
 */
export async function updatePosting(id: string, input: UpdatePostingInput, user: UserContext) {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id },
    select: { id: true, companyId: true, title: true },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (user.role === 'company' && posting.companyId !== user.id) {
    throw new AppError(403, 'You are not authorized to modify postings for another company.');
  }

  const data: Prisma.InternshipPostingUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.industryDomain !== undefined) data.industryDomain = input.industryDomain;
  if (input.location !== undefined) data.location = input.location;
  if (input.workMode !== undefined) data.workMode = input.workMode;
  if (input.internshipType !== undefined) data.internshipType = input.internshipType;
  if (input.duration !== undefined) data.duration = input.duration;
  if (input.stipend !== undefined) data.stipend = input.stipend;
  if (input.eligibility !== undefined) data.eligibility = input.eligibility;
  if (input.vacancies !== undefined) data.vacancies = input.vacancies;
  if (input.skills !== undefined) data.skills = input.skills;
  if (input.applicationDeadline !== undefined) {
    data.applicationDeadline = input.applicationDeadline
      ? new Date(input.applicationDeadline)
      : null;
  }
  if (input.status !== undefined) data.status = input.status;

  if (user.role === 'admin' && input.companyId && input.companyId !== posting.companyId) {
    const targetCompany = await prisma.companyProfile.findUnique({
      where: { id: input.companyId },
      select: { id: true },
    });
    if (!targetCompany) {
      throw new AppError(404, 'Target company profile not found.');
    }
    data.company = { connect: { id: input.companyId } };
  }

  try {
    return await prisma.internshipPosting.update({
      where: { id },
      data,
      select: {
        ...POSTING_MARKETPLACE_SELECT,
        companyId: true,
        updatedAt: true,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Internship posting not found.');
      }
      if (err.code === 'P2002') {
        throw new AppError(409, 'Conflict occurred while updating the internship posting.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Delete Posting: DELETE /api/postings/:id
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deletes an internship posting if it has zero dependent applications
 * or active/past assignments.
 *
 * Returns HTTP 409 if dependent business records exist.
 */
export async function deletePosting(id: string, user: UserContext) {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      title: true,
      _count: {
        select: {
          applications: true,
          assignments: true,
        },
      },
    },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (user.role === 'company' && posting.companyId !== user.id) {
    throw new AppError(403, 'You are not authorized to delete postings for another company.');
  }

  if (posting._count.applications > 0 || posting._count.assignments > 0) {
    throw new AppError(
      409,
      `Cannot delete posting "${posting.title}" because it already has ${posting._count.applications} application(s) and ${posting._count.assignments} assignment(s) associated with it.`
    );
  }

  try {
    await prisma.internshipPosting.delete({ where: { id } });
    return { id, title: posting.title };
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Internship posting not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Task Template Operations
// ─────────────────────────────────────────────────────────────────────────────

async function verifyPostingOwnership(postingId: string, user: UserContext) {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id: postingId },
    select: { id: true, companyId: true, title: true },
  });

  if (!posting) {
    throw new AppError(404, 'Internship posting not found.');
  }

  if (user.role === 'company' && posting.companyId !== user.id) {
    throw new AppError(403, 'You are not authorized to manage templates for another company.');
  }

  return posting;
}

export async function createTaskTemplate(
  postingId: string,
  input: CreateTaskTemplateInput,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  try {
    return await prisma.internshipTaskTemplate.create({
      data: {
        internshipId: postingId,
        title: input.title,
        description: input.description,
        priority: input.priority ?? 'medium',
        expectedDays: input.expectedDays,
      },
      select: TASK_TEMPLATE_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(409, 'A task template with this title already exists for this posting.');
      }
    }
    throw err;
  }
}

export async function updateTaskTemplate(
  postingId: string,
  templateId: string,
  input: UpdateTaskTemplateInput,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  const template = await prisma.internshipTaskTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, internshipId: true },
  });

  if (!template) {
    throw new AppError(404, 'Task template not found.');
  }

  if (template.internshipId !== postingId) {
    throw new AppError(400, 'Task template does not belong to the specified posting.');
  }

  const data: Prisma.InternshipTaskTemplateUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.expectedDays !== undefined) data.expectedDays = input.expectedDays;

  try {
    return await prisma.internshipTaskTemplate.update({
      where: { id: templateId },
      data,
      select: TASK_TEMPLATE_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Task template not found.');
      }
    }
    throw err;
  }
}

export async function deleteTaskTemplate(
  postingId: string,
  templateId: string,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  const template = await prisma.internshipTaskTemplate.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      internshipId: true,
      title: true,
      _count: {
        select: {
          spawnedTasks: true,
        },
      },
    },
  });

  if (!template) {
    throw new AppError(404, 'Task template not found.');
  }

  if (template.internshipId !== postingId) {
    throw new AppError(400, 'Task template does not belong to the specified posting.');
  }

  if (template._count.spawnedTasks > 0) {
    throw new AppError(
      409,
      `Cannot delete task template "${template.title}" because it is currently referenced by ${template._count.spawnedTasks} spawned task(s).`
    );
  }

  try {
    await prisma.internshipTaskTemplate.delete({ where: { id: templateId } });
    return { id: templateId, title: template.title };
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Task template not found.');
      }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Milestone Template Operations
// ─────────────────────────────────────────────────────────────────────────────

export async function createMilestoneTemplate(
  postingId: string,
  input: CreateMilestoneTemplateInput,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  try {
    return await prisma.internshipMilestoneTemplate.create({
      data: {
        internshipId: postingId,
        title: input.title,
        description: input.description,
        sequenceOrder: input.sequenceOrder,
      },
      select: MILESTONE_TEMPLATE_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        throw new AppError(409, 'A milestone template with these details already exists.');
      }
    }
    throw err;
  }
}

export async function updateMilestoneTemplate(
  postingId: string,
  templateId: string,
  input: UpdateMilestoneTemplateInput,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  const template = await prisma.internshipMilestoneTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, internshipId: true },
  });

  if (!template) {
    throw new AppError(404, 'Milestone template not found.');
  }

  if (template.internshipId !== postingId) {
    throw new AppError(400, 'Milestone template does not belong to the specified posting.');
  }

  const data: Prisma.InternshipMilestoneTemplateUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.sequenceOrder !== undefined) data.sequenceOrder = input.sequenceOrder;

  try {
    return await prisma.internshipMilestoneTemplate.update({
      where: { id: templateId },
      data,
      select: MILESTONE_TEMPLATE_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Milestone template not found.');
      }
    }
    throw err;
  }
}

export async function deleteMilestoneTemplate(
  postingId: string,
  templateId: string,
  user: UserContext
) {
  await verifyPostingOwnership(postingId, user);

  const template = await prisma.internshipMilestoneTemplate.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      internshipId: true,
      title: true,
      _count: {
        select: {
          spawnedMilestones: true,
        },
      },
    },
  });

  if (!template) {
    throw new AppError(404, 'Milestone template not found.');
  }

  if (template.internshipId !== postingId) {
    throw new AppError(400, 'Milestone template does not belong to the specified posting.');
  }

  if (template._count.spawnedMilestones > 0) {
    throw new AppError(
      409,
      `Cannot delete milestone template "${template.title}" because it is currently referenced by ${template._count.spawnedMilestones} spawned milestone(s).`
    );
  }

  try {
    await prisma.internshipMilestoneTemplate.delete({ where: { id: templateId } });
    return { id: templateId, title: template.title };
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        throw new AppError(404, 'Milestone template not found.');
      }
    }
    throw err;
  }
}
