import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Avatar from '../../components/Avatar';

const Dashboard = () => {
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [upcomingMeetingsCount, setUpcomingMeetingsCount] = useState(0);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [projectRes, tasksRes, meetingsRes, announcementsRes] = await Promise.all([
          fetch('/api/projects/my', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/meetings', { headers }),
          fetch('/api/announcements', { headers }),
        ]);

        if (projectRes.ok) {
          const projectData = await projectRes.json();
          if (projectData.success) setProject(projectData.data);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData.success) {
            const pending = (tasksData.data || []).filter((t) => t.status === 'pending').length;
            setPendingTasksCount(pending);
          }
        }

        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          if (meetingsData.success) {
            const now = new Date();
            const upcoming = (meetingsData.data || []).filter((m) => {
              if (!m.proposedDate) return false;
              return new Date(m.proposedDate) >= now && m.status !== 'rejected';
            }).length;
            setUpcomingMeetingsCount(upcoming);
          }
        }

        if (announcementsRes.ok) {
          const annData = await announcementsRes.json();
          if (annData.success) setRecentAnnouncements((annData.data || []).slice(0, 2));
        }
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

  if (!project) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="mb-3" style={{ fontSize: '3rem' }}>📋</div>
          <h5 className="fw-semibold text-dark mb-2">No Project Assigned Yet</h5>
          <p className="text-muted small mb-0">Contact your coordinator to get assigned to a project.</p>
        </div>
      </div>
    );
  }

  const milestones         = project.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent    = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
  const currentMilestone   = milestones.find((m) => !m.completed);

  const supervisor = project.supervisors?.[0] || project.supervisorId || null;
  const students   = project.students || [];


  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const now  = new Date();
    const then = new Date(dateStr);
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30)  return `${diffDays} days ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const cardStyle = (index) => ({
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, transform 0.15s',
    boxShadow: hoveredCard === index
      ? '0 6px 24px rgba(0,0,0,0.13)'
      : '0 1px 4px rgba(0,0,0,0.07)',
    transform: hoveredCard === index ? 'translateY(-2px)' : 'translateY(0)',
  });

  return (
    <>
      <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-4 mb-4">

        <div className="col">
          <div
            className="card border-0 h-100"
            style={cardStyle(0)}
            onClick={() => navigate('/project/status')}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '44px', height: '44px', backgroundColor: '#3c50e020' }}>
                  <svg width="20" height="20" viewBox="0 0 22 22" fill="#3c50e0">
                    <path d="M11 2C6.04 2 2 6.04 2 11s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>
                    <path d="M11 6v5l4 2.5-.75 1.3L10 12V6h1z"/>
                  </svg>
                </div>
                <span className="badge bg-primary rounded-pill" style={{ fontSize: '0.7rem' }}>
                  {completedMilestones}/{milestones.length} Milestones
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-0">{Math.round(progressPercent)}%</h3>
              <p className="text-muted small mb-0">Project Progress</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div
            className="card border-0 h-100"
            style={cardStyle(1)}
            onClick={() => navigate('/tasks')}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#ffc10720' }}>
                <svg width="20" height="20" viewBox="0 0 22 22" fill="#ffc107">
                  <path d="M6 2v20l5-3 5 3V2H6z"/>
                </svg>
              </div>
              <h3 className="fw-bold text-dark mb-0">{pendingTasksCount}</h3>
              <p className="text-muted small mb-0">Pending Tasks</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div
            className="card border-0 h-100"
            style={cardStyle(2)}
            onClick={() => navigate('/project/status')}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#28a74520' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem' }}>
                {currentMilestone ? currentMilestone.name : 'All Done!'}
              </h3>
              <p className="text-muted small mb-0">Current Milestone</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div
            className="card border-0 h-100"
            style={cardStyle(3)}
            onClick={() => navigate('/meetings/requests')}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '44px', height: '44px', backgroundColor: '#17a2b820' }}>
                <svg width="20" height="20" viewBox="0 0 18 18" fill="#17a2b8">
                  <path d="M15.75 2.98H14.29V2.36C14.29 2.02 14.01 1.72 13.64 1.72C13.27 1.72 12.99 2 12.99 2.36V2.98H4.98V2.36C4.98 2.02 4.7 1.72 4.33 1.72C3.97 1.72 3.68 2 3.68 2.36V2.98H2.25C1.29 2.98 0.48 3.77 0.48 4.75V14.54C0.48 15.5 1.27 16.31 2.25 16.31H15.75C16.71 16.31 17.52 15.52 17.52 14.54V4.72C17.52 3.77 16.71 2.98 15.75 2.98Z"/>
                </svg>
              </div>
              <h3 className="fw-bold text-dark mb-0">{upcomingMeetingsCount}</h3>
              <p className="text-muted small mb-0">Upcoming Meetings</p>
            </div>
          </div>
        </div>

      </div>

      <div className="row g-4">

        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-semibold text-dark mb-0">Project Progress</h6>
                <p className="text-muted small mb-0">{project.title}</p>
              </div>
              <Link to="/project/status" className="btn btn-outline-primary btn-sm px-3">
                View Project
              </Link>
            </div>
            <div className="card-body p-4">

              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-medium text-dark">Overall Completion</span>
                  <span className="small fw-medium text-dark">{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress" style={{ height: '10px', borderRadius: '6px' }}>
                  <div
                    className="progress-bar bg-primary"
                    style={{ width: `${progressPercent}%`, borderRadius: '6px' }}
                  />
                </div>
              </div>

              {milestones.length > 0 ? (
                <div className="d-flex align-items-center justify-content-between position-relative">
                  <div
                    className="position-absolute"
                    style={{ top: '18px', left: '18px', right: '18px', height: '2px', backgroundColor: '#e9ecef', zIndex: 0 }}
                  />
                  <div
                    className="position-absolute"
                    style={{
                      top: '18px', left: '18px',
                      width: `calc(${progressPercent}% - 18px)`,
                      height: '2px', backgroundColor: '#3c50e0', zIndex: 1,
                      transition: 'width 0.5s ease',
                    }}
                  />
                  {milestones.map((m, i) => {
                    const currentIdx = milestones.findIndex((x) => !x.completed);
                    const isCurrent  = i === currentIdx;
                    return (
                      <div key={m._id || i} className="d-flex flex-column align-items-center" style={{ zIndex: 2, flex: 1 }}>
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle fw-bold mb-2"
                          style={{
                            width: '36px', height: '36px',
                            backgroundColor: m.completed ? '#3c50e0' : isCurrent ? '#3c50e020' : '#e9ecef',
                            color: m.completed ? '#fff' : isCurrent ? '#3c50e0' : '#adb5bd',
                            border: isCurrent ? '2px solid #3c50e0' : 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          {m.completed ? '✓' : i + 1}
                        </div>
                        <span className="text-dark text-center" style={{ fontSize: '0.68rem', maxWidth: '60px', lineHeight: '1.2' }}>
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted small mb-0">No milestones defined yet.</p>
              )}

            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">

          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">My Group</h6>
            </div>
            <div className="card-body p-3">
              {students.length === 0 ? (
                <p className="text-muted small mb-0 px-1">No students listed yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {students.map((s, i) => (
                    <div key={s._id || i} className="d-flex align-items-center gap-2 p-2 rounded"
                      style={{ backgroundColor: '#f8f9fa' }}>
                      <Avatar name={s.name} size={32} />
                      <div>
                        <p className="fw-medium text-dark mb-0" style={{ fontSize: '0.82rem' }}>{s.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{s.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {supervisor ? (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Supervisor</h6>
              </div>
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Avatar name={supervisor.name} size={38} />
                  <div>
                    <p className="fw-medium text-dark mb-0 small">{supervisor.name}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{supervisor.email}</p>
                  </div>
                </div>
                <Link to="/supervisor/view" className="btn btn-outline-primary btn-sm w-100">
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 text-center">
                <p className="text-muted small mb-0">No supervisor assigned yet.</p>
              </div>
            </div>
          )}

        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Quick Actions</h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-6">
                  <Link to="/project/proposal" className="btn btn-primary w-100 py-3 fw-medium text-decoration-none">
                    My Proposal
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/project/documents" className="btn btn-primary w-100 py-3 fw-medium text-decoration-none">
                    Documents
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/meetings/requests" className="btn btn-primary w-100 py-3 fw-medium text-decoration-none">
                    Request Meeting
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/tasks" className="btn btn-primary w-100 py-3 fw-medium text-decoration-none">
                    View Tasks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <h6 className="fw-semibold text-dark mb-0">Recent Announcements</h6>
              <Link to="/announcements" className="text-primary small text-decoration-none">View All</Link>
            </div>
            <div className="card-body p-4">
              {recentAnnouncements.length === 0 ? (
                <p className="text-muted small mb-0">No announcements yet.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentAnnouncements.map((ann, i) => (
                    <div key={ann._id} className={i < recentAnnouncements.length - 1 ? 'border-bottom pb-3' : ''}>
                      <p className="small fw-medium text-dark mb-1">{ann.title}</p>
                      <p className="small text-muted mb-1">{ann.content?.slice(0, 80)}{ann.content?.length > 80 ? '...' : ''}</p>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{formatDate(ann.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
