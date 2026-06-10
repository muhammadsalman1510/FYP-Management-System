import { Link } from 'react-router-dom';

/*
  STUDENT — DASHBOARD
  Shows project progress bar with 5 milestones,
  group members, supervisor info, recent tasks, quick actions.

  TODO (Backend): GET /api/projects/my-project
  Replace all hardcoded data below with API response.
*/

const Dashboard = () => {

  // TODO (Backend): Replace with GET /api/projects/my-project
  const project = {
    title: 'FYP Management System',
    status: 'active', // 'no-project' | 'proposal-pending' | 'active'
    supervisor: { name: 'Mr. Shoaib Ahmed', department: 'Computer Science' },
    groupMembers: [
      { name: 'Muhammad Salman', rollNumber: 'F2021001001' },
      { name: 'Ali Hassan',      rollNumber: 'F2021001002' },
    ],
    milestones: [
      { id: 1, name: 'Proposal',       completed: true  },
      { id: 2, name: 'Defense',        completed: false },
      { id: 3, name: 'Implementation', completed: false },
      { id: 4, name: 'Documentation',  completed: false },
      { id: 5, name: 'Final',          completed: false },
    ],
  };

  // TODO (Backend): Replace with GET /api/tasks?status=pending
  const pendingTasksCount = 3;

  // TODO (Backend): Replace with GET /api/meetings?upcoming=true
  const upcomingMeetingsCount = 2;

  const completedMilestones = project.milestones.filter(m => m.completed).length;
  const progressPercent     = (completedMilestones / project.milestones.length) * 100;

  const currentMilestone = project.milestones.find(m => !m.completed);

  return (
    <>
      {/* ── Top Stats Row ── */}
      <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-4 mb-4">

        {/* Project Progress */}
        <div className="col">
          <div className="card shadow-sm border-0 h-100">
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
                  {completedMilestones}/{project.milestones.length} Milestones
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-0">{Math.round(progressPercent)}%</h3>
              <p className="text-muted small mb-0">Project Progress</p>
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="col">
          <div className="card shadow-sm border-0 h-100">
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

        {/* Current Milestone */}
        <div className="col">
          <div className="card shadow-sm border-0 h-100">
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

        {/* Upcoming Meetings */}
        <div className="col">
          <div className="card shadow-sm border-0 h-100">
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

      {/* ── Bottom Row ── */}
      <div className="row g-4">

        {/* ── Project Progress + Milestones (col-8) ── */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-semibold text-dark mb-0">Project Progress</h6>
                <p className="text-muted small mb-0">{project.title}</p>
              </div>
              {/* CHANGED: button label updated from "View Details" to "View Project" */}
              <Link to="/project/status" className="btn btn-outline-primary btn-sm px-3">
                View Project
              </Link>
            </div>
            <div className="card-body p-4">

              {/* Progress bar */}
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

              {/* Milestone steps */}
              <div className="d-flex align-items-center justify-content-between position-relative">
                {/* Connecting line */}
                <div
                  className="position-absolute"
                  style={{ top: '18px', left: '18px', right: '18px', height: '2px', backgroundColor: '#e9ecef', zIndex: 0 }}
                />
                {/* Completed line overlay */}
                <div
                  className="position-absolute"
                  style={{
                    top: '18px', left: '18px',
                    width: `calc(${progressPercent}% - 18px)`,
                    height: '2px', backgroundColor: '#3c50e0', zIndex: 1,
                    transition: 'width 0.5s ease',
                  }}
                />

                {project.milestones.map((m, i) => (
                  <div key={m.id} className="d-flex flex-column align-items-center" style={{ zIndex: 2, flex: 1 }}>
                    {/* Circle */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold mb-2"
                      style={{
                        width: '36px', height: '36px',
                        backgroundColor: m.completed ? '#3c50e0' : i === project.milestones.findIndex(x => !x.completed) ? '#3c50e020' : '#e9ecef',
                        color: m.completed ? '#fff' : i === project.milestones.findIndex(x => !x.completed) ? '#3c50e0' : '#adb5bd',
                        border: i === project.milestones.findIndex(x => !x.completed) ? '2px solid #3c50e0' : 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      {m.completed ? '✓' : m.id}
                    </div>
                    <span className="text-dark text-center" style={{ fontSize: '0.68rem', maxWidth: '60px', lineHeight: '1.2' }}>
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* ── Group Members + Supervisor (col-4) ── */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">My Group</h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex flex-column gap-2">
                {project.groupMembers.map((m, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 p-2 rounded"
                    style={{ backgroundColor: '#f8f9fa' }}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style={{ width: '32px', height: '32px', minWidth: '32px', backgroundColor: '#3c50e0', fontSize: '0.72rem' }}
                    >
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="fw-medium text-dark mb-0" style={{ fontSize: '0.82rem' }}>{m.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{m.rollNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supervisor mini card */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Supervisor</h6>
            </div>
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: '38px', height: '38px', minWidth: '38px', backgroundColor: '#28a745', fontSize: '0.8rem' }}
                >
                  {project.supervisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0 small">{project.supervisor.name}</p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{project.supervisor.department}</p>
                </div>
              </div>
              <Link to="/supervisor/view" className="btn btn-outline-primary btn-sm w-100">
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
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

        {/* ── Recent Announcements ── */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <h6 className="fw-semibold text-dark mb-0">Recent Announcements</h6>
              <Link to="/announcements" className="text-primary small text-decoration-none">View All</Link>
            </div>
            <div className="card-body p-4">
              {/* TODO (Backend): Replace with GET /api/announcements?limit=2 */}
              <div className="d-flex flex-column gap-3">
                <div className="border-bottom pb-3">
                  <p className="small fw-medium text-dark mb-1">FYP Defense Schedule Released</p>
                  <p className="small text-muted mb-1">Check your assigned date and time on the noticeboard.</p>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>2 days ago</span>
                </div>
                <div>
                  <p className="small fw-medium text-dark mb-1">Submission Deadline Reminder</p>
                  <p className="small text-muted mb-1">All documentation must be submitted by May 15.</p>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>4 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;