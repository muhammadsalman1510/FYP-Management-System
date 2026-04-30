import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import Dashboard from './pages/Dashboard/Dashboard';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';

// Import the project pages
import Proposal from './pages/Project/Proposal';
import Documents from './pages/Project/Documents';
import Status from './pages/Project/Status';

// Import the meetings pages
import MeetingRequests from './pages/MeetingRequests';

// Import the tasks page
import Tasks from './pages/Tasks/Tasks';

function App() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        {/* ========== AUTHENTICATION ROUTES (No Layout) ========== */}
        <Route
          index
          element={
            <>
              <PageTitle title="Signin | FYP Management System" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="Signin | FYP Management System" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <PageTitle title="Signup | FYP Management System" />
              <SignUp />
            </>
          }
        />

        {/* ========== PROTECTED ROUTES (With Layout) ========== */}
        <Route
          path="/dashboard"
          element={
            <DefaultLayout>
              <PageTitle title="Dashboard | FYP Management System" />
              <Dashboard />
            </DefaultLayout>
          }
        />

        {/* ========== PROJECT ROUTES ========== */}
        <Route
          path="/project/proposal"
          element={
            <DefaultLayout>
              <PageTitle title="Project Proposal | FYP Management System" />
              <Proposal />
            </DefaultLayout>
          }
        />
        <Route
          path="/project/documents"
          element={
            <DefaultLayout>
              <PageTitle title="Project Documents | FYP Management System" />
              <Documents />
            </DefaultLayout>
          }
        />
        <Route
          path="/project/status"
          element={
            <DefaultLayout>
              <PageTitle title="Project Status | FYP Management System" />
              <Status />
            </DefaultLayout>
          }
        />

        {/* ========== TASKS ROUTE ========== */}
        <Route
          path="/tasks"
          element={
            <DefaultLayout>
              <PageTitle title="Tasks | FYP Management System" />
              <Tasks />
            </DefaultLayout>
          }
        />

        {/* ========== MEETINGS ROUTES ========== */}
        <Route
          path="/meetings/calendar"
          element={
            <DefaultLayout>
              <PageTitle title="Meeting Calendar | FYP Management System" />
              <Calendar />
            </DefaultLayout>
          }
        />
        <Route
          path="/meetings/requests"
          element={
            <DefaultLayout>
              <PageTitle title="Meeting Requests | FYP Management System" />
              <MeetingRequests />
            </DefaultLayout>
          }
        />

        {/* ========== SUPERVISOR & COORDINATOR ROUTES ========== */}
        <Route
          path="/supervisor/dashboard"
          element={
            <DefaultLayout>
              <PageTitle title="Supervisor Dashboard | FYP Management System" />
              <div className="p-4">
                <h1 className="fs-4 fw-bold text-dark">
                  Supervisor Dashboard - Coming Soon
                </h1>
                <p className="text-muted mt-2">
                  Welcome Mr. Shoaib! Supervisor dashboard is under development.
                </p>
              </div>
            </DefaultLayout>
          }
        />
        <Route
          path="/coordinator/dashboard"
          element={
            <DefaultLayout>
              <PageTitle title="Coordinator Dashboard | FYP Management System" />
              <div className="p-4">
                <h1 className="fs-4 fw-bold text-dark">
                  Coordinator Dashboard - Coming Soon
                </h1>
                <p className="text-muted mt-2">
                  Welcome Mr. Omer! Coordinator dashboard is under development.
                </p>
              </div>
            </DefaultLayout>
          }
        />

        <Route
          path="/calendar"
          element={
            <DefaultLayout>
              <PageTitle title="Calendar | FYP Management System" />
              <Calendar />
            </DefaultLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <DefaultLayout>
              <PageTitle title="Profile | FYP Management System" />
              <Profile />
            </DefaultLayout>
          }
        />
        <Route
          path="/forms/form-elements"
          element={
            <DefaultLayout>
              <PageTitle title="Form Elements | FYP Management System" />
              <FormElements />
            </DefaultLayout>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <DefaultLayout>
              <PageTitle title="Form Layout | FYP Management System" />
              <FormLayout />
            </DefaultLayout>
          }
        />
        <Route
          path="/tables"
          element={
            <DefaultLayout>
              <PageTitle title="Tables | FYP Management System" />
              <Tables />
            </DefaultLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DefaultLayout>
              <PageTitle title="Settings | FYP Management System" />
              <Settings />
            </DefaultLayout>
          }
        />
        <Route
          path="/chart"
          element={
            <DefaultLayout>
              <PageTitle title="Basic Chart | FYP Management System" />
              <Chart />
            </DefaultLayout>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <DefaultLayout>
              <PageTitle title="Alerts | FYP Management System" />
              <Alerts />
            </DefaultLayout>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <DefaultLayout>
              <PageTitle title="Buttons | FYP Management System" />
              <Buttons />
            </DefaultLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;