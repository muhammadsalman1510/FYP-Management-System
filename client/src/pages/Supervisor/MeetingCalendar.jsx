import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — MEETING CALENDAR
  Shows all approved meetings on calendar grid.
  Blue  = Meeting with Student
  Green = Meeting with Coordinator
  TODO (Backend): GET /api/supervisor/meetings/calendar?month=X&year=Y
*/

const SupervisorMeetingCalendar = () => {

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());

  // TODO (Backend): Replace with API call
  const meetings = [
    { id: 1, title: 'Proposal Review',    date: new Date(currentYear, currentMonth, 5),  time: '10:00', type: 'student',     with: 'Muhammad Salman' },
    { id: 2, title: 'Coordinator Sync',   date: new Date(currentYear, currentMonth, 10), time: '14:00', type: 'coordinator', with: 'Mr. Omer'        },
    { id: 3, title: 'Progress Check',     date: new Date(currentYear, currentMonth, 15), time: '11:00', type: 'student',     with: 'Ali Hassan'      },
    { id: 4, title: 'FYP Review',         date: new Date(currentYear, currentMonth, 22), time: '09:00', type: 'student',     with: 'Sara Khan'       },
  ];

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay     = new Date(currentYear, currentMonth, 1).getDay();

  const goToPrev = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const goToNext = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const getMeetingsForDay = (day) =>
    meetings.filter(m => { const d = new Date(m.date); return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day; });

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const totalRows = Math.ceil((firstDay + daysInMonth) / 7);
  const calDays = [];
  for (let i = 0; i < totalRows * 7; i++) { const d = i - firstDay + 1; calDays.push(d >= 1 && d <= daysInMonth ? d : null); }
  const calRows = [];
  for (let i = 0; i < calDays.length; i += 7) calRows.push(calDays.slice(i, i + 7));

  return (
    <>
      <Breadcrumb pageName="Meeting Calendar" />

      <div className="card shadow-sm border-0">

        {/* Header */}
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={goToPrev}>&lt;</button>
            <h5 className="fw-semibold text-dark mb-0">{monthNames[currentMonth]} {currentYear}</h5>
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={goToNext}>&gt;</button>
          </div>
          <a href="/supervisor/meetings/requests" className="btn btn-primary btn-sm px-4 fw-medium">
            View Requests
          </a>
        </div>

        {/* Calendar Grid */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  {dayNames.map(day => (
                    <th key={day} className="text-center py-3 fw-semibold text-white"
                      style={{ backgroundColor: '#3c50e0', fontSize: '0.82rem' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((day, ci) => {
                      const dayMeetings = day ? getMeetingsForDay(day) : [];
                      return (
                        <td key={ci} className="align-top p-2"
                          style={{ minHeight: '100px', height: '100px', backgroundColor: day && isToday(day) ? '#eef0fd' : 'transparent' }}>
                          {day && (
                            <>
                              <span className={`d-inline-block mb-1 fw-medium small ${isToday(day) ? 'text-primary' : 'text-dark'}`}>{day}</span>
                              <div className="d-flex flex-column gap-1">
                                {dayMeetings.map(m => (
                                  <div key={m.id} className="rounded px-2 py-1"
                                    style={{ backgroundColor: m.type === 'student' ? '#3c50e0' : '#28a745', color: '#fff', fontSize: '0.7rem', lineHeight: '1.3', cursor: 'pointer' }}
                                    title={`${m.title} — ${m.with} at ${m.time}`}>
                                    <div className="fw-semibold">{m.title}</div>
                                    <div style={{ opacity: 0.9 }}>{m.with}</div>
                                  </div>
                                ))}
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

        {/* Legend */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <span className="small fw-medium text-muted">Legend:</span>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#3c50e0', display: 'inline-block' }}></span>
              <span className="small text-muted">Meeting with Student</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width: '14px', height: '14px', backgroundColor: '#28a745', display: 'inline-block' }}></span>
              <span className="small text-muted">Meeting with Coordinator</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default SupervisorMeetingCalendar;