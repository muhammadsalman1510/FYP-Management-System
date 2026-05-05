import React, { useState } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { useLocation } from 'react-router-dom';

const DefaultLayout = ({ children }) => {

  /*
    sidebarOpen is ONLY used on small screens (<992px).
    On large screens (≥992px), the sidebar is ALWAYS visible
    using CSS — the sidebarOpen state is completely ignored.
  */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const excludedRoutes = ['/login'];
  const isExcludedRoute = excludedRoutes.includes(location.pathname);

  return (
    <div className="d-flex vh-100 overflow-hidden position-relative">

      {/*
        DARK OVERLAY — small screens only (d-lg-none)
        Appears behind the sidebar when it slides open on mobile.
        Clicking it closes the sidebar.
        On large screens this never renders (d-lg-none).
      */}
      {sidebarOpen && !isExcludedRoute && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      {!isExcludedRoute && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* MAIN CONTENT */}
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        {!isExcludedRoute && (
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        <main>
          <div className={isExcludedRoute ? '' : 'p-3 p-md-4'}>
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};

export default DefaultLayout;