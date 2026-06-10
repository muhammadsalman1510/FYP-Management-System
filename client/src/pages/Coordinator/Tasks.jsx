import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — TASKS
  Tabs:
    1. Create Task   — searchable project dropdown; "All Projects" is the first option
    2. All Tasks     — every task row shows a project tag
    3. Submissions   — every submission row shows a project tag; accept/reject with feedback

  TODO (Backend):
    POST /api/tasks                        — create task
    GET  /api/tasks                        — get all tasks (coordinator sees all)
    GET  /api/tasks/submissions            — get all submissions
    PUT  /api/tasks/submissions/:id/review — approve or reject submission  { status, feedback }
*/

const CoordinatorTasks = () => {
  const [activeTab, setActiveTab] = useState('create');

  // TODO (Backend): Replace with GET /api/projects (all projects in the system)
  const allProjects = [
    { id: 1, name: 'FYP Management System' },
    { id: 2, name: 'Smart Attendance System' },
    { id: 3, name: 'Hospital Management System' },
    { id: 4, name: 'E-Commerce Platform' },
    { id: 5, name: 'Library Management System' },
  ];

  // TODO (Backend): Replace with GET /api/tasks
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Literature Review',  projectId: 1,    projectName: 'FYP Management System',   scope: 'specific', instructions: 'Find and summarize 10 research papers.',        openDate: '2025-11-02', dueDate: '2025-11-13', submissionsCount: 3 },
    { id: 2, title: 'Progress Report',    projectId: 2,    projectName: 'Smart Attendance System', scope: 'specific', instructions: 'Submit your mid-semester progress report.',     openDate: '2025-11-15', dueDate: '2025-11-25', submissionsCount: 1 },
    { id: 3, title: 'Final Presentation', projectId: null, projectName: 'All Projects',            scope: 'all',      instructions: 'Prepare and submit final presentation slides.', openDate: '2025-12-01', dueDate: '2025-12-15', submissionsCount: 0 },
  ]);

  // TODO (Backend): Replace with GET /api/tasks/submissions
  const [submissions, setSubmissions] = useState([
    { id: 1, taskTitle: 'Literature Review', projectName: 'FYP Management System',   student: 'Muhammad Salman', rollNumber: 'F2021001001', submittedFile: 'lit_review_salman.pdf', submitDate: '2025-11-10', status: 'submitted', feedback: '' },
    { id: 2, taskTitle: 'Literature Review', projectName: 'FYP Management System',   student: 'Ali Hassan',      rollNumber: 'F2021001002', submittedFile: 'lit_review_ali.pdf',    submitDate: '2025-11-11', status: 'approved',  feedback: 'Good work.' },
    { id: 3, taskTitle: 'Progress Report',   projectName: 'Smart Attendance System', student: 'Sara Khan',       rollNumber: 'F2021001003', submittedFile: 'progress_sara.pdf',     submitDate: '2025-11-20', status: 'submitted', feedback: '' },
  ]);

  // Create task form
  const emptyTask = { title: '', instructions: '', openDate: '', dueDate: '', projectId: '', projectName: '', scope: '', attachFile: null };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [formError, setFormError] = useState('');

  // Searchable project dropdown state
  const [projectSearch, setProjectSearch]             = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const projectOptions = [
    { id: 'all', name: 'All Projects' },
    ...allProjects,
  ];

  const filteredProjectOptions = projectOptions.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleProjectSelect = (project) => {
    const isAll = project.id === 'all';
    setTaskForm(prev => ({
      ...prev,
      projectId: isAll ? null : project.id,
      projectName: project.name,
      scope: isAll ? 'all' : 'specific',
    }));
    setProjectSearch(project.name);
    setShowProjectDropdown(false);
    setFormError('');
  };

  const handleProjectSearchChange = (value) => {
    setProjectSearch(value);
    // Clear selection when user types freely
    setTaskForm(prev => ({ ...prev, projectId: '', projectName: '', scope: '' }));
    setShowProjectDropdown(true);
  };

  // Allow mousedown click on option to fire before the input's onBlur hides the list
  const handleProjectBlur = () => {
    setTimeout(() => setShowProjectDropdown(false), 150);
  };

  const handleCreateTask = () => {
    if (!taskForm.title.trim())        { setFormError('Task title is required.'); return; }
    if (!taskForm.projectName)         { setFormError('Please select a project from the dropdown.'); return; }
    if (!taskForm.instructions.trim()) { setFormError('Instructions are required.'); return; }
    if (!taskForm.openDate)            { setFormError('Open date is required.'); return; }
    if (!taskForm.dueDate)             { setFormError('Due date is required.'); return; }

    // TODO (Backend): POST /api/tasks
    setTasks(prev => [...prev, { ...taskForm, id: Date.now(), submissionsCount: 0 }]);
    setTaskForm(emptyTask);
    setProjectSearch('');
    setFormError('');
    setActiveTab('tasks');
    alert('Task created successfully!');
  };

  // Review modal
  const [reviewModal, setReviewModal]           = useState(false);
  const [reviewSubmission, setReviewSubmission] = useState(null);
  const [reviewDecision, setReviewDecision]     = useState('');
  const [reviewFeedback, setReviewFeedback]     = useState('');

  const openReview = (sub, decision) => {
    setReviewSubmission(sub);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  const submitReview = () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    // TODO (Backend): PUT /api/tasks/submissions/:id/review
    setSubmissions(prev =>
      prev.map(s => s.id === reviewSubmission.id ? { ...s, status: reviewDecision, feedback: reviewFeedback } : s)
    );
    setReviewModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#065f46', label: 'Approved' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default:         return { bg: '#dbeafe', color: '#1e40af', label: 'Under Review' };
    }
  };

  const projectTagStyle = {
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    fontSize: '0.68rem',
    fontWeight: '500',
  };

  return (
    <>
      <Breadcrumb pageName="Tasks" />

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {[
              { key: 'create',      label: 'Create Task' },
              { key: 'tasks',       label: `All Tasks (${tasks.length})` },
              { key: 'submissions', label: `Submissions (${submissions.filter(s => s.status === 'submitted').length} Pending)` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
                style={{
                  color: activeTab === tab.key ? '#3c50e0' : '#6c757d',
                  borderBottom: activeTab === tab.key ? '2px solid #3c50e0' : '2px solid transparent',
                  fontSize: '0.9rem',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CREATE TASK ── */}
      {activeTab === 'create' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Create New Task</h5>
          </div>
          <div className="card-body p-4">
            {formError && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}
            <div className="row g-3">

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Task Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Literature Review"
                  value={taskForm.title}
                  onChange={(e) => { setTaskForm(prev => ({ ...prev, title: e.target.value })); setFormError(''); }}
                />
              </div>

              {/* Searchable project dropdown */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Assign To Project *</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search or select a project..."
                    value={projectSearch}
                    onChange={(e) => handleProjectSearchChange(e.target.value)}
                    onFocus={() => setShowProjectDropdown(true)}
                    onBlur={handleProjectBlur}
                    autoComplete="off"
                  />
                  {showProjectDropdown && filteredProjectOptions.length > 0 && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-sm"
                      style={{ top: '100%', zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {filteredProjectOptions.map(p => (
                        <div
                          key={p.id}
                          className="px-3 py-2 small"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                          onMouseDown={() => handleProjectSelect(p)}
                        >
                          {p.id === 'all' ? (
                            <span className="fw-semibold" style={{ color: '#3c50e0' }}>All Projects</span>
                          ) : (
                            p.name
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12">
                <label className="form-label fw-medium text-dark small">Instructions *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the task requirements in detail..."
                  value={taskForm.instructions}
                  onChange={(e) => { setTaskForm(prev => ({ ...prev, instructions: e.target.value })); setFormError(''); }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Open Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.openDate}
                  onChange={(e) => { setTaskForm(prev => ({ ...prev, openDate: e.target.value })); setFormError(''); }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Due Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.dueDate}
                  onChange={(e) => { setTaskForm(prev => ({ ...prev, dueDate: e.target.value })); setFormError(''); }}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium text-dark small">
                  Attach File <span className="text-muted fw-normal">(Optional — guidelines, templates, etc.)</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setTaskForm(prev => ({ ...prev, attachFile: e.target.files[0] }))}
                />
              </div>

              <div className="col-12 d-flex gap-3 mt-2">
                <button className="btn btn-primary px-5 fw-medium" onClick={handleCreateTask}>
                  Create Task
                </button>
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => { setTaskForm(emptyTask); setProjectSearch(''); setFormError(''); }}
                >
                  Clear
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── ALL TASKS ── */}
      {activeTab === 'tasks' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">All Tasks</h5>
          </div>
          <div className="card-body p-0">
            {tasks.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No tasks created yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '44px' }}>#</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Title</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Project</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Open Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Due Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Submissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={task.id}>
                        <td className="px-4 py-3 text-muted small">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark small mb-1">{task.title}</p>
                          <p className="text-muted small mb-0">{task.instructions.slice(0, 60)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge rounded-pill" style={projectTagStyle}>{task.projectName}</span>
                        </td>
                        <td className="px-4 py-3 text-muted small">{task.openDate}</td>
                        <td className="px-4 py-3 text-muted small">{task.dueDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}
                          >
                            {task.submissionsCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUBMISSIONS ── */}
      {activeTab === 'submissions' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Task Submissions</h5>
          </div>
          <div className="card-body p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No submissions yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Task</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Project</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">File</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => {
                      const badge = getStatusBadge(sub.status);
                      return (
                        <tr key={sub.id}>
                          <td className="px-4 py-3">
                            <p className="fw-medium text-dark small mb-0">{sub.student}</p>
                            <p className="text-muted small mb-0">{sub.rollNumber}</p>
                          </td>
                          <td className="px-4 py-3 text-dark small">{sub.taskTitle}</td>
                          <td className="px-4 py-3">
                            <span className="badge rounded-pill" style={projectTagStyle}>{sub.projectName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                              style={{ fontSize: '0.82rem' }}
                              onClick={() => alert(`Downloading ${sub.submittedFile}`)}
                            >
                              📎 {sub.submittedFile}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-muted small">{sub.submitDate}</td>
                          <td className="px-4 py-3">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.72rem' }}
                            >
                              {badge.label}
                            </span>
                            {sub.feedback && (
                              <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>"{sub.feedback}"</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {sub.status === 'submitted' && (
                              <div className="d-flex gap-2">
                                <button className="btn btn-success btn-sm px-3" onClick={() => openReview(sub, 'approved')}>✓ Accept</button>
                                <button className="btn btn-danger btn-sm px-3"  onClick={() => openReview(sub, 'rejected')}>✕ Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {reviewDecision === 'approved' ? '✓ Accept Submission' : '✕ Reject Submission'}
                </h5>
                <button className="btn-close" onClick={() => setReviewModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted small mb-3">
                  Student: <strong className="text-dark">{reviewSubmission?.student}</strong><br />
                  Task: <strong className="text-dark">{reviewSubmission?.taskTitle}</strong><br />
                  Project: <strong className="text-dark">{reviewSubmission?.projectName}</strong>
                </p>
                <label className="form-label fw-medium text-dark small">Feedback *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Provide feedback for the student..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setReviewModal(false)}>Cancel</button>
                <button
                  className={`btn px-4 fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitReview}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorTasks;
