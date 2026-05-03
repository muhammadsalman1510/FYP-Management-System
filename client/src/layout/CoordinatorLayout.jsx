import React, { useState } from 'react';
import Header from '../components/Header/index';
import CoordinatorSidebar from '../components/Sidebar/CoordinatorSidebar';

/*
  CoordinatorLayout wraps all coordinator pages.
  It is identical in structure to DefaultLayout but uses
  CoordinatorSidebar which has coordinator-specific menu items.
*/
const CoordinatorLayout = ({ children }) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex vh-100 overflow-hidden position-relative">

      {/* Dark overlay — small screens only when sidebar is open */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Coordinator Sidebar */}
      <CoordinatorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="d-flex flex-column flex-grow-1 overflow-auto">

        {/* Header (same header used across all roles) */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main>
          <div className="p-3 p-md-4">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default CoordinatorLayout;