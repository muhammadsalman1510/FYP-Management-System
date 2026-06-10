import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — TASKS
  Tabs:
    1. Create Task   — assign to a specific project or "All My Projects"
    2. All Tasks     — tasks grouped with project tag; project filter dropdown at top
    3. Submissions   — submissions with project tag; project filter dropdown at top

  TODO (Backend):
    POST /api/tasks                        — create task
    GET  /api/tasks                        — get supervisor's tasks (filtered by assigned projects)
    GET  /api/tasks/submissions            — get submissions for supervisor's projects
    PUT  /api/tasks/submissions/:id/review — approve or reject submission
*/

const SupervisorTasks = () => {
  const [activeTab, setActiveTab] = useState('create');

  // TODO (Backend): Replace with GET /api/projects/assigned (supervisor's assigned projects only)
  const myProjects = [
    { id: 1, name: 'FYP Management System' },
    { id: 2, name: 'Smart Attendance System' },
    { id: 3, name: 'Hospital Management System' },
  ];

  // TODO (Backend): Replace with GET /api/tasks (supervisor's tasks)
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Literature Review', projectId: 1, projectName: 'FYP Management System',   scope: 'specific',        instructions: 'Find and summarize 10 research papers.', openDate: '2025-11-02', dueDate: '2025-11-13', submissionsCount: 3 },
    { id: 2, title: 'Progress Report',   projectId: 2, projectName: 'Smart Attendance System', scope: 'specific',        instructions: 'Submit your mid-semester progress.',      openDate: '2025-11-15', dueDate: '2025-11-25', submissionsCount: 1 },
    { id: 3, title: 'System Design',     projectId: null, projectName: 'All My Projects',       scope: 'all_my_projects', instructions: 'Submit your full system design document.', openDate: '2025-12-01', dueDate: '2025-12-15', submissionsCount: 0 },
  ]);

  // TODO (Backend): Replace with GET /api/tasks/submissions (supervisor's projects)
  const [submissions, setSubmissions] = useState([
    { id: 1, taskTitle: 'Literature Review', projectName: 'FYP Management System',   student: 'Muhammad Salman', rollNumber: 'F2021001001', submittedFile: 'lit_review_salman.pdf', submitDate: '2025-11-10', status: 'submitted', feedback: '' },
    { id: 2, taskTitle: 'Literature Review', projectName: 'FYP Management System',   student: 'Ali Hassan',      rollNumber: 'F2021001002', submittedFile: 'lit_review_ali.pdf',    submitDate: '2025-11-11', status: 'approved',  feedback: 'Good work.' },
    { id: 3, taskTitle: 'Progress Report',   projectName: 'Smart Attendance System', student: 'Sara Khan',       rollNumber: 'F2021001003', submittedFile: 'progress_sara.pdf',     submitDate: '2025-11-20', status: 'submitted', feedback: '' },
  ]);

  // Project filters for All Tasks and Submissions tabs
  const [taskFilter, setTaskFilter]             = useState('all');
  const [submissionFilter, setSubmissionFilter] = useState('all');

  // Create task form
  const emptyTask = { title: '', instructions: '', openDate: '', dueDate: '', projectId: '', scope: 'specific', attachFile: null };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [formError, setFormError] = useState('');

  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleProjectSelect = (value) => {
    if (value === 'all_my_projects') {
      setTaskForm(prev => ({ ...prev, projectId: 'all_my_projects', scope: 'all_my_projects' }));
    } else {
      setTaskForm(prev => ({ ...prev, projectId: value, scope: 'specific' }));
    }
    setFormError('');
  };

  const handleCreateTask = () => {
    if (!taskForm.title.trim())        { setFormError('Task title is required.'); return; }
    if (!taskForm.projectId)           { setFormError('Please select a project.'); return; }
    if (!taskForm.instructions.trim()) { setFormError('Instructions are required.'); return; }
    if (!taskForm.openDate)            { setFormError('Open date is required.'); return; }
    if (!taskForm.dueDate)             { setFormError('Due date is required.'); return; }

    const isAll = taskForm.projectId === 'all_my_projects';
    const selectedProject = myProjects.find(p => p.id === Number(taskForm.projectId));

    // TODO (Backend): POST /api/tasks
    setTasks(prev => [...prev, {
      ...taskForm,
      id: Date.now(),
      projectId: isAll ? null : Number(taskForm.projectId),
      projectName: isAll ? 'All My Projects' : selectedProject.name,
      scope: isAll ? 'all_my_projects' : 'specific',
      submissionsCount: 0,
    }]);
    setTaskForm(emptyTask);
    setFormError('');
    setActiveTab('tasks');
    alert('Task created successfully!');
  };

  // Filtered lists
  const filteredTasks = taskFilter === 'all'
    ? tasks
    : tasks.filter(t => String(t.projectId) === String(taskFilter) || (taskFilter === 'all_my_projects' && t.scope === 'all_my_projects'));

  const filteredSubmissions = submissionFilter === 'all'
    ? submissions
    : submissions.filter(s => s.projectName === myProjects.find(p => p.id === Number(submissionFilter))?.name);

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
    // TODO (Backend): PUT /api/tasks/submissions/:id/review  { status, feedback }
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
                  onChange={(e) => handleFormChange('title', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Assign To Project *</label>
                <select
                  className="form-select"
                  value={taskForm.projectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                >
                  <option value="">— Select a project —</option>
                  <option value="all_my_projects">All My Projects</option>
                  {myProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-medium text-dark small">Instructions *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the task requirements..."
                  value={taskForm.instructions}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Open Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.openDate}
                  onChange={(e) => handleFormChange('openDate', e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Due Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.dueDate}
                  onChange={(e) => handleFormChange('dueDate', e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-medium text-dark small">
                  Attach File <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleFormChange('attachFile', e.target.files[0])}
                />
              </div>

              <div className="col-12 d-flex gap-3 mt-2">
                <button className="btn btn-primary px-5 fw-medium" onClick={handleCreateTask}>
                  Create Task
                </button>
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => { setTaskForm(emptyTask); setFormError(''); }}
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
          <div
            className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
          >
            <h5 className="fw-semibold text-dark mb-0">All Tasks</h5>
            <div style={{ minWidth: '220px' }}>
              <select
                className="form-select form-select-sm"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No tasks found for the selected project.</p>
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
                    {filteredTasks.map((task, index) => (
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
          <div
            className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
          >
            <h5 className="fw-semibold text-dark mb-0">Task Submissions</h5>
            <div style={{ minWidth: '220px' }}>
              <select
                className="form-select form-select-sm"
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No submissions for the selected project.</p>
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
                    {filteredSubmissions.map(sub => {
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

export default SupervisorTasks;
