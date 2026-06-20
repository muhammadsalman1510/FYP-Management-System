import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorScheduleMeeting = () => {
  const [students, setStudents]       = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError]   = useState(null);

  // Form state
  const [meetWith, setMeetWith]             = useState('student');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [topic, setTopic]                   = useState('');
  const [proposedDate, setProposedDate]     = useState('');
  const [proposedTime, setProposedTime]     = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [formError, setFormError]           = useState('');
  const [success, setSuccess]               = useState(false);

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [studentsRes, supervisorsRes] = await Promise.all([
          fetch('/api/users?role=student',    { headers }),
          fetch('/api/users?role=supervisor', { headers }),
        ]);

        const studentsData    = await studentsRes.json();
        const supervisorsData = await supervisorsRes.json();

        if (!studentsRes.ok)    throw new Error(studentsData.message    || 'Failed to load students');
        if (!supervisorsRes.ok) throw new Error(supervisorsData.message || 'Failed to load supervisors');

        // GET /api/users returns { users: [...] } — not { success, data }
        setStudents(studentsData.users    || []);
        setSupervisors(supervisorsData.users || []);
      } catch (err) {
        setUsersError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleMeetWithChange = (value) => {
    setMeetWith(value);
    setSelectedUserId('');
    setFormError('');
  };

  const handleSubmit = async () => {
    if (!selectedUserId)  { setFormError(`Please select a ${meetWith}.`); return; }
    if (!topic.trim())    { setFormError('Please enter a meeting topic.'); return; }
    if (!proposedDate)    { setFormError('Please select a proposed date.'); return; }
    if (!proposedTime)    { setFormError('Please select a proposed time.'); return; }

    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestedTo: selectedUserId,
          topic:       topic.trim(),
          proposedDate,
          proposedTime,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send meeting request');
      setSuccess(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMeetWith('student');
    setSelectedUserId('');
    setTopic('');
    setProposedDate('');
    setProposedTime('');
    setFormError('');
    setSuccess(false);
  };

  if (success) {
    return (
      <>
        <Breadcrumb pageName="Schedule Meeting" />
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="fw-bold text-dark mb-2">Meeting Request Sent!</h5>
            <p className="text-muted mb-4">
              The meeting request has been sent and is awaiting confirmation.
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

  if (loadingUsers) {
    return (
      <>
        <Breadcrumb pageName="Schedule Meeting" />
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (usersError) {
    return (
      <>
        <Breadcrumb pageName="Schedule Meeting" />
        <div className="alert alert-danger border-0">{usersError}</div>
      </>
    );
  }

  const participantList = meetWith === 'student' ? students : supervisors;

  return (
    <>
      <Breadcrumb pageName="Schedule Meeting" />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Meeting Details</h6>
              <p className="text-muted small mb-0 mt-1">
                Schedule a meeting with a student or supervisor.
              </p>
            </div>
            <div className="card-body p-4">

              {formError && (
                <div className="alert alert-danger border-0 py-2 px-3 small mb-4">
                  {formError}
                </div>
              )}

              <div className="row g-4">

                {/* Meet With */}
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <div className="d-flex gap-4">
                    {['student', 'supervisor'].map((role) => (
                      <div
                        key={role}
                        className="form-check d-flex align-items-center gap-2 mb-0"
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          id={`meetWith-${role}`}
                          value={role}
                          checked={meetWith === role}
                          onChange={() => handleMeetWithChange(role)}
                        />
                        <label
                          className="form-check-label fw-medium small text-dark text-capitalize"
                          htmlFor={`meetWith-${role}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Participant */}
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">
                    Select {meetWith === 'student' ? 'Student' : 'Supervisor'} *
                  </label>
                  <select
                    className="form-select"
                    value={selectedUserId}
                    onChange={(e) => { setSelectedUserId(e.target.value); setFormError(''); }}
                  >
                    <option value="">
                      — Select {meetWith === 'student' ? 'a student' : 'a supervisor'} —
                    </option>
                    {participantList.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                        {meetWith === 'student' && u.rollNumber ? ` (${u.rollNumber})` : ''}
                        {meetWith === 'supervisor' && u.department ? ` — ${u.department}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meeting Topic */}
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Meeting Topic *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Proposal Review, Progress Check"
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setFormError(''); }}
                  />
                </div>

                {/* Proposed Date */}
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Proposed Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                  />
                </div>

                {/* Proposed Time */}
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Proposed Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-3">
                    <a href="/coordinator/meetings/calendar" className="btn btn-outline-secondary px-4">
                      Cancel
                    </a>
                    <button
                      className="btn btn-primary px-4 fw-medium"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting && (
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                      )}
                      Send Meeting Request
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordinatorScheduleMeeting;
