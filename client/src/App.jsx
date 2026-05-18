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

//  Student Pages
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
import SupervisorStudents from './pages/Supervisor/Students';
import SupervisorStudentDetail from './pages/Supervisor/StudentDetail';
import SupervisorProposals from './pages/Supervisor/Proposals';
import SupervisorTasks from './pages/Supervisor/Tasks';
import SupervisorMeetingCalendar from './pages/Supervisor/MeetingCalendar';
import SupervisorMeetingRequests from './pages/Supervisor/MeetingRequests';
import SupervisorAnnouncements from './pages/Supervisor/Announcements';
import SupervisorProfile from './pages/Supervisor/Profile';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { setTimeout(() => setLoading(false), 1000); }, []);

  return loading ? <Loader /> : (
    <Routes>

      {/*
          AUTH ROUTES — No layout
        */}
      <Route index element={<><PageTitle title="Sign In | FYP Management System" /><SignIn /></>} />
      <Route path="/login" element={<><PageTitle title="Sign In | FYP Management System" /><SignIn /></>} />


      {/*
          STUDENT ROUTES — DefaultLayout
         */}
      <Route path="/dashboard" element={
        <DefaultLayout><PageTitle title="Dashboard | FYP Management System" /><Dashboard /></DefaultLayout>
      } />
      <Route path="/project/proposal" element={
        <DefaultLayout><PageTitle title="Project Proposal | FYP Management System" /><Proposal /></DefaultLayout>
      } />
      <Route path="/project/documents" element={
        <DefaultLayout><PageTitle title="Project Documents | FYP Management System" /><Documents /></DefaultLayout>
      } />
      <Route path="/project/status" element={
        <DefaultLayout><PageTitle title="Project Status | FYP Management System" /><Status /></DefaultLayout>
      } />
      <Route path="/tasks" element={
        <DefaultLayout><PageTitle title="Tasks | FYP Management System" /><Tasks /></DefaultLayout>
      } />
      <Route path="/meetings/calendar" element={
        <DefaultLayout><PageTitle title="Meeting Calendar | FYP Management System" /><Calendar /></DefaultLayout>
      } />
      <Route path="/meetings/requests" element={
        <DefaultLayout><PageTitle title="Meeting Requests | FYP Management System" /><StudentMeetingRequests /></DefaultLayout>
      } />
      <Route path="/announcements" element={
        <DefaultLayout><PageTitle title="Announcements | FYP Management System" /><Announcements /></DefaultLayout>
      } />
      <Route path="/supervisor/view" element={
        <DefaultLayout><PageTitle title="My Supervisor | FYP Management System" /><SupervisorView /></DefaultLayout>
      } />
      <Route path="/coordinator/view" element={
        <DefaultLayout><PageTitle title="Coordinator | FYP Management System" /><CoordinatorView /></DefaultLayout>
      } />
      <Route path="/calendar" element={
        <DefaultLayout><PageTitle title="Calendar | FYP Management System" /><Calendar /></DefaultLayout>
      } />
      <Route path="/profile" element={
        <DefaultLayout><PageTitle title="Profile | FYP Management System" /><Profile /></DefaultLayout>
      } />
      <Route path="/settings" element={
        <DefaultLayout><PageTitle title="Settings | FYP Management System" /><Settings /></DefaultLayout>
      } />
      <Route path="/tables" element={
        <DefaultLayout><PageTitle title="Tables | FYP Management System" /><Tables /></DefaultLayout>
      } />
      <Route path="/chart" element={
        <DefaultLayout><PageTitle title="Chart | FYP Management System" /><Chart /></DefaultLayout>
      } />
      <Route path="/forms/form-elements" element={
        <DefaultLayout><PageTitle title="Form Elements | FYP Management System" /><FormElements /></DefaultLayout>
      } />
      <Route path="/forms/form-layout" element={
        <DefaultLayout><PageTitle title="Form Layout | FYP Management System" /><FormLayout /></DefaultLayout>
      } />
      <Route path="/ui/alerts" element={
        <DefaultLayout><PageTitle title="Alerts | FYP Management System" /><Alerts /></DefaultLayout>
      } />
      <Route path="/ui/buttons" element={
        <DefaultLayout><PageTitle title="Buttons | FYP Management System" /><Buttons /></DefaultLayout>
      } />


      {/*
          COORDINATOR ROUTES — CoordinatorLayout
         */}
      <Route path="/coordinator/dashboard" element={
        <CoordinatorLayout><PageTitle title="Coordinator Dashboard | FYP Management System" /><CoordinatorDashboard /></CoordinatorLayout>
      } />
      <Route path="/coordinator/accounts/students" element={
        <CoordinatorLayout><PageTitle title="Manage Students | FYP Management System" /><CoordinatorStudents /></CoordinatorLayout>
      } />
      <Route path="/coordinator/accounts/supervisors" element={
        <CoordinatorLayout><PageTitle title="Manage Supervisors | FYP Management System" /><CoordinatorSupervisors /></CoordinatorLayout>
      } />
      <Route path="/coordinator/accounts/projects" element={
        <CoordinatorLayout><PageTitle title="Manage Projects | FYP Management System" /><Projects /></CoordinatorLayout>
      } />
      <Route path="/coordinator/proposals" element={
        <CoordinatorLayout><PageTitle title="Proposals | FYP Management System" /><CoordinatorProposals /></CoordinatorLayout>
      } />
      <Route path="/coordinator/tasks" element={
        <CoordinatorLayout><PageTitle title="Tasks | FYP Management System" /><CoordinatorTasks /></CoordinatorLayout>
      } />
      <Route path="/coordinator/meetings/calendar" element={
        <CoordinatorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><CoordinatorMeetingCalendar /></CoordinatorLayout>
      } />
      <Route path="/coordinator/meetings/schedule" element={
        <CoordinatorLayout><PageTitle title="Schedule Meeting | FYP Management System" /><CoordinatorScheduleMeeting /></CoordinatorLayout>
      } />
      <Route path="/coordinator/meetings/requests" element={
        <CoordinatorLayout><PageTitle title="Meeting Requests | FYP Management System" /><CoordinatorMeetingRequests /></CoordinatorLayout>
      } />
      <Route path="/coordinator/announcements" element={
        <CoordinatorLayout><PageTitle title="Announcements | FYP Management System" /><CoordinatorAnnouncements /></CoordinatorLayout>
      } />
      <Route path="/coordinator/profile" element={
        <CoordinatorLayout><PageTitle title="Coordinator Profile | FYP Management System" /><CoordinatorProfile /></CoordinatorLayout>
      } />
      <Route path="/coordinator/projects/:id" element={
        <CoordinatorLayout><PageTitle title="Project Details | FYP Management System" /><ProjectDetail /></CoordinatorLayout>
      } />


      {/*
          SUPERVISOR ROUTES — SupervisorLayout
         */}
      <Route path="/supervisor/dashboard" element={
        <SupervisorLayout><PageTitle title="Supervisor Dashboard | FYP Management System" /><SupervisorDashboard /></SupervisorLayout>
      } />
      <Route path="/supervisor/students" element={
        <SupervisorLayout><PageTitle title="My Students | FYP Management System" /><SupervisorStudents /></SupervisorLayout>
      } />
      <Route path="/supervisor/students/:id" element={
        <SupervisorLayout><PageTitle title="Student Detail | FYP Management System" /><SupervisorStudentDetail /></SupervisorLayout>
      } />
      <Route path="/supervisor/proposals" element={
        <SupervisorLayout><PageTitle title="Proposals | FYP Management System" /><SupervisorProposals /></SupervisorLayout>
      } />
      <Route path="/supervisor/tasks" element={
        <SupervisorLayout><PageTitle title="Tasks | FYP Management System" /><SupervisorTasks /></SupervisorLayout>
      } />
      <Route path="/supervisor/meetings/calendar" element={
        <SupervisorLayout><PageTitle title="Meeting Calendar | FYP Management System" /><SupervisorMeetingCalendar /></SupervisorLayout>
      } />
      <Route path="/supervisor/meetings/requests" element={
        <SupervisorLayout><PageTitle title="Meeting Requests | FYP Management System" /><SupervisorMeetingRequests /></SupervisorLayout>
      } />
      <Route path="/supervisor/announcements" element={
        <SupervisorLayout><PageTitle title="Announcements | FYP Management System" /><SupervisorAnnouncements /></SupervisorLayout>
      } />
      <Route path="/supervisor/profile" element={
        <SupervisorLayout><PageTitle title="Supervisor Profile | FYP Management System" /><SupervisorProfile /></SupervisorLayout>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;