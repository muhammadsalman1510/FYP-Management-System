import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

/*
  ================================================================
  CALENDAR PAGE — PURPOSE & BACKEND INTEGRATION GUIDE
  ================================================================
  This calendar shows scheduled meetings on their specific dates.

  HOW IT WORKS:
  - Each cell in the calendar grid = one day of the month
  - If a meeting is scheduled on that date, it appears as a
    colored event block inside that day's cell
  - Just like a mobile calendar app shows "Independence Day" on
    14th August, this shows "Meeting with Supervisor" on the
    scheduled date

  FUTURE BACKEND INTEGRATION:
  - Replace the `meetings` array below with an API call:
      GET /api/meetings?month=12&year=2024
  - Each meeting object needs: { id, title, date, startTime, endTime, type }
  - The `type` field controls the color:
      'supervisor'   → blue  (btn-primary style)
      'coordinator'  → green (btn-success style)
      'other'        → gray  (btn-secondary style)
  - When supervisor/coordinator creates a meeting from their dashboard,
    it gets saved to DB and shows here automatically
  ================================================================
*/

const Calendar = () => {

  // ── State ──────────────────────────────────────────────────────
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());     // 0-11
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());  // e.g. 2024

  // ── Sample meetings data ────────────────────────────────────────
  // TODO (Backend): Replace this with API call:
  //   useEffect(() => { fetch('/api/meetings?month=...').then(...) }, [currentMonth])
  const meetings = [
    {
      id: 1,
      title: 'Proposal Discussion',
      date: new Date(currentYear, currentMonth, 1),   // 1st of current month
      startTime: '14:00',
      endTime: '15:00',
      type: 'supervisor',   // blue
    },
    {
      id: 2,
      title: 'Progress Review',
      date: new Date(currentYear, currentMonth, 15),  // 15th
      startTime: '11:00',
      endTime: '11:30',
      type: 'coordinator',  // green
    },
    {
      id: 3,
      title: 'App Design Review',
      date: new Date(currentYear, currentMonth, 25),  // 25th
      startTime: '10:00',
      endTime: '11:00',
      type: 'supervisor',   // blue
    },
  ];

  // ── Navigation helpers ──────────────────────────────────────────
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // ── Calendar grid calculation ───────────────────────────────────
  // How many days in this month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // What day of week does the 1st fall on (0=Sun, 6=Sat)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Month name for header
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // ── Helper: get meetings for a specific day ─────────────────────
  const getMeetingsForDay = (day) => {
    return meetings.filter((meeting) => {
      const mDate = new Date(meeting.date);
      return (
        mDate.getFullYear() === currentYear &&
        mDate.getMonth()    === currentMonth &&
        mDate.getDate()     === day
      );
    });
  };

  // ── Helper: meeting type → Bootstrap color class ────────────────
  const getMeetingColor = (type) => {
    switch (type) {
      case 'supervisor':   return { bg: '#3c50e0', text: '#fff' };   // blue
      case 'coordinator':  return { bg: '#28a745', text: '#fff' };   // green
      default:             return { bg: '#6c757d', text: '#fff' };   // gray
    }
  };

  // ── Build the grid rows ─────────────────────────────────────────
  // Total cells = blank days before the 1st + actual days
  const totalCells = firstDayOfMonth + daysInMonth;
  const totalRows  = Math.ceil(totalCells / 7);

  // Build array of day numbers (0 = blank cell before month starts)
  const calendarDays = [];
  for (let i = 0; i < totalRows * 7; i++) {
    const day = i - firstDayOfMonth + 1;
    calendarDays.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  // Split flat array into rows of 7
  const calendarRows = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    calendarRows.push(calendarDays.slice(i, i + 7));
  }

  // Is this day today?
  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear  === today.getFullYear();

  return (
    <>
      {/* Breadcrumb: Dashboard / Calendar */}
      <Breadcrumb pageName="Calendar" />

      <div className="card shadow-sm">

        {/* ── Calendar Header: Month/Year + Prev/Next buttons ── */}
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">

          {/* Prev month button */}
          <button
            onClick={goToPrevMonth}
            className="btn btn-outline-secondary btn-sm px-3"
          >
            &lt;
          </button>

          {/* Month + Year title */}
          <h5 className="fw-semibold text-dark mb-0">
            {monthNames[currentMonth]} {currentYear}
          </h5>

          {/* Next month button */}
          <button
            onClick={goToNextMonth}
            className="btn btn-outline-secondary btn-sm px-3"
          >
            &gt;
          </button>
        </div>

        {/* ── Calendar Grid ── */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ tableLayout: 'fixed' }}>

              {/* Day name headers: Sun, Mon, Tue... */}
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

              {/* Calendar date rows */}
              <tbody>
                {calendarRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((day, colIndex) => {
                      const dayMeetings = day ? getMeetingsForDay(day) : [];

                      return (
                        <td
                          key={colIndex}
                          className="align-top p-2"
                          style={{
                            minHeight: '110px',
                            height: '110px',
                            verticalAlign: 'top',
                            /* Highlight today's cell with a very light blue bg */
                            backgroundColor: day && isToday(day) ? '#eef0fd' : 'transparent',
                          }}
                        >
                          {day && (
                            <>
                              {/* Date number */}
                              <span
                                className={`d-inline-block mb-1 fw-medium ${isToday(day) ? 'text-primary' : 'text-dark'}`}
                                style={{ fontSize: '0.9rem' }}
                              >
                                {day}
                              </span>

                              {/*
                                Meeting event blocks for this day.
                                Each meeting = a colored pill/block.
                                In the future, clicking a meeting could open a modal
                                with full meeting details from the backend.
                              */}
                              <div className="d-flex flex-column gap-1">
                                {dayMeetings.map((meeting) => {
                                  const colors = getMeetingColor(meeting.type);
                                  return (
                                    <div
                                      key={meeting.id}
                                      className="rounded px-2 py-1"
                                      style={{
                                        backgroundColor: colors.bg,
                                        color: colors.text,
                                        fontSize: '0.72rem',
                                        lineHeight: '1.3',
                                        cursor: 'pointer',
                                        /*
                                          TODO (Backend): onClick → open modal with meeting details
                                          e.g. onClick={() => openMeetingModal(meeting.id)}
                                        */
                                      }}
                                      title={`${meeting.title} — ${meeting.startTime} to ${meeting.endTime}`}
                                    >
                                      <div className="fw-semibold">{meeting.title}</div>
                                      <div style={{ opacity: 0.9 }}>
                                        {/* Format: "1 Dec - 2 Dec" style date range label */}
                                        {new Date(meeting.date).getDate()} {monthNames[currentMonth].slice(0,3)}
                                        {meeting.endTime && ` — ${meeting.startTime}`}
                                      </div>
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
        {/* ── End Calendar Grid ── */}

        {/* ── Legend: what the colors mean ── */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <span className="small fw-medium text-muted">Legend:</span>

            {/* Blue = Supervisor meeting */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded"
                style={{ width: '14px', height: '14px', backgroundColor: '#3c50e0', display: 'inline-block' }}
              ></span>
              <span className="small text-muted">Supervisor Meeting</span>
            </div>

            {/* Green = Coordinator meeting */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded"
                style={{ width: '14px', height: '14px', backgroundColor: '#28a745', display: 'inline-block' }}
              ></span>
              <span className="small text-muted">Coordinator Meeting</span>
            </div>

            {/* Gray = Other */}
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded"
                style={{ width: '14px', height: '14px', backgroundColor: '#6c757d', display: 'inline-block' }}
              ></span>
              <span className="small text-muted">Other</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Calendar;