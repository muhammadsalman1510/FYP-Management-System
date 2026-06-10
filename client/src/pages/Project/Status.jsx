import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  STUDENT — PROJECT PAGE (formerly "Project Status")
  Shows 5 milestones. Progress bar fills 20% per milestone.

  MILESTONE LOGIC:
  - Milestone 1 (Proposal): Auto-completed when COORDINATOR approves proposal
    (proposal goes directly to coordinator, no supervisor step)
  - Milestones 2-5: Coordinator manually marks each as complete

  Also shows: group members, supervisor, coordinator info.

  TODO (Backend): GET /api/projects/my-project
  Replace hardcoded data below with real API response.
*/

const Status = () => {

  // TODO (Backend): Replace with GET /api/projects/my-project
  const project = {
    title: 'FYP Management System',
    supervisor: {
      name: 'Mr. Shoaib Ahmed',
      email: 'shoaib@university.edu',
      department: 'Computer Science',
    },
    coordinator: {
      name: 'Mr. Omer Farooq',
      email: 'omer@university.edu',
      department: 'Computer Science',
    },
    groupMembers: [
      { name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7th', section: 'A' },
      { name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7th', section: 'A' },
    ],
    milestones: [
      {
        id: 1,
        name: 'Project Proposal',
        description: 'Proposal submitted and approved by coordinator.',
        completed: true,
        completedAt: '2024-04-10',
        autoCompleted: true,
        // Auto-completed when coordinator approves proposal
        // No supervisor step — proposal goes directly to coordinator
      },
      {
        id: 2,
        name: 'Project Defense',
        description: 'Initial defense presented to supervisor and coordinator.',
        completed: false,
        completedAt: null,
        autoCompleted: false,
        // Coordinator clicks "Mark Complete" after physical defense
      },
      {
        id: 3,
        name: 'Implementation',
        description: 'Core development and implementation phase completed.',
        completed: false,
        completedAt: null,
        autoCompleted: false,
      },
      {
        id: 4,
        name: 'Documentation',
        description: 'Full project documentation submitted and approved.',
        completed: false,
        completedAt: null,
        autoCompleted: false,
      },
      {
        id: 5,
        name: 'Final Presentation',
        description: 'Final project presented and signed off by coordinator.',
        completed: false,
        completedAt: null,
        autoCompleted: false,
      },
    ],
  };

  // TODO (Backend): Replace with real pending tasks count from GET /api/tasks?status=pending
  const pendingTasksCount = 2;

  const completedCount    = project.milestones.filter(m => m.completed).length;
  const overallProgress   = (completedCount / project.milestones.length) * 100;
  const currentMilestone  = project.milestones.find(m => !m.completed);
  const currentMilestoneIdx = project.milestones.findIndex(m => !m.completed);

  return (
    <>
      {/* CHANGED: pageName updated from "Project Status" to "Project" */}
      <Breadcrumb pageName="Project" />

      <div className="d-flex flex-column gap-4">

        {/* ── Pending Tasks Alert Widget ── */}
        {pendingTasksCount > 0 && (
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
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <p className="fw-semibold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                  You have {pendingTasksCount} pending {pendingTasksCount === 1 ? 'task' : 'tasks'}
                </p>
                <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                  Complete your pending tasks before the deadline.
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

        {/* ── Progress Overview Card ── */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Project Progress</h5>
            <p className="text-muted small mb-0 mt-1">{project.title}</p>
          </div>
          <div className="card-body p-4">

            {/* Stats row */}
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
                  {completedCount}/{project.milestones.length}
                </p>
                <p className="text-muted small mb-0">Milestones Completed</p>
              </div>
            </div>

            {/* Progress bar */}
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
              {/* Labels under bar */}
              <div className="d-flex justify-content-between mt-1">
                {project.milestones.map((m) => (
                  <span key={m.id} className="text-muted text-center"
                    style={{ fontSize: '0.65rem', flex: 1 }}>
                    {m.name.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── 5 Milestones Detail ── */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Milestones</h5>
            <p className="text-muted small mb-0 mt-1">
              Milestones are marked complete by the coordinator.
            </p>
          </div>
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-3">
              {project.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`d-flex align-items-center justify-content-between p-3 rounded border ${
                    milestone.completed
                      ? 'border-success bg-success bg-opacity-10'
                      : index === currentMilestoneIdx
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-light'
                  }`}
                >
                  {/* Left: circle + info */}
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
                      {milestone.completed ? '✓' : milestone.id}
                    </div>
                    <div>
                      <p className="fw-semibold text-dark mb-0 small">{milestone.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {milestone.description}
                      </p>
                      {milestone.completed && milestone.completedAt && (
                        <p className="text-success mb-0" style={{ fontSize: '0.72rem' }}>
                          ✓ Completed on {milestone.completedAt}
                          {milestone.autoCompleted && ' (auto — proposal approved)'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: badge */}
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

            {completedCount === project.milestones.length && (
              <div className="alert alert-success border-0 mt-4 text-center mb-0">
                🎉 <strong>Congratulations!</strong> All milestones completed. Your FYP is finished!
              </div>
            )}
          </div>
        </div>

        {/* ── Group Members Card ── */}
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Group Members</h5>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {project.groupMembers.map((member, i) => (
                <div key={i} className="col-12 col-md-6">
                  <div className="d-flex align-items-center gap-3 p-3 border rounded">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: '#3c50e0', fontSize: '0.85rem' }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="fw-semibold text-dark mb-0 small">{member.name}</p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                        {member.rollNumber} &bull; {member.program} &bull; Sem {member.semester} &bull; Sec {member.section}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Supervisor + Coordinator Row ── */}
        <div className="row g-4">
          {/* Supervisor */}
          <div className="col-12 col-md-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h5 className="fw-semibold text-dark mb-0">Supervisor</h5>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '48px', height: '48px', minWidth: '48px', backgroundColor: '#28a745', fontSize: '1rem' }}
                  >
                    {project.supervisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="fw-semibold text-dark mb-0">{project.supervisor.name}</p>
                    <p className="text-muted small mb-0">{project.supervisor.department}</p>
                  </div>
                </div>
                <p className="small mb-3">
                  <span className="fw-medium">Email:</span> {project.supervisor.email}
                </p>
                <a href="/meetings/requests" className="btn btn-primary w-100 py-2">
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
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '48px', height: '48px', minWidth: '48px', backgroundColor: '#3c50e0', fontSize: '1rem' }}
                  >
                    {project.coordinator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="fw-semibold text-dark mb-0">{project.coordinator.name}</p>
                    <p className="text-muted small mb-0">{project.coordinator.department}</p>
                  </div>
                </div>
                <p className="small mb-3">
                  <span className="fw-medium">Email:</span> {project.coordinator.email}
                </p>
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