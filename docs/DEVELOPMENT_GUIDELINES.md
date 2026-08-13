# DEVELOPMENT GUIDELINES — INTERORA

Product Name: **Interora**  
Tagline: **Learn • Intern • Grow**  
Team: **AlphaStack**

---

## 1. Code & Component Guidelines

### Clean & Modular Architecture
- Keep feature-specific logic inside its respective `src/features/<feature-name>/` directory.
- Use shared UI components from `src/components/ui/` instead of re-implementing buttons, inputs, or cards.
- Do not build complex business or API logic directly inside base UI components (`src/components/ui/`).
- Avoid giant files (>250 lines). Split complex pages into smaller sub-components.

### Naming Conventions
- Component files: `PascalCase.tsx` (e.g., `StatCard.tsx`, `StudentLayout.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuth.ts`)
- Utilities/Services: `camelCase.ts` (e.g., `supabaseClient.ts`, `formatters.ts`)
- Feature directories: `kebab-case` or lowercase (e.g., `student`, `certificates`)

---

## 2. Visual Design & Styling Standard

- Interora uses a **Light, Clean, Professional SaaS Design System**.
- **Backgrounds:** Crisp slate/gray backgrounds (`bg-slate-50`, `bg-gray-50`) with white card surfaces (`bg-white`).
- **Typography:** Dark slate/gray readable text (`text-slate-900`, `text-slate-700`).
- **Brand Colors:** Indigo/Violet Interora accents (`#4f46e5`, `bg-indigo-600`, `text-indigo-600`).
- **Borders & Shadows:** Subtle light borders (`border-slate-200`) and soft shadows (`shadow-sm`).
- **STRICTLY PROHIBITED:**
  - Dark themes
  - Neon colors
  - Heavy glassmorphism / blurred glows
  - Excessive decorative animations
  - Cartoonish overly rounded cards

---

## 3. Git Collaboration & Pull Request Workflow

1. **Branch Naming Standard:**
   - `feature/student-portal`
   - `feature/faculty-company`
   - `feature/admin-ai`
   - `fix/<short-description>`

2. **Commit Messages:**
   - Keep commits small, descriptive, and atomic.
   - Example: `feat(student): add active internship progress summary card`

3. **Pre-PR Verification:**
   - ALWAYS run local build check before creating PR:
     ```bash
     npm run build
     ```
   - Fix all TypeScript errors and linting warnings before requesting review.

4. **Merging Strategy:**
   - Never push directly to `main`.
   - Open a Pull Request on GitHub and request review from at least one team member.
