# FYP Management System — Project Instructions for Claude Code

This file contains everything Claude Code needs to understand, work on, and continue building this project without asking repeated questions.

**IMPORTANT — READ THIS FIRST:**
Before doing anything, read this entire file. Do not start writing code until you have fully understood the current project state, the workflow rules, and all the rules at the bottom of this file.

---

## Project Overview

This is a **Final Year Project (FYP) Management System** built as a university capstone project. MERN stack — React 18, Node.js, Express 5, MongoDB, Mongoose 9, JWT authentication.

Three roles: Coordinator, Supervisor, Student. Local dev path: `D:\FYP-Github\Fyp`, with `client/` (port 5173) and `server/` (port 4000) subfolders.

---

## CURRENT STATUS

### Frontend — 100% COMPLETE (initial build)
All pages built and styled. Frontend-backend wiring is now in progress/ongoing as bugs are found and fixed.

### Backend — ALL CORE ROUTES BUILT
All models, routes, controllers, and middleware are built, including the proposal auto-creates-project workflow (see below — this is the most important business logic in the system).

### Current Phase — Bug fixing during SQA testing
Frontend and backend are wired together. We are now fixing bugs found during end-to-end testing, one focused batch at a time.

---

## CRITICAL — Proposal-to-Project Workflow (DO NOT REVERSE THIS)

This is the most important business logic in the entire system. A student does NOT need an existing project to submit a proposal — the proposal IS what creates the project. Do not gate the proposal form behind "must have a project first."

**Full flow:**

1. Student submits a proposal with: title, description, problemStatement, techStack, groupMembers (array of {name, rollNumber} — manually typed by the student, no dropdown, since the form represents the whole group), supervisorName, supervisorEmail (also manually typed).
2. Backend validates BEFORE saving:
   - Every groupMembers[].rollNumber must exist in StudentProfile. If any roll number is not found, reject with the EXACT message: "No student found with roll number '{rollNumber}'. Please check and try again."
   - supervisorEmail must exist in User with role='supervisor'. If not found, reject with the EXACT message: "No supervisor found with email '{email}'. Please check the email and try again."
   - Both validations return HTTP 400 and must happen before any database write — never save a partially-invalid proposal.
3. Proposal is saved with status: 'pending', no projectId yet.
4. Coordinator (and supervisor, read-only) can view it. Supervisor only sees proposals where supervisorEmail matches their own email — not all proposals.
5. Coordinator approves or rejects via PUT /api/proposals/:id/review.
6. On approval — the backend AUTOMATICALLY creates the Project. The coordinator does NOT manually create it. Auto-created project gets:
   - title = proposal.title
   - description = proposal.description
   - maxStudents = proposal.groupMembers.length
   - students = resolved User IDs from each groupMember's rollNumber
   - supervisors = resolved User ID from supervisorEmail
   - coordinator = the reviewing coordinator's ID
   - milestones = the default 5 milestones, with milestone 1 marked completed: true and completedAt set
   - progress = 20 (1 of 5 milestones done)
   - status = 'active'
   - proposalId = the proposal's own ID
   - Supervisor's SupervisorProfile.currentProjects is incremented (respect capacity checks if present)
   - proposal.projectId is set to the new project's ID
7. On rejection: student submits a brand new proposal from scratch. No edit/resubmit of the same proposal document.
8. Coordinator retains full manual ability to edit project students/supervisor AFTER auto-creation (existing assignSupervisor/assignStudent endpoints stay intact) — auto-creation is the starting point, not the only way to modify a project.
9. Students check their own proposal status via GET /api/proposals/my (see below) — this MUST be used so proposal status persists across page refreshes. Do not rely on local component state alone, since refreshing the page loses that state and previously caused the form to incorrectly reappear after a pending submission.

---

## Supervisor Recommendation on Proposals (ADVISORY ONLY)

The supervisor's input on a proposal is a non-binding RECOMMENDATION ONLY. It NEVER overrides the coordinator's decision. There is no scenario where the supervisor's choice changes the outcome by itself.

Truth table:
- Supervisor approves + Coordinator approves → Project created
- Supervisor rejects  + Coordinator approves → Project STILL created (coordinator overrides)
- Supervisor approves + Coordinator rejects  → Project NOT created (coordinator overrides)
- Supervisor rejects  + Coordinator rejects  → Project NOT created

Proposal model has separate fields for this:
- supervisorRecommendation: 'pending' | 'approved' | 'rejected'
- supervisorFeedback: String
- supervisorReviewedAt: Date
These are entirely separate from status (the coordinator's field) and coordinatorFeedback.

Rules:
- Only the supervisor NAMED on the proposal (req.user.email === proposal.supervisorEmail) can submit a recommendation — not any supervisor.
- Supervisor can change their recommendation as many times as they want, but ONLY while proposal.status === 'pending' (i.e. before the coordinator has made the final call). Once the coordinator decides, the proposal is locked — PUT /api/proposals/:id/supervisor-review must reject further changes with a 400 once status is no longer pending.
- The coordinator's reviewProposal logic in proposal.controller.js does NOT read or depend on supervisorRecommendation at all when deciding whether to approve/reject or whether to auto-create the project. It is display-only information for the coordinator's benefit before they decide.
- Student-facing views must show BOTH decisions separately and clearly labeled: "Supervisor Recommendation: ..." and "Coordinator Decision: ...". Never merge them into a single status — they are conceptually different things.

New route: PUT /api/proposals/:id/supervisor-review — supervisor only.

---

## Server Structure (Complete)

```
server/
├── index.js                      # Port 4000, mounts all routes, serves /uploads
├── config/db.js                  # mongoose.connect — logs real error.message + process.exit(1) on failure
├── uploads/                      # Multer file storage (gitignored)
├── .env                          # MONGO_URI must have NO duplicate "MONGO_URI=" text, no replicaSet param
│                                  # unless a real local replica set is initialized
├── middleware/
│   ├── auth.middleware.js        # authenticate + authorize
│   └── upload.middleware.js      # Multer — 10MB, disk storage, ext whitelist
├── models/
│   ├── user.model.js             # phone + photoUrl fields
│   ├── student-profile.model.js  # supervisorId REMOVED — do not re-add
│   ├── supervisor-profile.model.js  # has canAcceptProject(), currentProjects, maxProjects
│   ├── project.model.js          # supervisors[] (array), coordinator, milestones[], progress, status, proposalId
│   ├── announcements.js
│   ├── proposal.model.js         # + supervisorName, supervisorEmail (lowercase indexed), supervisorRecommendation, supervisorFeedback, supervisorReviewedAt. projectId optional/nullable.
│   ├── task.model.js
│   ├── tasksubmission.model.js
│   ├── document.model.js
│   └── meeting.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js        # getMe, updateMe, updatePassword, uploadPhoto + duplicate email/rollNumber checks on create
│   ├── project.controller.js     # populateProject() helper uses 'supervisors' not 'supervisorId'. getMyProject, getAssignedProjects, updateMilestone
│   ├── announcements.controller.js  # coordinator-only POST, all-roles GET
│   ├── proposal.controller.js    # createProposal (validates roll numbers + supervisor email), getProposals, getMyProposal, reviewProposal (auto-creates Project on approval, coordinator decision is final/absolute), submitSupervisorRecommendation (advisory only, locked once coordinator decides)
│   ├── task.controller.js
│   ├── document.controller.js
│   └── meeting.controller.js
└── routes/
    ├── auth.routes.js
    ├── user.routes.js            # /me/* routes BEFORE /:id routes
    ├── project.routes.js         # /my and /assigned BEFORE /:id routes
    ├── announcements.routes.js
    ├── proposal.routes.js        # /my BEFORE /:id routes (NEW route added)
    ├── task.routes.js            # /submissions and /submissions/:id BEFORE /:id
    ├── document.routes.js
    └── meeting.routes.js
```

---

## Client Structure Notes

```
client/
├── vite.config.js   # MUST have a server.proxy block forwarding /api and /uploads
│                     # to http://localhost:4000 (changeOrigin: true, secure: false).
│                     # Without this, all fetch('/api/...') calls hit the Vite dev
│                     # server itself and get back HTML, causing
│                     # "Unexpected token '<', <!DOCTYPE..." JSON parse errors.
│                     # MUST restart `npm run dev` after editing this file — it
│                     # does not hot-reload.
└── src/
    ├── App.jsx       # AuthRoute: simple `if (token && role)` check only.
    │                 # DO NOT decode the JWT with atob()/jwt-decode in the browser
    │                 # for redirect logic — this previously caused a CSP 'eval'
    │                 # violation error. If the token is actually expired/invalid,
    │                 # the page's own API call will get a 401 and can redirect then.
    └── pages/...
```

---

## All API Routes (Complete Reference)

### Auth
- POST /api/auth/login

### Users
- POST /api/users — coordinator only (checks duplicate email + duplicate rollNumber for students, returns clear 400 messages)
- GET /api/users — coordinator only
- GET /api/users/:id — coordinator only
- PUT /api/users/:id — coordinator only
- DELETE /api/users/:id — coordinator only
- GET /api/users/me — all roles
- PUT /api/users/me — all roles
- PUT /api/users/me/password — all roles
- POST /api/users/me/photo — all roles

### Projects
- POST /api/projects — coordinator (manual creation still works; most projects now come via proposal auto-creation)
- GET /api/projects — coordinator
- GET /api/projects/:id — coordinator
- PUT /api/projects/:id — coordinator
- PUT /api/projects/:id/supervisor — coordinator
- PUT /api/projects/:id/students — coordinator
- DELETE /api/projects/:id/students/:studentId — coordinator
- DELETE /api/projects/:id — coordinator
- GET /api/projects/my — student only
- GET /api/projects/assigned — supervisor only
- PUT /api/projects/:id/milestones/:milestoneId — coordinator only

### Proposals
- POST /api/proposals — student only. Validates groupMembers rollNumbers + supervisorEmail exist BEFORE saving.
- GET /api/proposals — coordinator (sees all) + supervisor (sees only proposals where supervisorEmail matches their own email)
- GET /api/proposals/my — student only. Returns their own most recent proposal ({success:true, data: proposal|null}). Used so proposal status survives page refresh. Declared BEFORE /:id routes.
- PUT /api/proposals/:id/review — coordinator only. On approval, auto-creates the Project (see workflow section above). Returns the created project in the response.
- PUT /api/proposals/:id/supervisor-review — supervisor only (must be the NAMED supervisor on the proposal). Advisory only — does not affect coordinator's decision. Locked once status is no longer 'pending'.

### Tasks
- POST /api/tasks — coordinator + supervisor
- GET /api/tasks — all roles (role-filtered)
- POST /api/tasks/:id/submit — student only, Multer
- GET /api/tasks/submissions — coordinator + supervisor
- PUT /api/tasks/submissions/:id/review — coordinator + supervisor

### Documents
- POST /api/documents — student only, Multer
- GET /api/documents — all roles (role-filtered)

### Meetings
- POST /api/meetings — all roles
- GET /api/meetings — all roles (own meetings)
- PUT /api/meetings/:id — supervisor + coordinator

### Announcements
- POST /api/announcements — coordinator only
- GET /api/announcements — all roles

---

## localStorage Keys

```js
localStorage.setItem('token', data.token)
localStorage.setItem('user',  JSON.stringify(data.user))
localStorage.setItem('name',  data.user.name)
localStorage.setItem('role',  data.user.role)
```

---

## User Roles

### Coordinator — /coordinator/dashboard
Admin. Creates users, projects (manual path still exists), tasks. Posts announcements. Approves/rejects proposals (approval auto-creates the project). Marks milestones. Can manually edit project students/supervisor after auto-creation.

### Supervisor — /supervisor/dashboard
Assigned to projects (via proposal auto-creation or manual assignment). Creates tasks for their projects. Reviews submissions. Can submit a non-binding recommendation (approve/reject + feedback) on proposals that name them as supervisor, while status is still pending — see "Supervisor Recommendation on Proposals" section above. Otherwise read-only on proposals and announcements. Can request meetings with students OR with a project's coordinator (see Meeting UI note below).

### Student — /dashboard
Has 0 or 1 project. If 0 projects: submits a Project Proposal (the form that creates the project). If 1 project: sees Project Status with milestones, group members, supervisor info. Uploads documents, submits tasks, requests meetings. Read-only announcements.

---

## Known UI/UX Conventions Established During Bug Fixes

- Response parsing: Backend always returns { success: true, data: ... } or { success: false, message: '...' }. When the frontend reads a response, the actual payload is at responseJson.data — NOT responseJson.project, responseJson.user, responseJson.users, or any other custom key. Several bugs (Coordinator Dashboard showing 0, ProjectDetail showing "Project not found", Student Profile crashing) were all caused by reading the wrong key on the response object. Always re-verify the exact controller response shape before writing frontend parsing code — do not assume.
- Dashboard stat cards should be clickable where a corresponding list page exists (e.g. Total Students card → navigates to Manage Students). Use useNavigate() + onClick + cursor: pointer style.
- Supervisor meeting request UI: one form with a "Meet With" dropdown (Student or Coordinator), not two separate buttons. Selecting Student shows a student picker and the submit button reads "Create Meeting". Selecting Coordinator shows the project picker (to resolve which coordinator) and the submit button reads "Request Meeting". The page-level button that opens this modal should be a neutral label like "+ New Meeting" since it can lead to either action.
- Error display in modals: never let a backend 400 error fail silently (console.error only). Always surface data.message in a visible alert-danger inside the relevant modal, keep the modal open, and preserve the user's entered form data so they can correct and resubmit.

---

## File Upload Pattern (documents, task submissions, photos)

```js
const formData = new FormData();
formData.append('file', selectedFile); // or 'photo' for user photo uploads
const res = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }, // NO Content-Type for FormData — browser sets it
  body: formData
});
```

## Standard Auth Header Pattern (all JSON requests)

```js
const token = localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
```

## Standard Loading/Error State Pattern (use on every page)

```js
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
// in useEffect: try/catch around fetch, setLoading(false) in finally
```

---

## Backend Architecture Notes

- ES modules ("type": "module" in server/package.json)
- All models: export default mongoose.model(...)
- Server port: 4000 | Frontend port: 5173 (Vite proxy forwards /api and /uploads — see Client Structure Notes above)
- .env: MONGO_URI, JWT_SECRET, PORT, ADMIN_EMAIL, ADMIN_PASSWORD
  - Known footgun: a duplicated MONGO_URI=MONGO_URI=mongodb://... line (e.g. from pasting a value back into an already-filled field) will cause MongoParseError: Invalid scheme. If you ever see that error, print JSON.stringify(process.env.MONGO_URI) to check for this exact duplication before assuming anything else is wrong.
  - Local MongoDB does not need ?replicaSet=rs0 unless a real replica set was deliberately initialized with mongod --replSet rs0 + rs.initiate(). If using plain standalone local MongoDB, the URI should NOT include the replicaSet query param.
- uploads/ folder is gitignored
- connectDB() in config/db.js must log the real error.message (not a generic string) and call process.exit(1) on failure — never let the server claim "running" while silently failing to connect to the database, since this previously caused every query to hang for 10 seconds with a confusing buffering timed out error instead of a clear connection failure message.

---

## Important Rules

### Frontend rules:
1. Read this entire CLAUDE.md before writing any code.
2. Always return complete files — never partial snippets.
3. Replace ALL hardcoded dummy data with real API calls when wiring a page.
4. Always show a loading spinner while fetching.
5. Always show a visible error message if a fetch fails — never console.error only.
6. Never use form tags — use onClick and onChange handlers.
7. Never use Tailwind — Bootstrap 5 and inline styles only.
8. Do not change routing or URL paths unless explicitly asked.
9. For file uploads use FormData — do NOT set Content-Type header manually.
10. Token is always read from localStorage.getItem('token').
11. Always double-check the actual backend response shape (read the controller) before writing .data parsing logic on the frontend.

### Backend rules:
1. Use ES module syntax — import/export not require.
2. All routes use authenticate middleware.
3. Role-restricted routes use authorize('role') middleware.
4. Use try/catch in every controller function.
5. Return { success: true, data: ... } or { success: false, message: '...' } — always.
6. Never modify auth logic without asking first.
7. Any route with a static segment (e.g. /my, /assigned, /me, /submissions) must be declared BEFORE a dynamic /:id route in the same router, or Express will incorrectly match the static path as an :id parameter.
8. Validation errors (duplicate email, invalid roll number, invalid supervisor email, etc.) must return HTTP 400 with a specific, user-readable message naming exactly what was wrong — never a generic "Internal server error" for a validation case.

---

## How to Run

```bash
# Backend (port 4000)
cd server && npm install && npm run dev

# Frontend (port 5173) — restart after any vite.config.js change
cd client && npm install && npm run dev

# Seed coordinator
cd server && node seed.js
```

If login fails with "Internal server error" or queries hang/timeout: check the backend terminal for a real MongoDB connection error first (see .env footguns above) before assuming it's a frontend or route bug.