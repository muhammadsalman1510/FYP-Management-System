import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const MeetingRequests = () => {
  const [project, setProject]   = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const currentUserId = (() => {
    try { return JSON.parse(sessionStorage.getItem('user'))?._id || ''; }
    catch { return ''; }
  })();

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Modal state
  const [showModal, setShowModal]       = useState(false);
  const [meetWith, setMeetWith]         = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [topic, setTopic]               = useState('');
  const [modalError, setModalError]     = useState('');
  const [submitting, setSubmitting]     = useState(false);

  const loadMeetings = async () => {
    const res  = await fetch('/api/meetings', { headers });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load meetings');
    return data.data;
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meetingsRes, projectRes] = await Promise.all([
          fetch('/api/meetings',     { headers }),
          fetch('/api/projects/my', { headers }),
        ]);

        const meetingsData = await meetingsRes.json();
        const projectData  = await projectRes.json();

        if (!meetingsRes.ok || !meetingsData.success) {
          throw new Error(meetingsData.message || 'Failed to load meetings');
        }
        setMeetings(meetingsData.data);

        if (projectRes.status === 404) {
          setProject(null);
        } else if (!projectRes.ok || !projectData.success) {
          throw new Error(projectData.message || 'Failed to load project');
        } else {
          setProject(projectData.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const openModal = () => {
    setMeetWith('');
    setProposedDate('');
    setProposedTime('');
    setTopic('');
    setModalError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError('');
  };

  const handleSubmit = async () => {
    if (!meetWith)       { setModalError('Please select who you want to meet with.'); return; }
    if (!proposedDate)   { setModalError('Please select a proposed date.'); return; }
    if (!proposedTime)   { setModalError('Please select a proposed time.'); return; }
    if (!topic.trim())   { setModalError('Please enter a topic or reason.'); return; }

    let requestedTo = '';
    if (meetWith === 'supervisor') {
      requestedTo = project?.supervisors?.[0]?._id;
      if (!requestedTo) { setModalError('No supervisor is assigned to your project.'); return; }
    } else {
      requestedTo = project?.coordinator?._id;
      if (!requestedTo) { setModalError('No coordinator is assigned to your project.'); return; }
    }

    setModalError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestedTo,
          proposedDate,
          proposedTime,
          topic:     topic.trim(),
          projectId: project._id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit meeting request');

      const fresh = await loadMeetings();
      setMeetings(fresh);
      closeModal();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending':  return 'Pending Review';
      case 'rejected': return 'Rejected';
      default:         return status;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const getRoleBadgeClass = (role) => {
    if (!role) return 'bg-secondary';
    if (role === 'supervisor')  return 'bg-info text-dark';
    if (role === 'coordinator') return 'bg-primary';
    return 'bg-secondary';
  };

  // Classify each meeting
  const isOwnMeeting = (m) =>
    String(m.requestedBy?._id || m.requestedBy) === String(currentUserId) ||
    String(m.requestedTo?._id  || m.requestedTo) === String(currentUserId);

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="My Meetings" />
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
        <Breadcrumb pageName="My Meetings" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  const supervisorName  = project?.supervisors?.[0]?.name || '';
  const coordinatorName = project?.coordinator?.name       || '';

  return (
    <>
      <Breadcrumb pageName="My Meetings" />

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">

            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-semibold text-dark mb-0">My Meetings</h5>
              <button
                className="btn btn-primary btn-sm px-3 fw-medium"
                onClick={openModal}
                disabled={!project}
                title={!project ? 'You need an active project before requesting a meeting.' : ''}
              >
                + Request a Meeting
              </button>
            </div>

            {!project && (
              <div className="alert alert-warning border-0 rounded-0 mb-0 px-4 py-3 small">
                You need an active project before requesting a meeting. Once your proposal is approved,
                you will be able to request meetings here.
              </div>
            )}

            <div className="card-body p-4">
              {meetings.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No meetings yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-4">
                  {meetings.map((m) => {
                    const own = isOwnMeeting(m);

                    if (!own) {
                      // ── Groupmate meeting card ──────────────────────────────
                      // One of requestedBy/requestedTo is the groupmate (student),
                      // the other is the supervisor/coordinator they met with.
                      const groupmate = m.requestedTo?.role === 'student'
                        ? m.requestedTo
                        : m.requestedBy;
                      const withPerson = m.requestedTo?.role !== 'student'
                        ? m.requestedTo
                        : m.requestedBy;

                      return (
                        <div key={m._id} className="border rounded p-4" style={{ borderLeft: '3px solid #6f42c1 !important' }}>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className="badge rounded-pill px-2"
                                  style={{ backgroundColor: '#6f42c1', color: '#fff', fontSize: '0.65rem' }}
                                >
                                  Group
                                </span>
                                <h5 className="fw-semibold text-dark mb-0">{m.topic}</h5>
                              </div>

                              <p className="text-muted mb-1 small">
                                Group Meeting —{' '}
                                <strong className="text-dark">{groupmate?.name || '—'}</strong>
                                <span className="ms-1 badge rounded-pill bg-secondary" style={{ fontSize: '0.65rem' }}>
                                  Student
                                </span>
                              </p>

                              <p className="text-muted mb-1 small">
                                With:{' '}
                                <strong className="text-dark">{withPerson?.name || '—'}</strong>
                                {withPerson?.role && (
                                  <span className={`ms-1 badge rounded-pill ${getRoleBadgeClass(withPerson.role)}`} style={{ fontSize: '0.65rem' }}>
                                    {withPerson.role.charAt(0).toUpperCase() + withPerson.role.slice(1)}
                                  </span>
                                )}
                              </p>

                              <p className="text-muted mb-1 small">
                                Date:{' '}
                                <strong className="text-dark">{formatDate(m.proposedDate)}</strong>
                                {' '}at{' '}
                                <strong className="text-dark">{m.proposedTime}</strong>
                              </p>
                              {m.location && (
                                <p className="text-muted mb-1 small">
                                  Location: <strong className="text-dark">📍 {m.location}</strong>
                                </p>
                              )}
                              {m.projectId?.title && (
                                <p className="text-muted mb-0 small">
                                  Project: <strong className="text-dark">{m.projectId.title}</strong>
                                </p>
                              )}
                            </div>
                            <span className="badge rounded-pill px-3 py-2 bg-success">Approved</span>
                          </div>
                        </div>
                      );
                    }

                    // ── Own meeting card ──────────────────────────────────────
                    const isOutgoing  = String(m.requestedBy?._id || m.requestedBy) === String(currentUserId);
                    const otherPerson = isOutgoing ? m.requestedTo : m.requestedBy;
                    const otherRole   = otherPerson?.role || '';

                    return (
                      <div key={m._id} className="border rounded p-4">

                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-semibold text-dark mb-2">{m.topic}</h5>

                            {isOutgoing ? (
                              <>
                                <p className="text-muted mb-1 small">
                                  With:{' '}
                                  <strong className="text-dark">{otherPerson?.name || '—'}</strong>
                                  {otherRole && (
                                    <span className={`ms-1 badge rounded-pill ${getRoleBadgeClass(otherRole)}`} style={{ fontSize: '0.65rem' }}>
                                      {otherRole.charAt(0).toUpperCase() + otherRole.slice(1)}
                                    </span>
                                  )}
                                </p>
                                <p className="text-muted mb-1 small" style={{ fontStyle: 'italic' }}>
                                  You requested this meeting
                                </p>
                              </>
                            ) : (
                              <p className="text-muted mb-1 small">
                                Scheduled by:{' '}
                                <strong className="text-dark">{otherPerson?.name || '—'}</strong>
                                {otherRole && (
                                  <span className={`ms-1 badge rounded-pill ${getRoleBadgeClass(otherRole)}`} style={{ fontSize: '0.65rem' }}>
                                    {otherRole.charAt(0).toUpperCase() + otherRole.slice(1)}
                                  </span>
                                )}
                              </p>
                            )}

                            <p className="text-muted mb-1 small">
                              Date:{' '}
                              <strong className="text-dark">{formatDate(m.proposedDate)}</strong>
                              {' '}at{' '}
                              <strong className="text-dark">{m.proposedTime}</strong>
                            </p>
                            {m.location && (
                              <p className="text-muted mb-1 small">
                                Location: <strong className="text-dark">📍 {m.location}</strong>
                              </p>
                            )}
                            {m.projectId?.title && (
                              <p className="text-muted mb-1 small">
                                Project: <strong className="text-dark">{m.projectId.title}</strong>
                              </p>
                            )}
                            {isOutgoing && (
                              <p className="text-muted mb-0 small">
                                Submitted: {formatDate(m.createdAt)}
                              </p>
                            )}
                          </div>
                          <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(m.status)}`}>
                            {getStatusText(m.status)}
                          </span>
                        </div>

                        {m.notes && (
                          <div className={`alert py-2 px-3 mt-2 mb-2 ${m.status === 'approved' ? 'alert-success' : 'alert-danger'}`}>
                            <p className="small mb-0">
                              <strong>{m.status === 'approved' ? 'Approval Message' : 'Response'}:</strong>{' '}
                              {m.notes}
                            </p>
                          </div>
                        )}

                        {/* Student's own reply — read-only here; reply sent from Calendar */}
                        {m.studentReply && (
                          <div className="alert alert-light border py-2 px-3 mt-2 mb-0">
                            <p className="small mb-0">
                              <strong>Your reply:</strong> {m.studentReply}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Request a Meeting Modal ── */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">

              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">Request a Meeting</h5>
                <button className="btn-close" onClick={closeModal} />
              </div>

              <div className="modal-body px-4 py-4">

                {modalError && (
                  <div className="alert alert-danger border-0 py-2 px-3 small mb-3">
                    {modalError}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <select
                    className="form-select"
                    value={meetWith}
                    onChange={(e) => { setMeetWith(e.target.value); setModalError(''); }}
                  >
                    <option value="">— Select —</option>
                    <option value="supervisor" disabled={!project?.supervisors?.length}>
                      Supervisor{supervisorName ? ` — ${supervisorName}` : ''}
                    </option>
                    <option value="coordinator" disabled={!project?.coordinator}>
                      Coordinator{coordinatorName ? ` — ${coordinatorName}` : ''}
                    </option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={proposedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setProposedDate(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-medium text-dark small">Topic / Reason *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Progress update discussion"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

              </div>

              <div className="modal-footer border-top px-4 py-3 gap-2">
                <button className="btn btn-outline-secondary px-4" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4 fw-medium"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  )}
                  Submit Request
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingRequests;
