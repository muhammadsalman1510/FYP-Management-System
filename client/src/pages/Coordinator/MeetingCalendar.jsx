import React, { useState } from 'react';

/*
  COORDINATOR — MEETING CALENDAR
  Shows all approved meetings on a calendar grid.
  Blue = meetings with students
  Green = meetings with supervisors
  TODO (Backend): GET /api/coordinator/meetings?month=X&year=Y
  Only meetings with status "approved" show on calendar.
*/

const CoordinatorMeetingCalendar = () => {

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());

  // Sample approved meetings — replace with API call
  const meetings = [
    { id: 1, title: 'Proposal Review — Salman', date: new Date(currentYear, currentMonth, 5),  time: '10:00', type: 'student',    with: 'Muhammad Salman' },
    { id: 2, title: 'Progress Meeting — Shoaib',date: new Date(currentYear, currentMonth, 10), time: '14:00', type: 'supervisor',  with: 'Mr. Shoaib'      },
    { id: 3, title: 'FYP Review — Ali',         date: new Date(currentYear, currentMonth, 15), time: '11:00', type: 'student',    with: 'Ali Hassan'      },
    { id: 4, title: 'Dept. Sync — Omer',        date: new Date(currentYear, currentMonth, 20), time: '09:00', type: 'supervisor',  with: 'Mr. Omer'        },
    { id: 5, title: 'Final Review — Sara',       date: new Date(currentYear, currentMonth, 25), time: '15:00', type: 'student',    with: 'Sara Khan'       },
  ];

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const daysInMonth    = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getMeetingsForDay = (day) => meetings.filter(m => {
    const d = new Date(m.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
  });

  const getMeetingColor = (type) =>
    type === 'student' ? { bg: '#3c50e0', text: '#fff' } : { bg: '#28a745', text: '#fff' };

  const isToday = (day) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const totalCells = firstDayOfMonth + daysInMonth;
  const totalRows  = Math.ceil(totalCells / 7);
  const calendarDays = [];
  for (let i = 0; i < totalRows * 7; i++) {
    const day = i - firstDayOfMonth + 1;
    calendarDays.push(day >= 1 && day <= daysInMonth ? day : null);
  }
  const calendarRows = [];
  for (let i = 0; i < calendarDays.length; i += 7) calendarRows.push(calendarDays.slice(i, i + 7));

  return (
    <>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Meeting Calendar</h4>
          <p className="text-muted small mb-0">View all approved meetings on the calendar.</p>
        </div>
        <a href="/coordinator/meetings/schedule" className="btn btn-primary px-4 fw-medium">
          + Schedule Meeting
        </a>
      </div>

      <div className="card shadow-sm border-0">

        {/* Calendar Header */}
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
          <button onClick={goToPrevMonth} className="btn btn-outline-secondary btn-sm px-3">&lt;</button>
          <h5 className="fw-semibold text-dark mb-0">{monthNames[currentMonth]} {currentYear}</h5>
          <button onClick={goToNextMonth} className="btn btn-outline-secondary btn-sm px-3">&gt;</button>
        </div>

        {/* Calendar Grid */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ tableLayout:'fixed' }}>
              <thead>
                <tr>
                  {dayNames.map(day => (
                    <th key={day} className="text-center py-3 fw-semibold text-white"
                      style={{ backgroundColor:'#3c50e0', fontSize:'0.82rem' }}>{day}</th>
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
                          style={{ minHeight:'100px', height:'100px', backgroundColor: day && isToday(day) ? '#eef0fd' : 'transparent' }}>
                          {day && (
                            <>
                              <span className={`d-inline-block mb-1 fw-medium small ${isToday(day) ? 'text-primary' : 'text-dark'}`}>
                                {day}
                              </span>
                              <div className="d-flex flex-column gap-1">
                                {dayMeetings.map(meeting => {
                                  const colors = getMeetingColor(meeting.type);
                                  return (
                                    <div key={meeting.id} className="rounded px-2 py-1"
                                      style={{ backgroundColor:colors.bg, color:colors.text, fontSize:'0.7rem', lineHeight:'1.3', cursor:'pointer' }}
                                      title={`${meeting.title} — ${meeting.time}`}>
                                      <div className="fw-semibold">{meeting.title}</div>
                                      <div style={{ opacity:0.9 }}>{meeting.time}</div>
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

        {/* Legend */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <span className="small fw-medium text-muted">Legend:</span>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width:'14px', height:'14px', backgroundColor:'#3c50e0', display:'inline-block' }}></span>
              <span className="small text-muted">Meeting with Student</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="rounded" style={{ width:'14px', height:'14px', backgroundColor:'#28a745', display:'inline-block' }}></span>
              <span className="small text-muted">Meeting with Supervisor</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default CoordinatorMeetingCalendar;