import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SupervisorMeetingRequests = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [meetings, setMeetings]   = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const currentUserId = (() => {
    try { return JSON.parse(sessionStorage.getItem('user'))?._id || ''; }
    catch { return ''; }
  })();

  // Respond modal (approve/reject incoming from students)
  const [respondModal, setRespondModal]       = useState(false);
  const [respondMeeting, setRespondMeeting]   = useState(null);
  const [respondDecision, setRespondDecision] = useState('');
  const [respondNotes, setRespondNotes]       = useState('');
  const [responding, setResponding]           = useState(false);

  // New meeting modal — dual-mode (to Student or to Coordinator)
  const [requestModal, setRequestModal] = useState(false);
  const [reqForm, setReqForm] = useState({
    meetWith:     '',   // 'student' | 'coordinator'
    studentId:    '',
    projectId:    '',
    proposedDate: '',
    proposedTime: '',
    topic:        '',
  });
  const [reqError, setReqError]     = useState('');
  const [reqSending, setReqSending] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [meetingsRes, projectsRes] = await Promise.all([
          fetch('/api/meetings', { headers }),
          fetch('/api/projects/assigned', { headers }),
        ]);

        const meetingsData = await meetingsRes.json();
        const projectsData = await projectsRes.json();

        if (!meetingsRes.ok || !meetingsData.success)  throw new Error(meetingsData.message  || 'Failed to load meetings');
        if (!projectsRes.ok || !projectsData.success)  throw new Error(projectsData.message  || 'Failed to load projects');

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

  // Deduplicated list of all students across assigned projects (requires populated students)
  const allStudents = projects.reduce((acc, project) => {
    (project.students || []).forEach((student) => {
      if (!student || !student._id) return;
      if (!acc.find((s) => String(s._id) === String(student._id))) {
        acc.push(student);
      }
    });
    return acc;
  }, []);

  const incoming = meetings.filter((m) => {
    const toId = m.requestedTo?._id || m.requestedTo;
    return String(toId) === String(currentUserId);
  });

  const outgoing = meetings.filter((m) => {
    const byId = m.requestedBy?._id || m.requestedBy;
    return String(byId) === String(currentUserId);
  });

  const pendingIncomingCount = incoming.filter((m) => m.status === 'pending').length;

  const openRespond = (meeting, decision) => {
    setRespondMeeting(meeting);
    setRespondDecision(decision);
    setRespondNotes('');
    setRespondModal(true);
  };

  const submitResponse = async () => {
    if (!respondNotes.trim()) { alert('Please provide a response message.'); return; }
    setResponding(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/meetings/${respondMeeting._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: respondDecision, notes: respondNotes }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update meeting');

      setMeetings((prev) =>
        prev.map((m) =>
          m._id === respondMeeting._id ? { ...m, status: respondDecision, notes: respondNotes } : m
        )
      );
      setRespondModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setResponding(false);
    }
  };

  const openRequestModal = () => {
    setReqForm({ meetWith: '', studentId: '', projectId: '', proposedDate: '', proposedTime: '', topic: '' });
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

    if (!reqForm.meetWith)         { setReqError('Please select who you want to meet with.'); return; }
    if (!reqForm.proposedDate)     { setReqError('Please select a date.'); return; }
    if (!reqForm.proposedTime)     { setReqError('Please select a time.'); return; }
    if (!reqForm.topic.trim())     { setReqError('Please enter a topic.'); return; }

    let requestedToId = '';
    let projectId = null;

    if (reqForm.meetWith === 'coordinator') {
      if (!reqForm.projectId) { setReqError('Please select a project.'); return; }
      const selectedProject = projects.find((p) => p._id === reqForm.projectId);
      const coordinatorId = selectedProject?.coordinator?._id;
      if (!coordinatorId) { setReqError('No coordinator assigned to this project.'); return; }
      requestedToId = coordinatorId;
      projectId = reqForm.projectId;
    } else {
      // meeting with a student
      if (!reqForm.studentId) { setReqError('Please select a student.'); return; }
      requestedToId = reqForm.studentId;
      // attach the project this student belongs to for context
      const proj = projects.find((p) =>
        (p.students || []).some((s) => String(s._id || s) === String(reqForm.studentId))
      );
      if (proj) projectId = proj._id;
    }

    setReqSending(true);
    try {
      const token = sessionStorage.getItem('token');
      const body = {
        requestedTo:  requestedToId,
        proposedDate: reqForm.proposedDate,
        proposedTime: reqForm.proposedTime,
        topic:        reqForm.topic.trim(),
      };
      if (projectId) body.projectId = projectId;

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send meeting request');

      setMeetings((prev) => [data.data, ...prev]);
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
    if (reqForm.meetWith === 'student')     return 'Create Meeting with Student';
    if (reqForm.meetWith === 'coordinator') return 'Request Meeting with Coordinator';
    return 'New Meeting';
  };

  const submitBtnLabel = () => {
    if (reqSending) return null;
    return reqForm.meetWith === 'student' ? 'Create Meeting' : 'Request Meeting';
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

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            <button
              onClick={() => setActiveTab('incoming')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{
                color: activeTab === 'incoming' ? '#3c50e0' : '#6c757d',
                borderBottom: activeTab === 'incoming' ? '2px solid #3c50e0' : '2px solid transparent',
              }}
            >
              From Students
              {pendingIncomingCount > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  {pendingIncomingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{
                color: activeTab === 'outgoing' ? '#3c50e0' : '#6c757d',
                borderBottom: activeTab === 'outgoing' ? '2px solid #3c50e0' : '2px solid transparent',
              }}
            >
              My Requests ({outgoing.length})
            </button>
          </div>
        </div>
      </div>

      {/* INCOMING — FROM STUDENTS */}
      {activeTab === 'incoming' && (
        <div className="d-flex flex-column gap-3">
          {incoming.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No meeting requests from students.</p>
              </div>
            </div>
          ) : (
            incoming.map((req) => (
              <div key={req._id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold text-dark mb-1">{req.topic}</h6>
                      <p className="text-muted small mb-1">
                        From: <strong className="text-dark">{req.requestedBy?.name || '—'}</strong>
                        {req.requestedBy?.email && ` (${req.requestedBy.email})`}
                      </p>
                      <p className="text-muted small mb-1">
                        Proposed: <strong className="text-dark">{formatDate(req.proposedDate)}</strong> at{' '}
                        <strong className="text-dark">{req.proposedTime}</strong>
                      </p>
                      {req.projectId && (
                        <p className="text-muted small mb-0">
                          Project: <strong className="text-dark">{req.projectId.title || '—'}</strong>
                        </p>
                      )}
                      <p className="text-muted small mb-0">Submitted: {formatDate(req.createdAt)}</p>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(req.status)}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  {req.notes && (
                    <div className={`alert ${req.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mt-3 mb-2`}>
                      <p className="small mb-0">
                        <strong>Your Response:</strong> {req.notes}
                      </p>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="d-flex gap-2 mt-3">
                      <button className="btn btn-success btn-sm px-4 fw-medium" onClick={() => openRespond(req, 'approved')}>
                        ✓ Approve
                      </button>
                      <button className="btn btn-danger btn-sm px-4 fw-medium" onClick={() => openRespond(req, 'rejected')}>
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* OUTGOING — MY REQUESTS */}
      {activeTab === 'outgoing' && (
        <div className="d-flex flex-column gap-3">
          {outgoing.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-2">No outgoing meeting requests.</p>
                <button className="btn btn-primary btn-sm px-4" onClick={openRequestModal}>
                  + New Meeting
                </button>
              </div>
            </div>
          ) : (
            outgoing.map((req) => (
              <div key={req._id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold text-dark mb-1">{req.topic}</h6>
                      <p className="text-muted small mb-1">
                        To: <strong className="text-dark">{req.requestedTo?.name || '—'}</strong>
                        {req.requestedTo?.role && (
                          <span className="ms-1 badge bg-secondary rounded-pill" style={{ fontSize: '0.65rem' }}>
                            {req.requestedTo.role}
                          </span>
                        )}
                      </p>
                      <p className="text-muted small mb-1">
                        Proposed: <strong className="text-dark">{formatDate(req.proposedDate)}</strong> at{' '}
                        <strong className="text-dark">{req.proposedTime}</strong>
                      </p>
                      {req.projectId && (
                        <p className="text-muted small mb-0">
                          Project: <strong className="text-dark">{req.projectId.title || '—'}</strong>
                        </p>
                      )}
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(req.status)}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                  {req.notes && (
                    <div className={`alert ${req.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mt-3 mb-0`}>
                      <p className="small mb-0">
                        <strong>Response:</strong> {req.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Respond to Student Modal ── */}
      {respondModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {respondDecision === 'approved' ? '✓ Approve Meeting' : '✕ Reject Meeting'}
                </h5>
                <button className="btn-close" onClick={() => setRespondModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
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
                  onChange={(e) => setRespondNotes(e.target.value)}
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
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">{modalTitle()}</h5>
                <button className="btn-close" onClick={closeRequestModal} />
              </div>
              <div className="modal-body px-4 py-4">

                {reqSuccess && (
                  <div className="alert alert-success border-0 small py-2 mb-3">
                    <strong>Request sent!</strong> They will be notified shortly.
                  </div>
                )}
                {reqError && (
                  <div className="alert alert-danger border-0 small py-2 mb-3">{reqError}</div>
                )}

                {/* Meet With dropdown */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <select
                    className="form-select"
                    value={reqForm.meetWith}
                    onChange={(e) => setReqForm((prev) => ({
                      ...prev,
                      meetWith: e.target.value,
                      studentId: '',
                      projectId: '',
                    }))}
                  >
                    <option value="">— Select —</option>
                    <option value="student">Student</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>

                {/* Student picker */}
                {reqForm.meetWith === 'student' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark small">Select Student *</label>
                    <select
                      className="form-select"
                      value={reqForm.studentId}
                      onChange={(e) => setReqForm((prev) => ({ ...prev, studentId: e.target.value }))}
                    >
                      <option value="">— Select a student —</option>
                      {allStudents.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}{s.email ? ` (${s.email})` : ''}
                        </option>
                      ))}
                    </select>
                    {allStudents.length === 0 && (
                      <p className="text-muted small mt-1 mb-0">No students found on your assigned projects.</p>
                    )}
                  </div>
                )}

                {/* Project picker (coordinator path) */}
                {reqForm.meetWith === 'coordinator' && (
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark small">Select Project *</label>
                    <select
                      className="form-select"
                      value={reqForm.projectId}
                      onChange={(e) => setReqForm((prev) => ({ ...prev, projectId: e.target.value }))}
                    >
                      <option value="">— Select a project —</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id} disabled={!p.coordinator}>
                          {p.title}{!p.coordinator ? ' (no coordinator)' : ''}
                        </option>
                      ))}
                    </select>
                    {reqForm.projectId && (() => {
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

              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={closeRequestModal}>Cancel</button>
                <button
                  className="btn btn-primary px-4 fw-medium"
                  onClick={handleSendRequest}
                  disabled={reqSending}
                >
                  {reqSending && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                  {submitBtnLabel()}
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
