import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SupervisorTasks = () => {
  const [activeTab, setActiveTab] = useState('create');

  const [projects, setProjects]       = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [taskFilter, setTaskFilter]             = useState('all');
  const [submissionFilter, setSubmissionFilter] = useState('all');

  const emptyForm = { title: '', instructions: '', openDate: '', dueDate: '', targetScope: 'project', projectId: '' };
  const [taskForm, setTaskForm]   = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating]   = useState(false);

  const [reviewModal, setReviewModal]         = useState(false);
  const [reviewSub, setReviewSub]             = useState(null);
  const [reviewDecision, setReviewDecision]   = useState('');
  const [reviewFeedback, setReviewFeedback]   = useState('');
  const [reviewing, setReviewing]             = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [projRes, tasksRes, subsRes] = await Promise.all([
          fetch('/api/projects/assigned', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/tasks/submissions', { headers }),
        ]);

        const projData  = await projRes.json();
        const tasksData = await tasksRes.json();
        const subsData  = await subsRes.json();

        if (!projRes.ok  || !projData.success)  throw new Error(projData.message  || 'Failed to load projects');
        if (!tasksRes.ok || !tasksData.success) throw new Error(tasksData.message || 'Failed to load tasks');
        if (!subsRes.ok  || !subsData.success)  throw new Error(subsData.message  || 'Failed to load submissions');

        setProjects(projData.data);
        setTasks(tasksData.data);
        setSubmissions(subsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleFormChange = (field, value) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleScopeChange = (value) => {
    setTaskForm((prev) => ({ ...prev, targetScope: value, projectId: value === 'all' ? '' : prev.projectId }));
    setFormError('');
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim())        { setFormError('Task title is required.'); return; }
    if (!taskForm.instructions.trim()) { setFormError('Instructions are required.'); return; }
    if (!taskForm.openDate)            { setFormError('Open date is required.'); return; }
    if (!taskForm.dueDate)             { setFormError('Due date is required.'); return; }
    if (taskForm.targetScope === 'project' && !taskForm.projectId) {
      setFormError('Please select a project.'); return;
    }

    setCreating(true);
    setFormError('');
    try {
      const token = sessionStorage.getItem('token');
      const body = {
        title:        taskForm.title.trim(),
        instructions: taskForm.instructions.trim(),
        openDate:     taskForm.openDate,
        dueDate:      taskForm.dueDate,
        targetScope:  taskForm.targetScope,
      };
      if (taskForm.targetScope === 'project') body.projectId = taskForm.projectId;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create task');

      // data.data may be a single task or array (when targetScope='all')
      const newTasks = Array.isArray(data.data) ? data.data : [data.data];
      setTasks((prev) => [...newTasks, ...prev]);
      setTaskForm(emptyForm);
      setActiveTab('tasks');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const openReview = (sub, decision) => {
    setReviewSub(sub);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    setReviewing(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/tasks/submissions/${reviewSub._id}/review`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewDecision, feedback: reviewFeedback }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Review failed');

      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === reviewSub._id ? { ...s, status: reviewDecision, feedback: reviewFeedback } : s
        )
      );
      setReviewModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#065f46', label: 'Approved' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default:         return { bg: '#dbeafe', color: '#1e40af', label: 'Under Review' };
    }
  };

  const projectTagStyle = { backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: '0.68rem', fontWeight: '500' };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '-');
  };

  const getProjectName = (task) => {
    if (task.projectId && typeof task.projectId === 'object') return task.projectId.title;
    if (task.targetScope === 'all') return 'All Projects';
    return '—';
  };

  const pendingSubsCount = submissions.filter((s) => s.status === 'pending').length;

  const filteredTasks = taskFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.projectId && (t.projectId._id || t.projectId) === taskFilter);

  const filteredSubs = submissionFilter === 'all'
    ? submissions
    : submissions.filter((s) => s.projectId && (s.projectId._id || s.projectId) === submissionFilter);

  const getSubsCountForTask = (taskId) =>
    submissions.filter((s) => {
      const sid = s.taskId?._id || s.taskId;
      return String(sid) === String(taskId);
    }).length;

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Tasks" />
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
        <Breadcrumb pageName="Tasks" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

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
              { key: 'submissions', label: `Submissions (${pendingSubsCount} Pending)` },
            ].map((tab) => (
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
                <label className="form-label fw-medium text-dark small">Assign To *</label>
                <select
                  className="form-select"
                  value={taskForm.targetScope}
                  onChange={(e) => handleScopeChange(e.target.value)}
                >
                  <option value="project">Specific Project</option>
                  <option value="all">All My Projects</option>
                </select>
              </div>

              {taskForm.targetScope === 'project' && (
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Select Project *</label>
                  <select
                    className="form-select"
                    value={taskForm.projectId}
                    onChange={(e) => handleFormChange('projectId', e.target.value)}
                  >
                    <option value="">— Select a project —</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

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

              <div className="col-12 d-flex gap-3 mt-2">
                <button
                  className="btn btn-primary px-5 fw-medium"
                  onClick={handleCreateTask}
                  disabled={creating}
                >
                  {creating ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                  Create Task
                </button>
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => { setTaskForm(emptyForm); setFormError(''); }}
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
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h5 className="fw-semibold text-dark mb-0">All Tasks</h5>
            <div style={{ minWidth: '220px' }}>
              <select
                className="form-select form-select-sm"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
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
                      <tr key={task._id}>
                        <td className="px-4 py-3 text-muted small">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark small mb-1">{task.title}</p>
                          {task.instructions && (
                            <p className="text-muted small mb-0">
                              {task.instructions.length > 60 ? task.instructions.slice(0, 60) + '...' : task.instructions}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge rounded-pill" style={projectTagStyle}>
                            {getProjectName(task)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted small">{formatDate(task.openDate)}</td>
                        <td className="px-4 py-3 text-muted small">{formatDate(task.dueDate)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}
                          >
                            {getSubsCountForTask(task._id)}
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
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h5 className="fw-semibold text-dark mb-0">Task Submissions</h5>
            <div style={{ minWidth: '220px' }}>
              <select
                className="form-select form-select-sm"
                value={submissionFilter}
                onChange={(e) => setSubmissionFilter(e.target.value)}
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredSubs.length === 0 ? (
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
                    {filteredSubs.map((sub) => {
                      const badge = getStatusBadge(sub.status);
                      return (
                        <tr key={sub._id}>
                          <td className="px-4 py-3">
                            <p className="fw-medium text-dark small mb-0">{sub.submittedBy?.name || '—'}</p>
                            <p className="text-muted small mb-0">{sub.submittedBy?.email || ''}</p>
                          </td>
                          <td className="px-4 py-3 text-dark small">{sub.taskId?.title || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="badge rounded-pill" style={projectTagStyle}>
                              {sub.projectId?.title || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                              style={{ fontSize: '0.82rem' }}
                              onClick={() => window.open(sub.fileUrl, '_blank')}
                            >
                              📎 {sub.fileName}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-muted small">{formatDate(sub.submittedAt)}</td>
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
                            {sub.status === 'pending' && (
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
                  Student: <strong className="text-dark">{reviewSub?.submittedBy?.name}</strong><br />
                  Task: <strong className="text-dark">{reviewSub?.taskId?.title}</strong><br />
                  Project: <strong className="text-dark">{reviewSub?.projectId?.title}</strong>
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
                  disabled={reviewing}
                >
                  {reviewing ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
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
