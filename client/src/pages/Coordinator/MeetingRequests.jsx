import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorMeetingRequests = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [meetings, setMeetings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [cancelError, setCancelError] = useState('');

  const currentUserId = (() => {
    try { return JSON.parse(sessionStorage.getItem('user'))?._id || ''; }
    catch { return ''; }
  })();

  const token = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Respond modal
  const [respondModal, setRespondModal]       = useState(false);
  const [respondMeeting, setRespondMeeting]   = useState(null);
  const [respondDecision, setRespondDecision] = useState('');
  const [respondNotes, setRespondNotes]       = useState('');
  const [responding, setResponding]           = useState(false);
  const [respondError, setRespondError]       = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch('/api/meetings', { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load meetings');
        setMeetings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const pendingCount = meetings.filter((m) => m.status === 'pending').length;
  const displayedMeetings = activeTab === 'all'
    ? meetings
    : meetings.filter((m) => m.status === 'pending');

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
          m._id === respondMeeting._id
            ? { ...m, status: respondDecision, notes: respondNotes.trim() }
            : m
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

      {/* Meeting cards */}
      <div className="d-flex flex-column gap-3">
        {displayedMeetings.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">
                {activeTab === 'pending' ? 'No pending meeting requests.' : 'No meetings found.'}
              </p>
            </div>
          </div>
        ) : (
          displayedMeetings.map((m) => {
            const isOutgoing = String(m.requestedBy?._id || m.requestedBy) === String(currentUserId);
            const otherPerson = isOutgoing ? m.requestedTo : m.requestedBy;
            const canCancel = m.meetingType === 'scheduled' && isOutgoing;
            const canRespond = m.status === 'pending' && !isOutgoing;

            return (
              <div key={m._id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        {otherPerson?.role && (
                          <span
                            className={`badge rounded-pill px-2 small ${
                              otherPerson.role === 'student' ? 'bg-primary' :
                              otherPerson.role === 'supervisor' ? 'bg-info text-dark' : 'bg-secondary'
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
                        <strong>Response:</strong> {m.notes}
                      </p>
                    </div>
                  )}

                  {m.studentReply && (
                    <div className="alert alert-secondary py-2 px-3 mt-2 mb-2">
                      <p className="small mb-0">
                        <strong>Student's reply:</strong> {m.studentReply}
                      </p>
                    </div>
                  )}

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

      {/* Respond Modal */}
      {respondModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setRespondModal(false); }}
        >
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
                  <div className="alert alert-danger border-0 py-2 px-3 small mb-3">
                    {respondError}
                  </div>
                )}
                <p className="text-muted small mb-3">
                  From: <strong className="text-dark">{respondMeeting?.requestedBy?.name}</strong><br />
                  Topic: <strong className="text-dark">{respondMeeting?.topic}</strong><br />
                  Date:{' '}
                  <strong className="text-dark">
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
                      : 'e.g. Please reschedule to next week.'
                  }
                  value={respondNotes}
                  onChange={(e) => { setRespondNotes(e.target.value); setRespondError(''); }}
                />
                {respondDecision === 'approved' && (
                  <p className="text-success small mt-2 mb-0">
                    ✓ This meeting will appear on both calendars automatically.
                  </p>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3 gap-2">
                <button className="btn btn-outline-secondary px-4" onClick={() => setRespondModal(false)}>
                  Cancel
                </button>
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
    </>
  );
};

export default CoordinatorMeetingRequests;
