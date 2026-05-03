import React, { useState } from 'react';

/*
  COORDINATOR DASHBOARD
  Shows an overview of the entire FYP system:
  - Stat cards: total students, supervisors, pending proposals, pending tasks
  - Recent proposals waiting for review
  - Recent meeting requests
  - Quick action buttons
*/
const CoordinatorDashboard = () => {

  // ── Sample data (replace with API calls when backend is ready) ──
  const stats = [
    { title: 'Total Students',    value: '24',  icon: 'students',   color: '#3c50e0' },
    { title: 'Total Supervisors', value: '6',   icon: 'supervisors',color: '#28a745' },
    { title: 'Pending Proposals', value: '5',   icon: 'proposals',  color: '#ffc107' },
    { title: 'Pending Tasks',     value: '8',   icon: 'tasks',      color: '#dc3545' },
  ];

  const recentProposals = [
    { id: 1, student: 'Muhammad Salman', title: 'FYP Management System',    supervisor: 'Mr. Shoaib', submittedDate: '2024-04-25', status: 'pending'  },
    { id: 2, student: 'Ali Hassan',      title: 'E-Commerce Platform',       supervisor: 'Mr. Shoaib', submittedDate: '2024-04-24', status: 'pending'  },
    { id: 3, student: 'Sara Khan',       title: 'Hospital Management System',supervisor: 'Mr. Omer',   submittedDate: '2024-04-23', status: 'approved' },
  ];

  const recentMeetingRequests = [
    { id: 1, from: 'Muhammad Salman', role: 'Student',    title: 'Proposal Discussion',  date: '2024-04-28', time: '14:00', status: 'pending'  },
    { id: 2, from: 'Mr. Shoaib',      role: 'Supervisor', title: 'Progress Review',       date: '2024-04-29', time: '11:00', status: 'pending'  },
    { id: 3, from: 'Ali Hassan',      role: 'Student',    title: 'Technical Discussion',  date: '2024-04-30', time: '10:00', status: 'approved' },
  ];

  // ── Helper: status badge ──
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  // ── Helper: stat card icon ──
  const StatIcon = ({ type, color }) => {
    switch (type) {
      case 'students':
        return (
          <svg width="24" height="24" viewBox="0 0 18 18" fill={color}>
            <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065Z"/>
            <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"/>
          </svg>
        );
      case 'supervisors':
        return (
          <svg width="24" height="24" viewBox="0 0 22 22" fill={color}>
            <path d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499Z"/>
            <path d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156Z"/>
          </svg>
        );
      case 'proposals':
        return (
          <svg width="24" height="24" viewBox="0 0 18 18" fill={color}>
            <path d="M10.125 2.25H3.1875C2.4285 2.25 1.8125 2.866 1.8125 3.625V12.375C1.8125 13.134 2.4285 13.75 3.1875 13.75H11.8125C12.5715 13.75 13.1875 13.134 13.1875 12.375V5.875L10.125 2.25ZM3.1875 12.375V3.625H9.5625V6.5H12.375V12.375H3.1875Z"/>
          </svg>
        );
      case 'tasks':
        return (
          <svg width="24" height="24" viewBox="0 0 18 18" fill={color}>
            <path d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z"/>
          </svg>
        );
      default: return null;
    }
  };

  return (
    <>
      {/* ── Page Title ── */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Coordinator Dashboard</h4>
        <p className="text-muted small mb-0">Welcome back! Here's what's happening in your FYP system.</p>
      </div>

      {/* ══════════════════════════════════
          STAT CARDS ROW
          ══════════════════════════════════ */}
      <div className="row g-4 mb-4 row-cols-1 row-cols-sm-2 row-cols-xl-4">
        {stats.map((stat, index) => (
          <div key={index} className="col">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-body px-4 py-4">

                {/* Icon circle */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: stat.color + '20', /* 20 = 12% opacity in hex */
                  }}
                >
                  <StatIcon type={stat.icon} color={stat.color} />
                </div>

                {/* Value + Label */}
                <h3 className="fw-bold text-dark mb-1">{stat.value}</h3>
                <p className="text-muted small mb-0">{stat.title}</p>

              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ══ END STAT CARDS ══ */}

      {/* ══════════════════════════════════
          BOTTOM SECTION: Proposals + Meetings
          ══════════════════════════════════ */}
      <div className="row g-4">

        {/* ── Recent Proposals ── */}
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Recent Proposals</h6>
              <a href="/coordinator/proposals" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Project Title</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Supervisor</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProposals.map((proposal) => (
                      <tr key={proposal.id}>
                        <td className="px-4 py-3 small fw-medium text-dark">{proposal.student}</td>
                        <td className="px-4 py-3 small text-muted">{proposal.title}</td>
                        <td className="px-4 py-3 small text-muted">{proposal.supervisor}</td>
                        <td className="px-4 py-3">
                          <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(proposal.status)}`}>
                            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {proposal.status === 'pending' && (
                            <a href="/coordinator/proposals" className="btn btn-primary btn-sm px-3">
                              Review
                            </a>
                          )}
                          {proposal.status !== 'pending' && (
                            <a href="/coordinator/proposals" className="btn btn-outline-secondary btn-sm px-3">
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Meeting Requests + Quick Actions ── */}
        <div className="col-12 col-xl-5">

          {/* Meeting Requests */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Meeting Requests</h6>
              <a href="/coordinator/meetings/requests" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-3">
                {recentMeetingRequests.map((req) => (
                  <div key={req.id} className="d-flex align-items-center justify-content-between border rounded p-3">
                    <div>
                      <p className="fw-medium text-dark small mb-0">{req.from}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {req.role} • {req.title}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {req.date} at {req.time}
                      </p>
                    </div>
                    <span className={`badge rounded-pill px-2 py-1 ${getStatusBadge(req.status)}`} style={{ fontSize: '0.7rem' }}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Quick Actions</h6>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-6">
                  <a href="/coordinator/accounts/students" className="btn btn-primary w-100 py-2 small fw-medium">
                    + Add Student
                  </a>
                </div>
                <div className="col-6">
                  <a href="/coordinator/accounts/supervisors" className="btn btn-success w-100 py-2 small fw-medium">
                    + Add Supervisor
                  </a>
                </div>
                <div className="col-6">
                  <a href="/coordinator/tasks" className="btn btn-outline-primary w-100 py-2 small fw-medium">
                    Create Task
                  </a>
                </div>
                <div className="col-6">
                  <a href="/coordinator/announcements" className="btn btn-outline-secondary w-100 py-2 small fw-medium">
                    Announce
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* ══ END BOTTOM SECTION ══ */}

    </>
  );
};

export default CoordinatorDashboard;