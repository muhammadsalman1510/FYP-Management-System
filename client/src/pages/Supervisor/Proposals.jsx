// 📁 FILE: src/pages/Supervisor/Proposals.jsx

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — PROPOSALS REVIEW
  View proposals from assigned students.
  Supervisor can Accept or Reject with feedback.
  NOTE: Supervisor decision is NOT final — coordinator has final say.
  TODO (Backend): GET /api/supervisor/proposals
  TODO (Backend): PUT /api/supervisor/proposals/:id/review { status, feedback }
*/

const SupervisorProposals = () => {

  const [proposals, setProposals] = useState([
    {
      _id: '1',
      student: 'Muhammad Salman',
      rollNumber: 'F2021001001',
      title: 'FYP Management & Tracking System',
      description: 'A web-based system to manage and track Final Year Projects for students, supervisors, and coordinators.',
      objectives: '1. Create role-based login\n2. Track project milestones\n3. Enable meeting scheduling\n4. Document management',
      methodology: 'Agile development with React.js frontend and Node.js backend.',
      submittedDate: '2024-04-25',
      status: 'pending',
      feedback: '',
    },
    {
      _id: '2',
      student: 'Ali Hassan',
      rollNumber: 'F2021001002',
      title: 'E-Commerce Platform with AI Recommendations',
      description: 'An online shopping platform with AI-based product recommendations.',
      objectives: '1. Build product catalog\n2. Implement payment gateway\n3. Add AI recommendation engine',
      methodology: 'MERN Stack with Python ML microservice.',
      submittedDate: '2024-04-24',
      status: 'pending',
      feedback: '',
    },
    {
      _id: '3',
      student: 'Sara Khan',
      rollNumber: 'F2021001003',
      title: 'Hospital Management System',
      description: 'A complete hospital management system for patient records and appointments.',
      objectives: '1. Patient registration\n2. Doctor scheduling\n3. Billing system',
      methodology: 'React and Node.js with MongoDB.',
      submittedDate: '2024-04-23',
      status: 'approved',
      feedback: 'Well planned proposal. Approved for coordinator review.',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId]     = useState(null);
  const [reviewModal, setReviewModal]   = useState(false);
  const [reviewProposal, setReviewProposal] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  const filtered = proposals.filter(p =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const counts = {
    all:      proposals.length,
    pending:  proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  const openReview = (proposal, decision) => {
    setReviewProposal(proposal);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  const submitReview = () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    // TODO (Backend): PUT /api/supervisor/proposals/:id/review
    setProposals(prev =>
      prev.map(p => p._id === reviewProposal._id ? { ...p, status: reviewDecision, feedback: reviewFeedback } : p)
    );
    setReviewModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0 text-capitalize"
                style={{ color: filterStatus === status ? '#3c50e0' : '#6c757d', borderBottom: filterStatus === status ? '2px solid #3c50e0' : '2px solid transparent' }}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`badge ms-2 rounded-pill ${status === 'pending' ? 'bg-warning text-dark' : status === 'approved' ? 'bg-success' : status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                  {counts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Note about supervisor role */}
      <div className="alert alert-info border-0 shadow-sm mb-4 small">
        <strong>Note:</strong> Your approval is the first step. The coordinator makes the final decision on all proposals.
      </div>

      {/* Proposals List */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No proposals found.</p>
            </div>
          </div>
        ) : (
          filtered.map(proposal => (
            <div key={proposal._id} className="card shadow-sm border-0">
              <div className="card-body p-4">

                {/* Top row */}
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                    <p className="text-muted small mb-0">
                      {proposal.student} ({proposal.rollNumber}) &bull; Submitted: {proposal.submittedDate}
                    </p>
                  </div>
                  <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(proposal.status)}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                </div>

                {/* Expand/collapse */}
                <button
                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none mb-3"
                  onClick={() => setExpandedId(expandedId === proposal._id ? null : proposal._id)}
                >
                  {expandedId === proposal._id ? '▲ Hide Details' : '▼ View Full Proposal'}
                </button>

                {expandedId === proposal._id && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <p className="fw-medium text-dark small mb-1">Description</p>
                    <p className="text-muted small mb-3">{proposal.description}</p>
                    <p className="fw-medium text-dark small mb-1">Objectives</p>
                    <p className="text-muted small mb-3" style={{ whiteSpace: 'pre-line' }}>{proposal.objectives}</p>
                    <p className="fw-medium text-dark small mb-1">Methodology</p>
                    <p className="text-muted small mb-0">{proposal.methodology}</p>
                  </div>
                )}

                {/* Feedback box */}
                {proposal.feedback && (
                  <div className={`alert ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>
                    <p className="small mb-0"><strong>Your Feedback:</strong> {proposal.feedback}</p>
                  </div>
                )}

                {/* Action buttons */}
                {proposal.status === 'pending' && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-success btn-sm px-4 fw-medium" onClick={() => openReview(proposal, 'approved')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm px-4 fw-medium"  onClick={() => openReview(proposal, 'rejected')}>✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {reviewDecision === 'approved' ? '✓ Approve Proposal' : '✕ Reject Proposal'}
                </h5>
                <button className="btn-close" onClick={() => setReviewModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted small mb-3">
                  Student: <strong className="text-dark">{reviewProposal?.student}</strong><br/>
                  Proposal: <strong className="text-dark">"{reviewProposal?.title}"</strong>
                </p>
                <label className="form-label fw-medium text-dark small">Feedback * <span className="text-muted fw-normal">(required)</span></label>
                <textarea
                  className="form-control" rows={4}
                  placeholder={reviewDecision === 'approved' ? 'e.g. Good proposal. Approved for coordinator review.' : 'e.g. Please revise the methodology section.'}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
                <p className="text-muted small mt-2 mb-0">The coordinator will make the final decision.</p>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setReviewModal(false)}>Cancel</button>
                <button className={`btn px-4 fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={submitReview}>
                  Confirm {reviewDecision === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorProposals;