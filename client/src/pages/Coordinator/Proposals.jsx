import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROPOSALS REVIEW
  Proposals are submitted directly by students to the coordinator.
  Coordinator approves or rejects with feedback. Decision is final.
  On approval → coordinator creates a project and adds the listed group members.

  TODO (Backend): GET /api/proposals
  TODO (Backend): PUT /api/proposals/:id/review { status, feedback }
*/

// TODO (Backend): Replace with GET /api/proposals
const INITIAL_PROPOSALS = [
  {
    id: 1,
    submittedBy: 'Muhammad Salman',
    rollNumber: 'F2021001001',
    title: 'FYP Management & Tracking System',
    description: 'A web-based system to manage and track Final Year Projects across all three roles — student, supervisor, and coordinator — using the MERN stack.',
    problemStatement: 'Universities lack a unified digital platform for managing FYP workflows, leading to miscommunication, missed deadlines, and poor progress tracking.',
    stack: 'React.js, Node.js, Express.js, MongoDB',
    expectedOutcome: 'A fully functional multi-role web application that streamlines FYP management.',
    submittedDate: '2024-04-25',
    status: 'pending',
    feedback: '',
    groupMembers: [
      { name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7', section: 'A' },
      { name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7', section: 'A' },
    ],
  },
  {
    id: 2,
    submittedBy: 'Sara Khan',
    rollNumber: 'F2021001003',
    title: 'Hospital Management System',
    description: 'A complete hospital management system for patient records, doctor scheduling, and appointment booking.',
    problemStatement: 'Manual hospital record-keeping is error-prone and inefficient, causing delays in patient care.',
    stack: 'React.js, Node.js, MySQL',
    expectedOutcome: 'A digital hospital management platform used by doctors, admins, and receptionists.',
    submittedDate: '2024-04-23',
    status: 'approved',
    feedback: 'Excellent proposal with clear scope. Proceed to project creation and team assignment.',
    groupMembers: [
      { name: 'Sara Khan',    rollNumber: 'F2021001003', program: 'BSCS', semester: '7', section: 'B' },
      { name: 'Ahmed Raza',  rollNumber: 'F2021001004', program: 'BSCS', semester: '7', section: 'B' },
      { name: 'Fatima Tariq', rollNumber: 'F2021001005', program: 'BSCS', semester: '7', section: 'B' },
    ],
  },
  {
    id: 3,
    submittedBy: 'Bilal Khan',
    rollNumber: 'F2021002001',
    title: 'Blockchain-Based Voting System',
    description: 'A decentralized voting system using blockchain technology to ensure transparency and prevent fraud.',
    problemStatement: 'Traditional voting systems are vulnerable to fraud and lack transparency.',
    stack: 'React.js, Solidity, Ethereum, Web3.js',
    expectedOutcome: 'A secure, transparent, and tamper-proof online voting platform.',
    submittedDate: '2024-04-20',
    status: 'rejected',
    feedback: 'Blockchain scope is too broad for a single semester. Please revise to a more focused deliverable, or consider switching to a conventional web stack.',
    groupMembers: [
      { name: 'Bilal Khan',  rollNumber: 'F2021002001', program: 'BSCS', semester: '7', section: 'C' },
      { name: 'Zara Malik',  rollNumber: 'F2021002002', program: 'BSCS', semester: '7', section: 'C' },
    ],
  },
];

const CoordinatorProposals = () => {
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);

  const [filterStatus,    setFilterStatus]    = useState('all');
  const [expandedId,      setExpandedId]      = useState(null);
  const [reviewModal,     setReviewModal]     = useState(false);
  const [reviewProposal,  setReviewProposal]  = useState(null);
  const [reviewDecision,  setReviewDecision]  = useState('');
  const [reviewFeedback,  setReviewFeedback]  = useState('');

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
    if (!reviewFeedback.trim()) { alert('Please provide feedback before submitting.'); return; }
    // TODO (Backend): PUT /api/proposals/:id/review { status, feedback }
    // On approval: milestone 1 of the linked project auto-completes
    setProposals(prev =>
      prev.map(p => p.id === reviewProposal.id
        ? { ...p, status: reviewDecision, feedback: reviewFeedback }
        : p
      )
    );
    setReviewModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#28a74520', color: '#28a745' };
      case 'rejected': return { bg: '#dc354520', color: '#dc3545' };
      default:         return { bg: '#ffc10730', color: '#d39e00' };
    }
  };

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      {/* Info Banner */}
      <div className="alert alert-info border-0 shadow-sm mb-4 small">
        <strong>Direct Flow:</strong> Proposals are submitted directly by students to you.
        After approving, go to <strong>Manage Projects</strong> to create a project and add the listed group members.
      </div>

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map(s => {
              const badge = getStatusBadge(s);
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
                  style={{
                    color: filterStatus === s ? '#3c50e0' : '#6c757d',
                    borderBottom: filterStatus === s ? '2px solid #3c50e0' : '2px solid transparent',
                    fontSize: '0.875rem',
                    minWidth: '100px',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span
                    className="badge ms-2 rounded-pill"
                    style={{
                      backgroundColor: s === 'all' ? '#6c757d20' : badge.bg,
                      color: s === 'all' ? '#6c757d' : badge.color,
                      fontSize: '0.7rem',
                    }}
                  >
                    {counts[s]}
                  </span>
                </button>
              );
            })}
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
          filtered.map(proposal => {
            const badge = getStatusBadge(proposal.status);
            return (
              <div key={proposal.id} className="card shadow-sm border-0">
                <div className="card-body p-4">

                  {/* Top row */}
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                      <p className="text-muted small mb-0">
                        Submitted by: <strong className="text-dark">{proposal.submittedBy}</strong>
                        &nbsp;({proposal.rollNumber}) &bull; {proposal.submittedDate}
                      </p>
                      <p className="text-muted small mb-0">
                        Group size: <strong className="text-dark">{proposal.groupMembers.length} students</strong>
                      </p>
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.78rem' }}
                    >
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>

                  {/* Expand toggle */}
                  <button
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none mb-3"
                    onClick={() => setExpandedId(expandedId === proposal.id ? null : proposal.id)}
                  >
                    {expandedId === proposal.id ? '▲ Hide Details' : '▼ View Full Proposal'}
                  </button>

                  {/* Expanded details */}
                  {expandedId === proposal.id && (
                    <div className="border rounded p-3 mb-3 bg-light">

                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <p className="fw-semibold text-dark small mb-1">Description</p>
                          <p className="text-muted small mb-0">{proposal.description}</p>
                        </div>
                        <div className="col-12">
                          <p className="fw-semibold text-dark small mb-1">Problem Statement</p>
                          <p className="text-muted small mb-0">{proposal.problemStatement}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                          <p className="text-muted small mb-0">{proposal.stack}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p className="fw-semibold text-dark small mb-1">Expected Outcome</p>
                          <p className="text-muted small mb-0">{proposal.expectedOutcome}</p>
                        </div>
                      </div>

                      {/* Group Members Table */}
                      <div>
                        <p className="fw-semibold text-dark small mb-2">
                          Group Members ({proposal.groupMembers.length})
                        </p>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0 bg-white">
                            <thead className="table-light">
                              <tr>
                                <th className="small fw-semibold">#</th>
                                <th className="small fw-semibold">Name</th>
                                <th className="small fw-semibold">Roll No.</th>
                                <th className="small fw-semibold">Program</th>
                                <th className="small fw-semibold">Semester</th>
                                <th className="small fw-semibold">Section</th>
                              </tr>
                            </thead>
                            <tbody>
                              {proposal.groupMembers.map((m, i) => (
                                <tr key={i}>
                                  <td className="small text-muted">{i + 1}</td>
                                  <td className="small fw-medium text-dark">{m.name}</td>
                                  <td className="small text-muted">{m.rollNumber}</td>
                                  <td className="small text-muted">{m.program}</td>
                                  <td className="small text-muted">{m.semester}</td>
                                  <td className="small text-muted">{m.section}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {proposal.status === 'pending' && (
                          <div className="alert alert-warning border-0 mt-3 mb-0 small">
                            After approving, go to <strong>Manage Projects</strong> to create a project
                            and add these {proposal.groupMembers.length} students.
                          </div>
                        )}
                        {proposal.status === 'approved' && (
                          <div className="alert alert-success border-0 mt-3 mb-0 small">
                            Approved. Make sure this group is added to a project in <strong>Manage Projects</strong>.
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* Feedback box */}
                  {proposal.feedback && (
                    <div
                      className={`alert py-2 px-3 mb-3 ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'}`}
                    >
                      <p className="small mb-0">
                        <strong>Your Feedback:</strong> {proposal.feedback}
                      </p>
                    </div>
                  )}

                  {/* Action buttons — only for pending */}
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
            );
          })
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
                <div
                  className="rounded p-3 mb-3"
                  style={{ backgroundColor: '#f8f9fa' }}
                >
                  <p className="text-muted small mb-1">
                    Proposal: <strong className="text-dark">"{reviewProposal?.title}"</strong>
                  </p>
                  <p className="text-muted small mb-1">
                    Submitted by: <strong className="text-dark">{reviewProposal?.submittedBy}</strong>
                  </p>
                  <p className="text-muted small mb-0">
                    Group size: <strong className="text-dark">{reviewProposal?.groupMembers.length} students</strong>
                  </p>
                </div>
                {reviewDecision === 'approved' && (
                  <div className="alert alert-info border-0 small mb-3">
                    After approving, go to <strong>Manage Projects</strong> to create the project
                    and assign these students and a supervisor.
                  </div>
                )}
                <label className="form-label fw-medium text-dark small">
                  Feedback <span className="text-danger">*</span>
                  <span className="text-muted fw-normal ms-1">(required)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder={
                    reviewDecision === 'approved'
                      ? 'e.g. Good proposal. You may proceed with implementation.'
                      : 'e.g. Please revise your problem statement and narrow the scope.'
                  }
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4"
                  onClick={() => setReviewModal(false)}>Cancel</button>
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
