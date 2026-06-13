# FYP Management System — Project Instructions for Claude Code

This file contains everything Claude Code needs to understand, work on, and continue building this project without asking repeated questions.

---

## Project Overview

This is a **Final Year Project (FYP) Management System** built as a university capstone project.

The system manages group-based final year projects at a university level. It serves three user roles — Coordinator, Supervisor, and Student — each with their own dedicated portal, sidebar, and workflow.

The project is a **MERN stack** application:
- **Frontend:** React 18, Vite, React Router v6, Bootstrap 5, TailAdmin template
- **Backend:** Node.js, Express 5, MongoDB, Mongoose 9, JWT authentication
- **Database:** MongoDB (via Mongoose)

---

## Repository Structure

```
Fyp/
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── App.jsx                  # All routes defined here — has ProtectedRoute and AuthRoute
│       ├── layout/
│       │   ├── DefaultLayout.jsx    # Student layout wrapper
│       │   ├── CoordinatorLayout.jsx
│       │   └── SupervisorLayout.jsx
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── index.jsx        # Student sidebar
│       │   │   ├── CoordinatorSidebar.jsx
│       │   │   ├── SupervisorSidebar.jsx
│       │   │   └── SidebarLinkGroup.jsx
│       │   ├── Header/index.jsx     # Must read name and role from localStorage
│       │   └── Breadcrumbs/Breadcrumb.jsx
│       └── pages/
│           ├── Authentication/SignIn.jsx   # Must save name, role, token to localStorage
│           ├── Dashboard/Dashboard.jsx     # Student dashboard (post-login landing page)
│           ├── Project/
│           │   ├── Proposal.jsx            # Student submits proposal
│           │   ├── Documents.jsx           # Student uploads documents
│           │   └── Status.jsx              # Student project page (renamed from Project Status)
│           ├── Tasks/Tasks.jsx             # Student tasks — shows project name tag per task
│           ├── MeetingRequests.jsx
│           ├── Announcements.jsx           # Student view only — no post button
│           ├── SupervisorView.jsx
│           ├── CoordinatorView.jsx
│           ├── Coordinator/
│           │   ├── Dashboard.jsx
│           │   ├── Students.jsx            # Real API calls
│           │   ├── Supervisors.jsx         # Real API calls
│           │   ├── Projects.jsx            # Real API calls
│           │   ├── ProjectDetail.jsx       # Real API calls — 4 tabs: Overview, Milestones, Documents, Proposal
│           │   ├── Proposals.jsx           # Approve/reject UI — all 3 states shown
│           │   ├── Tasks.jsx               # Searchable project dropdown, All Projects option
│           │   ├── MeetingCalendar.jsx
│           │   ├── ScheduleMeeting.jsx
│           │   ├── MeetingRequests.jsx
│           │   ├── Announcements.jsx       # Coordinator can post announcements
│           │   └── Profile.jsx
│           └── Supervisor/
│               ├── Dashboard.jsx
<<<<<<< HEAD
│               ├── Projects.jsx             # NEW — list of assigned projects
│               ├── ProjectDetail.jsx        # NEW — single project detail for supervisor
│               ├── Proposals.jsx
│               ├── Tasks.jsx
=======
│               ├── Projects.jsx            # List of assigned projects
│               ├── ProjectDetail.jsx       # 4 tabs: Overview, Tasks, Submissions, Documents
│               ├── Proposals.jsx           # READ ONLY — supervisor cannot approve/reject
│               ├── Tasks.jsx               # Grouped by project, filter dropdown
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)
│               ├── MeetingCalendar.jsx
│               ├── MeetingRequests.jsx
│               ├── Announcements.jsx       # VIEW ONLY — no post button, no delete, coordinator announcements only
│               └── Profile.jsx
│
└── server/                         # Node.js/Express backend
    ├── index.js                     # Entry point, mounts all routes
    ├── config/db.js                 # MongoDB connection
    ├── middleware/
    │   └── auth.middleware.js       # authenticate + authorize middleware
    ├── models/
    │   ├── user.model.js
    │   ├── student-profile.model.js
    │   ├── supervisor-profile.model.js
    │   ├── project.model.js
    │   └── announcements.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── project.controller.js
    │   └── announcements.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   └── project.routes.js
    └── seed.js
```

---

## User Roles and Their Portals

### Coordinator
- The admin of the system. Only one coordinator exists, seeded via `seed.js`.
- Can create, read, update, delete students and supervisors.
- Can create, update, delete projects.
- Can assign and remove supervisors and students from projects.
- Can create announcements. Only coordinator can post announcements.
- Can review and approve/reject student proposals.
- Can create tasks for any project or all projects.
- Can mark project milestones as complete.
- Can review task submissions from students.
- Post-login landing page: `/coordinator/dashboard`
- Sidebar label: **Coordinator Panel**

### Supervisor
- Cannot create users or projects. Assigned to projects by coordinator.
- Can view all projects assigned to them.
- Can create tasks for their assigned projects (or all their projects at once).
- Can review task submissions from students.
- Can view proposals — READ ONLY, cannot approve or reject.
- Can view announcements — READ ONLY, cannot post or delete announcements.
- Can request meetings.
- Post-login landing page: `/supervisor/dashboard`
- Sidebar label: **Supervisor Panel**

### Student
- Cannot create users or projects. Added to a project by the coordinator.
- Has exactly ONE project. Everything they do is scoped to that project.
- Can submit a project proposal (one student from the group submits on behalf of all).
- Can upload documents.
- Can view and submit tasks.
- Can request meetings with supervisor or coordinator.
- Can view announcements — READ ONLY, cannot post announcements.
- Can view their project progress (milestones, group members, supervisor, coordinator).
- Post-login landing page: `/dashboard`
- Sidebar label: **Menu**

---

## Authentication

- JWT-based authentication.
- On login (`POST /api/auth/login`), the server returns a token and the user's role and name.
- The frontend stores token, role, and name in `localStorage`.
- localStorage keys used: `token`, `role`, `name`
- Role-based navigation: after login, the frontend redirects based on role:
  - `coordinator` → `/coordinator/dashboard`
  - `supervisor` → `/supervisor/dashboard`
  - `student` → `/dashboard`
- All protected API routes require `Authorization: Bearer <token>` header.
- Middleware: `authenticate` verifies token and attaches `req.user`. `authorize(...roles)` checks role.
- `ProtectedRoute` component in App.jsx checks localStorage for token and role, redirects to `/` if missing or wrong role.
- `AuthRoute` component in App.jsx redirects already-logged-in users away from the login page to their dashboard.
- Header component reads name and role from localStorage to display the logged-in user — never hardcoded.

---

## Known Bug — Currently Being Fixed

**Header shows hardcoded "M.Salman - Student" regardless of who is logged in.**

Root cause: Header component uses hardcoded dummy data instead of reading from localStorage.

Fix required:
1. `SignIn.jsx` must save `name` to localStorage after login alongside `token` and `role`
2. `Header/index.jsx` must read `name` and `role` from localStorage to display the correct user

This fix must be applied before testing any role-based pages.

---

## What is Currently Working (Backend)

### Auth
- `POST /api/auth/login` — fully working

### Users (Coordinator only)
- `POST /api/users` — create student or supervisor with full profile in a transaction
- `GET /api/users` — list all users, filter by `?role=student|supervisor`
- `GET /api/users/:id` — get one user with full profile
- `PUT /api/users/:id` — update user and profile
- `DELETE /api/users/:id` — delete user and profile in a transaction

### Projects (Coordinator only)
- `POST /api/projects` — create project
- `GET /api/projects` — list all projects
- `GET /api/projects/:id` — get one project with supervisor and students populated
- `PUT /api/projects/:id` — update project
- `PUT /api/projects/:id/supervisor` — assign or unassign supervisor
- `PUT /api/projects/:id/students` — assign student to project
- `DELETE /api/projects/:id/students/:studentId` — remove student
- `DELETE /api/projects/:id` — delete project

### Announcements
- `POST /api/announcements` — create announcement (no auth, incomplete)

---

## What is Missing (Backend — To Be Built)

<<<<<<< HEAD
These are all the backend features that need to be built. Do NOT build them yet. Frontend must be completed first.
=======
**Do NOT build any of these yet. Frontend must be fully verified first.**
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)

### Project model needs these new fields:
```js
supervisors: [{ type: ObjectId, ref: 'User' }]
coordinator: { type: ObjectId, ref: 'User' }
status: enum ['pending_proposal', 'active', 'completed']
milestones: [{ id, name, description, completed, completedAt }]
progress: Number
proposalId: ObjectId
```

### New models needed:
- **Proposal** — `{ title, description, problemStatement, techStack, groupMembers, submittedBy, attachmentUrl, status, coordinatorFeedback, submittedAt }`
- **Task** — `{ title, instructions, openDate, dueDate, projectId, createdBy, creatorRole, attachmentUrl, targetScope }`
- **TaskSubmission** — `{ taskId, submittedBy, projectId, fileUrl, submittedAt, status, feedback }`
- **Document** — `{ projectId, uploadedBy, type, fileName, fileUrl, size, uploadedAt }`
- **Meeting** — `{ requestedBy, requestedTo, projectId, proposedDate, status, notes }`

### New routes needed:
- `POST /api/proposals`, `GET /api/proposals`, `PUT /api/proposals/:id/review`
- `GET /api/projects/my` — student gets their project
- `GET /api/projects/assigned` — supervisor gets their projects
- `PUT /api/projects/:id/milestones/:milestoneId` — coordinator marks milestone complete
- `POST /api/tasks`, `GET /api/tasks`
- `POST /api/tasks/:id/submit`, `GET /api/tasks/submissions`, `PUT /api/tasks/submissions/:id/review`
- `POST /api/documents`, `GET /api/documents`
- `POST /api/meetings`, `GET /api/meetings`, `PUT /api/meetings/:id`
- `GET /api/announcements` — add auth

---

## What is Currently Working (Frontend)

### Coordinator
- Projects list, Project Detail, Students, Supervisors — **real API calls**
- Proposals page — approve/reject UI, all 3 states (pending/approved/rejected)
- Tasks page — searchable project dropdown, All Projects option, project tags
- ProjectDetail — 4 tabs: Overview, Milestones, Documents, Proposal
- All other pages — hardcoded dummy data

### Supervisor
- Projects list and Project Detail — **hardcoded dummy data**
- Tasks page — grouped by project, filter dropdown, no search bar in dropdown
- Proposals page — **read only**, no approve/reject buttons
- Announcements — **view only**, no post button, no delete buttons
- All other pages — hardcoded dummy data

### Student
- Tasks page — project name tag on every row, pending and submitted tabs
- All other pages — hardcoded dummy data
- Login page — **real API call**

---

## Frontend Conventions

### Always give full files
When modifying any frontend file, always return the complete updated file — never partial snippets or diffs.

### Styling approach
- Bootstrap 5 for layout (grid, flex, cards, badges, buttons, tables, progress bars)
- Inline styles for custom colors and fine-tuned spacing
- TailAdmin dark sidebar color: `#1e2433`
- Primary brand color: `#3c50e0`
- No Tailwind utility classes in component JSX
- Dark mode toggle exists in the header

### Component patterns
- Breadcrumb: `<Breadcrumb pageName="Page Name" />`
- All pages use Bootstrap card structure: `card border-0 shadow-sm`
- Sidebar active state: `sidebar-link-active` class

### Announcements rule
Only the coordinator can post announcements. Supervisor and student pages show announcements as view-only with no post, edit, or delete controls.

### Hardcoded data pattern
```js
// TODO (Backend): Replace with GET /api/...
```

---

## Current Frontend Work Sequence (Phases)

### Phase 1 — DONE ✅
- Renamed "Project Status" to "Project" in student sidebar and Status.jsx
- Added pending tasks alert widget on Status.jsx
- Updated Dashboard.jsx "View Details" to "View Project"

### Phase 2 — DONE ✅
- Added Projects to supervisor sidebar (replaced My Students)
- Created Supervisor/Projects.jsx and Supervisor/ProjectDetail.jsx
- Updated App.jsx with supervisor project routes

<<<<<<< HEAD
### Phase 3 — NEXT
- Update student Tasks page (`client/src/pages/Tasks/Tasks.jsx`)
  - Each task row must show which project it belongs to (project name tag)
  - Pending tab and Submitted tab must be clean and complete
- Update supervisor Tasks page (`client/src/pages/Supervisor/Tasks.jsx`)
  - Group tasks by project
  - Add a project filter dropdown at the top
  - Task creation form with project dropdown (shows only assigned projects)
  - No search bar needed in supervisor's project dropdown
- Update coordinator Tasks page (`client/src/pages/Coordinator/Tasks.jsx`)
  - Project tag on every submission row
  - "All Projects" option in the create task project dropdown
  - Coordinator sees all projects in the dropdown, searchable
=======
### Phase 3 — DONE ✅
- Student Tasks.jsx — project name tag on every row, fixed upload state bug
- Supervisor Tasks.jsx — grouped by project, filter dropdown, project tags
- Coordinator Tasks.jsx — searchable project dropdown, All Projects option, project tags
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)

### Phase 4 — DONE ✅
- Coordinator ProjectDetail.jsx — 4-tab layout: Overview, Milestones, Documents, Proposal
- Coordinator Proposals.jsx — all 3 states with approve/reject functionality

### Phase 5 — DONE ✅
- App.jsx — ProtectedRoute and AuthRoute components added
- Supervisor Proposals.jsx — read-only view
- Supervisor Announcements.jsx — view-only, no post/delete buttons

### Current Bug Fix — IN PROGRESS 🔧
- Header hardcoded name/role — fix SignIn.jsx and Header/index.jsx to use localStorage

### Backend Phase — NEXT 👈
Frontend must be fully verified and bug-free before backend work begins.
Follow the backend sequence defined in this file.

---

## Task System Design

<<<<<<< HEAD
Tasks are always linked to a specific project. When a coordinator or supervisor creates a task, they select a project from a dropdown. The task is visible to all students in that project.

**Task scope options:**
- `project` — task assigned to one specific project
- `all` — coordinator selects "All Projects" (task goes to all projects) / supervisor selects "All My Projects" (task goes to all their assigned projects)

**Student view:**
- Tasks page shows Pending and Submitted tabs
- Each task row shows the project name as a tag
- On the Project page (`/project/status`), there is a pending tasks alert widget showing count with a link to the Tasks page

**Supervisor view:**
- Tasks page shows tasks grouped by project
- Project filter dropdown at the top (no search bar needed — supervisors have ≤6 projects)
- Submissions tab shows which project each submission came from

**Coordinator view:**
- Tasks page shows all tasks across all projects
- Each submission row shows a project tag
- Create task form has a searchable project dropdown with "All Projects" at the top
=======
- Tasks always linked to a specific project
- `project` scope — one project, `all` scope — all eligible projects
- Student: Pending and Submitted tabs, project name tag on each row
- Supervisor: grouped by project, filter dropdown (no search bar — max 6 projects)
- Coordinator: searchable dropdown, All Projects at top
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)

---

## Documents System Design

- Students upload formal deliverables AND respond to verbal instructions
- Document types: Proposal, Literature Review, Progress Report, Implementation, Screenshots, Final Report, Other
- Supervisors and coordinators view documents inside Project Detail page

---

## Milestone System Design

<<<<<<< HEAD
Each project has exactly 5 milestones:
1. Project Proposal — auto-marked complete when coordinator approves the proposal
2. Project Defense — coordinator manually marks complete
3. Implementation — coordinator manually marks complete
4. Documentation — coordinator manually marks complete
5. Final Presentation — coordinator manually marks complete

Progress percentage = (completed milestones / 5) × 100

Tasks do NOT affect milestone progress or project progress percentage. This keeps the system clean and avoidance over-engineering.
=======
- 5 milestones per project
- Milestone 1 auto-completes when coordinator approves proposal
- Milestones 2-5 manually marked by coordinator
- Progress = (completed / 5) × 100
- Tasks do NOT affect progress
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)

---

## Proposal Workflow

1. One student submits proposal with group member roll numbers
2. System validates roll numbers exist in database
3. Goes to coordinator — supervisor can view for reference only
4. Coordinator approves or rejects with feedback
5. On approval: milestone 1 auto-completes, project status → active

---

## Backend Architecture

- ES modules (`"type": "module"` in package.json)
- All models: `export default mongoose.model(...)`
- Transactions for user creation/deletion
- Server runs on port 4000
- Frontend runs on port 5173

### Environment variables (`server/.env`):
- `MONGO_URI`, `JWT_SECRET`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

---

## Important Rules When Writing Code

<<<<<<< HEAD
1. Always return the **complete file** — never partial snippets or diffs.
2. Always tell the exact file path where the file should be placed.
3. If creating a new file, say **"Create new file at:"** before the path.
4. If replacing an existing file, say **"Replace existing file at:"** before the path.
5. If a file should be deleted, say **"Delete file at:"** before the path.
6. All hardcoded data must have a `// TODO (Backend):` comment above it explaining which API call will replace it.
7. Never use Tailwind utility classes in page JSX — use Bootstrap 5 classes and inline styles.
8. Never use `<form>` HTML tags — use `onClick` and `onChange` handlers instead.
9. Do not connect any page to the real API until explicitly told to. All pages use dummy data during the frontend phase.
10. Do not change the routing structure or URL paths unless explicitly asked.
11. The student post-login landing page is always `/dashboard`, not `/project/status`.
12. The coordinator post-login landing page is always `/coordinator/dashboard`.
13. The supervisor post-login landing page is always `/supervisor/dashboard`.
=======
1. **Read this entire CLAUDE.md file before writing a single line of code.**
2. Always return the **complete file** — never partial snippets or diffs.
3. Always tell the exact file path where the file should be placed.
4. If creating a new file, say **"Create new file at:"** before the path.
5. If replacing an existing file, say **"Replace existing file at:"** before the path.
6. If a file should be deleted, say **"Delete file at:"** before the path.
7. All hardcoded data must have a `// TODO (Backend):` comment.
8. Never use Tailwind utility classes — use Bootstrap 5 and inline styles only.
9. Never use `<form>` HTML tags — use `onClick` and `onChange` handlers.
10. Do not connect any page to real API unless explicitly told to.
11. Do not change routing structure or URL paths unless explicitly asked.
12. Student landing page: `/dashboard`. Coordinator: `/coordinator/dashboard`. Supervisor: `/supervisor/dashboard`.
13. **Never modify authentication logic, role-based access control, routing structure, or database schemas without explicitly asking for confirmation first.**
14. Only the coordinator can post or delete announcements. Supervisor and student announcement pages are view-only.
15. Header must always read name and role from localStorage — never hardcoded values.
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)

---

## How to Run the Project

### Backend
```bash
cd server
npm install
npm run dev     # port 4000
```

### Frontend
```bash
cd client
npm install
npm run dev     # port 5173
```

### Seed coordinator account
```bash
cd server
node seed.js
```

---

## Current Known Issues / Notes

<<<<<<< HEAD
- `StudentProfile.supervisorId` field still exists in the schema but is now obsolete — supervisor-student relationship is through the Project in the new group-based design. Do not use this field for any new logic. It will be removed when backend work begins.
- `SupervisorProfile.currentProjects` is manually incremented/decremented. This can drift. When backend is refactored, consider computing it dynamically from the Project collection instead.
- The `Project.status` enum currently has values `available | assigned | completed`. This will be changed to `pending_proposal | active | completed` when the Project model is extended.
- The `Project` model currently has a single `supervisorId` field. This will be changed to a `supervisors: []` array when the model is extended.
- Announcements route has no authentication currently. This will be fixed during backend phase.
- No file upload system exists yet. Multer will be added when backend phase begins.
- No frontend route protection yet (anyone can access any URL without logging in). This will be added in Phase 5.
- Never modify authentication, role-based access control, routing, or database schemas without asking for confirmation first.
=======
- Header shows hardcoded "M.Salman - Student" — fix in progress (SignIn.jsx + Header/index.jsx)
- `StudentProfile.supervisorId` is obsolete — do not use, will be removed in backend phase
- `SupervisorProfile.currentProjects` manually incremented — will be computed dynamically in backend phase
- `Project.status` enum currently `available|assigned|completed` — will change to `pending_proposal|active|completed`
- `Project` model has single `supervisorId` — will change to `supervisors: []` array
- Announcements route has no auth — will be fixed in backend phase
- No file upload system yet — Multer will be added in backend phase
>>>>>>> e72945d (UI cleanup phases complete - profile edit, auth fix, sidebar updates, cosmetic fixes)
