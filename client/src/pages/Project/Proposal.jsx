import React, { useState, useEffect } from 'react';

const Proposal = () => {
  const [loading, setLoading]                         = useState(true);
  const [error, setError]                             = useState(null);
  const [hasProject, setHasProject]                   = useState(false);
  const [projectData, setProjectData]                 = useState(null);
  const [submitted, setSubmitted]                     = useState(false);
  const [proposalStatus, setProposalStatus]           = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [rejectedFeedback, setRejectedFeedback]       = useState('');
  const [supervisorRecommendation, setSupervisorRecommendation] = useState('pending');
  const [supervisorFeedback, setSupervisorFeedback]   = useState('');

  const [title, setTitle]                       = useState('');
  const [description, setDescription]           = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [techStack, setTechStack]               = useState('');
  const [groupMembers, setGroupMembers]         = useState([{ name: '', rollNumber: '', section: '', email: '' }]);
  const [supervisorName, setSupervisorName]     = useState('');
  const [supervisorEmail, setSupervisorEmail]   = useState('');

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        const projectRes  = await fetch('/api/projects/my', { headers });
        const projectJson = await projectRes.json();

        if (projectRes.ok && projectJson.success) {
          setHasProject(true);
          setProjectData(projectJson.data);
          return;
        }

        if (projectRes.status !== 404) {
          throw new Error(projectJson.message || 'Failed to load project info');
        }

        const proposalRes  = await fetch('/api/proposals/my', { headers });
        const proposalJson = await proposalRes.json();

        if (!proposalRes.ok || !proposalJson.success) {
          throw new Error(proposalJson.message || 'Failed to load proposal info');
        }

        const proposal = proposalJson.data;
        if (!proposal) {
          setProposalStatus(null); // no proposal at all — show blank form
        } else {
          setProposalStatus(proposal.status);
          setSupervisorRecommendation(proposal.supervisorRecommendation || 'pending');
          setSupervisorFeedback(proposal.supervisorFeedback || '');
          if (proposal.status === 'rejected') {
            setRejectedFeedback(proposal.coordinatorFeedback || '');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getRecStyle = (rec) => {
    switch (rec) {
      case 'approved': return { backgroundColor: '#28a74520', color: '#28a745' };
      case 'rejected': return { backgroundColor: '#dc354520', color: '#dc3545' };
      default:         return { backgroundColor: '#6c757d20', color: '#6c757d' };
    }
  };

  const getRecLabel = (rec) => {
    switch (rec) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default:         return 'Pending';
    }
  };

  const addMember = () => {
    setGroupMembers((prev) => [...prev, { name: '', rollNumber: '', section: '', email: '' }]);
  };

  const removeMember = (index) => {
    setGroupMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMember = (index, field, value) => {
    setSubmitError(null);
    setGroupMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim())            { setSubmitError('Please enter a project title.'); return; }
    if (!description.trim())      { setSubmitError('Please enter a project description.'); return; }
    if (!problemStatement.trim()) { setSubmitError('Please enter the problem statement.'); return; }
    if (!techStack.trim())        { setSubmitError('Please enter the technology stack.'); return; }
    if (!supervisorName.trim())   { setSubmitError("Please enter your supervisor's name."); return; }
    if (!supervisorEmail.trim())  { setSubmitError("Please enter your supervisor's email."); return; }

    for (let i = 0; i < groupMembers.length; i++) {
      const m = groupMembers[i];
      if (!m.name.trim() || !m.rollNumber.trim() || !m.section.trim() || !m.email.trim()) {
        setSubmitError(`Please fill in all fields (name, roll number, section, and email) for Group Member ${i + 1}.`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/proposals', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, problemStatement, techStack, groupMembers, supervisorName, supervisorEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitted(true); // already have a pending proposal from a previous session
        } else {
          setSubmitError(data.message || 'Failed to submit proposal. Please try again.');
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger border-0">{error}</div>;
  }

  if (hasProject) {
    return (
      <div className="d-flex flex-column gap-4">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Proposal Status</h5>
          </div>
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="fw-semibold text-dark mb-2">Project Active</h5>
            <p className="text-muted small mb-1">
              {projectData?.title
                ? <span>Your project <strong className="text-dark">"{projectData.title}"</strong> is active.</span>
                : 'Your project proposal has been approved and your project is active.'}
            </p>
            <p className="text-muted small mb-4">
              You can track milestones and project progress on the Project Status page.
            </p>
            <a href="/project/status" className="btn btn-primary px-5 fw-medium">
              View Project Status
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Just submitted this session OR already have a pending proposal from a previous session
  if (submitted || proposalStatus === 'pending') {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <div className="mb-3" style={{ fontSize: '3rem' }}>📋</div>
          <h5 className="fw-semibold text-dark mb-2">Proposal Submitted — Awaiting Coordinator Review</h5>
          <p className="text-muted small mb-4">
            Your proposal has been received. The coordinator will review it and get back to you.
            Once approved, your project will be automatically created.
          </p>

          <div className="d-inline-flex flex-column gap-2 text-start">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted" style={{ minWidth: '185px', textAlign: 'right' }}>
                Supervisor Recommendation:
              </span>
              <span
                className="badge rounded-pill px-3 py-1"
                style={getRecStyle(supervisorRecommendation)}
              >
                {getRecLabel(supervisorRecommendation)}
              </span>
            </div>
            {supervisorFeedback && (
              <p className="small text-muted mb-0 ms-1">
                <strong>Supervisor feedback:</strong> {supervisorFeedback}
              </p>
            )}
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted" style={{ minWidth: '185px', textAlign: 'right' }}>
                Coordinator Decision:
              </span>
              <span
                className="badge rounded-pill px-3 py-1"
                style={{ backgroundColor: '#ffc10730', color: '#d39e00' }}
              >
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved but project not yet visible (edge case — approval creates project synchronously, but brief race on page load)
  if (proposalStatus === 'approved') {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="fw-semibold text-dark mb-2">Project Being Created</h5>
          <p className="text-muted small mb-0">
            Your proposal was approved. Your project is being set up — please refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  // Show form — either no proposal (proposalStatus === null) or rejected (show feedback + fresh form)
  return (
    <div className="d-flex flex-column gap-4">

      {proposalStatus === 'rejected' && (
        <div className="alert alert-danger border-0 shadow-sm">
          <h6 className="fw-semibold mb-3">Your Previous Proposal Was Rejected</h6>

          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="small fw-medium">Supervisor Recommendation:</span>
            <span
              className="badge rounded-pill px-2 py-1"
              style={getRecStyle(supervisorRecommendation)}
            >
              {getRecLabel(supervisorRecommendation)}
            </span>
          </div>
          {supervisorFeedback && (
            <p className="small mb-2 mt-1">
              <strong>Supervisor feedback:</strong> {supervisorFeedback}
            </p>
          )}

          <div className="d-flex align-items-center gap-2 mb-1 mt-2">
            <span className="small fw-medium">Coordinator Decision:</span>
            <span
              className="badge rounded-pill px-2 py-1"
              style={{ backgroundColor: '#dc354520', color: '#dc3545' }}
            >
              Rejected
            </span>
          </div>
          {rejectedFeedback
            ? <p className="small mb-0 mt-1"><strong>Coordinator feedback:</strong> {rejectedFeedback}</p>
            : <p className="small mb-0 mt-1 text-danger-emphasis">No coordinator feedback was provided. You may submit a new proposal below.</p>
          }
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Proposal Status</h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <span
              className="rounded-circle bg-warning"
              style={{ width: '12px', height: '12px', display: 'inline-block', flexShrink: 0 }}
            />
            <span className="fw-medium text-dark">
              {proposalStatus === 'rejected'
                ? 'Previous proposal rejected — submit a new proposal below.'
                : 'Not yet submitted — fill the form below and click Submit.'}
            </span>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Project Proposal Form</h5>
          <p className="text-muted small mb-0 mt-1">
            One student from your group should fill and submit this on behalf of the group.
            On approval, the system automatically creates your project and assigns your supervisor.
          </p>
        </div>
        <div className="card-body p-4">

          {submitError && (
            <div className="alert alert-danger border-0 py-2 px-3 mb-4" style={{ fontSize: '0.875rem' }}>
              {submitError}
            </div>
          )}

          <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">Project Details</h6>

          <div className="mb-3">
            <label className="form-label fw-medium text-dark small">
              Project Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your project title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setSubmitError(null); }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium text-dark small">
              Project Description <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe your project in detail..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setSubmitError(null); }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium text-dark small">
              Problem Statement <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="What problem does your project solve?"
              value={problemStatement}
              onChange={(e) => { setProblemStatement(e.target.value); setSubmitError(null); }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-medium text-dark small">
              Technology Stack <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. React.js, Node.js, MongoDB, Express.js"
              value={techStack}
              onChange={(e) => { setTechStack(e.target.value); setSubmitError(null); }}
            />
          </div>

          <h6 className="fw-semibold text-dark mb-1 pb-2 border-bottom">Group Members</h6>
          <p className="text-muted small mb-3">
            Add all students in your group. All four fields per member must exactly match what
            is registered in the system. Include yourself.
          </p>

          <div className="d-flex flex-column gap-3 mb-3">
            {groupMembers.map((member, index) => (
              <div key={index} className="border rounded p-3">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-semibold text-dark mb-0 small">Group Member {index + 1}</h6>
                  {groupMembers.length > 1 && (
                    <button
                      className="btn btn-outline-danger btn-sm px-2 py-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => removeMember(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Muhammad Ali"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">
                      Roll Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. F2021001002"
                      value={member.rollNumber}
                      onChange={(e) => updateMember(index, 'rollNumber', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">
                      Section <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A, B, C"
                      value={member.section}
                      onChange={(e) => updateMember(index, 'section', e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. student@university.edu"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {groupMembers.length < 4 && (
            <button
              className="btn btn-outline-secondary btn-sm px-4 mb-4"
              onClick={addMember}
            >
              + Add Member
            </button>
          )}

          <h6 className="fw-semibold text-dark mb-1 pb-2 border-bottom">Supervisor</h6>
          <p className="text-muted small mb-3">
            Enter your intended supervisor's name and university email exactly as registered in the system.
          </p>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-dark small">
                Supervisor Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Dr. Ahmed Khan"
                value={supervisorName}
                onChange={(e) => { setSupervisorName(e.target.value); setSubmitError(null); }}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-medium text-dark small">
                Supervisor Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="supervisor@university.edu"
                value={supervisorEmail}
                onChange={(e) => { setSupervisorEmail(e.target.value); setSubmitError(null); }}
              />
              <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
                Must match exactly the email registered in the system.
              </p>
            </div>
          </div>

          <div className="d-flex gap-3 mt-2">
            <button
              className="btn btn-primary px-5 fw-medium"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" />}
              Submit Proposal
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Proposal;
