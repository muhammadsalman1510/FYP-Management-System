import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROPOSALS REVIEW
  - View all submitted proposals from all students
  - Filter by status: All / Pending / Approved / Rejected
  - Expand any proposal to read full details
  - Accept or Reject with mandatory feedback
  - Coordinator decision is FINAL
  - TODO (Backend): GET /api/coordinator/proposals
  - TODO (Backend): PUT /api/coordinator/proposals/:id/review  { status, feedback }
*/

const CoordinatorProposals = () => {

  const [proposals, setProposals] = useState([
    {
      id: 1,
      student: 'Muhammad Salman',
      rollNumber: 'F2021001001',
      supervisor: 'Mr. Shoaib',
      title: 'FYP Management & Tracking System',
      description: 'A web-based system to manage and track Final Year Projects for students, supervisors, and coordinators.',
      objectives: '1. Create role-based login\n2. Track project milestones\n3. Enable meeting scheduling\n4. Document management',
      methodology: 'Agile development methodology with React.js frontend and Node.js backend.',
      submittedDate: '2024-04-25',
      supervisorStatus: 'approved',
      supervisorFeedback: 'Good proposal. Well structured.',
      status: 'pending',
      feedback: '',
    },
    {
      id: 2,
      student: 'Ali Hassan',
      rollNumber: 'F2021001002',
      supervisor: 'Mr. Shoaib',
      title: 'E-Commerce Platform with AI Recommendations',
      description: 'An online shopping platform with AI-based product recommendations using collaborative filtering.',
      objectives: '1. Build product catalog\n2. Implement payment gateway\n3. Add AI recommendation engine',
      methodology: 'MERN Stack with Python ML microservice.',
      submittedDate: '2024-04-24',
      supervisorStatus: 'approved',
      supervisorFeedback: 'Interesting idea.',
      status: 'pending',
      feedback: '',
    },
    {
      id: 3,
      student: 'Sara Khan',
      rollNumber: 'F2021001003',
      supervisor: 'Mr. Omer',
      title: 'Hospital Management System',
      description: 'A complete hospital management system for patient records, appointments, and billing.',
      objectives: '1. Patient registration\n2. Doctor scheduling\n3. Billing system',
      methodology: 'Traditional waterfall with React and Node.js.',
      submittedDate: '2024-04-23',
      supervisorStatus: 'approved',
      supervisorFeedback: 'Well planned.',
      status: 'approved',
      feedback: 'Excellent proposal. You may proceed to implementation.',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId]     = useState(null);
  const [reviewModal, setReviewModal]   = useState(false);
  const [reviewProposal, setReviewProposal] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  // Filter proposals
  const filtered = proposals.filter(p =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  // Open review modal
  const openReview = (proposal, decision) => {
    setReviewProposal(proposal);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  // Submit review decision
  const submitReview = () => {
    if (!reviewFeedback.trim()) {
      alert('Please provide feedback before submitting.');
      return;
    }
    // TODO (Backend): PUT /api/coordinator/proposals/:id/review
    setProposals(prev =>
      prev.map(p =>
        p.id === reviewProposal.id
          ? { ...p, status: reviewDecision, feedback: reviewFeedback }
          : p
      )
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

  // Count per status
  const counts = {
    all:      proposals.length,
    pending:  proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length,
  };

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0 text-capitalize"
                style={{
                  color: filterStatus === status ? '#3c50e0' : '#6c757d',
                  borderBottom: filterStatus === status ? '2px solid #3c50e0' : '2px solid transparent',
                }}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`badge ms-2 rounded-pill ${status === 'pending' ? 'bg-warning text-dark' : status === 'approved' ? 'bg-success' : status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                  {counts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>
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
            <div key={proposal.id} className="card shadow-sm border-0">
              <div className="card-body p-4">

                {/* Top row */}
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                    <p className="text-muted small mb-0">
                      {proposal.student} ({proposal.rollNumber}) &bull; Supervisor: {proposal.supervisor}
                    </p>
                    <p className="text-muted small mb-0">Submitted: {proposal.submittedDate}</p>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Supervisor status */}
                    <div className="text-center">
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Supervisor</p>
                      <span className={`badge rounded-pill px-2 ${getStatusBadge(proposal.supervisorStatus)}`} style={{ fontSize: '0.7rem' }}>
                        {proposal.supervisorStatus}
                      </span>
                    </div>
                    {/* Coordinator status */}
                    <div className="text-center">
                      <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>Coordinator (You)</p>
                      <span className={`badge rounded-pill px-2 ${getStatusBadge(proposal.status)}`} style={{ fontSize: '0.7rem' }}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand / collapse details */}
                <button
                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none mb-3"
                  onClick={() => setExpandedId(expandedId === proposal.id ? null : proposal.id)}
                >
                  {expandedId === proposal.id ? '▲ Hide Details' : '▼ View Full Proposal'}
                </button>

                {expandedId === proposal.id && (
                  <div className="border rounded p-3 mb-3 bg-light">
                    <div className="mb-2">
                      <p className="fw-medium text-dark small mb-1">Description</p>
                      <p className="text-muted small mb-0">{proposal.description}</p>
                    </div>
                    <div className="mb-2">
                      <p className="fw-medium text-dark small mb-1">Objectives</p>
                      <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-line' }}>{proposal.objectives}</p>
                    </div>
                    <div className="mb-2">
                      <p className="fw-medium text-dark small mb-1">Methodology</p>
                      <p className="text-muted small mb-0">{proposal.methodology}</p>
                    </div>
                    {proposal.supervisorFeedback && (
                      <div className="alert alert-info py-2 px-3 mb-0">
                        <p className="fw-medium small mb-0">Supervisor Feedback: <span className="fw-normal">{proposal.supervisorFeedback}</span></p>
                      </div>
                    )}
                  </div>
                )}

                {/* Coordinator feedback (if reviewed) */}
                {proposal.feedback && (
                  <div className={`alert ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-3`}>
                    <p className="small mb-0">
                      <strong>Your Feedback:</strong> {proposal.feedback}
                    </p>
                  </div>
                )}

                {/* Action buttons — only for pending proposals */}
                {proposal.status === 'pending' && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm px-4 fw-medium"
                      onClick={() => openReview(proposal, 'approved')}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm px-4 fw-medium"
                      onClick={() => openReview(proposal, 'rejected')}
                    >
                      ✕ Reject
                    </button>
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
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {reviewDecision === 'approved' ? '✓ Approve Proposal' : '✕ Reject Proposal'}
                </h5>
                <button className="btn-close" onClick={() => setReviewModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted small mb-3">
                  You are about to <strong className={reviewDecision === 'approved' ? 'text-success' : 'text-danger'}>{reviewDecision}</strong> the proposal:
                  <br /><strong className="text-dark">"{reviewProposal?.title}"</strong>
                </p>
                <label className="form-label fw-medium text-dark small">
                  Feedback * <span className="text-muted fw-normal">(required)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={reviewDecision === 'approved'
                    ? 'e.g. Excellent proposal. You may proceed to the implementation phase.'
                    : 'e.g. Please revise the methodology section and resubmit.'
                  }
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
                <p className="text-muted small mt-2 mb-0">
                  ⚠ Your decision is final. The student will see this feedback.
                </p>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setReviewModal(false)}>Cancel</button>
                <button
                  className={`btn px-4 fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitReview}
                >
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

export default CoordinatorProposals;