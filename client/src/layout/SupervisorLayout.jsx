import React, { useState } from 'react';
import Header from '../components/Header/index';
import SupervisorSidebar from '../components/Sidebar/SupervisorSidebar';

const SupervisorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex vh-100 overflow-hidden position-relative">
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1039 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <SupervisorSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="d-flex flex-column flex-grow-1 overflow-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main>
          <div className="p-3 p-md-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;