import React from 'react';
/*
  SUPERVISOR DASHBOARD
  Shows overview of assigned students, pending proposals,
  pending task submissions, and upcoming meetings.
  TODO (Backend): GET /api/supervisor/dashboard-stats
*/

const SupervisorDashboard = () => {

  // TODO (Backend): Replace with API call
  const stats = [
    { title: 'My Students',        value: '5',  color: '#3c50e0' },
    { title: 'Pending Proposals',  value: '2',  color: '#ffc107' },
    { title: 'Pending Tasks',      value: '4',  color: '#dc3545' },
    { title: 'Upcoming Meetings',  value: '3',  color: '#28a745' },
  ];

  // TODO (Backend): GET /api/supervisor/proposals?status=pending
  const recentProposals = [
    { id: 1, student: 'Muhammad Salman', title: 'FYP Management System',     submittedDate: '2024-04-25', status: 'pending'  },
    { id: 2, student: 'Ali Hassan',      title: 'E-Commerce Platform',        submittedDate: '2024-04-24', status: 'pending'  },
    { id: 3, student: 'Sara Khan',       title: 'Hospital Management System', submittedDate: '2024-04-23', status: 'approved' },
  ];

  // TODO (Backend): GET /api/supervisor/tasks/submissions?status=submitted
  const recentSubmissions = [
    { id: 1, student: 'Muhammad Salman', task: 'Literature Review',  submitDate: '2024-04-26', status: 'submitted' },
    { id: 2, student: 'Ali Hassan',      task: 'Progress Report',    submitDate: '2024-04-25', status: 'submitted' },
    { id: 3, student: 'Usman Tariq',     task: 'Literature Review',  submitDate: '2024-04-24', status: 'approved'  },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':  return 'bg-success';
      case 'pending':   return 'bg-warning text-dark';
      case 'submitted': return 'bg-primary';
      case 'rejected':  return 'bg-danger';
      default:          return 'bg-secondary';
    }
  };

  return (
    <>
      {/* Page Title */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Supervisor Dashboard</h4>
        <p className="text-muted small mb-0">Welcome back! Here's an overview of your students' progress.</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-4 mb-4 row-cols-1 row-cols-sm-2 row-cols-xl-4">
        {stats.map((stat, index) => (
          <div key={index} className="col">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body px-4 py-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{ width: '48px', height: '48px', backgroundColor: stat.color + '20' }}
                >
                  <svg width="22" height="22" viewBox="0 0 18 18" fill={stat.color}>
                    <path d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065Z"/>
                    <path d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"/>
                  </svg>
                </div>
                <h3 className="fw-bold text-dark mb-1">{stat.value}</h3>
                <p className="text-muted small mb-0">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="row g-4">

        {/* Recent Proposals */}
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Recent Proposals</h6>
              <a href="/supervisor/proposals" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Project Title</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProposals.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 fw-medium text-dark small">{p.student}</td>
                        <td className="px-4 py-3 text-muted small">{p.title}</td>
                        <td className="px-4 py-3">
                          <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(p.status)}`} style={{ fontSize: '0.72rem' }}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'pending' ? (
                            <a href="/supervisor/proposals" className="btn btn-primary btn-sm px-3">Review</a>
                          ) : (
                            <a href="/supervisor/proposals" className="btn btn-outline-secondary btn-sm px-3">View</a>
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

        {/* Recent Task Submissions + Quick Actions */}
        <div className="col-12 col-xl-5">

          {/* Task Submissions */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
              <a href="/supervisor/tasks" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-3">
                {recentSubmissions.map(sub => (
                  <div key={sub.id} className="d-flex align-items-center justify-content-between border rounded p-3">
                    <div>
                      <p className="fw-medium text-dark small mb-0">{sub.student}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{sub.task} • {sub.submitDate}</p>
                    </div>
                    <span className={`badge rounded-pill px-2 py-1 ${getStatusBadge(sub.status)}`} style={{ fontSize: '0.7rem' }}>
                      {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
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
                  <a href="/supervisor/students" className="btn btn-primary w-100 py-2 small fw-medium">My Students</a>
                </div>
                <div className="col-6">
                  <a href="/supervisor/tasks" className="btn btn-outline-primary w-100 py-2 small fw-medium">Create Task</a>
                </div>
                <div className="col-6">
                  <a href="/supervisor/meetings/requests" className="btn btn-outline-secondary w-100 py-2 small fw-medium">Meetings</a>
                </div>
                <div className="col-6">
                  <a href="/supervisor/announcements" className="btn btn-outline-secondary w-100 py-2 small fw-medium">Announce</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SupervisorDashboard;