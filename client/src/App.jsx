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
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Chart from './pages/Chart';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
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

// Redirects to the correct dashboard if the user is already logged in
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (token) {
    if (role === 'coordinator') return <Navigate to="/coordinator/dashboard" replace />;
    if (role === 'supervisor')  return <Navigate to="/supervisor/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Redirects to login if not authenticated, or to own dashboard if wrong role
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return <Navigate to="/" replace />;

  if (allowedRole && role !== allowedRole) {
    if (role === 'coordinator') return <Navigate to="/coordinator/dashboard" replace />;
    if (role === 'supervisor')  return <Navigate to="/supervisor/dashboard" replace />;
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

      {/* AUTH ROUTES — No layout. Redirect to dashboard if already logged in. */}
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


      {/* STUDENT ROUTES — DefaultLayout, role: student */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Dashboard | FYP Management System" /><Dashboard /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/proposal" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Project Proposal | FYP Management System" /><Proposal /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/documents" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Project Documents | FYP Management System" /><Documents /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/project/status" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Project | FYP Management System" /><Status /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Tasks | FYP Management System" /><Tasks /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/meetings/calendar" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Meeting Calendar | FYP Management System" /><Calendar /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/meetings/requests" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Meeting Requests | FYP Management System" /><StudentMeetingRequests /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Announcements | FYP Management System" /><Announcements /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/view" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="My Supervisor | FYP Management System" /><SupervisorView /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/view" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Coordinator | FYP Management System" /><CoordinatorView /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Calendar | FYP Management System" /><Calendar /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Profile | FYP Management System" /><Profile /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Settings | FYP Management System" /><Settings /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/tables" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Tables | FYP Management System" /><Tables /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/chart" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Chart | FYP Management System" /><Chart /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/form-elements" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Form Elements | FYP Management System" /><FormElements /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/forms/form-layout" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Form Layout | FYP Management System" /><FormLayout /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/ui/alerts" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Alerts | FYP Management System" /><Alerts /></DefaultLayout>
        </ProtectedRoute>
      } />
      <Route path="/ui/buttons" element={
        <ProtectedRoute allowedRole="student">
          <DefaultLayout><PageTitle title="Buttons | FYP Management System" /><Buttons /></DefaultLayout>
        </ProtectedRoute>
      } />


      {/* COORDINATOR ROUTES — CoordinatorLayout, role: coordinator */}
      <Route path="/coordinator/dashboard" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Coordinator Dashboard | FYP Management System" /><CoordinatorDashboard /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/students" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Students | FYP Management System" /><CoordinatorStudents /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/supervisors" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Supervisors | FYP Management System" /><CoordinatorSupervisors /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/accounts/projects" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Manage Projects | FYP Management System" /><Projects /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/proposals" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Proposals | FYP Management System" /><CoordinatorProposals /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/tasks" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Tasks | FYP Management System" /><CoordinatorTasks /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/calendar" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><CoordinatorMeetingCalendar /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/schedule" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Schedule Meeting | FYP Management System" /><CoordinatorScheduleMeeting /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/meetings/requests" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Meeting Requests | FYP Management System" /><CoordinatorMeetingRequests /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/announcements" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Announcements | FYP Management System" /><CoordinatorAnnouncements /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/profile" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Coordinator Profile | FYP Management System" /><CoordinatorProfile /></CoordinatorLayout>
        </ProtectedRoute>
      } />
      <Route path="/coordinator/projects/:id" element={
        <ProtectedRoute allowedRole="coordinator">
          <CoordinatorLayout><PageTitle title="Project Details | FYP Management System" /><ProjectDetail /></CoordinatorLayout>
        </ProtectedRoute>
      } />


      {/* SUPERVISOR ROUTES — SupervisorLayout, role: supervisor */}
      <Route path="/supervisor/dashboard" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Supervisor Dashboard | FYP Management System" /><SupervisorDashboard /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/projects" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="My Projects | FYP Management System" /><SupervisorProjects /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/projects/:id" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Project Details | FYP Management System" /><SupervisorProjectDetail /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/proposals" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Proposals | FYP Management System" /><SupervisorProposals /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/tasks" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Tasks | FYP Management System" /><SupervisorTasks /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/meetings/calendar" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><SupervisorMeetingCalendar /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/meetings/requests" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Meeting Requests | FYP Management System" /><SupervisorMeetingRequests /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/announcements" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Announcements | FYP Management System" /><SupervisorAnnouncements /></SupervisorLayout>
        </ProtectedRoute>
      } />
      <Route path="/supervisor/profile" element={
        <ProtectedRoute allowedRole="supervisor">
          <SupervisorLayout><PageTitle title="Supervisor Profile | FYP Management System" /><SupervisorProfile /></SupervisorLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;
