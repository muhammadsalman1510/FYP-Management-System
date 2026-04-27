import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import SidebarLinkGroup from './SidebarLinkGroup';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? true : storedSidebarExpanded === 'true'
  );

  // Close sidebar on Escape key (small screens only)
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
  }, [sidebarExpanded]);

  // Only close sidebar on nav click when on small screens
  const handleNavClick = () => {
    if (window.innerWidth < 992) setSidebarOpen(false);
  };

  return (
    <>
      <style>{`
        /*
          ════════════════════════════════════════════════
          SIDEBAR RESPONSIVE BEHAVIOUR
          ════════════════════════════════════════════════

          LARGE SCREENS (≥992px):
            - Sidebar is part of normal page layout (sticky)
            - Always visible — no toggling, no animation
            - Fixed width of 260px, sits to the left of content
            - NO X button shown inside sidebar

          SMALL/MEDIUM SCREENS (<992px):
            - Sidebar floats OVER the page (position: fixed)
            - Hidden off-screen by default (translateX -100%)
            - Slides in when hamburger is clicked (translateX 0)
            - Dark overlay covers page behind it
            - X button inside sidebar header closes it
          ════════════════════════════════════════════════
        */

        /* ── LARGE SCREENS ── */
        @media (min-width: 992px) {
          #app-sidebar {
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
            width: 260px !important;
            min-width: 260px !important;
            /* Never hidden on large screens */
            transform: none !important;
          }
        }

        /* ── SMALL / MEDIUM SCREENS ── */
        @media (max-width: 991.98px) {
          #app-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            width: 260px !important;
            min-width: 260px !important;
            /* Slide in when open, hide off-screen when closed */
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'} !important;
            transition: transform 0.3s ease !important;
          }
        }
      `}</style>

      <aside
        id="app-sidebar"
        className="d-flex flex-column"
        style={{
          backgroundColor: '#1e2433',
          zIndex: 1040,
          overflowX: 'hidden',
        }}
      >

        {/* ══════════════════════════════════
            SIDEBAR HEADER
            ══════════════════════════════════ */}
        <div
          className="d-flex align-items-center justify-content-between px-4"
          style={{
            borderBottom: '1px solid #2d3748',
            minHeight: '65px',
            flexShrink: 0,
          }}
        >
          {/* Brand name */}
          <NavLink to="/dashboard" className="text-decoration-none">
            <span className="fw-bold text-white" style={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
              FYP-Management
            </span>
          </NavLink>

          {/*
            X close button — ONLY on small/medium screens.
            d-lg-none = completely hidden on large screens (≥992px).
            On large screens the sidebar is always visible so no
            close button is needed.
          */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn p-0 border-0 d-lg-none ms-2"
            aria-label="Close sidebar"
            style={{ lineHeight: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M1 1L17 17M17 1L1 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* ══ END SIDEBAR HEADER ══ */}

        {/* ══════════════════════════════════
            SIDEBAR MENU (scrollable)
            ══════════════════════════════════ */}
        <div
          className="flex-grow-1 overflow-auto no-scrollbar"
          style={{ overflowX: 'hidden' }}
        >
          <nav className="mt-3 px-3 pb-4">

            {/* Section label */}
            <p
              className="text-uppercase fw-semibold px-2 mb-3"
              style={{ fontSize: '0.68rem', letterSpacing: '0.1em', color: '#8892a4' }}
            >
              Menu
            </p>

            <ul className="list-unstyled d-flex flex-column gap-1 mb-0">

              {/* ── Dashboard ── */}
              <li>
                <NavLink
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link ${pathname === '/dashboard' || pathname.includes('dashboard') ? 'sidebar-link-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z"/>
                    <path d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2127 1.7438 16.4252 0.956299 15.4689 0.956299Z"/>
                    <path d="M6.10322 9.92822H2.53135C1.5751 9.92822 0.787598 10.7157 0.787598 11.672V15.2438C0.787598 16.2001 1.5751 16.9876 2.53135 16.9876H6.10322C7.05947 16.9876 7.84697 16.2001 7.84697 15.2438V11.7001C7.8751 10.7157 7.0876 9.92822 6.10322 9.92822Z"/>
                    <path d="M15.4689 9.92822H11.8971C10.9408 9.92822 10.1533 10.7157 10.1533 11.672V15.2438C10.1533 16.2001 10.9408 16.9876 11.8971 16.9876H15.4689C16.4252 16.9876 17.2127 16.2001 17.2127 15.2438V11.7001C17.2127 10.7157 16.4252 9.92822 15.4689 9.92822Z"/>
                  </svg>
                  Dashboard
                </NavLink>
              </li>

              {/* ── Project ── */}
              <SidebarLinkGroup activeCondition={pathname.includes('project')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink to="#"
                      className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link position-relative ${pathname.includes('project') ? 'sidebar-link-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M1.43425 7.5093H2.278C2.44675 7.5093 2.55925 7.3968 2.58737 7.31243L2.98112 6.32805H5.90612L6.27175 7.31243C6.328 7.48118 6.46862 7.5093 6.58112 7.5093H7.453C7.76237 7.48118 7.87487 7.25618 7.76237 7.03118L5.428 1.4343C5.37175 1.26555 5.3155 1.23743 5.14675 1.23743H3.88112C3.76862 1.23743 3.59987 1.29368 3.57175 1.4343L1.153 7.08743C1.0405 7.2843 1.20925 7.5093 1.43425 7.5093ZM4.47175 2.98118L5.3155 5.17493H3.59987L4.47175 2.98118Z"/>
                        <path d="M10.1249 2.5031H16.8749C17.2124 2.5031 17.5218 2.22185 17.5218 1.85623C17.5218 1.4906 17.2405 1.20935 16.8749 1.20935H10.1249C9.7874 1.20935 9.47803 1.4906 9.47803 1.85623C9.47803 2.22185 9.75928 2.5031 10.1249 2.5031Z"/>
                      </svg>
                      Project
                      <svg className="position-absolute end-0 me-3" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"/>
                      </svg>
                    </NavLink>
                    <div className={open ? 'd-block' : 'd-none'}>
                      <ul className="list-unstyled ps-4 mt-1 mb-2 d-flex flex-column gap-1">
                        <li><NavLink to="/project/proposal" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Project Proposal</NavLink></li>
                        <li><NavLink to="/project/documents" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Documents</NavLink></li>
                        <li><NavLink to="/project/status" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Project Status</NavLink></li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* ── Tasks ── */}
              <li>
                <NavLink to="/tasks" onClick={handleNavClick}
                  className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link ${pathname.includes('tasks') ? 'sidebar-link-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z"/>
                  </svg>
                  Tasks
                </NavLink>
              </li>

              {/* ── Meetings ── */}
              <SidebarLinkGroup activeCondition={pathname.includes('meetings')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink to="#"
                      className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link position-relative ${pathname.includes('meetings') ? 'sidebar-link-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M15.7499 2.9812H14.2874V2.36245C14.2874 2.02495 14.0062 1.71558 13.6405 1.71558C13.2749 1.71558 12.9937 1.99683 12.9937 2.36245V2.9812H4.97803V2.36245C4.97803 2.02495 4.69678 1.71558 4.33115 1.71558C3.96553 1.71558 3.68428 1.99683 3.68428 2.36245V2.9812H2.2499C1.29365 2.9812 0.478027 3.7687 0.478027 4.75308V14.5406C0.478027 15.4968 1.26553 16.3125 2.2499 16.3125H15.7499C16.7062 16.3125 17.5218 15.525 17.5218 14.5406V4.72495C17.5218 3.7687 16.7062 2.9812 15.7499 2.9812Z"/>
                      </svg>
                      Meetings
                      <svg className="position-absolute end-0 me-3" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"/>
                      </svg>
                    </NavLink>
                    <div className={open ? 'd-block' : 'd-none'}>
                      <ul className="list-unstyled ps-4 mt-1 mb-2 d-flex flex-column gap-1">
                        <li><NavLink to="/meetings/calendar" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Calendar</NavLink></li>
                        <li><NavLink to="/meetings/requests" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Meeting Requests</NavLink></li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* ── Announcements ── */}
              <SidebarLinkGroup activeCondition={pathname.includes('announcements')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink to="#"
                      className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link position-relative ${pathname.includes('announcements') ? 'sidebar-link-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M10.125 2.25H3.1875C2.4285 2.25 1.8125 2.866 1.8125 3.625V12.375C1.8125 13.134 2.4285 13.75 3.1875 13.75H11.8125C12.5715 13.75 13.1875 13.134 13.1875 12.375V5.875L10.125 2.25ZM3.1875 12.375V3.625H9.5625V6.5H12.375V12.375H3.1875Z"/>
                      </svg>
                      Announcements
                      <svg className="position-absolute end-0 me-3" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"/>
                      </svg>
                    </NavLink>
                    <div className={open ? 'd-block' : 'd-none'}>
                      <ul className="list-unstyled ps-4 mt-1 mb-2 d-flex flex-column gap-1">
                        <li><NavLink to="/announcements/notices" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Notices</NavLink></li>
                        <li><NavLink to="/announcements/important-dates" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Important Dates</NavLink></li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* ── Supervisor ── */}
              <SidebarLinkGroup activeCondition={pathname.includes('supervisor')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink to="#"
                      className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link position-relative ${pathname.includes('supervisor') ? 'sidebar-link-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065Z"/>
                        <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"/>
                      </svg>
                      Supervisor
                      <svg className="position-absolute end-0 me-3" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"/>
                      </svg>
                    </NavLink>
                    <div className={open ? 'd-block' : 'd-none'}>
                      <ul className="list-unstyled ps-4 mt-1 mb-2 d-flex flex-column gap-1">
                        <li><NavLink to="/supervisor/profile" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Supervisor Profile</NavLink></li>
                        <li><NavLink to="/supervisor/feedback" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Supervisor Feedback</NavLink></li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* ── Coordinator ── */}
              <SidebarLinkGroup activeCondition={pathname.includes('coordinator')}>
                {(handleClick, open) => (
                  <React.Fragment>
                    <NavLink to="#"
                      className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link position-relative ${pathname.includes('coordinator') ? 'sidebar-link-active' : ''}`}
                      onClick={(e) => { e.preventDefault(); sidebarExpanded ? handleClick() : setSidebarExpanded(true); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065Z"/>
                        <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"/>
                      </svg>
                      Coordinator
                      <svg className="position-absolute end-0 me-3" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"/>
                      </svg>
                    </NavLink>
                    <div className={open ? 'd-block' : 'd-none'}>
                      <ul className="list-unstyled ps-4 mt-1 mb-2 d-flex flex-column gap-1">
                        <li><NavLink to="/coordinator/profile" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Coordinator Profile</NavLink></li>
                        <li><NavLink to="/coordinator/feedback" onClick={handleNavClick} className={({ isActive }) => `d-flex align-items-center px-3 py-1 rounded text-decoration-none fw-medium sidebar-sub-link ${isActive ? 'text-white' : ''}`}>Coordinator Feedback</NavLink></li>
                      </ul>
                    </div>
                  </React.Fragment>
                )}
              </SidebarLinkGroup>

              {/* ── My Profile ── */}
              <li>
                <NavLink to="/profile" onClick={handleNavClick}
                  className={`d-flex align-items-center gap-2 rounded px-3 py-2 fw-medium text-decoration-none sidebar-link ${pathname.includes('profile') ? 'sidebar-link-active' : ''}`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                    <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065Z"/>
                    <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"/>
                  </svg>
                  My Profile
                </NavLink>
              </li>

            </ul>
          </nav>
        </div>
        {/* ══ END SIDEBAR MENU ══ */}

      </aside>
    </>
  );
};

export default Sidebar;