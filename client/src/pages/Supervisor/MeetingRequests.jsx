import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SupervisorMeetingRequests = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [meetings, setMeetings]   = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [cancelError, setCancelError] = useState('');

  // Per-card reply state for coordinator-originated meetings
  // shape: { [meetingId]: { text, sending, success, error } }
  const [replyStates, setReplyStates] = useState({});

  const currentUserId = (() => {
    try { return JSON.parse(sessionStorage.getItem('user'))?._id || ''; }
    catch { return ''; }
  })();

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Respond modal
  const [respondModal, setRespondModal]       = useState(false);
  const [respondMeeting, setRespondMeeting]   = useState(null);
  const [respondDecision, setRespondDecision] = useState('');
  const [respondNotes, setRespondNotes]       = useState('');
  const [responding, setResponding]           = useState(false);
  const [respondError, setRespondError]       = useState('');

  // New meeting modal
  const [requestModal, setRequestModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    meetWith: '', projectId: '',
    proposedDate: '', proposedTime: '', topic: '', location: '',
  });
  const [reqError, setReqError]     = useState('');
  const [reqSending, setReqSending] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [meetingsRes, projectsRes] = await Promise.all([
          fetch('/api/meetings',          { headers }),
          fetch('/api/projects/assigned', { headers }),
        ]);

        const meetingsData = await meetingsRes.json();
        const projectsData = await projectsRes.json();

        if (!meetingsRes.ok || !meetingsData.success) throw new Error(meetingsData.message || 'Failed to load meetings');
        if (!projectsRes.ok || !projectsData.success) throw new Error(projectsData.message || 'Failed to load projects');

        setMeetings(meetingsData.data);
        setProjects(projectsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const pendingCount      = meetings.filter((m) => m.status === 'pending').length;
  const displayedMeetings = activeTab === 'all' ? meetings : meetings.filter((m) => m.status === 'pending');

  // ── Reply state helpers ───────────────────────────────────────────────────
  const getRS = (id) =>
    replyStates[String(id)] || { text: '', sending: false, success: false, error: '' };

  const setRS = (id, updates) =>
    setReplyStates((prev) => ({
      ...prev,
      [String(id)]: { ...(prev[String(id)] || { text: '', sending: false, success: false, error: '' }), ...updates },
    }));

  const sendReply = async (meetingId) => {
    const rs = getRS(meetingId);
    if (!rs.text.trim()) { setRS(meetingId, { error: 'Please enter a reply.' }); return; }
    setRS(meetingId, { sending: true, error: '' });
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ studentReply: rs.text.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send reply');
      setMeetings((prev) =>
        prev.map((m) => m._id === meetingId ? { ...m, studentReply: rs.text.trim() } : m)
      );
      setRS(meetingId, { sending: false, success: true, text: '' });
    } catch (err) {
      setRS(meetingId, { sending: false, error: err.message });
    }
  };

  // ── Respond to student meeting request ───────────────────────────────────
  const openRespond = (meeting, decision) => {
    setRespondMeeting(meeting);
    setRespondDecision(decision);
    setRespondNotes('');
    setRespondError('');
    setRespondModal(true);
  };

  const submitResponse = async () => {
    if (!respondNotes.trim()) { setRespondError('Please provide a response message.'); return; }
    setResponding(true);
    setRespondError('');
    try {
      const res = await fetch(`/api/meetings/${respondMeeting._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: respondDecision, notes: respondNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update meeting');

      setMeetings((prev) =>
        prev.map((m) =>
          m._id === respondMeeting._id ? { ...m, status: respondDecision, notes: respondNotes.trim() } : m
        )
      );
      setRespondModal(false);
    } catch (err) {
      setRespondError(err.message);
    } finally {
      setResponding(false);
    }
  };

  const cancelMeeting = async (meetingId) => {
    if (!window.confirm('Cancel this meeting? This cannot be undone.')) return;
    setCancelError('');
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to cancel meeting');
      setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
    } catch (err) {
      setCancelError(err.message);
    }
  };

  const openRequestModal = () => {
    setReqForm({ meetWith: '', projectId: '', proposedDate: '', proposedTime: '', topic: '', location: '' });
    setReqError('');
    setReqSuccess(false);
    setRequestModal(true);
  };

  const closeRequestModal = () => {
    setRequestModal(false);
    setReqError('');
    setReqSuccess(false);
  };

  const handleSendRequest = async () => {
    setReqError('');
    if (!reqForm.meetWith)     { setReqError('Please select who you want to meet with.'); return; }
    if (!reqForm.proposedDate) { setReqError('Please select a date.'); return; }
    if (!reqForm.proposedTime) { setReqError('Please select a time.'); return; }
    if (!reqForm.topic.trim()) { setReqError('Please enter a topic.'); return; }
    if (!reqForm.projectId)    { setReqError('Please select a project.'); return; }

    const selectedProject = projects.find((p) => p._id === reqForm.projectId);
    let body = {
      proposedDate: reqForm.proposedDate,
      proposedTime: reqForm.proposedTime,
      topic:        reqForm.topic.trim(),
      location:     reqForm.location.trim(),
      projectId:    reqForm.projectId,
    };

    if (reqForm.meetWith === 'coordinator') {
      const coordinatorId = selectedProject?.coordinator?._id;
      if (!coordinatorId) { setReqError('No coordinator assigned to this project.'); return; }
      body.requestedTo = coordinatorId;
      body.meetingType = 'requested';
    } else {
      // student path — schedule meeting for all students in the project
      body.meetWith = 'project';
    }

    setReqSending(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send meeting request');

      const newData = Array.isArray(data.data) ? data.data : [data.data];
      setMeetings((prev) => [...newData, ...prev]);
      setReqSuccess(true);
      setTimeout(() => {
        setReqSuccess(false);
        closeRequestModal();
      }, 1500);
    } catch (err) {
      setReqError(err.message);
    } finally {
      setReqSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-warning text-dark';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  const modalTitle = () => {
    if (reqForm.meetWith === 'student')     return 'Schedule Meeting with Students';
    if (reqForm.meetWith === 'coordinator') return 'Request Meeting with Coordinator';
    return 'New Meeting';
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Meeting Requests" />
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
        <Breadcrumb pageName="Meeting Requests" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Meeting Requests" />

      <div className="d-flex align-items-center justify-content-end mb-4">
        <button className="btn btn-primary px-4 fw-medium" onClick={openRequestModal}>
          + New Meeting
        </button>
      </div>

      {cancelError && (
        <div className="alert alert-danger border-0 mb-3">{cancelError}</div>
      )}

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            <button
              onClick={() => setActiveTab('all')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{
                color: activeTab === 'all' ? '#3c50e0' : '#6c757d',
                borderBottom: activeTab === 'all' ? '2px solid #3c50e0' : '2px solid transparent',
              }}
            >
              All Meetings ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{
                color: activeTab === 'pending' ? '#3c50e0' : '#6c757d',
                borderBottom: activeTab === 'pending' ? '2px solid #3c50e0' : '2px solid transparent',
              }}
            >
              Pending
              {pendingCount > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Meeting Cards */}
      <div className="d-flex flex-column gap-3">
        {displayedMeetings.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-2">
                {activeTab === 'pending' ? 'No pending meeting requests.' : 'No meetings yet.'}
              </p>
              {activeTab === 'all' && (
                <button className="btn btn-primary btn-sm px-4" onClick={openRequestModal}>
                  + New Meeting
                </button>
              )}
            </div>
          </div>
        ) : (
          displayedMeetings.map((m) => {
            const isOutgoing        = String(m.requestedBy?._id || m.requestedBy) === String(currentUserId);
            const otherPerson       = isOutgoing ? m.requestedTo : m.requestedBy;
            // Only student-originated incoming requests get Approve/Reject buttons
            const canRespond        = m.status === 'pending' && !isOutgoing && m.requestedBy?.role === 'student';
            // Incoming meeting from coordinator — show reply box instead of approve/reject
            const isCoordinatorMtg  = !isOutgoing && m.requestedBy?.role === 'coordinator';
            // Supervisor can only cancel meetings they created with students
            const canCancel         = isOutgoing &&
                                      m.meetingType === 'scheduled' &&
                                      m.requestedTo?.role === 'student';

            const rs = getRS(m._id);

            return (
              <div key={m._id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        {otherPerson?.role && (
                          <span
                            className={`badge rounded-pill px-2 small ${
                              otherPerson.role === 'student'     ? 'bg-primary' :
                              otherPerson.role === 'coordinator' ? 'bg-secondary' : 'bg-info text-dark'
                            }`}
                          >
                            {otherPerson.role.charAt(0).toUpperCase() + otherPerson.role.slice(1)}
                          </span>
                        )}
                        {m.meetingType === 'scheduled' && (
                          <span className="badge bg-light text-dark border rounded-pill px-2 small">Scheduled</span>
                        )}
                        <h6 className="fw-semibold text-dark mb-0">{m.topic}</h6>
                      </div>
                      <p className="text-muted small mb-1">
                        {isOutgoing ? 'To' : 'From'}:{' '}
                        <strong className="text-dark">{otherPerson?.name || '—'}</strong>
                        {otherPerson?.email && ` (${otherPerson.email})`}
                      </p>
                      <p className="text-muted small mb-1">
                        Date: <strong className="text-dark">{formatDate(m.proposedDate)}</strong> at{' '}
                        <strong className="text-dark">{m.proposedTime}</strong>
                      </p>
                      {m.location && (
                        <p className="text-muted small mb-1">
                          Location: <strong className="text-dark">📍 {m.location}</strong>
                        </p>
                      )}
                      {m.projectId?.title && (
                        <p className="text-muted small mb-1">
                          Project: <strong className="text-dark">{m.projectId.title}</strong>
                        </p>
                      )}
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(m.status)}`}>
                      {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </div>

                  {m.notes && (
                    <div className={`alert ${m.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mt-3 mb-2`}>
                      <p className="small mb-0">
                        <strong>{isOutgoing ? 'Response' : 'Your Response'}:</strong> {m.notes}
                      </p>
                    </div>
                  )}

                  {/* Student's reply — shown for student meetings only */}
                  {m.studentReply && !isCoordinatorMtg && (
                    <div className="alert alert-secondary py-2 px-3 mt-2 mb-2">
                      <p className="small mb-0">
                        <strong>Student's reply:</strong> {m.studentReply}
                      </p>
                    </div>
                  )}

                  {/* Reply section for coordinator-originated meetings */}
                  {isCoordinatorMtg && (
                    <div className="mt-3">
                      {m.studentReply ? (
                        <div className="alert alert-light border py-2 px-3 mb-0">
                          <p className="small mb-0">
                            <strong>Your Reply:</strong> {m.studentReply}
                          </p>
                          {rs.success && (
                            <p className="text-success small mt-1 mb-0">✓ Reply sent.</p>
                          )}
                        </div>
                      ) : (
                        <>
                          {rs.error && (
                            <div className="alert alert-danger border-0 py-2 px-3 small mb-2">{rs.error}</div>
                          )}
                          {rs.success ? (
                            <div className="alert alert-success border-0 py-2 px-3 small mb-0">
                              ✓ Reply sent successfully.
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-2">
                              <label className="form-label fw-medium text-dark small mb-0">Your Reply</label>
                              <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Type your reply…"
                                value={rs.text}
                                onChange={(e) => setRS(m._id, { text: e.target.value, error: '' })}
                              />
                              <div>
                                <button
                                  className="btn btn-primary btn-sm px-4 fw-medium"
                                  onClick={() => sendReply(m._id)}
                                  disabled={rs.sending}
                                >
                                  {rs.sending && (
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                  )}
                                  Send Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Approve/Reject/Cancel buttons — student meetings only */}
                  {(canRespond || canCancel) && (
                    <div className="d-flex gap-2 mt-3">
                      {canRespond && (
                        <>
                          <button className="btn btn-success btn-sm px-4 fw-medium" onClick={() => openRespond(m, 'approved')}>
                            ✓ Approve
                          </button>
                          <button className="btn btn-danger btn-sm px-4 fw-medium" onClick={() => openRespond(m, 'rejected')}>
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {canCancel && (
                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => cancelMeeting(m._id)}>
                          Cancel Meeting
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Respond Modal ── */}
      {respondModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setRespondModal(false); }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {respondDecision === 'approved' ? '✓ Approve Meeting' : '✕ Reject Meeting'}
                </h5>
                <button className="btn-close" onClick={() => setRespondModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                {respondError && (
                  <div className="alert alert-danger border-0 py-2 px-3 small mb-3">{respondError}</div>
                )}
                <p className="text-muted small mb-3">
                  From: <strong className="text-dark">{respondMeeting?.requestedBy?.name}</strong>
                  <br />
                  Topic: <strong className="text-dark">{respondMeeting?.topic}</strong>
                  <br />
                  Date: <strong className="text-dark">
                    {formatDate(respondMeeting?.proposedDate)} at {respondMeeting?.proposedTime}
                  </strong>
                </p>
                <label className="form-label fw-medium text-dark small">Response Message *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    respondDecision === 'approved'
                      ? 'e.g. Confirmed. See you then.'
                      : 'e.g. I am unavailable. Please reschedule.'
                  }
                  value={respondNotes}
                  onChange={(e) => { setRespondNotes(e.target.value); setRespondError(''); }}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setRespondModal(false)}>Cancel</button>
                <button
                  className={`btn px-4 fw-medium ${respondDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitResponse}
                  disabled={responding}
                >
                  {responding && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                  Confirm {respondDecision === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Meeting Modal ── */}
      {requestModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeRequestModal(); }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">{modalTitle()}</h5>
                <button className="btn-close" onClick={closeRequestModal} />
              </div>
              <div className="modal-body px-4 py-4">

                {reqSuccess && (
                  <div className="alert alert-success border-0 small py-2 mb-3">
                    <strong>{reqForm.meetWith === 'student' ? 'Meeting scheduled for all students!' : 'Request sent!'}</strong>
                  </div>
                )}
                {reqError && (
                  <div className="alert alert-danger border-0 small py-2 mb-3">{reqError}</div>
                )}

                {/* Meet With */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <select
                    className="form-select"
                    value={reqForm.meetWith}
                    onChange={(e) => setReqForm((prev) => ({
                      ...prev, meetWith: e.target.value, projectId: '',
                    }))}
                  >
                    <option value="">— Select —</option>
                    <option value="student">Student(s)</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>

                {/* Project picker — shown for BOTH student and coordinator paths */}
                {reqForm.meetWith !== '' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark small">Select Project *</label>
                    <select
                      className="form-select"
                      value={reqForm.projectId}
                      onChange={(e) => setReqForm((prev) => ({ ...prev, projectId: e.target.value }))}
                    >
                      <option value="">— Select a project —</option>
                      {projects.map((p) => (
                        <option
                          key={p._id}
                          value={p._id}
                          disabled={reqForm.meetWith === 'coordinator' && !p.coordinator}
                        >
                          {p.title}
                          {reqForm.meetWith === 'coordinator' && !p.coordinator ? ' (no coordinator)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Preview for student path */}
                    {reqForm.meetWith === 'student' && reqForm.projectId && (() => {
                      const proj = projects.find((p) => p._id === reqForm.projectId);
                      const names = (proj?.students || []).map((s) => s.name).filter(Boolean).join(', ');
                      return names ? (
                        <p className="text-muted small mt-1 mb-0">
                          This meeting will be sent to:{' '}
                          <strong className="text-dark">{names}</strong>
                        </p>
                      ) : (
                        <p className="text-muted small mt-1 mb-0">No students assigned to this project yet.</p>
                      );
                    })()}

                    {/* Preview for coordinator path */}
                    {reqForm.meetWith === 'coordinator' && reqForm.projectId && (() => {
                      const proj = projects.find((p) => p._id === reqForm.projectId);
                      return proj?.coordinator ? (
                        <p className="text-muted small mt-1 mb-0">
                          Meeting with: <strong>{proj.coordinator.name}</strong>
                        </p>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={reqForm.proposedDate}
                    min={today}
                    onChange={(e) => setReqForm((prev) => ({ ...prev, proposedDate: e.target.value }))}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={reqForm.proposedTime}
                    onChange={(e) => setReqForm((prev) => ({ ...prev, proposedTime: e.target.value }))}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Topic / Reason *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. FYP Progress Discussion"
                    value={reqForm.topic}
                    onChange={(e) => setReqForm((prev) => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-medium text-dark small">Location <span className="text-muted">(optional)</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Room 204, Online (Zoom)"
                    value={reqForm.location}
                    onChange={(e) => setReqForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>

              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={closeRequestModal}>Cancel</button>
                <button
                  className="btn btn-primary px-4 fw-medium"
                  onClick={handleSendRequest}
                  disabled={reqSending}
                >
                  {reqSending && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                  {reqForm.meetWith === 'student' ? 'Schedule Meeting' : 'Request Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorMeetingRequests;
