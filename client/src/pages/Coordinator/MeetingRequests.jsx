import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorMeetingRequests = () => {
  const [activeTab, setActiveTab] = useState('incoming');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const incoming = meetings.filter((m) =>
    String(m.requestedTo?._id || m.requestedTo) === String(currentUserId)
  );

  const outgoing = meetings.filter((m) =>
    String(m.requestedBy?._id || m.requestedBy) === String(currentUserId)
  );

  const pendingIncomingCount = incoming.filter((m) => m.status === 'pending').length;

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
              Incoming Requests
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

      {/* INCOMING — requests sent TO coordinator */}
      {activeTab === 'incoming' && (
        <div className="d-flex flex-column gap-3">
          {incoming.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No incoming meeting requests.</p>
              </div>
            </div>
          ) : (
            incoming.map((req) => (
              <div key={req._id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        {req.requestedBy?.role && (
                          <span
                            className={`badge rounded-pill px-2 small ${
                              req.requestedBy.role === 'student' ? 'bg-primary' : 'bg-info text-dark'
                            }`}
                          >
                            {req.requestedBy.role.charAt(0).toUpperCase() + req.requestedBy.role.slice(1)}
                          </span>
                        )}
                        <h6 className="fw-semibold text-dark mb-0">{req.topic}</h6>
                      </div>
                      <p className="text-muted small mb-1">
                        From: <strong className="text-dark">{req.requestedBy?.name || '—'}</strong>
                        {req.requestedBy?.email && ` (${req.requestedBy.email})`}
                      </p>
                      <p className="text-muted small mb-1">
                        Proposed: <strong className="text-dark">{formatDate(req.proposedDate)}</strong> at{' '}
                        <strong className="text-dark">{req.proposedTime}</strong>
                      </p>
                      {req.projectId?.title && (
                        <p className="text-muted small mb-1">
                          Project: <strong className="text-dark">{req.projectId.title}</strong>
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

      {/* OUTGOING — requests sent BY coordinator */}
      {activeTab === 'outgoing' && (
        <div className="d-flex flex-column gap-3">
          {outgoing.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No outgoing meeting requests.</p>
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
                      {req.projectId?.title && (
                        <p className="text-muted small mb-0">
                          Project: <strong className="text-dark">{req.projectId.title}</strong>
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
                    ✓ This meeting will appear on the calendar automatically.
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
