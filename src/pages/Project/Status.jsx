import React from 'react';

const Status = () => {
  const projectProgress = {
    currentPhase: 'Implementation',
    overallProgress: 65,
    phases: [
      { name: 'Proposal',          status: 'completed',  progress: 100 },
      { name: 'Literature Review', status: 'completed',  progress: 100 },
      { name: 'Methodology',       status: 'completed',  progress: 100 },
      { name: 'Implementation',    status: 'in-progress',progress: 65  },
      { name: 'Testing',           status: 'pending',    progress: 0   },
      { name: 'Final Report',      status: 'pending',    progress: 0   },
    ],
    supervisor: {
      name: 'Mr. Shoaib',
      email: 'shoaib@university.edu',
      department: 'Computer Science',
    },
    coordinator: {
      name: 'Mr. Omer',
      email: 'omer@university.edu',
      department: 'Computer Science',
    },
    recentFeedback: [
      {
        from: 'supervisor',
        date: '2024-01-20',
        message: 'Good progress on the implementation. Make sure to document your code properly.',
        type: 'positive',
      },
      {
        from: 'coordinator',
        date: '2024-01-18',
        message: 'Project timeline looks good. Keep up the good work.',
        type: 'positive',
      },
    ],
  };

  /* Returns a Bootstrap bg class for phase dots */
  const getPhaseDotClass = (status) => {
    switch (status) {
      case 'completed':  return 'bg-success';
      case 'in-progress':return 'bg-warning';
      case 'pending':    return 'bg-secondary';
      default:           return 'bg-secondary';
    }
  };

  /* Returns label text for each phase status */
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':  return 'Completed';
      case 'in-progress':return 'In Progress';
      case 'pending':    return 'Pending';
      default:           return 'Unknown';
    }
  };

  /* Returns Bootstrap progress bar class */
  const getProgressBarClass = (status) => {
    switch (status) {
      case 'completed':  return 'bg-success';
      case 'in-progress':return 'bg-primary';
      default:           return 'bg-secondary';
    }
  };

  return (
    <div className="d-flex flex-column gap-4">

      {/* ===== Project Overview Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Project Overview</h5>
        </div>
        <div className="card-body p-4">

          {/* 3 stat boxes: Overall %, Current Phase, Phases done */}
          <div className="row g-3 mb-4 text-center">
            <div className="col-12 col-md-4">
              <p className="fs-3 fw-bold text-dark mb-0">{projectProgress.overallProgress}%</p>
              <p className="text-muted small mb-0">Overall Progress</p>
            </div>
            <div className="col-12 col-md-4">
              <p className="fs-3 fw-bold text-dark mb-0">{projectProgress.currentPhase}</p>
              <p className="text-muted small mb-0">Current Phase</p>
            </div>
            <div className="col-12 col-md-4">
              <p className="fs-3 fw-bold text-success mb-0">4/6</p>
              <p className="text-muted small mb-0">Phases Completed</p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <span className="small fw-medium text-dark">Project Completion</span>
              <span className="small fw-medium text-dark">{projectProgress.overallProgress}%</span>
            </div>
            <div className="progress" style={{ height: '10px' }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${projectProgress.overallProgress}%` }}
                aria-valuenow={projectProgress.overallProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          {/* Per-phase progress rows */}
          <div className="d-flex flex-column gap-3">
            {projectProgress.phases.map((phase, index) => (
              <div key={index} className="d-flex align-items-center justify-content-between flex-wrap gap-2">

                {/* Phase name with colored dot */}
                <div className="d-flex align-items-center gap-2" style={{ minWidth: '160px' }}>
                  <span
                    className={`rounded-circle ${getPhaseDotClass(phase.status)}`}
                    style={{ width: '10px', height: '10px', display: 'inline-block', minWidth: '10px' }}
                  ></span>
                  <span className="fw-medium text-dark small">{phase.name}</span>
                </div>

                {/* Status label + mini progress bar + % */}
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <span className="text-muted small">{getStatusText(phase.status)}</span>
                  <div className="progress" style={{ width: '80px', height: '6px' }}>
                    <div
                      className={`progress-bar ${getProgressBarClass(phase.status)}`}
                      style={{ width: `${phase.progress}%` }}
                    ></div>
                  </div>
                  <span className="small fw-medium text-dark" style={{ minWidth: '32px' }}>
                    {phase.progress}%
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
      {/* ===== End Project Overview ===== */}

      {/* ===== Supervisor + Coordinator Cards ===== */}
      <div className="row g-4">

        {/* Supervisor Card */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Supervisor</h5>
            </div>
            <div className="card-body p-4">

              {/* Avatar + name */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
                  style={{ width: '48px', height: '48px', minWidth: '48px', fontSize: '1rem' }}
                >
                  {projectProgress.supervisor.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0">{projectProgress.supervisor.name}</p>
                  <p className="text-muted small mb-0">{projectProgress.supervisor.department}</p>
                </div>
              </div>

              {/* Email */}
              <p className="small mb-3">
                <span className="fw-medium">Email:</span> {projectProgress.supervisor.email}
              </p>

              {/* Contact button */}
              <button className="btn btn-primary w-100 py-2">
                Contact Supervisor
              </button>
            </div>
          </div>
        </div>

        {/* Coordinator Card */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Coordinator</h5>
            </div>
            <div className="card-body p-4">

              {/* Avatar + name */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white fw-bold"
                  style={{ width: '48px', height: '48px', minWidth: '48px', fontSize: '1rem' }}
                >
                  {projectProgress.coordinator.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="fw-medium text-dark mb-0">{projectProgress.coordinator.name}</p>
                  <p className="text-muted small mb-0">{projectProgress.coordinator.department}</p>
                </div>
              </div>

              {/* Email */}
              <p className="small mb-3">
                <span className="fw-medium">Email:</span> {projectProgress.coordinator.email}
              </p>

              {/* Contact button */}
              <button className="btn btn-success w-100 py-2">
                Contact Coordinator
              </button>
            </div>
          </div>
        </div>

      </div>
      {/* ===== End Supervisor + Coordinator ===== */}

      {/* ===== Recent Feedback Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Recent Feedback</h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex flex-column gap-3">

            {projectProgress.recentFeedback.map((feedback, index) => (
              /* Left blue border accent using Bootstrap border utility */
              <div
                key={index}
                className="ps-3 py-2"
                style={{ borderLeft: '4px solid #3c50e0' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-medium text-dark text-capitalize">{feedback.from}</span>
                  <span className="text-muted small">{feedback.date}</span>
                </div>
                <p className="text-muted mb-0 small">{feedback.message}</p>
              </div>
            ))}

          </div>
        </div>
      </div>
      {/* ===== End Recent Feedback ===== */}

    </div>
  );
};

export default Status;