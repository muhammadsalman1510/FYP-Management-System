import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [meetings, setMeetings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Meeting detail popup state
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showModal, setShowModal]             = useState(false);
  const [replyText, setReplyText]             = useState('');
  const [replySending, setReplySending]       = useState(false);
  const [replySuccess, setReplySuccess]       = useState(false);
  const [replyError, setReplyError]           = useState('');

  const currentUserId = (() => {
    try { const u = JSON.parse(sessionStorage.getItem('user') || '{}'); return String(u._id || u.id || ''); }
    catch { return ''; }
  })();

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch('/api/meetings', { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load meetings');
        // Student sees only meetings they are requestedTo with status=approved
        const filtered = (data.data || []).filter(
          (m) =>
            m.status === 'approved' &&
            String(m.requestedTo?._id || m.requestedTo) === currentUserId
        );
        setMeetings(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();

  const goToPrev = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const goToNext = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const getMeetingColor = (meeting) => {
    const sender = meeting.requestedBy;
    return sender?.role === 'supervisor' ? '#3c50e0' : '#28a745';
  };

  const getMeetingsForDay = (day) =>
    meetings.filter((m) => {
      const d = new Date(m.proposedDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const totalRows = Math.ceil((firstDay + daysInMonth) / 7);
  const calDays   = [];
  for (let i = 0; i < totalRows * 7; i++) {
    const d = i - firstDay + 1;
    calDays.push(d >= 1 && d <= daysInMonth ? d : null);
  }
  const calRows = [];
  for (let i = 0; i < calDays.length; i += 7) calRows.push(calDays.slice(i, i + 7));

  const openMeetingModal = (meeting) => {
    setSelectedMeeting(meeting);
    setReplyText('');
    setReplySuccess(false);
    setReplyError('');
    setShowModal(true);
  };

  const closeMeetingModal = () => {
    setShowModal(false);
    setSelectedMeeting(null);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) { setReplyError('Please enter a reply message.'); return; }
    setReplySending(true);
    setReplyError('');
    try {
      const res = await fetch(`/api/meetings/${selectedMeeting._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ studentReply: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send reply');

      const updatedMeeting = { ...selectedMeeting, studentReply: replyText.trim() };
      setMeetings((prev) => prev.map((m) => m._id === selectedMeeting._id ? updatedMeeting : m));
      setSelectedMeeting(updatedMeeting);
      setReplySuccess(true);
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplySending(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRoleBadge = (role) => {
    if (!role) return null;
    const colors = { supervisor: 'bg-info text-dark', coordinator: 'bg-primary' };
    return (
      <span className={`badge rounded-pill px-2 ms-1 ${colors[role] || 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <>
      <Breadcrumb pageName="Calendar" />

      {error && (
        <div className="alert alert-danger border-0 mb-4">{error}</div>
      )}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={goToPrev}>&lt;</button>
            <h5 className="fw-semibold text-dark mb-0">{monthNames[currentMonth]} {currentYear}</h5>
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={goToNext}>&gt;</button>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-bordered mb-0" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    {dayNames.map((day) => (
                      <th
                        key={day}
                        className="text-center py-3 fw-semibold text-white"
                        style={{ backgroundColor: '#3c50e0', fontSize: '0.85rem' }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((day, ci) => {
                        const dayMeetings = day ? getMeetingsForDay(day) : [];
                        return (
                          <td
                            key={ci}
                            className="align-top p-2"
                            style={{
                              minHeight: '110px',
                              height: '110px',
                              backgroundColor: day && isToday(day) ? '#eef0fd' : 'transparent',
                            }}
                          >
                            {day && (
                              <>
                                <span
                                  className={`d-inline-block mb-1 fw-medium ${isToday(day) ? 'text-primary' : 'text-dark'}`}
                                  style={{ fontSize: '0.9rem' }}
                                >
                                  {day}
                                </span>
                                <div className="d-flex flex-column gap-1">
                                  {dayMeetings.map((m) => {
                                    const sender = m.requestedBy;
                                    const locationStr = m.location ? ` | 📍 ${m.location}` : '';
                                    return (
                                      <div
                                        key={m._id}
                                        className="rounded px-2 py-1"
                                        style={{
                                          backgroundColor: getMeetingColor(m),
                                          color: '#fff',
                                          fontSize: '0.72rem',
                                          lineHeight: '1.3',
                                          cursor: 'pointer',
                                        }}
                                        title={`${m.topic} — ${sender?.name || '—'} at ${m.proposedTime}${locationStr}`}
                                        onClick={() => openMeetingModal(m)}
                                      >
                                        <div className="fw-semibold">{m.topic}</div>
                                        <div style={{ opacity: 0.9 }}>{m.proposedTime}</div>
                                        {m.location && (
                                          <div style={{ opacity: 0.85, fontSize: '0.63rem' }}>📍 {m.location}</div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <span className="small fw-medium text-muted">Legend:</span>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#3c50e0', display: 'inline-block' }} />
              <span className="small text-muted">Meeting with Supervisor</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#28a745', display: 'inline-block' }} />
              <span className="small text-muted">Meeting with Coordinator</span>
            </div>
            <span className="small text-muted ms-auto">Click a meeting to view details and send a reply.</span>
          </div>
        </div>

      </div>

      {/* ── Meeting Detail Modal ── */}
      {showModal && selectedMeeting && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeMeetingModal(); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow">

              <div
                className="modal-header border-bottom px-4 py-3"
                style={{ backgroundColor: getMeetingColor(selectedMeeting), color: '#fff' }}
              >
                <h5 className="modal-title fw-semibold mb-0">{selectedMeeting.topic}</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={closeMeetingModal}
                />
              </div>

              <div className="modal-body px-4 py-4">

                <div className="mb-4">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2 small">
                      <span className="text-muted" style={{ minWidth: '70px' }}>From:</span>
                      <span className="fw-medium text-dark">
                        {selectedMeeting.requestedBy?.name || '—'}
                        {getRoleBadge(selectedMeeting.requestedBy?.role)}
                      </span>
                    </div>
                    <div className="d-flex gap-2 small">
                      <span className="text-muted" style={{ minWidth: '70px' }}>Date:</span>
                      <span className="fw-medium text-dark">{formatDate(selectedMeeting.proposedDate)}</span>
                    </div>
                    <div className="d-flex gap-2 small">
                      <span className="text-muted" style={{ minWidth: '70px' }}>Time:</span>
                      <span className="fw-medium text-dark">{selectedMeeting.proposedTime}</span>
                    </div>
                    {selectedMeeting.location && (
                      <div className="d-flex gap-2 small">
                        <span className="text-muted" style={{ minWidth: '70px' }}>Location:</span>
                        <span className="fw-medium text-dark">📍 {selectedMeeting.location}</span>
                      </div>
                    )}
                    {selectedMeeting.projectId?.title && (
                      <div className="d-flex gap-2 small">
                        <span className="text-muted" style={{ minWidth: '70px' }}>Project:</span>
                        <span className="fw-medium text-dark">{selectedMeeting.projectId.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-3" />

                {/* Reply section */}
                {selectedMeeting.studentReply ? (
                  <div>
                    <p className="fw-medium text-dark small mb-2">Your reply:</p>
                    <div className="alert alert-success border-0 py-2 px-3 mb-0">
                      <p className="small mb-0">{selectedMeeting.studentReply}</p>
                    </div>
                    {replySuccess && (
                      <p className="text-success small mt-2 mb-0">✓ Reply sent successfully.</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="form-label fw-medium text-dark small">Send a Reply</label>
                    {replyError && (
                      <div className="alert alert-danger border-0 py-2 px-3 small mb-2">{replyError}</div>
                    )}
                    {replySuccess ? (
                      <div className="alert alert-success border-0 py-2 px-3 small mb-0">
                        ✓ Reply sent successfully.
                      </div>
                    ) : (
                      <>
                        <textarea
                          className="form-control mb-2"
                          rows={3}
                          placeholder="Type your reply here…"
                          value={replyText}
                          onChange={(e) => { setReplyText(e.target.value); setReplyError(''); }}
                        />
                        <button
                          className="btn btn-primary btn-sm px-4 fw-medium"
                          onClick={handleSendReply}
                          disabled={replySending}
                        >
                          {replySending && <span className="spinner-border spinner-border-sm me-2" role="status" />}
                          Send Reply
                        </button>
                      </>
                    )}
                  </div>
                )}

              </div>

              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={closeMeetingModal}>
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calendar;
