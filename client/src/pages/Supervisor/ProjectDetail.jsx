import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Avatar from '../../components/Avatar';


const docTypeColors = {
  'Proposal':         '#3c50e0',
  'Literature Review':'#28a745',
  'Implementation':   '#17a2b8',
  'Progress Report':  '#fd7e14',
  'Final Report':     '#6f42c1',
  'Screenshots':      '#e83e8c',
  'Other':            '#6c757d',
};

const SupervisorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [documents, setDocuments]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [reviewModal, setReviewModal]       = useState(false);
  const [reviewSub, setReviewSub]           = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing]           = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [projRes, tasksRes, subsRes, docsRes] = await Promise.all([
          fetch('/api/projects/assigned', { headers }),
          fetch('/api/tasks', { headers }),
          fetch('/api/tasks/submissions', { headers }),
          fetch('/api/documents', { headers }),
        ]);

        const [projData, tasksData, subsData, docsData] = await Promise.all([
          projRes.json(), tasksRes.json(), subsRes.json(), docsRes.json(),
        ]);

        if (!projRes.ok  || !projData.success)  throw new Error(projData.message  || 'Failed to load project');
        if (!tasksRes.ok || !tasksData.success) throw new Error(tasksData.message || 'Failed to load tasks');
        if (!subsRes.ok  || !subsData.success)  throw new Error(subsData.message  || 'Failed to load submissions');
        if (!docsRes.ok  || !docsData.success)  throw new Error(docsData.message  || 'Failed to load documents');

        const found = projData.data.find((p) => p._id === id);
        if (!found) throw new Error('Project not found or not assigned to you');
        setProject(found);

        setTasks(tasksData.data.filter((t) => {
          const pid = t.projectId?._id || t.projectId;
          return String(pid) === String(id);
        }));

        setSubmissions(subsData.data.filter((s) => {
          const pid = s.projectId?._id || s.projectId;
          return String(pid) === String(id);
        }));

        setDocuments(docsData.data.filter((d) => {
          const pid = d.projectId?._id || d.projectId;
          return String(pid) === String(id);
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Project Detail" />
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
        <Breadcrumb pageName="Project Detail" />
        <div className="alert alert-danger border-0 mb-4">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/supervisor/projects')}>
          Back to Projects
        </button>
      </>
    );
  }

  const milestones = project.milestones || [];
  const completedCount = milestones.filter((m) => m.completed).length;
  const currentMilestoneIdx = milestones.findIndex((m) => !m.completed);
  const students = project.students || [];
  const coordinator = project.coordinator || null;
  const pendingSubsCount = submissions.filter((s) => s.status === 'pending').length;

  const tabs = [
    { key: 'overview',    label: 'Overview' },
    { key: 'tasks',       label: `Tasks (${tasks.length})` },
    { key: 'submissions', label: `Submissions (${pendingSubsCount} Pending)` },
    { key: 'documents',   label: `Documents (${documents.length})` },
  ];

  return (
    <>
      <Breadcrumb pageName={project.title} />

      <button
        className="btn btn-outline-secondary btn-sm mb-4 d-flex align-items-center gap-2"
        onClick={() => navigate('/supervisor/projects')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Projects
      </button>

      {/* Project Header Card */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold text-dark mb-0">{project.title}</h4>
                <span
                  className="badge"
                  style={{
                    backgroundColor: project.status === 'active' ? '#28a74520' : '#ffc10720',
                    color: project.status === 'active' ? '#28a745' : '#d39e00',
                    fontSize: '0.72rem',
                  }}
                >
                  {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : 'Assigned'}
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem', maxWidth: '600px' }}>
                {project.description}
              </p>
            </div>
            <div className="text-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white mx-auto"
                style={{ width: '64px', height: '64px', backgroundColor: '#3c50e0', fontSize: '1.1rem' }}
              >
                {project.progress || 0}%
              </div>
              <p className="text-muted small mt-1 mb-0">Progress</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${project.progress || 0}%`, borderRadius: '4px' }}
              />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                {completedCount} of {milestones.length} milestones completed
              </span>
              {coordinator && (
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  Coordinator: {coordinator.name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4" style={{ borderBottom: '2px solid #e9ecef' }}>
        <div className="d-flex gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="btn btn-sm fw-medium px-4 py-2"
              style={{
                borderRadius: '6px 6px 0 0',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #3c50e0' : '2px solid transparent',
                backgroundColor: activeTab === tab.key ? '#3c50e010' : 'transparent',
                color: activeTab === tab.key ? '#3c50e0' : '#6c757d',
                marginBottom: '-2px',
                fontSize: '0.85rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="d-flex flex-column gap-4">

          {/* Milestones */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Milestones</h6>
              <p className="text-muted small mb-0 mt-1">Marked complete by the coordinator.</p>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {milestones.map((m, i) => (
                  <div
                    key={m.id || m._id || i}
                    className={`d-flex align-items-center justify-content-between p-3 rounded border ${
                      m.completed
                        ? 'border-success bg-success bg-opacity-10'
                        : i === currentMilestoneIdx
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                        style={{
                          width: '36px', height: '36px', minWidth: '36px',
                          backgroundColor: m.completed ? '#28a745' : i === currentMilestoneIdx ? '#3c50e0' : '#e9ecef',
                          color: m.completed || i === currentMilestoneIdx ? '#fff' : '#adb5bd',
                          fontSize: '0.8rem',
                        }}
                      >
                        {m.completed ? '✓' : (m.id || i + 1)}
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{m.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>{m.description}</p>
                        {m.completed && m.completedAt && (
                          <p className="text-success mb-0" style={{ fontSize: '0.7rem' }}>
                            ✓ Completed on {formatDate(m.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2 flex-shrink-0 ms-2"
                      style={{
                        backgroundColor: m.completed ? '#28a745' : i === currentMilestoneIdx ? '#3c50e0' : '#6c757d',
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {m.completed ? 'Completed' : i === currentMilestoneIdx ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Group Members</h6>
            </div>
            <div className="card-body p-4">
              {students.length === 0 ? (
                <p className="text-muted small mb-0">No students assigned yet.</p>
              ) : (
                <div className="row g-3">
                  {students.map((student, i) => (
                    <div key={student._id || i} className="col-12 col-md-6">
                      <div className="d-flex align-items-center gap-3 p-3 border rounded">
                        <Avatar name={student.name} size={42} />
                        <div>
                          <p className="fw-semibold text-dark mb-0 small">{student.name}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coordinator */}
          {coordinator && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Coordinator</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-3">
                  <Avatar name={coordinator.name} size={48} />
                  <div>
                    <p className="fw-semibold text-dark mb-0">{coordinator.name}</p>
                    <p className="text-muted small mb-0">Coordinator</p>
                    <p className="text-muted small mb-0">{coordinator.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── TASKS ── */}
      {activeTab === 'tasks' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-semibold text-dark mb-0">Tasks</h6>
              <p className="text-muted small mb-0 mt-1">Tasks you created for this project.</p>
            </div>
            <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/supervisor/tasks')}>
              + Create Task
            </button>
          </div>
          <div className="card-body p-0">
            {tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No tasks created for this project yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">TITLE &amp; INSTRUCTIONS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">OPEN DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">DUE DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">SUBMISSIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, i) => {
                      const subCount = submissions.filter((s) => {
                        const tid = s.taskId?._id || s.taskId;
                        return String(tid) === String(task._id);
                      }).length;
                      return (
                        <tr key={task._id}>
                          <td className="px-4 py-3 text-muted small">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="fw-semibold text-dark mb-1 small">{task.title}</p>
                            {task.instructions && (
                              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                                {task.instructions.length > 80 ? task.instructions.slice(0, 80) + '...' : task.instructions}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted small">{formatDate(task.openDate)}</td>
                          <td className="px-4 py-3 text-muted small">{formatDate(task.dueDate)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="badge rounded-pill px-3"
                              style={{
                                backgroundColor: subCount > 0 ? '#28a74520' : '#ffc10720',
                                color: subCount > 0 ? '#28a745' : '#d39e00',
                                fontSize: '0.72rem',
                              }}
                            >
                              {subCount} submission{subCount !== 1 ? 's' : ''}
                            </span>
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

      {/* ── SUBMISSIONS ── */}
      {activeTab === 'submissions' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
            <p className="text-muted small mb-0 mt-1">Review files submitted by students.</p>
          </div>
          <div className="card-body p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No submissions yet for this project.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">TASK</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">STUDENT</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">FILE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">SUBMITTED</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">STATUS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, i) => (
                      <tr key={sub._id}>
                        <td className="px-4 py-3 text-muted small">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.taskId?.title || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.submittedBy?.name || '—'}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{sub.submittedBy?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="btn btn-link btn-sm p-0 text-primary text-decoration-none small"
                            onClick={() => window.open(sub.fileUrl, '_blank')}
                          >
                            📎 {sub.fileName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted small">{formatDate(sub.submittedAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{
                              backgroundColor: sub.status === 'approved' ? '#28a74520' : sub.status === 'rejected' ? '#dc354520' : '#ffc10720',
                              color: sub.status === 'approved' ? '#28a745' : sub.status === 'rejected' ? '#dc3545' : '#d39e00',
                              fontSize: '0.72rem',
                            }}
                          >
                            {sub.status === 'pending' ? 'Pending Review' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                          {sub.feedback && (
                            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.7rem' }}>"{sub.feedback}"</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'pending' && (
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-success px-2" onClick={() => openReview(sub, 'approved')}>✓</button>
                              <button className="btn btn-sm btn-danger px-2"  onClick={() => openReview(sub, 'rejected')}>✕</button>
                            </div>
                          )}
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

      {/* ── DOCUMENTS ── */}
      {activeTab === 'documents' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Documents</h6>
            <p className="text-muted small mb-0 mt-1">Files uploaded by students for this project.</p>
          </div>
          <div className="card-body p-4">
            {documents.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {documents.map((doc) => (
                  <div key={doc._id} className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                        style={{ width: '42px', height: '42px', backgroundColor: docTypeColors[doc.type] || '#6c757d' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{doc.fileName}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                          {doc.type} &bull; {formatDate(doc.uploadedAt || doc.createdAt)} &bull; {doc.size} &bull; By {doc.uploadedBy?.name || '—'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm px-3"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={() => setReviewModal(false)}
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-semibold text-dark mb-0">
                {reviewDecision === 'approved' ? '✓ Accept Submission' : '✕ Reject Submission'}
              </h6>
              <button className="btn btn-sm p-0 border-0" onClick={() => setReviewModal(false)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <p className="fw-medium text-dark mb-1 small">{reviewSub?.taskId?.title}</p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                Submitted by: {reviewSub?.submittedBy?.name}
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                File: <span className="text-primary">{reviewSub?.fileName}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium small">Feedback *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter feedback for the student..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn flex-fill fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={submitReview}
                disabled={reviewing}
              >
                {reviewing ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                Confirm
              </button>
              <button className="btn btn-outline-secondary flex-fill" onClick={() => setReviewModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorProjectDetail;
