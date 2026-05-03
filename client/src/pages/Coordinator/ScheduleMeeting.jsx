import React, { useState } from 'react';

/*
  COORDINATOR — SCHEDULE MEETING
  Coordinator can directly schedule a meeting with any student or supervisor.
  No approval needed — coordinator-created meetings are auto-approved
  and automatically appear on the calendar.
  TODO (Backend): POST /api/coordinator/meetings
*/

const CoordinatorScheduleMeeting = () => {

  // Sample users (replace with API calls)
  const students = [
    { id: 1, name: 'Muhammad Salman', rollNumber: 'F2021001001' },
    { id: 2, name: 'Ali Hassan',      rollNumber: 'F2021001002' },
    { id: 3, name: 'Sara Khan',       rollNumber: 'F2021001003' },
    { id: 4, name: 'Usman Ahmed',     rollNumber: 'F2021001004' },
  ];

  const supervisors = [
    { id: 1, name: 'Mr. Shoaib Ahmed' },
    { id: 2, name: 'Mr. Omer Khan'    },
    { id: 3, name: 'Dr. Ayesha Malik' },
  ];

  const [form, setForm] = useState({
    meetWith:    'student', // 'student' or 'supervisor'
    participantId: '',
    title:       '',
    date:        '',
    startTime:   '',
    endTime:     '',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value, ...(name === 'meetWith' ? { participantId: '' } : {}) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO (Backend): POST /api/coordinator/meetings
    // Meeting will be auto-approved since coordinator is scheduling it
    // After saving, it should appear on the calendar automatically
    console.log('Scheduling meeting:', form);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ meetWith:'student', participantId:'', title:'', date:'', startTime:'', endTime:'', description:'' });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="fw-bold text-dark mb-0">Schedule Meeting</h4>
        </div>
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize:'3rem' }}>✅</div>
            <h5 className="fw-bold text-dark mb-2">Meeting Scheduled!</h5>
            <p className="text-muted mb-4">
              The meeting has been successfully scheduled and added to the calendar.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <a href="/coordinator/meetings/calendar" className="btn btn-primary px-4">View Calendar</a>
              <button className="btn btn-outline-secondary px-4" onClick={handleReset}>Schedule Another</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Schedule Meeting</h4>
          <p className="text-muted small mb-0">Schedule a direct meeting with a student or supervisor.</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Meeting Details</h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-4">

                  {/* Meet With toggle */}
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Meet With *</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input type="radio" className="form-check-input" name="meetWith"
                          id="meetStudent" value="student"
                          checked={form.meetWith === 'student'}
                          onChange={handleInputChange} />
                        <label className="form-check-label fw-medium small text-dark" htmlFor="meetStudent">
                          Student
                        </label>
                      </div>
                      <div className="form-check">
                        <input type="radio" className="form-check-input" name="meetWith"
                          id="meetSupervisor" value="supervisor"
                          checked={form.meetWith === 'supervisor'}
                          onChange={handleInputChange} />
                        <label className="form-check-label fw-medium small text-dark" htmlFor="meetSupervisor">
                          Supervisor
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Select participant */}
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">
                      Select {form.meetWith === 'student' ? 'Student' : 'Supervisor'} *
                    </label>
                    <select name="participantId" value={form.participantId} onChange={handleInputChange}
                      className="form-select" required>
                      <option value="">-- Select {form.meetWith === 'student' ? 'a student' : 'a supervisor'} --</option>
                      {form.meetWith === 'student'
                        ? students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)
                        : supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                      }
                    </select>
                  </div>

                  {/* Meeting Title */}
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Meeting Title *</label>
                    <input type="text" name="title" value={form.title} onChange={handleInputChange}
                      className="form-control" placeholder="e.g. Proposal Review, Progress Check" required />
                  </div>

                  {/* Date */}
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-medium text-dark small">Date *</label>
                    <input type="date" name="date" value={form.date} onChange={handleInputChange}
                      className="form-control" required />
                  </div>

                  {/* Start Time */}
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-medium text-dark small">Start Time *</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleInputChange}
                      className="form-control" required />
                  </div>

                  {/* End Time */}
                  <div className="col-12 col-sm-4">
                    <label className="form-label fw-medium text-dark small">End Time *</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleInputChange}
                      className="form-control" required />
                  </div>

                  {/* Agenda / Description */}
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Agenda / Description (Optional)</label>
                    <textarea name="description" value={form.description} onChange={handleInputChange}
                      rows={3} className="form-control"
                      placeholder="Briefly describe the purpose of this meeting..." />
                  </div>

                  {/* Info note */}
                  <div className="col-12">
                    <div className="alert alert-info small mb-0 py-2">
                      <strong>Note:</strong> As a coordinator, meetings you schedule are automatically approved and will immediately appear on the calendar.
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-3">
                      <a href="/coordinator/meetings/calendar" className="btn btn-outline-secondary px-4">Cancel</a>
                      <button type="submit" className="btn btn-primary px-4 fw-medium">Schedule Meeting</button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div> 
      </div>
    </>
  );
};

export default CoordinatorScheduleMeeting;