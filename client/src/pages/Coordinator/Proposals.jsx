import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const CoordinatorProposals = () => {
  const [proposals, setProposals]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId]     = useState(null);
  const [reviewModal, setReviewModal]   = useState(false);
  const [reviewProposal, setReviewProposal] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/proposals', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load proposals');
        setProposals(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = proposals.filter((p) =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const counts = {
    all:      proposals.length,
    pending:  proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#28a74520', color: '#28a745' };
      case 'rejected': return { bg: '#dc354520', color: '#dc3545' };
      default:         return { bg: '#ffc10730', color: '#d39e00' };
    }
  };

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

  const openReview = (proposal, decision) => {
    setReviewProposal(proposal);
    setReviewDecision(decision);
    setReviewFeedback('');
    setSubmitError(null);
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewFeedback.trim()) {
      setSubmitError('Please provide feedback before submitting.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/proposals/${reviewProposal._id}/review`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewDecision, coordinatorFeedback: reviewFeedback }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Review failed');

      setProposals((prev) =>
        prev.map((p) => p._id === reviewProposal._id
          ? { ...p, status: reviewDecision, coordinatorFeedback: reviewFeedback }
          : p
        )
      );

      if (reviewDecision === 'approved') {
        const project = data.data;
        const supervisorLabel = reviewProposal.supervisorName || reviewProposal.supervisorEmail || 'the named supervisor';
        setReviewSuccessMsg(
          `Project "${project.title}" created successfully with ${project.students?.length || 0} student(s) and supervisor ${supervisorLabel} assigned.`
        );
      }

      setReviewModal(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <>
      <Breadcrumb pageName="Proposals" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="Proposals" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      {reviewSuccessMsg && (
        <div className="alert alert-success border-0 shadow-sm mb-4 small d-flex justify-content-between align-items-start gap-2">
          <span><strong>Success:</strong> {reviewSuccessMsg}</span>
          <button
            type="button"
            className="btn-close btn-sm flex-shrink-0"
            onClick={() => setReviewSuccessMsg(null)}
          />
        </div>
      )}

      <div className="alert alert-info border-0 shadow-sm mb-4 small">
        <strong>Auto-creation workflow:</strong> When you approve a proposal, the system automatically
        creates a project, adds all listed group members as students, and assigns the named supervisor.
        No manual project creation needed.
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((s) => {
              const badge = getStatusBadge(s);
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
                  style={{
                    color:        filterStatus === s ? '#3c50e0' : '#6c757d',
                    borderBottom: filterStatus === s ? '2px solid #3c50e0' : '2px solid transparent',
                    fontSize:     '0.875rem',
                    minWidth:     '100px',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span
                    className="badge ms-2 rounded-pill"
                    style={{
                      backgroundColor: s === 'all' ? '#6c757d20' : badge.bg,
                      color:           s === 'all' ? '#6c757d'   : badge.color,
                      fontSize:        '0.7rem',
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

      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No proposals found.</p>
            </div>
          </div>
        ) : (
          filtered.map((proposal) => {
            const badge = getStatusBadge(proposal.status);
            return (
              <div key={proposal._id} className="card shadow-sm border-0">
                <div className="card-body p-4">

                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                      <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                      <p className="text-muted small mb-0">
                        Submitted by: <strong className="text-dark">{proposal.submittedBy?.name || '—'}</strong>
                        &nbsp;&bull;&nbsp;{formatDate(proposal.submittedAt)}
                      </p>
                      <p className="text-muted small mb-0">
                        Group: <strong className="text-dark">{(proposal.groupMembers || []).length} student(s)</strong>
                        &nbsp;&bull;&nbsp;Supervisor: <strong className="text-dark">
                          {proposal.supervisorName || '—'}
                        </strong>
                      </p>
                      {proposal.projectId?.title && (
                        <p className="text-muted small mb-0">
                          Project: <strong className="text-dark">{proposal.projectId.title}</strong>
                        </p>
                      )}
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.78rem' }}
                    >
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </div>

                  <button
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none mb-3"
                    onClick={() => setExpandedId(expandedId === proposal._id ? null : proposal._id)}
                  >
                    {expandedId === proposal._id ? '▲ Hide Details' : '▼ View Full Proposal'}
                  </button>

                  {expandedId === proposal._id && (
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
                        <div className="col-12">
                          <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                          <p className="text-muted small mb-0">{proposal.techStack || '—'}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="fw-semibold text-dark small mb-2">Supervisor</p>
                        <div className="d-flex flex-wrap gap-4">
                          <div>
                            <span className="text-muted small">Name: </span>
                            <span className="small fw-medium text-dark">{proposal.supervisorName || '—'}</span>
                          </div>
                          <div>
                            <span className="text-muted small">Email: </span>
                            <span className="small fw-medium text-dark">{proposal.supervisorEmail || '—'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="fw-semibold text-dark small mb-2">
                          Group Members ({(proposal.groupMembers || []).length})
                        </p>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0 bg-white">
                            <thead className="table-light">
                              <tr>
                                <th className="small fw-semibold">#</th>
                                <th className="small fw-semibold">Name</th>
                                <th className="small fw-semibold">Roll No.</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(proposal.groupMembers || []).map((m, i) => (
                                <tr key={i}>
                                  <td className="small text-muted">{i + 1}</td>
                                  <td className="small fw-medium text-dark">{m.name}</td>
                                  <td className="small text-muted">{m.rollNumber}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="pt-3 border-top">
                        <p className="fw-semibold text-dark small mb-2">Supervisor Recommendation</p>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{ ...getRecStyle(proposal.supervisorRecommendation), fontSize: '0.78rem' }}
                          >
                            {getRecLabel(proposal.supervisorRecommendation)}
                          </span>
                          {proposal.supervisorReviewedAt && (
                            <span className="text-muted small">
                              — submitted {formatDate(proposal.supervisorReviewedAt)}
                            </span>
                          )}
                        </div>
                        {proposal.supervisorFeedback ? (
                          <p className="text-muted small mb-0">
                            <strong>Supervisor feedback:</strong> {proposal.supervisorFeedback}
                          </p>
                        ) : (
                          proposal.supervisorRecommendation === 'pending' && (
                            <p className="text-muted small mb-0" style={{ fontStyle: 'italic' }}>
                              The supervisor has not yet provided a recommendation.
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {proposal.coordinatorFeedback && (
                    <div className={`alert py-2 px-3 mb-3 ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'}`}>
                      <p className="small mb-0">
                        <strong>Your Feedback:</strong> {proposal.coordinatorFeedback}
                      </p>
                    </div>
                  )}

                  {proposal.status === 'pending' && (
                    <div className="d-flex gap-2">
                      <button className="btn btn-success btn-sm px-4 fw-medium" onClick={() => openReview(proposal, 'approved')}>✓ Approve</button>
                      <button className="btn btn-danger btn-sm px-4 fw-medium" onClick={() => openReview(proposal, 'rejected')}>✕ Reject</button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {reviewModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {reviewDecision === 'approved' ? '✓ Approve Proposal' : '✕ Reject Proposal'}
                </h5>
                <button className="btn-close" onClick={() => setReviewModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                {submitError && (
                  <div className="alert alert-danger border-0 py-2 px-3 mb-3 small">{submitError}</div>
                )}
                <div className="rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                  <p className="text-muted small mb-1">
                    Proposal: <strong className="text-dark">"{reviewProposal?.title}"</strong>
                  </p>
                  <p className="text-muted small mb-1">
                    Submitted by: <strong className="text-dark">{reviewProposal?.submittedBy?.name || '—'}</strong>
                  </p>
                  <p className="text-muted small mb-1">
                    Group: <strong className="text-dark">{(reviewProposal?.groupMembers || []).length} student(s)</strong>
                  </p>
                  <p className="text-muted small mb-1">
                    Supervisor: <strong className="text-dark">
                      {reviewProposal?.supervisorName || '—'}
                    </strong>
                    {reviewProposal?.supervisorEmail && (
                      <span className="text-muted ms-1">({reviewProposal.supervisorEmail})</span>
                    )}
                  </p>
                  <p className="text-muted small mb-0">
                    Supervisor Recommendation:&nbsp;
                    <span
                      className="badge rounded-pill px-2 py-1"
                      style={{ ...getRecStyle(reviewProposal?.supervisorRecommendation), fontSize: '0.7rem' }}
                    >
                      {getRecLabel(reviewProposal?.supervisorRecommendation)}
                    </span>
                    {reviewProposal?.supervisorFeedback && (
                      <span className="text-muted ms-1 small">— "{reviewProposal.supervisorFeedback}"</span>
                    )}
                  </p>
                </div>
                {reviewDecision === 'approved' && (
                  <div className="alert alert-info border-0 small mb-3">
                    Approving will <strong>automatically create the project</strong>, add the {(reviewProposal?.groupMembers || []).length} listed student(s), and assign <strong>{reviewProposal?.supervisorName || reviewProposal?.supervisorEmail || 'the named supervisor'}</strong>.
                    All roll numbers and the supervisor email will be validated before creation.
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
                  onChange={(e) => { setReviewFeedback(e.target.value); setSubmitError(null); }}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setReviewModal(false)}>Cancel</button>
                <button
                  className={`btn px-4 fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={submitReview}
                  disabled={submitting}
                >
                  {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" />}
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
