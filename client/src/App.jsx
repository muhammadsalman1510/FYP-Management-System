import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

// Layouts
import DefaultLayout from './layout/DefaultLayout';
import CoordinatorLayout from './layout/CoordinatorLayout';
import SupervisorLayout from './layout/SupervisorLayout';

// Auth Pages
import SignIn from './pages/Authentication/SignIn';

// Student Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Proposal from './pages/Project/Proposal';
import Documents from './pages/Project/Documents';
import Status from './pages/Project/Status';
import StudentMeetingRequests from './pages/MeetingRequests';
import Tasks from './pages/Tasks/Tasks';
import Announcements from './pages/Announcements';
import SupervisorView from './pages/SupervisorView';
import CoordinatorView from './pages/CoordinatorView';

// Coordinator Pages
import CoordinatorDashboard from './pages/Coordinator/Dashboard';
import CoordinatorStudents from './pages/Coordinator/Students';
import CoordinatorSupervisors from './pages/Coordinator/Supervisors';
import Projects from './pages/Coordinator/Projects';
import CoordinatorProposals from './pages/Coordinator/Proposals';
import CoordinatorTasks from './pages/Coordinator/Tasks';
import CoordinatorMeetingCalendar from './pages/Coordinator/MeetingCalendar';
import CoordinatorScheduleMeeting from './pages/Coordinator/ScheduleMeeting';
import CoordinatorMeetingRequests from './pages/Coordinator/MeetingRequests';
import CoordinatorAnnouncements from './pages/Coordinator/Announcements';
import CoordinatorProfile from './pages/Coordinator/Profile';
import ProjectDetail from './pages/Coordinator/ProjectDetail';

// Supervisor Pages
import SupervisorDashboard from './pages/Supervisor/Dashboard';
import SupervisorProjects from './pages/Supervisor/Projects';
import SupervisorProjectDetail from './pages/Supervisor/ProjectDetail';
import SupervisorProposals from './pages/Supervisor/Proposals';
import SupervisorTasks from './pages/Supervisor/Tasks';

import SupervisorMeetingCalendar from './pages/Supervisor/MeetingCalendar';
import SupervisorMeetingRequests from './pages/Supervisor/MeetingRequests';
import SupervisorAnnouncements from './pages/Supervisor/Announcements';
import SupervisorProfile from './pages/Supervisor/Profile';

// Reads the user's role from localStorage.
// Prefers the explicit 'role' key; falls back to parsing the 'user' JSON object.
const getStoredRole = () => {
  const explicit = localStorage.getItem('role');
  if (explicit) return explicit;
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || null;
  } catch {
    return null;
  }
};

// Redirects already-authenticated users away from the login page to their dashboard.
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role  = getStoredRole();

  if (token) {
    if (role === 'coordinator') return <Navigate to="/coordinator/dashboard" replace />;
    if (role === 'supervisor')  return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Guards a route. Redirects to login if no token; redirects to own dashboard if wrong role.
const ProtectedRoute = ({ children, role }) => {
  const token    = localStorage.getItem('token');
  const userRole = getStoredRole();

  if (!token) return <Navigate to="/" replace />;

  if (role && userRole !== role) {
    if (userRole === 'coordinator') return <Navigate to="/coordinator/dashboard" replace />;
    if (userRole === 'supervisor')  return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { setTimeout(() => setLoading(false), 1000); }, []);

  return loading ? <Loader /> : (
    <Routes>

      {/* ── AUTH ── */}
      <Route index element={
        <AuthRoute>
          <PageTitle title="Sign In | FYP Management System" />
          <SignIn />
        </AuthRoute>
      } />
      <Route path="/login" element={
        <AuthRoute>
          <PageTitle title="Sign In | FYP Management System" />
          <SignIn />
        </AuthRoute>
      } />


      {/* ── STUDENT ROUTES ── */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Dashboard | FYP Management System" /><Dashboard /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/proposal" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Project Proposal | FYP Management System" /><Proposal /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/documents" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Project Documents | FYP Management System" /><Documents /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/status" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Project | FYP Management System" /><Status /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Tasks | FYP Management System" /><Tasks /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/meetings/calendar" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Meeting Calendar | FYP Management System" /><Calendar /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/meetings/requests" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Meeting Requests | FYP Management System" /><StudentMeetingRequests /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Announcements | FYP Management System" /><Announcements /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/view" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="My Supervisor | FYP Management System" /><SupervisorView /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/view" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Coordinator | FYP Management System" /><CoordinatorView /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="Calendar | FYP Management System" /><Calendar /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute role="student">
          <DefaultLayout><PageTitle title="My Profile | FYP Management System" /><Profile /></DefaultLayout>
        </ProtectedRoute>
      } />


      {/* ── COORDINATOR ROUTES ── */}
      <Route path="/coordinator/dashboard" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Coordinator Dashboard | FYP Management System" /><CoordinatorDashboard /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/students" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Students | FYP Management System" /><CoordinatorStudents /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/supervisors" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Supervisors | FYP Management System" /><CoordinatorSupervisors /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/projects" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Projects | FYP Management System" /><Projects /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/proposals" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Proposals | FYP Management System" /><CoordinatorProposals /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/tasks" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Tasks | FYP Management System" /><CoordinatorTasks /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/calendar" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><CoordinatorMeetingCalendar /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/schedule" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Schedule Meeting | FYP Management System" /><CoordinatorScheduleMeeting /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/requests" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Meeting Requests | FYP Management System" /><CoordinatorMeetingRequests /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/announcements" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Announcements | FYP Management System" /><CoordinatorAnnouncements /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/profile" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="My Profile | FYP Management System" /><CoordinatorProfile /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/projects/:id" element={
        <ProtectedRoute role="coordinator">
          <CoordinatorLayout><PageTitle title="Project Details | FYP Management System" /><ProjectDetail /></CoordinatorLayout>
        </ProtectedRoute>
      } />


      {/* ── SUPERVISOR ROUTES ── */}
      <Route path="/supervisor/dashboard" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Supervisor Dashboard | FYP Management System" /><SupervisorDashboard /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/projects" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="My Projects | FYP Management System" /><SupervisorProjects /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/projects/:id" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Project Details | FYP Management System" /><SupervisorProjectDetail /></SupervisorLayout>
        </ProtectedRoute>
      } />

      <Route path="/supervisor/proposals" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Proposals | FYP Management System" /><SupervisorProposals /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/tasks" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Tasks | FYP Management System" /><SupervisorTasks /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/meetings/calendar" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><SupervisorMeetingCalendar /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/meetings/requests" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Meeting Requests | FYP Management System" /><SupervisorMeetingRequests /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/announcements" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="Announcements | FYP Management System" /><SupervisorAnnouncements /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/profile" element={
        <ProtectedRoute role="supervisor">
          <SupervisorLayout><PageTitle title="My Profile | FYP Management System" /><SupervisorProfile /></SupervisorLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
