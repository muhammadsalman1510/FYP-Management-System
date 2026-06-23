import React, { useState, useEffect } from 'react';

const CoordinatorMeetingCalendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [meetings, setMeetings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        const res  = await fetch('/api/meetings', { headers });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load meetings');
        const approved = (data.data || []).filter((m) => m.status === 'approved');
        setMeetings(approved);
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

  const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const currentUserId = (() => {
    try { const u = JSON.parse(sessionStorage.getItem('user') || '{}'); return String(u._id || u.id || ''); }
    catch { return ''; }
  })();

  const getOtherParty = (meeting) => {
    if (String(meeting.requestedBy?._id) === currentUserId) return meeting.requestedTo;
    return meeting.requestedBy;
  };

  const getMeetingColor = (meeting) => {
    const other = getOtherParty(meeting);
    return other?.role === 'student'
      ? { bg: '#3c50e0', text: '#fff' }
      : { bg: '#28a745', text: '#fff' };
  };

  const getMeetingsForDay = (day) =>
    meetings.filter((m) => {
      const d = new Date(m.proposedDate);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const totalCells  = firstDayOfMonth + daysInMonth;
  const totalRows   = Math.ceil(totalCells / 7);
  const calendarDays = [];
  for (let i = 0; i < totalRows * 7; i++) {
    const day = i - firstDayOfMonth + 1;
    calendarDays.push(day >= 1 && day <= daysInMonth ? day : null);
  }
  const calendarRows = [];
  for (let i = 0; i < calendarDays.length; i += 7) calendarRows.push(calendarDays.slice(i, i + 7));

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Meeting Calendar</h4>
          <p className="text-muted small mb-0">View all approved meetings on the calendar.</p>
        </div>
        <a href="/coordinator/meetings/schedule" className="btn btn-primary px-4 fw-medium">
          + Schedule Meeting
        </a>
      </div>

      {error && (
        <div className="alert alert-danger border-0 mb-4">{error}</div>
      )}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <button onClick={goToPrevMonth} className="btn btn-outline-secondary btn-sm px-3">&lt;</button>
          <h5 className="fw-semibold text-dark mb-0">{monthNames[currentMonth]} {currentYear}</h5>
          <button onClick={goToNextMonth} className="btn btn-outline-secondary btn-sm px-3">&gt;</button>
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
                      <th key={day} className="text-center py-3 fw-semibold text-white"
                        style={{ backgroundColor: '#3c50e0', fontSize: '0.82rem' }}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calendarRows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((day, ci) => {
                        const dayMeetings = day ? getMeetingsForDay(day) : [];
                        return (
                          <td key={ci} className="align-top p-2"
                            style={{ minHeight: '100px', height: '100px', backgroundColor: day && isToday(day) ? '#eef0fd' : 'transparent' }}>
                            {day && (
                              <>
                                <span className={`d-inline-block mb-1 fw-medium small ${isToday(day) ? 'text-primary' : 'text-dark'}`}>
                                  {day}
                                </span>
                                <div className="d-flex flex-column gap-1">
                                  {dayMeetings.map((meeting) => {
                                    const colors    = getMeetingColor(meeting);
                                    const other     = getOtherParty(meeting);
                                    const otherName = other?.name || '—';
                                    const locationStr = meeting.location ? ` | 📍 ${meeting.location}` : '';
                                    return (
                                      <div
                                        key={meeting._id}
                                        className="rounded px-2 py-1"
                                        style={{ backgroundColor: colors.bg, color: colors.text, fontSize: '0.7rem', lineHeight: '1.3', cursor: 'pointer' }}
                                        title={`${meeting.topic} — ${otherName} at ${meeting.proposedTime}${locationStr}`}
                                      >
                                        <div className="fw-semibold">{meeting.topic}</div>
                                        <div style={{ opacity: 0.9 }}>{meeting.proposedTime}</div>
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
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#3c50e0', display: 'inline-block' }}></span>
              <span className="small text-muted">Meeting with Student</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#28a745', display: 'inline-block' }}></span>
              <span className="small text-muted">Meeting with Supervisor</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default CoordinatorMeetingCalendar;
