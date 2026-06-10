import React, { useState } from 'react';

/*
  STUDENT — PROJECT PROPOSAL FORM
  Student fills project details + group member information.
  Group size is selected first (2-4 students), then that many
  member forms appear dynamically.
  One student from the group submits on behalf of the group.

  TODO (Backend): POST /api/proposals
  Body: { title, description, problemStatement, stack,
          expectedOutcome, groupMembers: [...], file }
  TODO (Backend): GET /api/proposals/my  → to show existing proposal & status
*/

const Proposal = () => {

  // ── Proposal status (replace with API call later) ──
  // TODO (Backend): GET /api/proposals/my
  const [status, setStatus] = useState('draft');
  const [rejectionFeedback] = useState('Please add more technical details and refine your problem statement.');

  // ── Main form fields ──
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatement: '',
    stack: '',
    expectedOutcome: '',
    file: null,
  });

  // ── Group members ──
  // groupSize: how many additional members (not counting the submitting student)
  const [groupSize, setGroupSize] = useState('');

  const emptyMember = {
    name: '',
    rollNumber: '',
    semester: '',
    section: '',
    program: '',
  };

  const [groupMembers, setGroupMembers] = useState([]);

  // When group size changes, rebuild the groupMembers array
  const handleGroupSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setGroupSize(e.target.value);
    if (!isNaN(size) && size >= 1) {
      // Fill with empty forms up to that count
      setGroupMembers(Array.from({ length: size }, () => ({ ...emptyMember })));
    } else {
      setGroupMembers([]);
    }
  };

  // Update a specific member's field
  const handleMemberChange = (index, field, value) => {
    setGroupMembers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ── Main form handlers ──
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that all group member fields are filled
    for (let i = 0; i < groupMembers.length; i++) {
      const m = groupMembers[i];
      if (!m.name || !m.rollNumber || !m.semester || !m.section || !m.program) {
        alert(`Please fill all fields for Group Member ${i + 1}`);
        return;
      }
    }

    // TODO (Backend): POST /api/proposals
    // Send formData + groupMembers to API
    console.log('Submitting proposal:', { ...formData, groupMembers });
    setStatus('submitted');
    alert('Project Proposal Submitted Successfully!');
  };

  const handleSaveDraft = () => {
    // TODO (Backend): POST /api/proposals/draft
    alert('Draft Saved Successfully!');
  };

  // ── Status helpers ──
  const getStatusBadge = (s) => {
    switch (s) {
      case 'draft':        return 'bg-warning text-dark';
      case 'submitted':    return 'bg-primary';
      case 'under_review': return 'bg-warning';
      case 'approved':     return 'bg-success';
      case 'rejected':     return 'bg-danger';
      default:             return 'bg-secondary';
    }
  };

  const getStatusText = (s) => {
    switch (s) {
      case 'draft':        return 'Draft';
      case 'submitted':    return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved':     return 'Approved ✓';
      case 'rejected':     return 'Rejected';
      default:             return 'Unknown';
    }
  };

  // If proposal already approved, show read-only view
  if (status === 'approved') {
    return (
      <div className="d-flex flex-column gap-4">
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="fw-semibold text-dark mb-2">Proposal Approved!</h5>
            <p className="text-muted small mb-0">
              Your project proposal has been approved by the coordinator.
              Your project group has been created.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Status Card ── */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Proposal Status</h5>
        </div>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <span
              className={`rounded-circle badge ${getStatusBadge(status)}`}
              style={{ width: '12px', height: '12px', padding: 0, display: 'inline-block' }}
            />
            <span className="fw-medium text-dark">
              Status: {getStatusText(status)}
            </span>
          </div>

          {/* Rejection feedback */}
          {status === 'rejected' && (
            <div className="alert alert-danger border-0 mb-0">
              <h6 className="fw-semibold mb-1">Feedback:</h6>
              <p className="mb-0 small">{rejectionFeedback}</p>
            </div>
          )}

          {/* Submitted info */}
          {status === 'submitted' && (
            <div className="alert alert-info border-0 mb-0 small">
              Your proposal has been submitted and is awaiting review from your supervisor.
            </div>
          )}
        </div>
      </div>

      {/* ── Proposal Form ── */}
      {/* Show form if draft or rejected (can resubmit) */}
      {(status === 'draft' || status === 'rejected') && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Project Proposal Form</h5>
            <p className="text-muted small mb-0 mt-1">
              One student from your group should fill and submit this form on behalf of the group.
            </p>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>

              {/* ══════════════════════════════
                  SECTION 1 — Project Details
                  ══════════════════════════════ */}
              <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                Project Details
              </h6>

              {/* Project Title */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">
                  Project Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your project title"
                  className="form-control"
                  required
                />
              </div>

              {/* Project Description */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">
                  Project Description <span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your project in detail..."
                  className="form-control"
                  required
                />
              </div>

              {/* Problem Statement */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">
                  Problem Statement <span className="text-danger">*</span>
                </label>
                <textarea
                  name="problemStatement"
                  value={formData.problemStatement}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="What problem does your project solve?"
                  className="form-control"
                  required
                />
              </div>

              {/* Tech Stack */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">
                  Technology Stack <span className="text-danger">*</span>
                </label>
                <textarea
                  name="stack"
                  value={formData.stack}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="e.g. React.js, Node.js, MongoDB, Express.js"
                  className="form-control"
                  required
                />
              </div>

              {/* Expected Outcome */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Expected Outcome
                </label>
                <textarea
                  name="expectedOutcome"
                  value={formData.expectedOutcome}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="What do you expect to achieve with this project?"
                  className="form-control"
                />
              </div>

              {/* ══════════════════════════════
                  SECTION 2 — Group Members
                  ══════════════════════════════ */}
              <h6 className="fw-semibold text-dark mb-1 pb-2 border-bottom">
                Group Members
              </h6>
              <p className="text-muted small mb-3">
                Select how many other students are in your group (not counting yourself).
                Maximum group size is 4 students total.
              </p>

              {/* Group size selector */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Number of Other Group Members <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={groupSize}
                  onChange={handleGroupSizeChange}
                  required
                >
                  <option value="">-- Select number of other members --</option>
                  <option value="0">Just me (solo project)</option>
                  <option value="1">1 other member (2 total)</option>
                  <option value="2">2 other members (3 total)</option>
                  <option value="3">3 other members (4 total)</option>
                </select>
              </div>

              {/* Dynamic group member forms */}
              {groupMembers.length > 0 && (
                <div className="d-flex flex-column gap-4 mb-4">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="border rounded p-4">
                      <h6 className="fw-semibold text-dark mb-3">
                        Group Member {index + 1}
                      </h6>
                      <div className="row g-3">

                        {/* Full Name */}
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium text-dark small">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Muhammad Ali"
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            required
                          />
                        </div>

                        {/* Roll Number */}
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-medium text-dark small">
                            Roll Number <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. F2021001002"
                            value={member.rollNumber}
                            onChange={(e) => handleMemberChange(index, 'rollNumber', e.target.value)}
                            required
                          />
                        </div>

                        {/* Program */}
                        <div className="col-12 col-md-4">
                          <label className="form-label fw-medium text-dark small">
                            Program <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={member.program}
                            onChange={(e) => handleMemberChange(index, 'program', e.target.value)}
                            required
                          >
                            <option value="">-- Select --</option>
                            <option value="BSCS">BSCS</option>
                            <option value="BSIT">BSIT</option>
                            <option value="BSSE">BSSE</option>
                          </select>
                        </div>

                        {/* Semester */}
                        <div className="col-12 col-md-4">
                          <label className="form-label fw-medium text-dark small">
                            Semester <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={member.semester}
                            onChange={(e) => handleMemberChange(index, 'semester', e.target.value)}
                            required
                          >
                            <option value="">-- Select --</option>
                            <option value="7">7th</option>
                            <option value="8">8th</option>
                          </select>
                        </div>

                        {/* Section */}
                        <div className="col-12 col-md-4">
                          <label className="form-label fw-medium text-dark small">
                            Section <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={member.section}
                            onChange={(e) => handleMemberChange(index, 'section', e.target.value)}
                            required
                          >
                            <option value="">-- Select --</option>
                            {['A','B','C','D'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ══════════════════════════════
                  SECTION 3 — File Upload
                  ══════════════════════════════ */}
              <h6 className="fw-semibold text-dark mb-3 pb-2 border-bottom">
                Proposal Document
              </h6>

              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Upload Proposal Document <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="form-control"
                  required
                />
                <p className="text-muted small mt-1">
                  Supported formats: PDF, DOC, DOCX. Max size: 10MB.
                </p>
              </div>

              {/* Submit buttons */}
              <div className="d-flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-outline-secondary px-4"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-medium"
                >
                  Submit Proposal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* If submitted, show read-only submitted info */}
      {status === 'submitted' && (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>📋</div>
            <h5 className="fw-semibold text-dark mb-2">Proposal Submitted</h5>
            <p className="text-muted small mb-0">
              Your proposal is currently under review. You will be notified once your supervisor reviews it.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Proposal;