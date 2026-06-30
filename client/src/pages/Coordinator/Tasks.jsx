import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorTasks = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [tasksRes, subsRes, projectsRes] = await Promise.all([
          fetch('/api/tasks', { headers }),
          fetch('/api/tasks/submissions', { headers }),
          fetch('/api/projects', { headers }),
        ]);

        const [tasksData, subsData, projectsData] = await Promise.all([
          tasksRes.json(), subsRes.json(), projectsRes.json(),
        ]);

        if (!tasksRes.ok || !tasksData.success) throw new Error(tasksData.message || 'Failed to load tasks');
        if (!subsRes.ok || !subsData.success) throw new Error(subsData.message || 'Failed to load submissions');

        setTasks(tasksData.data);
        setSubmissions(subsData.data);
        if (projectsRes.ok && projectsData.success) {
          setProjects(projectsData.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const emptyTask = { title: '', instructions: '', openDate: '', dueDate: '', projectId: '', projectName: '', scope: '' };
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // searchable project dropdown state
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const projectOptions = [{ _id: 'all', title: 'All Projects' }, ...projects];
  const filteredProjectOptions = projectOptions.filter((p) =>
    p.title.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleProjectSelect = (project) => {
    const isAll = project._id === 'all';
    setTaskForm((prev) => ({
      ...prev,
      projectId: isAll ? null : project._id,
      projectName: project.title,
      scope: isAll ? 'all' : 'project',
    }));
    setProjectSearch(project.title);
    setShowProjectDropdown(false);
    setFormError('');
  };

  const handleProjectSearchChange = (value) => {
    setProjectSearch(value);
    setTaskForm((prev) => ({ ...prev, projectId: '', projectName: '', scope: '' }));
    setShowProjectDropdown(true);
  };

  const handleProjectBlur = () => {
    setTimeout(() => setShowProjectDropdown(false), 150);
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) { setFormError('Task title is required.'); return; }
    if (!taskForm.projectName) { setFormError('Please select a project from the dropdown.'); return; }
    if (!taskForm.instructions.trim()) { setFormError('Instructions are required.'); return; }
    if (!taskForm.openDate) { setFormError('Open date is required.'); return; }
    if (!taskForm.dueDate) { setFormError('Due date is required.'); return; }

    setCreating(true);
    setFormError('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskForm.title,
          instructions: taskForm.instructions,
          openDate: taskForm.openDate,
          dueDate: taskForm.dueDate,
          projectId: taskForm.projectId || null,
          targetScope: taskForm.scope,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create task');

      setTasks((prev) => [data.data, ...prev]);
      setTaskForm(emptyTask);
      setProjectSearch('');
      setActiveTab('tasks');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // edit task modal
  const [editModal, setEditModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', instructions: '', openDate: '', dueDate: '' });
  const [editError, setEditError] = useState('');
  const [editing, setEditing] = useState(false);

  const openEditModal = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title || '',
      instructions: task.instructions || '',
      openDate: task.openDate ? task.openDate.split('T')[0] : '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setEditError('');
    setEditModal(true);
  };

  const handleEditTask = async () => {
    if (!editForm.title.trim()) { setEditError('Task title is required.'); return; }
    if (!editForm.openDate) { setEditError('Open date is required.'); return; }
    if (!editForm.dueDate) { setEditError('Due date is required.'); return; }

    setEditing(true);
    setEditError('');
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/tasks/${editTask._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(),
          instructions: editForm.instructions,
          openDate: editForm.openDate,
          dueDate: editForm.dueDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update task');

      setTasks((prev) => prev.map((t) => t._id === editTask._id ? data.data : t));
      setEditModal(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete task');
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message);
    }
  };

  // review submission modal
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewSub, setReviewSub] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const openReview = (sub, decision) => {
    setReviewSub(sub);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewError(null);
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    setReviewing(true);
    setReviewError(null);
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
        prev.map((s) => (s._id === reviewSub._id ? { ...s, status: reviewDecision, feedback: reviewFeedback } : s))
      );
      setReviewModal(false);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#065f46', label: 'Approved' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default: return { bg: '#dbeafe', color: '#1e40af', label: 'Pending Review' };
    }
  };

  const projectTagStyle = {
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    fontSize: '0.68rem',
    fontWeight: '500',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const submissionCountForTask = (taskId) =>
    submissions.filter((s) => s.taskId?._id === taskId || s.taskId === taskId).length;

  if (loading) return (
    <>
      <Breadcrumb pageName="Tasks" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="Tasks" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  return (
    <>
      <Breadcrumb pageName="Tasks" />

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {[
              { key: 'create', label: 'Create Task' },
              { key: 'tasks', label: `All Tasks (${tasks.length})` },
              { key: 'submissions', label: `Submissions (${pendingCount} Pending)` },
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
                  onChange={(e) => { setTaskForm((prev) => ({ ...prev, title: e.target.value })); setFormError(''); }}
                />
              </div>

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
                      {filteredProjectOptions.map((p) => (
                        <div
                          key={p._id}
                          className="px-3 py-2 small"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                          onMouseDown={() => handleProjectSelect(p)}
                        >
                          {p._id === 'all' ? (
                            <span className="fw-semibold" style={{ color: '#3c50e0' }}>All Projects</span>
                          ) : p.title}
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
                  onChange={(e) => { setTaskForm((prev) => ({ ...prev, instructions: e.target.value })); setFormError(''); }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Open Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.openDate}
                  onChange={(e) => { setTaskForm((prev) => ({ ...prev, openDate: e.target.value })); setFormError(''); }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-medium text-dark small">Due Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.dueDate}
                  min={today}
                  onChange={(e) => { setTaskForm((prev) => ({ ...prev, dueDate: e.target.value })); setFormError(''); }}
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
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '120px' }}>Open Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '120px' }}>Due Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Submissions</th>
                      <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, index) => (
                      <tr key={task._id}>
                        <td className="px-4 py-3 text-muted small">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark small mb-1">{task.title}</p>
                          <p className="text-muted small mb-0">
                            {(task.instructions || '').slice(0, 60)}{(task.instructions || '').length > 60 ? '...' : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge rounded-pill" style={projectTagStyle}>
                            {task.targetScope === 'all' ? 'All Projects' : task.projectId?.title || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted small">{formatDate(task.openDate)}</td>
                        <td className="px-4 py-3 text-muted small">{formatDate(task.dueDate)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}
                          >
                            {submissionCountForTask(task._id)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => openEditModal(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                          </div>
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
                    {submissions.map((sub) => {
                      const badge = getStatusBadge(sub.status);
                      return (
                        <tr key={sub._id}>
                          <td className="px-4 py-3">
                            <p className="fw-medium text-dark small mb-0">{sub.submittedBy?.name}</p>
                            <p className="text-muted small mb-0">{sub.submittedBy?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-dark small">{sub.taskId?.title}</td>
                          <td className="px-4 py-3">
                            <span className="badge rounded-pill" style={projectTagStyle}>
                              {sub.projectId?.title || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {sub.fileUrl ? (
                              <a
                                href={`http://localhost:4000${sub.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-decoration-none"
                                style={{ fontSize: '0.82rem' }}
                              >
                                📎 {sub.fileName || 'Download'}
                              </a>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
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
                                <button className="btn btn-danger btn-sm px-3" onClick={() => openReview(sub, 'rejected')}>✕ Reject</button>
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

      {/* Edit Task Modal */}
      {editModal && editTask && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditModal(false); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">Edit Task</h5>
                <button className="btn-close" onClick={() => setEditModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                {editError && (
                  <div className="alert alert-danger border-0 py-2 px-3 small mb-3">{editError}</div>
                )}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Task Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.title}
                      onChange={(e) => { setEditForm((p) => ({ ...p, title: e.target.value })); setEditError(''); }}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Instructions</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editForm.instructions}
                      onChange={(e) => setEditForm((p) => ({ ...p, instructions: e.target.value }))}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Open Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.openDate}
                      onChange={(e) => { setEditForm((p) => ({ ...p, openDate: e.target.value })); setEditError(''); }}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Due Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.dueDate}
                      min={today}
                      onChange={(e) => { setEditForm((p) => ({ ...p, dueDate: e.target.value })); setEditError(''); }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top px-4 py-3 gap-2">
                <button className="btn btn-outline-secondary px-4" onClick={() => setEditModal(false)}>Cancel</button>
                <button
                  className="btn btn-primary px-4 fw-medium"
                  onClick={handleEditTask}
                  disabled={editing}
                >
                  {editing && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                  Save Changes
                </button>
              </div>
            </div>
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
                {reviewError && (
                  <div className="alert alert-danger border-0 py-2 px-3 mb-3 small">{reviewError}</div>
                )}
                <p className="text-muted small mb-3">
                  Student: <strong className="text-dark">{reviewSub?.submittedBy?.name}</strong><br />
                  Task: <strong className="text-dark">{reviewSub?.taskId?.title}</strong><br />
                  Project: <strong className="text-dark">{reviewSub?.projectId?.title || '—'}</strong>
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

export default CoordinatorTasks;
