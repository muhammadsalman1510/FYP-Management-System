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
All models, routes, controllers, and middleware are built.

### Current Phase — Bug fixing and feature completion during SQA testing

---

## CRITICAL — Proposal-to-Project Workflow (DO NOT REVERSE THIS)

A student does NOT need an existing project to submit a proposal — the proposal IS what creates the project.

**Full flow:**

1. Student submits a proposal with: title, description, problemStatement, techStack, groupMembers (array of {name, rollNumber, section, email} — ALL FOUR FIELDS), supervisorName, supervisorEmail.
2. Backend validates BEFORE saving:
   - PRESENCE CHECK FIRST: every group member must have all 4 fields non-empty.
   - CROSS-VALIDATION: all 4 fields must match real records. Look up StudentProfile by rollNumber, then User by profile.userId, then compare name → section → email IN THAT ORDER. Exact error messages: "No student found with roll number '{rollNumber}'. Please check and try again." or "The {field} provided for roll number '{rollNumber}' does not match our records. Please check and try again."
   - This logic lives in shared helper validateAndResolveMember in proposal.controller.js — used by BOTH createProposal and reviewProposal. Do not duplicate it.
   - supervisorEmail must exist in User with role='supervisor'.
3. Proposal saved with status: 'pending', no projectId yet.
4. On coordinator approval: backend AUTOMATICALLY creates the Project with milestone 1 completed, progress=20, status='active'.
5. On rejection: student submits a brand new proposal from scratch.
6. Students check own proposal status via GET /api/proposals/my (persists across refresh).

---

## Supervisor Recommendation on Proposals (ADVISORY ONLY)

Non-binding recommendation only. NEVER overrides coordinator's decision.

Truth table:
- Supervisor approves + Coordinator approves → Project created
- Supervisor rejects  + Coordinator approves → Project STILL created (coordinator overrides)
- Supervisor approves + Coordinator rejects  → Project NOT created
- Supervisor rejects  + Coordinator rejects  → Project NOT created

Rules:
- Only the NAMED supervisor (req.user.email === proposal.supervisorEmail) can submit a recommendation.
- Supervisor can change recommendation anytime while proposal.status === 'pending'.
- Once coordinator decides, proposal is locked — PUT /api/proposals/:id/supervisor-review returns 400.
- Supervisor recommendation buttons (Recommend Approval / Recommend Rejection) must be HIDDEN after a recommendation is successfully submitted — replaced by the success message and a "Change Recommendation" option. Do NOT keep showing the buttons after submission.

Route: PUT /api/proposals/:id/supervisor-review — supervisor only.

---

## Meeting System Rules (CRITICAL — DO NOT REVERSE)

There are two fundamentally different types of meetings:

**TYPE 1 — Scheduled meetings** (coordinator schedules for a project group, OR supervisor schedules for students):
- meetingType: 'scheduled', status: 'approved' — set immediately on creation, no approval needed
- Go directly to recipients' CALENDARS as confirmed events
- Recipient cannot approve or reject — they can only send a text reply
- Coordinator can cancel any scheduled meeting they created
- Supervisor can cancel scheduled meetings they created with students only

**TYPE 2 — Requested meetings** (anyone requesting someone else's time — needs approval):
- meetingType: 'requested', status: 'pending'
- Go to recipient's Meeting Requests page as pending
- Recipient approves/rejects with a response note
- Upon approval, appear on both parties' calendars

TYPE 2 includes ALL of these cases:
- Student requesting supervisor or coordinator → supervisor/coordinator approves/rejects
- Supervisor requesting coordinator → coordinator approves/rejects
- Coordinator requesting supervisor → SUPERVISOR APPROVES/REJECTS (not reply-only)

**CRITICAL — Supervisor approve/reject rules:**
The supervisor sees Approve/Reject buttons when:
  m.status === 'pending' AND !isOutgoing AND
  (requestedBy.role === 'student' OR
   (requestedBy.role === 'coordinator' AND meetingType === 'requested'))

The supervisor sees reply-only (no Approve/Reject) when:
  meetingType === 'scheduled' (already confirmed, no approval needed)

DO NOT restrict approve/reject to student-only. Coordinator-requested meetings
(meetingType: 'requested') also need supervisor approval.

isCoordinatorMtg (reply-only) = !isOutgoing AND requestedBy.role === 'coordinator'
  AND meetingType === 'scheduled'
  (NOT all coordinator meetings — only pre-confirmed scheduled ones)

**Coordinator Schedule Meeting form:**
- "Meet With" options: "Project" or "Supervisor"
- Project → all students get meetingType:'scheduled', status:'approved' immediately
- Supervisor → single meeting, meetingType:'requested', status:'pending' — needs supervisor approval

**Supervisor "New Meeting" modal:**
- "Meet With" dropdown: "Student(s)" or "Coordinator"
- Student(s) → select project → all students in project get meetingType:'scheduled', status:'approved'
- Coordinator → meetingType:'requested', status:'pending' — needs coordinator approval

**Student Calendar:**
- Shows all approved meetings student is involved in (own + groupmate)
- Backend getMeetings for students returns own meetings + groupmates' approved meetings
- DEDUPLICATION REQUIRED: when coordinator/supervisor creates a project meeting for 2 students,
  it creates 2 documents. Student A gets Doc A (direct) + Doc B via groupmate path = looks like duplicate.
  Frontend must deduplicate by grouping on topic+date+time+projectId key before rendering.
  Show ONE block per group. Student sees their own meeting, not a duplicate groupmate card
  for the same meeting they're already directly part of.
- Rule: if a meeting appears in both own-set AND groupmate-set with same topic+date+time+projectId,
  show it ONLY in own-set. Suppress the groupmate card.

**Student My Meetings page:**
- Shows ALL meetings student is involved in (own outgoing requests + incoming scheduled)
- Same deduplication rule as calendar: suppress groupmate card if own card covers same meeting
- Groupmate cards (purple Group badge) only appear for meetings the student is NOT directly part of

**Meeting Requests pages (Coordinator + Supervisor):**
- Tab 1: "All Meetings" — all meetings, both directions, all statuses
- Tab 2: "Pending" — only status === 'pending'
- "Cancel Meeting" button on meetings they created (calls DELETE /api/meetings/:id)

**getMeetings backend — student role:**
- Returns own meetings (requestedBy or requestedTo === student)
- PLUS groupmate approved meetings, BUT excludes meetings where student is already
  requestedBy or requestedTo (prevents duplicates at source):
  { $or: [{ requestedTo: {$in: groupmateIds} }, { requestedBy: {$in: groupmateIds} }],
    requestedTo: {$nin: [req.user._id]},
    requestedBy: {$nin: [req.user._id]},
    status: 'approved' }

**Meeting model fields:**
- location: String (optional, default '')
- meetingType: String (enum: ['scheduled', 'requested'], default: 'requested')
- studentReply: String (optional, default '')

**Routes:**
- DELETE /api/meetings/:id — coordinator (any they created), supervisor (student meetings only)

**Meeting model fields (including new ones):**
- location: String (optional, default '')
- meetingType: String (enum: ['scheduled', 'requested'], default: 'requested')
- studentReply: String (optional, default '')

**New routes:**
- DELETE /api/meetings/:id — coordinator (any meeting they created), supervisor (meetings they created with students only)

---

## Server Structure (Complete)

```
server/
├── index.js
├── config/db.js
├── uploads/
├── .env
├── middleware/
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── models/
│   ├── user.model.js
│   ├── student-profile.model.js       # supervisorId REMOVED
│   ├── supervisor-profile.model.js    # canAcceptProject(), currentProjects, maxProjects
│   ├── project.model.js               # supervisors[], coordinator, milestones[], progress, status, proposalId
│   ├── announcements.js
│   ├── proposal.model.js              # supervisorName, supervisorEmail, supervisorRecommendation, supervisorFeedback, supervisorReviewedAt, projectId optional
│   ├── task.model.js
│   ├── tasksubmission.model.js
│   ├── document.model.js
│   └── meeting.model.js               # + location, meetingType, studentReply fields
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── project.controller.js          # populateProject() uses 'supervisors' not 'supervisorId'
│   ├── announcements.controller.js
│   ├── proposal.controller.js         # validateAndResolveMember shared helper
│   ├── task.controller.js             # getMySubmissions (student), createTask, getTasks, submitTask, getSubmissions, reviewSubmission
│   ├── document.controller.js
│   └── meeting.controller.js          # createMeeting (sets meetingType+status by role), deleteMeeting (new)
└── routes/
    ├── auth.routes.js
    ├── user.routes.js                 # /me/* BEFORE /:id
    ├── project.routes.js              # /my and /assigned BEFORE /:id
    ├── announcements.routes.js
    ├── proposal.routes.js             # /my BEFORE /:id
    ├── task.routes.js                 # /submissions/my, /submissions, /submissions/:id/review BEFORE /:id
    ├── document.routes.js
    └── meeting.routes.js              # DELETE /:id added
```

---

## All API Routes (Complete Reference)

### Auth
- POST /api/auth/login

### Users
- POST /api/users — coordinator only
- GET /api/users — coordinator only. **FOOTGUN: returns { users: [...] } NOT { success, data }. Read .users not .data.**
- GET /api/users/:id — coordinator only. Do not loosen this restriction.
- PUT /api/users/:id — coordinator only
- DELETE /api/users/:id — coordinator only
- GET /api/users/me — all roles
- PUT /api/users/me — all roles
- PUT /api/users/me/password — all roles
- POST /api/users/me/photo — all roles

### Projects
- POST /api/projects — coordinator
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
- POST /api/proposals — student only. Full 4-field cross-validation.
- GET /api/proposals — coordinator (all) + supervisor (own email only)
- GET /api/proposals/my — student only. Before /:id.
- PUT /api/proposals/:id/review — coordinator only. Auto-creates Project on approval.
- PUT /api/proposals/:id/supervisor-review — supervisor only. Advisory. Locked once coordinator decides.

### Tasks
- POST /api/tasks — coordinator + supervisor
- GET /api/tasks — all roles (role-filtered)
- POST /api/tasks/:id/submit — student only, Multer
- GET /api/tasks/submissions — coordinator + supervisor
- GET /api/tasks/submissions/my — student only. Before /submissions/:id/review.
- PUT /api/tasks/submissions/:id/review — coordinator + supervisor

### Documents
- POST /api/documents — student only, Multer
- GET /api/documents — all roles (role-filtered)

### Meetings
- POST /api/meetings — all roles
- GET /api/meetings — all roles (own meetings)
- PUT /api/meetings/:id — supervisor + coordinator (approve/reject + notes + studentReply)
- DELETE /api/meetings/:id — coordinator (any they created) + supervisor (student meetings only)

### Announcements
- POST /api/announcements — coordinator only
- GET /api/announcements — all roles

---

## Session Storage — sessionStorage NOT localStorage (DO NOT REVERT)

Auth keys (token, user, name, role) use sessionStorage for per-tab independence.
UI preferences (theme, sidebar state) correctly stay in localStorage.

---

## User Roles

### Coordinator
Admin. Creates users, tasks, projects. Approves/rejects proposals. Marks milestones. Schedules meetings by project (all students notified) or individual supervisor.

### Supervisor
Assigned to projects. Creates tasks. Reviews submissions. Advisory recommendation on proposals naming them. Schedules meetings with students (confirmed immediately) or requests meetings with coordinator (needs approval).

### Student
Submits proposals. Uploads documents. Submits tasks. Can re-upload a file to replace a wrong submission. Requests meetings with supervisor/coordinator. Sees scheduled meetings on calendar only (not in Meeting Requests). Can send a text reply to a scheduled meeting from their calendar.

---

## Known UI/UX Conventions

- **Response parsing:** GET /api/users returns { users: [...] }. All other routes return { success, data }. Always verify.
- **Date inputs:** Use type="date" HTML input only. Never use custom date pickers that allow impossible dates (June 31, Feb 30, etc). The browser's native date picker handles month lengths correctly.
- **Dashboard stat cards:** All roles — clickable with useNavigate() + onClick + cursor:pointer.
- **Supervisor recommendation buttons:** Hide after submission — show success message + "Change Recommendation" link instead. Do not keep showing Recommend Approval/Rejection buttons after a recommendation was already submitted.
- **Student profile photos in project cards:** When rendering student cards in supervisor/coordinator project detail pages, always pass photoUrl from the populated student object to the Avatar component. Missing photoUrl prop causes silhouette even when student has uploaded a photo.
- **Coordinator profile photo in student's coordinator view:** The student's "My Coordinator" page (CoordinatorView.jsx) must fetch the coordinator's photoUrl from the project data (project.coordinator.photoUrl if populated) and pass it to Avatar.
- **Designation field:** Removed from Add Supervisor form. Do not re-add it.
- **Task shortcuts on project pages:** All 3 roles' project detail pages show a clickable task count shortcut (e.g. "2 Pending Tasks →") linking to the tasks page.
- **Coordinator ProjectDetail tabs:** Same tab structure as Supervisor ProjectDetail — Overview, Tasks, Submissions, Documents. Coordinator should be able to view all task/submission activity on a project.
- **Student cards clickable on coordinator ProjectDetail:** Same modal pattern as Supervisor ProjectDetail — clicking a student card opens an inline modal with their submissions and documents.
- **Error display in modals:** Always surface data.message in alert-danger, keep modal open, preserve form data.
- **Stub page warning:** A page that looks done may have zero real API calls. Always verify useEffect + fetch exist before assuming a page is wired.

---

## File Upload Pattern

```js
const formData = new FormData();
formData.append('file', selectedFile);
const res = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }, // NO Content-Type for FormData
  body: formData
});
```

## Standard Auth Header Pattern

```js
const token = sessionStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
```

---

## Backend Architecture Notes

- ES modules ("type": "module" in server/package.json)
- Server port: 4000 | Frontend port: 5173
- Vite proxy forwards /api and /uploads to localhost:4000
- .env footguns: duplicated MONGO_URI= prefix causes MongoParseError; no ?replicaSet=rs0 on plain standalone MongoDB
- connectDB() must log real error.message and call process.exit(1) on failure

---

## Important Rules

### Frontend:
1. Read entire CLAUDE.md before writing code.
2. Always return complete files — no partial snippets.
3. Replace all hardcoded data with real API calls.
4. Loading spinner while fetching. Visible error if fetch fails.
5. No form tags. No Tailwind. Bootstrap 5 + inline styles only.
6. Token from sessionStorage.getItem('token').
7. Verify exact backend response shape before writing parsing code.
8. Use type="date" for all date inputs — never custom pickers with manual day selectors.

### Backend:
1. ES module syntax only.
2. All routes: authenticate middleware.
3. Role restrictions: authorize('role') middleware.
4. Try/catch in every controller function.
5. Return { success: true, data: ... } or { success: false, message: '...' }.
6. Never modify auth logic without asking first.
7. Static route segments (/my, /assigned, /me, /submissions) BEFORE dynamic /:id in same router.
8. Validation errors: HTTP 400 with specific user-readable messages.

---

## How to Run

```bash
cd server && npm run dev   # port 4000
cd client && npm run dev   # port 5173 — restart after vite.config.js changes
cd server && node seed.js  # seed coordinator
```