import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Avatar from '../../components/Avatar';

const Status = () => {
  const [project, setProject] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    const fetchData = async () => {
      try {
        const [projectRes, tasksRes] = await Promise.all([
          fetch('/api/projects/my', { headers }),
          fetch('/api/tasks', { headers }),
        ]);

        const projectData = await projectRes.json();
        if (!projectRes.ok || !projectData.success) {
          throw new Error(projectData.message || 'Failed to load project');
        }
        setProject(projectData.data);

        const tasksData = await tasksRes.json();
        if (tasksRes.ok && tasksData.success) {
          setTaskCount(tasksData.data.length);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return null;
    return new Date(isoStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };


  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Project" />
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Project" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Breadcrumb pageName="Project" />
        <div className="alert alert-info border-0">No project has been assigned to you yet.</div>
      </>
    );
  }

  const milestones = project.milestones || [];
  const completedCount = milestones.filter((m) => m.completed).length;
  const overallProgress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;
  const currentMilestoneIdx = milestones.findIndex((m) => !m.completed);
  const currentMilestone = currentMilestoneIdx >= 0 ? milestones[currentMilestoneIdx] : null;

  const supervisors = project.supervisors || [];
  const coordinator = project.coordinator || null;
  const students = project.students || [];

  return (
    <>
      <Breadcrumb pageName="Project" />

      <div className="d-flex flex-column gap-4">

        {/* Pending Tasks Alert */}
        {taskCount > 0 && (
          <div
            className="d-flex align-items-center justify-content-between p-3 rounded border border-warning"
            style={{ backgroundColor: '#fff8e1' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: '#ffc10720' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffc107">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <div>
                <p className="fw-semibold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                  You have {taskCount} {taskCount === 1 ? 'task' : 'tasks'} assigned
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                  Complete your tasks before the deadline.
                </p>
              </div>
            </div>
            <a
              href="/tasks"
              className="btn btn-warning btn-sm px-3 fw-medium text-white"
              style={{ whiteSpace: 'nowrap' }}
            >
              View Tasks
            </a>
          </div>
        )}

        {/* Progress Overview Card */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Project Progress</h5>
            <p className="text-muted small mb-0 mt-1">{project.title}</p>
          </div>
          <div className="card-body p-4">
            <div className="row g-3 mb-4 text-center">
              <div className="col-12 col-md-4">
                <p className="fs-3 fw-bold text-primary mb-0">{Math.round(overallProgress)}%</p>
                <p className="text-muted small mb-0">Overall Progress</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
                  {currentMilestone ? currentMilestone.name : '🎉 All Done!'}
                </p>
                <p className="text-muted small mb-0">Current Milestone</p>
              </div>
              <div className="col-12 col-md-4">
                <p className="fs-3 fw-bold text-success mb-0">
                  {completedCount}/{milestones.length}
                </p>
                <p className="text-muted small mb-0">Milestones Completed</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="d-flex justify-content-between mb-1">
                <span className="small fw-medium text-dark">Completion</span>
                <span className="small fw-medium text-dark">{Math.round(overallProgress)}%</span>
              </div>
              <div className="progress" style={{ height: '12px', borderRadius: '6px' }}>
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${overallProgress}%`, borderRadius: '6px', transition: 'width 0.5s' }}
                />
              </div>
              <div className="d-flex justify-content-between mt-1">
                {milestones.map((m) => (
                  <span
                    key={m.id || m._id}
                    className="text-muted text-center"
                    style={{ fontSize: '0.65rem', flex: 1 }}
                  >
                    {m.name ? m.name.split(' ')[0] : `M${m.id}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Detail */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Milestones</h5>
            <p className="text-muted small mb-0 mt-1">
              Milestones are marked complete by the coordinator.
            </p>
          </div>
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-3">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id || milestone._id || index}
                  className={`d-flex align-items-center justify-content-between p-3 rounded border ${
                    milestone.completed
                      ? 'border-success bg-success bg-opacity-10'
                      : index === currentMilestoneIdx
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-light'
                  }`}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                      style={{
                        width: '38px', height: '38px', minWidth: '38px',
                        backgroundColor: milestone.completed
                          ? '#28a745'
                          : index === currentMilestoneIdx
                          ? '#3c50e0'
                          : '#e9ecef',
                        color: milestone.completed || index === currentMilestoneIdx ? '#fff' : '#adb5bd',
                        fontSize: '0.85rem',
                      }}
                    >
                      {milestone.completed ? '✓' : milestone.id || (index + 1)}
                    </div>
                    <div>
                      <p className="fw-semibold text-dark mb-0 small">{milestone.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {milestone.description}
                      </p>
                      {milestone.completed && milestone.completedAt && (
                        <p className="text-success mb-0" style={{ fontSize: '0.72rem' }}>
                          ✓ Completed on {formatDate(milestone.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-3">
                    {milestone.completed ? (
                      <span className="badge bg-success rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>
                        Completed
                      </span>
                    ) : index === currentMilestoneIdx ? (
                      <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>
                        In Progress
                      </span>
                    ) : (
                      <span className="badge bg-secondary rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {completedCount === milestones.length && milestones.length > 0 && (
              <div className="alert alert-success border-0 mt-4 text-center mb-0">
                🎉 <strong>Congratulations!</strong> All milestones completed. Your FYP is finished!
              </div>
            )}
          </div>
        </div>

        {/* Group Members Card */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Group Members</h5>
          </div>
          <div className="card-body p-4">
            {students.length === 0 ? (
              <p className="text-muted small mb-0">No students assigned yet.</p>
            ) : (
              <div className="row g-3">
                {students.map((member, i) => (
                  <div key={member._id || i} className="col-12 col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 border rounded">
                      <Avatar name={member.name} size={40} />
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{member.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{member.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Supervisor + Coordinator Row */}
        <div className="row g-4">

          {/* Supervisor */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="fw-semibold text-dark mb-0">Supervisor</h5>
              </div>
              <div className="card-body p-4">
                {supervisors.length === 0 ? (
                  <p className="text-muted small mb-3">No supervisor assigned yet.</p>
                ) : (
                  supervisors.map((sup, i) => (
                    <div key={sup._id || i} className={i > 0 ? 'mt-3 pt-3 border-top' : 'mb-3'}>
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <Avatar name={sup.name} size={48} />
                        <div>
                          <p className="fw-semibold text-dark mb-0">{sup.name}</p>
                          <p className="text-muted small mb-0">Supervisor</p>
                        </div>
                      </div>
                      <p className="small mb-0">
                        <span className="fw-medium">Email:</span> {sup.email}
                      </p>
                    </div>
                  ))
                )}
                <a href="/meetings/requests" className="btn btn-primary w-100 py-2 mt-3">
                  Request Meeting
                </a>
              </div>
            </div>
          </div>

          {/* Coordinator */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="fw-semibold text-dark mb-0">Coordinator</h5>
              </div>
              <div className="card-body p-4">
                {coordinator ? (
                  <>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Avatar name={coordinator.name} size={48} />
                      <div>
                        <p className="fw-semibold text-dark mb-0">{coordinator.name}</p>
                        <p className="text-muted small mb-0">Coordinator</p>
                      </div>
                    </div>
                    <p className="small mb-3">
                      <span className="fw-medium">Email:</span> {coordinator.email}
                    </p>
                  </>
                ) : (
                  <p className="text-muted small mb-3">No coordinator assigned yet.</p>
                )}
                <a href="/meetings/requests" className="btn btn-primary w-100 py-2">
                  Request Meeting
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default Status;
