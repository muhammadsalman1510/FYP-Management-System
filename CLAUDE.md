# FYP Management System — Project Instructions for Claude Code

This file contains everything Claude Code needs to understand, work on, and continue building this project without asking repeated questions.

**IMPORTANT — READ THIS FIRST:**
Before doing anything, read this entire file. Do not start writing code until you have fully understood the current project state, the phase sequence, and all the rules at the bottom of this file.

---

## Project Overview

This is a **Final Year Project (FYP) Management System** built as a university capstone project.

The system manages group-based final year projects at a university level. It serves three user roles — Coordinator, Supervisor, and Student — each with their own dedicated portal, sidebar, and workflow.

The project is a **MERN stack** application:
- **Frontend:** React 18, Vite, React Router v6, Bootstrap 5, TailAdmin template
- **Backend:** Node.js, Express 5, MongoDB, Mongoose 9, JWT authentication
- **Database:** MongoDB (via Mongoose)

---

## CURRENT STATUS

### ✅ Frontend — 100% COMPLETE AND VERIFIED
All pages built, all bugs fixed, full SQA completed across all 3 roles.
Do NOT modify any frontend files unless a bug is explicitly reported.

### 🔧 Backend — IN PROGRESS (CURRENT PHASE)
Follow the 5-step backend build sequence below.

---

## Repository Structure

```
Fyp/
├── client/
│   └── src/
│       ├── App.jsx                        # All routes — ProtectedRoute, AuthRoute, getStoredRole()
│       ├── layout/
│       │   ├── DefaultLayout.jsx
│       │   ├── CoordinatorLayout.jsx
│       │   └── SupervisorLayout.jsx
│       ├── components/
│       │   ├── Sidebar/
│       │   │   ├── index.jsx              # Student sidebar — toggle-only parent items
│       │   │   ├── CoordinatorSidebar.jsx # toggle-only parent items
│       │   │   ├── SupervisorSidebar.jsx  # No My Students link
│       │   │   └── SidebarLinkGroup.jsx
│       │   ├── Header/
│       │   │   ├── index.jsx
│       │   │   └── DropdownUser.jsx       # Reads name+role from localStorage; My Profile + Log Out only
│       │   └── Breadcrumbs/Breadcrumb.jsx # Fixed — no double slash
│       └── pages/
│           ├── Authentication/
│           │   └── SignIn.jsx             # Saves token, user, name, role to localStorage; inline error
│           ├── Dashboard/Dashboard.jsx    # Student post-login landing
│           ├── Project/
│           │   ├── Proposal.jsx
│           │   ├── Documents.jsx
│           │   └── Status.jsx             # Renamed from "Project Status"; has pending tasks widget
│           ├── Tasks/Tasks.jsx            # Project tag on every row; per-task upload state
│           ├── MeetingRequests.jsx        # Has "+ New Meeting Request" modal
│           ├── Announcements.jsx          # View only; all posts by Dr. Asadullah Ehsan (Coordinator)
│           ├── SupervisorView.jsx
│           ├── CoordinatorView.jsx
│           ├── Profile.jsx                # Edit profile + change password + photo upload
│           ├── Coordinator/
│           │   ├── Dashboard.jsx
│           │   ├── Students.jsx           # Real API calls
│           │   ├── Supervisors.jsx        # Real API calls
│           │   ├── Projects.jsx           # Real API calls
│           │   ├── ProjectDetail.jsx      # Real API calls — 4 tabs
│           │   ├── Proposals.jsx          # Approve/reject — all 3 states
│           │   ├── Tasks.jsx              # Searchable dropdown, All Projects, project tags, validation
│           │   ├── MeetingCalendar.jsx
│           │   ├── ScheduleMeeting.jsx
│           │   ├── MeetingRequests.jsx
│           │   ├── Announcements.jsx      # Only role that can post/delete
│           │   └── Profile.jsx            # Edit profile + change password + photo upload
│           └── Supervisor/
│               ├── Dashboard.jsx          # Stat card says "Total Students" not "My Students"
│               ├── Projects.jsx           # Hardcoded — list of assigned projects
│               ├── ProjectDetail.jsx      # 4 tabs: Overview, Tasks, Submissions, Documents
│               ├── Proposals.jsx          # Read only
│               ├── Tasks.jsx              # Grouped by project; filter dropdown
│               ├── MeetingCalendar.jsx
│               ├── MeetingRequests.jsx    # Approve/reject + "+ Request Meeting" modal
│               ├── Announcements.jsx      # View only — coordinator announcements only
│               └── Profile.jsx            # Edit profile + change password + photo upload
│
└── server/
    ├── index.js                           # Port 4000
    ├── config/db.js
    ├── middleware/auth.middleware.js       # authenticate + authorize
    ├── models/
    │   ├── user.model.js
    │   ├── student-profile.model.js       # supervisorId OBSOLETE — do not use
    │   ├── supervisor-profile.model.js    # currentProjects will be refactored
    │   ├── project.model.js               # Needs extension — see Step 1 below
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

## localStorage Keys — Critical, Do Not Change

```js
// Set on login
localStorage.setItem('token', data.token)
localStorage.setItem('user',  JSON.stringify(data.user))
localStorage.setItem('name',  data.user.name)
localStorage.setItem('role',  data.user.role)

// Cleared on logout
localStorage.removeItem('token')
localStorage.removeItem('user')
localStorage.removeItem('name')
localStorage.removeItem('role')
```

---

## User Roles

### Coordinator
- Admin. One coordinator, seeded via `seed.js`.
- Can create/edit/delete students, supervisors, projects.
- **Only role that can post and delete announcements.**
- Can approve/reject proposals, create tasks, mark milestones, review submissions.
- Landing page: `/coordinator/dashboard`

### Supervisor
- Assigned to projects by coordinator.
- Can view assigned projects, create tasks, review submissions.
- Proposals — read only. Announcements — read only.
- Can approve/reject student meeting requests, request coordinator meetings.
- Landing page: `/supervisor/dashboard`

### Student
- Has exactly ONE project.
- Can submit proposal, upload documents, submit tasks, request meetings.
- Announcements — read only.
- Landing page: `/dashboard`

---

## Backend — Currently Working

### Auth
- `POST /api/auth/login` ✅

### Users (Coordinator only)
- `POST /api/users` ✅
- `GET /api/users` ✅
- `GET /api/users/:id` ✅
- `PUT /api/users/:id` ✅
- `DELETE /api/users/:id` ✅

### Projects (Coordinator only)
- `POST /api/projects` ✅
- `GET /api/projects` ✅
- `GET /api/projects/:id` ✅
- `PUT /api/projects/:id` ✅
- `PUT /api/projects/:id/supervisor` ✅
- `PUT /api/projects/:id/students` ✅
- `DELETE /api/projects/:id/students/:studentId` ✅
- `DELETE /api/projects/:id` ✅

### Announcements
- `POST /api/announcements` — no auth, incomplete ⚠️

---

## Backend Build Sequence — DO THIS NOW

### STEP 1 — Extend Project Model
File: `server/models/project.model.js`

Add these fields:
```js
supervisors:  [{ type: ObjectId, ref: 'User' }]   // replace single supervisorId
coordinator:  { type: ObjectId, ref: 'User' }
status: {
  type: String,
  enum: ['pending_proposal', 'active', 'completed'],
  default: 'pending_proposal'
}
milestones: [{
  id:          Number,
  name:        String,
  description: String,
  completed:   { type: Boolean, default: false },
  completedAt: Date
}]
progress:   { type: Number, default: 0 }
proposalId: { type: ObjectId, ref: 'Proposal' }
```

Default milestones array to seed into every new project:
```js
[
  { id:1, name:'Project Proposal',   description:'Proposal submitted and approved by coordinator.', completed:false },
  { id:2, name:'Project Defense',    description:'Initial defense presented to supervisor and coordinator.', completed:false },
  { id:3, name:'Implementation',     description:'Core development and implementation phase.', completed:false },
  { id:4, name:'Documentation',      description:'Full project documentation submitted.', completed:false },
  { id:5, name:'Final Presentation', description:'Final project presented and signed off.', completed:false },
]
```

Also remove `supervisorId` field from StudentProfile.

### STEP 2 — Create New Models

Create these files in `server/models/`:

**proposal.model.js**
```js
{ title, description, problemStatement, techStack,
  groupMembers: [{ name: String, rollNumber: String }],
  submittedBy: ObjectId→User, projectId: ObjectId→Project,
  attachmentUrl: String,
  status: { type: String, enum:['pending','approved','rejected'], default:'pending' },
  coordinatorFeedback: String,
  submittedAt: { type: Date, default: Date.now } }
```

**task.model.js**
```js
{ title, instructions,
  openDate: Date, dueDate: Date,
  projectId: { type: ObjectId, ref:'Project', default: null },
  createdBy: ObjectId→User,
  creatorRole: { type: String, enum:['supervisor','coordinator'] },
  attachmentUrl: String,
  targetScope: { type: String, enum:['project','all'], default:'project' } }
```

**tasksubmission.model.js**
```js
{ taskId: ObjectId→Task, submittedBy: ObjectId→User,
  projectId: ObjectId→Project,
  fileUrl: String, fileName: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum:['pending','approved','rejected'], default:'pending' },
  feedback: String }
```

**document.model.js**
```js
{ projectId: ObjectId→Project, uploadedBy: ObjectId→User,
  type: { type: String, enum:['Proposal','Literature Review','Progress Report','Implementation','Screenshots','Final Report','Other'] },
  fileName: String, fileUrl: String,
  size: String,
  uploadedAt: { type: Date, default: Date.now } }
```

**meeting.model.js**
```js
{ requestedBy: ObjectId→User, requestedTo: ObjectId→User,
  projectId: { type: ObjectId, ref:'Project', default: null },
  proposedDate: Date, proposedTime: String,
  topic: String,
  status: { type: String, enum:['pending','approved','rejected'], default:'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now } }
```

### STEP 3 — Proposal Routes

Create `server/routes/proposal.routes.js` and `server/controllers/proposal.controller.js`:

```
POST   /api/proposals
  auth: student only
  body: { title, description, problemStatement, techStack, groupMembers, projectId }
  validates: groupMembers roll numbers exist in DB
  creates Proposal with status: 'pending'

GET    /api/proposals
  auth: coordinator + supervisor
  coordinator sees all, supervisor sees proposals for their projects

PUT    /api/proposals/:id/review
  auth: coordinator only
  body: { status: 'approved'|'rejected', coordinatorFeedback }
  on approved: auto-complete milestone 1, set project.status = 'active',
               set project.proposalId = proposal._id,
               recalculate project.progress
```

### STEP 4 — Task + Submission Routes

Create `server/routes/task.routes.js` and `server/controllers/task.controller.js`:

```
POST   /api/tasks
  auth: coordinator + supervisor
  body: { title, instructions, openDate, dueDate, projectId, targetScope, attachmentUrl }
  if targetScope='all' and coordinator: creates one task linked to null projectId
  if targetScope='all' and supervisor: creates tasks for all their assigned projects

GET    /api/tasks
  auth: all roles
  student: returns tasks for their project only
  supervisor: returns tasks they created, grouped by project
  coordinator: returns all tasks

POST   /api/tasks/:id/submit
  auth: student only
  body: multipart/form-data with file
  uses Multer for file upload
  creates TaskSubmission

GET    /api/tasks/submissions
  auth: coordinator + supervisor
  supervisor: their tasks' submissions only
  coordinator: all submissions

PUT    /api/tasks/submissions/:id/review
  auth: coordinator + supervisor
  body: { status: 'approved'|'rejected', feedback }
```

### STEP 5 — Document, Meeting, Announcement Routes

**Documents:**
```
POST   /api/documents
  auth: student only
  multipart/form-data: file + type
  uses Multer

GET    /api/documents
  student: their project docs
  supervisor: docs for assigned projects
  coordinator: all docs
```

**Meetings:**
```
POST   /api/meetings
  auth: all roles
  body: { requestedTo, projectId, proposedDate, proposedTime, topic }

GET    /api/meetings
  returns meetings relevant to logged-in user

PUT    /api/meetings/:id
  auth: supervisor + coordinator
  body: { status: 'approved'|'rejected', notes }
```

**Announcements (fix existing):**
```
POST   /api/announcements
  auth: coordinator only (add authenticate + authorize middleware)
  body: { title, content }

GET    /api/announcements
  auth: all roles
  returns all announcements newest first
```

**User profile (self-update):**
```
GET    /api/users/me
  auth: all roles
  returns full user + profile data for logged-in user

PUT    /api/users/me
  auth: all roles
  body: { name, email, phone, ...role-specific fields }

PUT    /api/users/me/password
  auth: all roles
  body: { currentPassword, newPassword }
  validates current password before updating

POST   /api/users/me/photo
  auth: all roles
  multipart/form-data: image file
  uses Multer, saves to uploads folder or cloud storage
```

**Project milestone:**
```
PUT    /api/projects/:id/milestones/:milestoneId
  auth: coordinator only
  body: { completed: true }
  recalculates project.progress = (completedCount / 5) * 100
  if milestoneId === 1 and completed: also sets project.status = 'active'
```

**Student project route:**
```
GET    /api/projects/my
  auth: student only
  finds project where students array includes req.user._id
  returns full project with populated supervisor, coordinator, students, milestones
```

**Supervisor assigned projects:**
```
GET    /api/projects/assigned
  auth: supervisor only
  finds projects where supervisors array includes req.user._id
  returns populated list
```

---

## File Upload Setup (Multer)

Install: `npm install multer`

Create `server/middleware/upload.middleware.js`:
```js
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|jpg|jpeg|png|zip/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});
```

Create `uploads/` folder at server root. Add to `.gitignore`:
```
uploads/
```

Serve static files in `server/index.js`:
```js
app.use('/uploads', express.static('uploads'));
```

---

## Backend Architecture Notes

- ES modules (`"type": "module"` in server/package.json)
- All models: `export default mongoose.model(...)`
- Transactions for user creation/deletion
- Server port: 4000 | Frontend port: 5173
- `.env`: `MONGO_URI`, `JWT_SECRET`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

---

## Important Rules When Writing Backend Code

1. **Read this entire CLAUDE.md before writing any code.**
2. Always return complete files — never partial snippets.
3. Always state exact file path before the code block.
4. Use ES module syntax throughout — `import/export`, not `require`.
5. All routes must use `authenticate` middleware.
6. Role-restricted routes must use `authorize('role')` middleware.
7. Never modify existing working routes unless explicitly asked.
8. Never touch any frontend files during the backend phase.
9. **Never modify auth logic or DB schemas without asking first.**
10. Every new route file must be imported and mounted in `server/index.js`.
11. Use try/catch in every controller function.
12. Return consistent response format: `{ success: true, data: ... }` or `{ success: false, message: '...' }`.
13. File upload routes use Multer middleware before the controller.

---

## How to Run

```bash
# Backend (port 4000)
cd server && npm install && npm run dev

# Frontend (port 5173)
cd client && npm install && npm run dev

# Seed coordinator
cd server && node seed.js
```