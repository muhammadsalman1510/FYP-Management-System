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
│       ├── App.jsx                  # All routes defined here
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
│       │   ├── Header/index.jsx
│       │   └── Breadcrumbs/Breadcrumb.jsx
│       └── pages/
│           ├── Authentication/SignIn.jsx
│           ├── Dashboard/Dashboard.jsx      # Student dashboard (post-login landing page)
│           ├── Project/
│           │   ├── Proposal.jsx             # Student submits proposal
│           │   ├── Documents.jsx            # Student uploads documents
│           │   └── Status.jsx               # Student project detail page (renamed from "Project Status" to "Project")
│           ├── Tasks/Tasks.jsx              # Student tasks page
│           ├── MeetingRequests.jsx          # Student meeting requests
│           ├── Announcements.jsx
│           ├── SupervisorView.jsx           # Student views supervisor info
│           ├── CoordinatorView.jsx          # Student views coordinator info
│           ├── Coordinator/
│           │   ├── Dashboard.jsx
│           │   ├── Students.jsx
│           │   ├── Supervisors.jsx
│           │   ├── Projects.jsx             # List all projects
│           │   ├── ProjectDetail.jsx        # Single project detail (real API calls)
│           │   ├── Proposals.jsx
│           │   ├── Tasks.jsx
│           │   ├── MeetingCalendar.jsx
│           │   ├── ScheduleMeeting.jsx
│           │   ├── MeetingRequests.jsx
│           │   ├── Announcements.jsx
│           │   └── Profile.jsx
│           └── Supervisor/
│               ├── Dashboard.jsx
│               ├── Projects.jsx             # NEW — list of assigned projects
│               ├── ProjectDetail.jsx        # NEW — single project detail for supervisor
│               ├── Proposals.jsx
│               ├── Tasks.jsx
│               ├── MeetingCalendar.jsx
│               ├── MeetingRequests.jsx
│               ├── Announcements.jsx
│               └── Profile.jsx
│
└── server/                         # Node.js/Express backend
    ├── index.js                     # Entry point, mounts all routes
    ├── config/db.js                 # MongoDB connection
    ├── middleware/
    │   └── auth.middleware.js       # authenticate + authorize middleware
    ├── models/
    │   ├── user.model.js            # User (coordinator, supervisor, student)
    │   ├── student-profile.model.js # Extended student profile
    │   ├── supervisor-profile.model.js
    │   ├── project.model.js         # Project model (needs extension)
    │   └── announcements.js
    ├── controllers/
    │   ├── auth.controller.js       # login
    │   ├── user.controller.js       # CRUD for users (coordinator only)
    │   ├── project.controller.js    # CRUD for projects (coordinator only)
    │   └── announcements.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   └── project.routes.js
    └── seed.js                      # Seeds initial coordinator account
```

---

## User Roles and Their Portals

### Coordinator
- The admin of the system. Only one coordinator exists, seeded via `seed.js`.
- Can create, read, update, delete students and supervisors.
- Can create, update, delete projects.
- Can assign and remove supervisors and students from projects.
- Can create announcements.
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
- Can view proposals submitted by students.
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
- Can view their project progress (milestones, group members, supervisor, coordinator).
- Post-login landing page: `/dashboard`
- Sidebar label: **Menu**

---

## Authentication

- JWT-based authentication.
- On login (`POST /api/auth/login`), the server returns a token and the user's role.
- The frontend stores token and role in `localStorage`.
- Role-based navigation: after login, the frontend redirects based on role:
  - `coordinator` → `/coordinator/dashboard`
  - `supervisor` → `/supervisor/dashboard`
  - `student` → `/dashboard`
- All protected API routes require `Authorization: Bearer <token>` header.
- Middleware: `authenticate` verifies token and attaches `req.user`. `authorize(...roles)` checks role.

---

## What is Currently Working (Backend)

### Auth
- `POST /api/auth/login` — fully working

### Users (Coordinator only)
- `POST /api/users` — create student or supervisor with full profile in a transaction
- `GET /api/users` — list all users, filter by `?role=student|supervisor`, returns merged user + profile data
- `GET /api/users/:id` — get one user with full profile
- `PUT /api/users/:id` — update user and profile
- `DELETE /api/users/:id` — delete user and profile in a transaction

### Projects (Coordinator only)
- `POST /api/projects` — create project
- `GET /api/projects` — list all projects, filter by `?status=` or `?supervisorId=`
- `GET /api/projects/:id` — get one project with supervisor and students populated
- `PUT /api/projects/:id` — update project title, description, maxStudents
- `PUT /api/projects/:id/supervisor` — assign or unassign supervisor (handles capacity)
- `PUT /api/projects/:id/students` — assign student to project
- `DELETE /api/projects/:id/students/:studentId` — remove student from project
- `DELETE /api/projects/:id` — delete project (releases supervisor slot)

### Announcements
- `POST /api/announcements` — create announcement (no auth, incomplete)

---

## What is Missing (Backend — To Be Built)

These are all the backend features that need to be built. Do NOT build them yet. Frontend must be completed first.

### Project model needs these new fields:
```js
supervisors: [{ type: ObjectId, ref: 'User' }]  // REPLACE single supervisorId with array
coordinator: { type: ObjectId, ref: 'User' }     // coordinator who activated the project
status: enum ['pending_proposal', 'active', 'completed']  // REPLACE old status
milestones: [{
  id: Number,
  name: String,
  description: String,
  completed: Boolean,
  completedAt: Date
}]
progress: Number  // 0-100, derived from milestones (20% per milestone)
proposalId: ObjectId  // links back to the approved proposal
```

### StudentProfile model:
- Remove `supervisorId` field — supervisor relationship is now through the Project only.

### New models needed:
- **Proposal** — `{ title, description, problemStatement, techStack, groupMembers: [{name, rollNumber}], submittedBy: ObjectId, attachmentUrl, status: 'pending'|'approved'|'rejected', coordinatorFeedback, submittedAt }`
- **Task** — `{ title, instructions, openDate, dueDate, projectId: ObjectId|null, createdBy: ObjectId, creatorRole: 'supervisor'|'coordinator', attachmentUrl, targetScope: 'project'|'all' }`
- **TaskSubmission** — `{ taskId: ObjectId, submittedBy: ObjectId, projectId: ObjectId, fileUrl, submittedAt, status: 'pending'|'approved'|'rejected', feedback }`
- **Document** — `{ projectId: ObjectId, uploadedBy: ObjectId, type: String, fileName, fileUrl, size, uploadedAt }`
- **Meeting** — `{ requestedBy: ObjectId, requestedTo: ObjectId, projectId: ObjectId, proposedDate, status: 'pending'|'approved'|'rejected', notes }`

### New routes needed:
- `POST /api/proposals` — student submits proposal
- `GET /api/proposals` — coordinator and supervisor view all proposals
- `PUT /api/proposals/:id/review` — coordinator approves or rejects
- `GET /api/projects/my` — student gets their own project (auth: student)
- `GET /api/projects/assigned` — supervisor gets their assigned projects (auth: supervisor)
- `PUT /api/projects/:id/milestones/:milestoneId` — coordinator marks milestone complete
- `POST /api/tasks` — coordinator or supervisor creates task
- `GET /api/tasks` — role-filtered task list
- `POST /api/tasks/:id/submit` — student submits task with file
- `GET /api/tasks/submissions` — coordinator/supervisor views submissions
- `PUT /api/tasks/submissions/:id/review` — coordinator/supervisor approves or rejects
- `POST /api/documents` — student uploads document (Multer)
- `GET /api/documents` — role-filtered document list
- `POST /api/meetings` — request a meeting
- `GET /api/meetings` — list meetings for the logged-in user
- `PUT /api/meetings/:id` — approve or reject meeting
- `GET /api/announcements` — get all announcements (add auth)

---

## What is Currently Working (Frontend)

### Coordinator
- Projects list page (`/coordinator/accounts/projects`) — **real API calls**
- Project detail page (`/coordinator/projects/:id`) — **real API calls**
- Students, Supervisors pages — **real API calls via the user routes**
- All other coordinator pages — **hardcoded dummy data**

### Supervisor
- Projects list page (`/supervisor/projects`) — **hardcoded dummy data** (new page, needs API later)
- Project detail page (`/supervisor/projects/:id`) — **hardcoded dummy data** (new page, needs API later)
- All other supervisor pages — **hardcoded dummy data**

### Student
- All pages — **hardcoded dummy data**
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
- No Tailwind utility classes in component JSX (Tailwind is installed but Bootstrap is used in pages)
- Dark mode toggle exists in the header (uses `useColorMode` hook and `localStorage`)

### Component patterns
- Breadcrumb: `<Breadcrumb pageName="Page Name" />`
- Page titles: set via `<PageTitle title="Page | FYP Management System" />` in `App.jsx` routes
- All pages use Bootstrap card structure: `card border-0 shadow-sm` with `card-header`, `card-body`
- Sidebar active state: `sidebar-link-active` class on active `NavLink`
- Sub-links use class `sidebar-sub-link`

### Routing
- All routes are defined in `client/src/App.jsx`
- Student routes use `<DefaultLayout>`
- Coordinator routes use `<CoordinatorLayout>`
- Supervisor routes use `<SupervisorLayout>`
- Student base routes: `/dashboard`, `/project/*`, `/tasks`, `/meetings/*`, `/announcements`, `/supervisor/view`, `/coordinator/view`, `/profile`
- Coordinator base routes: `/coordinator/*`
- Supervisor base routes: `/supervisor/*`

### Hardcoded data pattern
Every page that has dummy data includes a comment at the top:
```js
// TODO (Backend): Replace with GET /api/...
```
This makes it easy to find which pages need to be connected to the API later.

### File upload
File uploads are not yet implemented on the backend. On the frontend, document and task upload buttons exist but do not actually send files to a server. When backend integration begins, use **Multer** for file handling on the server.

---

## Current Frontend Work Sequence (Phases)

We are completing the frontend UI before touching the backend. The phases are:

### Phase 1 — DONE ✅
- Renamed "Project Status" sidebar link to "Project" in student sidebar
- Updated `Status.jsx` breadcrumb from "Project Status" to "Project"
- Added pending tasks alert widget on `Status.jsx`
- Updated `Dashboard.jsx` "View Details" button to "View Project"

### Phase 2 — DONE ✅
- Added "Projects" item to supervisor sidebar (replaced "My Students")
- Created `client/src/pages/Supervisor/Projects.jsx` — projects list page
- Created `client/src/pages/Supervisor/ProjectDetail.jsx` — project detail with 4 tabs
- Updated `App.jsx` with new supervisor routes: `/supervisor/projects` and `/supervisor/projects/:id`

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

### Phase 4 — Coordinator Frontend
- Review and complete Coordinator Project Detail page if anything is missing
- Ensure Coordinator Proposals page (approve/reject UI) is complete

### Phase 5 — Polish
- Add frontend route protection (check localStorage for token + role, redirect to `/` if missing)
- Review all pages for consistency in dark mode, spacing, and empty states

---

## Task System Design

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

---

## Documents System Design

Documents is a separate page for students under the Project sidebar section. It serves as a free-upload space for formal academic deliverables AND for responding to verbal instructions from supervisors or coordinators when no formal task has been created.

**Justification for keeping Documents separate from Tasks:**
If a supervisor verbally tells a student to submit something by a deadline but forgets to create a task, the student can upload it as a document to avoid missing the deadline. This covers informal/verbal instructions.

**Document types:** Proposal, Literature Review, Progress Report, Implementation, Screenshots, Final Report, Other

**Who can view documents:**
- Students see only their own project's documents
- Supervisors see documents for their assigned projects (from within the Project detail page)
- Coordinator sees documents for all projects (from within the Project detail page)

---

## Milestone System Design

Each project has exactly 5 milestones:
1. Project Proposal — auto-marked complete when coordinator approves the proposal
2. Project Defense — coordinator manually marks complete
3. Implementation — coordinator manually marks complete
4. Documentation — coordinator manually marks complete
5. Final Presentation — coordinator manually marks complete

Progress percentage = (completed milestones / 5) × 100

Tasks do NOT affect milestone progress or project progress percentage. This keeps the system clean and avoidance over-engineering.

---

## Proposal Workflow

1. One student from the group fills in the proposal form (`/project/proposal`).
2. They enter: project title, description, tech stack, problem statement, and roll numbers of group members.
3. The system validates roll numbers against the database (students must exist).
4. The proposal is submitted and goes to the coordinator.
5. The supervisor of the project can also see the proposal for reference.
6. The coordinator reviews and either approves or rejects (with feedback).
7. On approval, the first milestone (Project Proposal) is automatically marked complete and the project status changes to `active`.

---

## Backend Architecture (for when backend phase begins)

### Server entry: `server/index.js`
- Express app with CORS and JSON middleware
- Routes mounted at `/api/auth`, `/api/users`, `/api/projects`, `/api/announcements`
- New routes to add: `/api/proposals`, `/api/tasks`, `/api/documents`, `/api/meetings`

### Auth middleware: `server/middleware/auth.middleware.js`
- `authenticate`: verifies JWT, attaches `req.user`
- `authorize(...roles)`: checks `req.user.role` against allowed roles

### Database: MongoDB via Mongoose
- Using ES modules (`"type": "module"` in package.json)
- All models use named exports: `export default mongoose.model(...)`
- Transactions used in user creation and deletion (`mongoose.startSession()`)

### Environment variables (`server/.env`):
- `MONGO_URI`
- `JWT_SECRET`
- `PORT`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

---

## Important Rules When Writing Code

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

---

## How to Run the Project

### Backend
```bash
cd server
npm install
npm run dev     # runs on port 5000 by default (nodemon)
```

### Frontend
```bash
cd client
npm install
npm run dev     # runs on port 5173 (Vite)
```

### Seed the coordinator account
```bash
cd server
node seed.js
```
This creates the coordinator from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

---

## Current Known Issues / Notes

- `StudentProfile.supervisorId` field still exists in the schema but is now obsolete — supervisor-student relationship is through the Project in the new group-based design. Do not use this field for any new logic. It will be removed when backend work begins.
- `SupervisorProfile.currentProjects` is manually incremented/decremented. This can drift. When backend is refactored, consider computing it dynamically from the Project collection instead.
- The `Project.status` enum currently has values `available | assigned | completed`. This will be changed to `pending_proposal | active | completed` when the Project model is extended.
- The `Project` model currently has a single `supervisorId` field. This will be changed to a `supervisors: []` array when the model is extended.
- Announcements route has no authentication currently. This will be fixed during backend phase.
- No file upload system exists yet. Multer will be added when backend phase begins.
- No frontend route protection yet (anyone can access any URL without logging in). This will be added in Phase 5.
Update CLAUDE.md with the following rule:

Never modify authentication, role-based access control, routing, or database schemas without asking for confirmation first.