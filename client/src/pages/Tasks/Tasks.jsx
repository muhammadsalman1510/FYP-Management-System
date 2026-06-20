import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});

  const token = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, subsRes] = await Promise.all([
          fetch('/api/tasks', { headers }),
          fetch('/api/tasks/submissions/my', { headers }),
        ]);

        const tasksData = await tasksRes.json();
        const subsData  = await subsRes.json();

        if (!tasksRes.ok || !tasksData.success) throw new Error(tasksData.message || 'Failed to load tasks');
        if (!subsRes.ok  || !subsData.success)  throw new Error(subsData.message  || 'Failed to load submissions');

        const subs = subsData.data || [];
        const submittedIds = new Set(subs.map((s) => String(s.taskId?._id || s.taskId)));

        setPendingTasks((tasksData.data || []).filter((t) => !submittedIds.has(String(t._id))));
        setSubmittedTasks(subs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleFileChange = (taskId, file) => {
    setUploadFiles((prev) => ({ ...prev, [taskId]: file }));
    setSubmitErrors((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleSubmitTask = async (task) => {
    const file = uploadFiles[task._id];
    if (!file) {
      setSubmitErrors((prev) => ({ ...prev, [task._id]: 'Please select a file before submitting.' }));
      return;
    }

    setSubmitting((prev) => ({ ...prev, [task._id]: true }));
    setSubmitErrors((prev) => ({ ...prev, [task._id]: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/tasks/${task._id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');

      // Enrich the returned submission with the full task object so the submitted tab renders correctly
      const enrichedSub = { ...data.data, taskId: task };
      setPendingTasks((prev) => prev.filter((t) => t._id !== task._id));
      setSubmittedTasks((prev) => [enrichedSub, ...prev]);
      setUploadFiles((prev) => { const next = { ...prev }; delete next[task._id]; return next; });
    } catch (err) {
      setSubmitErrors((prev) => ({ ...prev, [task._id]: err.message }));
    } finally {
      setSubmitting((prev) => ({ ...prev, [task._id]: false }));
    }
  };

  const getSubmissionBadge = (status) => {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).replace(/\//g, '-');
  };

  const getProjectName = (task) => {
    if (!task) return '—';
    if (task.projectId && typeof task.projectId === 'object') return task.projectId.title;
    if (task.targetScope === 'all') return 'All Projects';
    return '—';
  };

  const getAssignedBy = (task) => {
    if (!task) return 'Unknown';
    if (task.createdBy && typeof task.createdBy === 'object') return task.createdBy.name;
    return 'Unknown';
  };

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

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">

            {/* Tab Navigation */}
            <div className="card-header bg-white border-bottom p-0">
              <div className="d-flex">
                {[
                  { key: 'pending',   label: `Pending (${pendingTasks.length})` },
                  { key: 'submitted', label: `Submitted (${submittedTasks.length})` },
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

            <div className="card-body p-0">

              {/* PENDING TAB */}
              {activeTab === 'pending' && (
                pendingTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No pending tasks. Check back later.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '44px' }}>#</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Title &amp; Details</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Assigned On</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Due Date</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '210px' }}>Submit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTasks.map((task, index) => (
                          <tr key={task._id}>
                            <td className="px-4 py-3 text-muted small">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <span className="fw-semibold text-dark small">{task.title}</span>
                                <span className="badge rounded-pill" style={projectTagStyle}>
                                  {getProjectName(task)}
                                </span>
                              </div>
                              <p className="text-muted small mb-1">By: {getAssignedBy(task)}</p>
                              {task.instructions && (
                                <p className="text-muted small mb-0">{task.instructions}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted small">{formatDate(task.createdAt)}</td>
                            <td className="px-4 py-3">
                              <span className="small fw-medium" style={{ color: '#dc3545' }}>
                                {formatDate(task.dueDate)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex flex-column gap-2">
                                <input
                                  type="file"
                                  id={`file-${task._id}`}
                                  className="d-none"
                                  onChange={(e) => handleFileChange(task._id, e.target.files[0])}
                                />
                                <label
                                  htmlFor={`file-${task._id}`}
                                  className="btn btn-outline-primary btn-sm mb-0"
                                  style={{ cursor: 'pointer', width: 'fit-content' }}
                                >
                                  Upload File
                                </label>
                                {uploadFiles[task._id] && (
                                  <>
                                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                      {uploadFiles[task._id].name}
                                    </span>
                                    <button
                                      className="btn btn-success btn-sm"
                                      style={{ width: 'fit-content' }}
                                      onClick={() => handleSubmitTask(task)}
                                      disabled={submitting[task._id]}
                                    >
                                      {submitting[task._id] && (
                                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                                      )}
                                      Submit
                                    </button>
                                  </>
                                )}
                                {submitErrors[task._id] && (
                                  <span className="text-danger" style={{ fontSize: '0.78rem' }}>
                                    {submitErrors[task._id]}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* SUBMITTED TAB */}
              {activeTab === 'submitted' && (
                submittedTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No submitted tasks yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '44px' }}>#</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Title &amp; Details</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Due Date</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '120px' }}>Submitted On</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">File</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedTasks.map((sub, index) => {
                          const task  = sub.taskId || {};
                          const badge = getSubmissionBadge(sub.status);
                          return (
                            <tr key={sub._id || index}>
                              <td className="px-4 py-3 text-muted small">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                  <span className="fw-semibold text-dark small">{task.title}</span>
                                  <span className="badge rounded-pill" style={projectTagStyle}>
                                    {getProjectName(task)}
                                  </span>
                                </div>
                                <p className="text-muted small mb-0">By: {getAssignedBy(task)}</p>
                              </td>
                              <td className="px-4 py-3 text-muted small">{formatDate(task.dueDate)}</td>
                              <td className="px-4 py-3 text-muted small">{formatDate(sub.submittedAt)}</td>
                              <td className="px-4 py-3">
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-muted small text-decoration-none"
                                >
                                  📎 {sub.fileName}
                                </a>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="badge rounded-pill px-3 py-2"
                                  style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.72rem' }}
                                >
                                  {badge.label}
                                </span>
                                {sub.feedback && (
                                  <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>
                                    "{sub.feedback}"
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
