import React, { useState } from 'react';

const Proposal = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ProblemStatement: '',
    stack: '',
    expectedOutcome: '',
    file: null,
  });

  const [status, setStatus] = useState('draft');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitted');
    alert('Project Proposal Submitted Successfully!');
  };

  const handleSaveDraft = () => {
    alert('Draft Saved Successfully!');
  };

  /* Returns a Bootstrap badge class for each status */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':        return 'bg-warning text-dark';
      case 'submitted':    return 'bg-primary';
      case 'under_review': return 'bg-warning';
      case 'approved':     return 'bg-success';
      case 'rejected':     return 'bg-danger';
      default:             return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':        return 'Draft';
      case 'submitted':    return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved':     return 'Approved';
      case 'rejected':     return 'Rejected';
      default:             return 'Unknown';
    }
  };

  return (
    <div className="d-flex flex-column gap-4">

      {/* ===== Status Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Proposal Status</h5>
        </div>
        <div className="card-body p-4">

          {/* Status indicator row */}
          <div className="d-flex align-items-center gap-3 mb-3">
            {/* Colored dot */}
            <span
              className={`rounded-circle badge ${getStatusBadge(status)}`}
              style={{ width: '12px', height: '12px', padding: 0, display: 'inline-block' }}
            ></span>
            <span className="fw-medium text-dark">
              Status: {getStatusText(status)}
            </span>
          </div>

          {/* Rejection feedback box - only shown when rejected */}
          {status === 'rejected' && (
            <div className="alert alert-danger">
              <h6 className="fw-semibold mb-1">Feedback from Supervisor:</h6>
              <p className="mb-0 small">
                Please add more technical details and stack. The Problem Statement need to be more specific.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* ===== End Status Card ===== */}

      {/* ===== Proposal Form Card ===== */}
      <div className="card shadow-sm">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-semibold text-dark mb-0">Project Proposal Form</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            {/* Project Title */}
            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
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
              <label className="form-label fw-medium text-dark">
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
              <label className="form-label fw-medium text-dark">
                Problem Statement <span className="text-danger">*</span>
              </label>
              <textarea
                name="ProblemStatement"
                value={formData.ProblemStatement}
                onChange={handleInputChange}
                rows={3}
                placeholder="List your project Problem Statement..."
                className="form-control"
                required
              />  
            </div>

            {/* stack */}
            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                 Stack <span className="text-danger">*</span>
              </label>
              <textarea
                name="stack"
                value={formData.stack}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe your research stack..."
                className="form-control"
                required
              />
            </div>

            {/* Expected Outcome */}
            <div className="mb-3">
              <label className="form-label fw-medium text-dark">
                Expected Outcome
              </label>
              <textarea
                name="expectedOutcome"
                value={formData.expectedOutcome}
                onChange={handleInputChange}
                rows={2}
                placeholder="What do you expect to achieve?"
                className="form-control"
              />
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="form-label fw-medium text-dark">
                Upload Proposal Document (PDF) <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="form-control"
                required
              />
              <p className="text-muted small mt-1">
                Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX
              </p>
            </div>

            {/* Save Draft + Submit buttons */}
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
                className="btn btn-primary px-4"
              >
                Submit Proposal
              </button>
            </div>

          </form>
        </div>
      </div>
      {/* ===== End Proposal Form Card ===== */}

    </div>
  );
};

export default Proposal;