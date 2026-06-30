import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SupervisorDashboard = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [projectsRes, subsRes, propsRes] = await Promise.all([
          fetch('/api/projects/assigned', { headers }),
          fetch('/api/tasks/submissions', { headers }),
          fetch('/api/proposals', { headers }),
        ]);

        const [projectsData, subsData, propsData] = await Promise.all([
          projectsRes.json(),
          subsRes.json(),
          propsRes.json(),
        ]);

        if (!projectsRes.ok || !projectsData.success) throw new Error(projectsData.message || 'Failed to load projects');
        if (!subsRes.ok || !subsData.success) throw new Error(subsData.message || 'Failed to load submissions');

        setProjects(projectsData.data || []);
        setSubmissions(subsData.data || []);
        if (propsRes.ok && propsData.success) setProposals(propsData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger border-0">{error}</div>
  );

  const totalProjects      = projects.length;
  const activeProjects     = projects.filter((p) => p.status === 'active').length;
  const totalStudents      = projects.reduce((acc, p) => acc + (p.students?.length || 0), 0);
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending').length;

  const stats = [
    { title: 'Total Projects',      value: totalProjects,      color: '#3c50e0', path: '/supervisor/projects' },
    { title: 'Active Projects',     value: activeProjects,     color: '#28a745', path: '/supervisor/projects' },
    { title: 'Total Students',      value: totalStudents,      color: '#17a2b8', path: '/supervisor/projects' },
    { title: 'Pending Submissions', value: pendingSubmissions, color: '#dc3545', path: '/supervisor/tasks'    },
  ];

  const recentProposals   = proposals.slice(0, 3);
  const recentSubmissions = submissions.slice(0, 3);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Supervisor Dashboard</h4>
        <p className="text-muted small mb-0">Welcome back! Here's an overview of your students' progress.</p>
      </div>

      <div className="row g-4 mb-4 row-cols-1 row-cols-sm-2 row-cols-xl-4">
        {stats.map((stat, i) => (
          <div key={i} className="col">
            <div
              className="card border-0 h-100"
              style={{
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, transform 0.15s',
                boxShadow: hoveredCard === i
                  ? '0 6px 24px rgba(0,0,0,0.13)'
                  : '0 1px 4px rgba(0,0,0,0.07)',
                transform: hoveredCard === i ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onClick={() => navigate(stat.path)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
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

      <div className="row g-4">

        <div className="col-12 col-xl-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Recent Proposals</h6>
              <a href="/supervisor/proposals" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-0">
              {recentProposals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted small mb-0">No proposals yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                        <th className="px-4 py-3 fw-semibold small text-dark">Title</th>
                        <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                        <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProposals.map((p) => (
                        <tr key={p._id}>
                          <td className="px-4 py-3 fw-medium text-dark small">{p.submittedBy?.name || '—'}</td>
                          <td className="px-4 py-3 text-muted small">{p.title}</td>
                          <td className="px-4 py-3">
                            <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(p.status)}`} style={{ fontSize: '0.72rem' }}>
                              {p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <a href="/supervisor/proposals" className="btn btn-outline-secondary btn-sm px-3">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
              <a href="/supervisor/tasks" className="text-primary small text-decoration-none">View All</a>
            </div>
            <div className="card-body p-3">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted small mb-0">No submissions yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentSubmissions.map((sub) => (
                    <div key={sub._id} className="d-flex align-items-center justify-content-between border rounded p-3">
                      <div>
                        <p className="fw-medium text-dark small mb-0">{sub.submittedBy?.name || '—'}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                          {sub.taskId?.title || 'Task'} &bull; {formatDate(sub.submittedAt)}
                        </p>
                      </div>
                      <span className={`badge rounded-pill px-2 py-1 ${getStatusBadge(sub.status)}`} style={{ fontSize: '0.7rem' }}>
                        {sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Quick Actions</h6>
            </div>
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-6">
                  <a href="/supervisor/projects" className="btn btn-primary w-100 py-2 small fw-medium">My Projects</a>
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
