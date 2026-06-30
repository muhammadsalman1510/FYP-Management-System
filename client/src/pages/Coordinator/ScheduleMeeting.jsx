import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorScheduleMeeting = () => {
  const [projects, setProjects]       = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError]     = useState(null);

  const [meetWith, setMeetWith]                   = useState('project');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [topic, setTopic]                         = useState('');
  const [proposedDate, setProposedDate]           = useState('');
  const [proposedTime, setProposedTime]           = useState('');
  const [location, setLocation]                   = useState('');
  const [submitting, setSubmitting]               = useState(false);
  const [formError, setFormError]                 = useState('');
  const [success, setSuccess]                     = useState(null); // { message }

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const today   = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const load = async () => {
      try {
        const [projectsRes, supervisorsRes] = await Promise.all([
          fetch('/api/projects',           { headers }),
          fetch('/api/users?role=supervisor', { headers }),
        ]);

        const projectsData    = await projectsRes.json();
        const supervisorsData = await supervisorsRes.json();

        if (!projectsRes.ok || !projectsData.success) throw new Error(projectsData.message || 'Failed to load projects');
        if (!supervisorsRes.ok) throw new Error(supervisorsData.message || 'Failed to load supervisors');

        setProjects(projectsData.data || []);
        // GET /api/users returns { users: [...] } — not { success, data }
        setSupervisors(supervisorsData.users || []);
      } catch (err) {
        setDataError(err.message);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const handleMeetWithChange = (value) => {
    setMeetWith(value);
    setSelectedProjectId('');
    setSelectedSupervisorId('');
    setFormError('');
  };

  const handleSubmit = async () => {
    if (!topic.trim())    { setFormError('Please enter a meeting topic.'); return; }
    if (!proposedDate)    { setFormError('Please select a proposed date.'); return; }
    if (!proposedTime)    { setFormError('Please select a proposed time.'); return; }

    if (meetWith === 'project') {
      if (!selectedProjectId) { setFormError('Please select a project.'); return; }
    } else {
      if (!selectedSupervisorId) { setFormError('Please select a supervisor.'); return; }
    }

    setFormError('');
    setSubmitting(true);
    try {
      let body;
      if (meetWith === 'project') {
        body = {
          meetWith:    'project',
          projectId:   selectedProjectId,
          topic:       topic.trim(),
          proposedDate,
          proposedTime,
          location:    location.trim(),
        };
      } else {
        body = {
          requestedTo:  selectedSupervisorId,
          topic:        topic.trim(),
          proposedDate,
          proposedTime,
          location:     location.trim(),
          meetingType:  'requested',
        };
      }

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to schedule meeting');

      if (meetWith === 'project') {
        const proj = projects.find((p) => p._id === selectedProjectId);
        const count = Array.isArray(data.data) ? data.data.length : 1;
        setSuccess({ message: `Meeting scheduled for ${count} student${count !== 1 ? 's' : ''} in "${proj?.title || 'project'}".` });
      } else {
        const sup = supervisors.find((s) => s._id === selectedSupervisorId);
        setSuccess({ message: `Meeting request sent to ${sup?.name || 'supervisor'}.` });
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setMeetWith('project');
    setSelectedProjectId('');
    setSelectedSupervisorId('');
    setTopic('');
    setProposedDate('');
    setProposedTime('');
    setLocation('');
    setFormError('');
    setSuccess(null);
  };

  if (success) {
    return (
      <>
        <Breadcrumb pageName="Schedule Meeting" />
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="fw-bold text-dark mb-2">
              {meetWith === 'project' ? 'Meeting Scheduled!' : 'Meeting Request Sent!'}
            </h5>
            <p className="text-muted mb-4">{success.message}</p>
            <div className="d-flex justify-content-center gap-3">
              <a href="/coordinator/meetings/calendar" className="btn btn-primary px-4">View Calendar</a>
              <button className="btn btn-outline-secondary px-4" onClick={handleReset}>Schedule Another</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loadingData) {
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

  if (dataError) {
    return (
      <>
        <Breadcrumb pageName="Schedule Meeting" />
        <div className="alert alert-danger border-0">{dataError}</div>
      </>
    );
  }

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const projectStudentNames = (selectedProject?.students || []).map((s) => s.name).filter(Boolean);

  return (
    <>
      <Breadcrumb pageName="Schedule Meeting" />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Meeting Details</h6>
              <p className="text-muted small mb-0 mt-1">
                Schedule a meeting for a project group or request a meeting with a supervisor.
              </p>
            </div>
            <div className="card-body p-4">

              {formError && (
                <div className="alert alert-danger border-0 py-2 px-3 small mb-4">
                  {formError}
                </div>
              )}

              <div className="row g-4">

                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <div className="d-flex gap-4">
                    {['project', 'supervisor'].map((opt) => (
                      <div
                        key={opt}
                        className="form-check d-flex align-items-center gap-2 mb-0"
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="radio"
                          className="form-check-input mt-0"
                          id={`meetWith-${opt}`}
                          value={opt}
                          checked={meetWith === opt}
                          onChange={() => handleMeetWithChange(opt)}
                        />
                        <label
                          className="form-check-label fw-medium small text-dark text-capitalize"
                          htmlFor={`meetWith-${opt}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {opt === 'project' ? 'Project (schedule for all students)' : 'Supervisor (send request)'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {meetWith === 'project' && (
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Select Project *</label>
                    <select
                      className="form-select"
                      value={selectedProjectId}
                      onChange={(e) => { setSelectedProjectId(e.target.value); setFormError(''); }}
                    >
                      <option value="">— Select a project —</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>{p.title}</option>
                      ))}
                    </select>
                    {selectedProjectId && (
                      projectStudentNames.length > 0 ? (
                        <div className="alert alert-info border-0 py-2 px-3 small mt-2 mb-0">
                          <strong>This meeting will be sent to:</strong> {projectStudentNames.join(', ')}
                        </div>
                      ) : (
                        <div className="alert alert-warning border-0 py-2 px-3 small mt-2 mb-0">
                          No students are currently assigned to this project.
                        </div>
                      )
                    )}
                  </div>
                )}

                {meetWith === 'supervisor' && (
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Select Supervisor *</label>
                    <select
                      className="form-select"
                      value={selectedSupervisorId}
                      onChange={(e) => { setSelectedSupervisorId(e.target.value); setFormError(''); }}
                    >
                      <option value="">— Select a supervisor —</option>
                      {supervisors.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}{s.department ? ` — ${s.department}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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

                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Proposed Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={proposedDate}
                    min={today}
                    onChange={(e) => setProposedDate(e.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Proposed Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Location <span className="text-muted">(optional)</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Room 204, Online (Zoom), Faculty Office"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

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
                      {meetWith === 'project' ? 'Schedule Meeting' : 'Send Meeting Request'}
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
