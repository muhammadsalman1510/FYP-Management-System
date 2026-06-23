import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SupervisorProposals = () => {
  const [proposals, setProposals]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId]     = useState(null);

  // changingRec tracks which proposal IDs are in "change recommendation" mode
  const [changingRec, setChangingRec] = useState({});

  // Recommendation form state (for whichever proposal is currently expanded)
  const [recFeedback,   setRecFeedback]   = useState('');
  const [recSubmitting, setRecSubmitting] = useState(false);
  const [recError,      setRecError]      = useState(null);
  const [recSuccess,    setRecSuccess]    = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
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
    fetchProposals();
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setRecFeedback('');
      setRecError(null);
      setRecSuccess(null);
    }
  };

  const submitRecommendation = async (proposal, decision) => {
    setRecSubmitting(true);
    setRecError(null);
    setRecSuccess(null);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`/api/proposals/${proposal._id}/supervisor-review`, {
        method:  'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendation: decision, feedback: recFeedback }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit recommendation');

      setProposals((prev) =>
        prev.map((p) => p._id === proposal._id
          ? { ...p, supervisorRecommendation: decision, supervisorFeedback: recFeedback, supervisorReviewedAt: new Date().toISOString() }
          : p
        )
      );
      setRecFeedback('');
      setRecSuccess('Your recommendation has been saved.');
      // Exit change mode so the success view shows
      setChangingRec((prev) => ({ ...prev, [proposal._id]: false }));
    } catch (err) {
      setRecError(err.message);
    } finally {
      setRecSubmitting(false);
    }
  };

  const filtered = proposals.filter((p) =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const counts = {
    all:      proposals.length,
    pending:  proposals.filter((p) => p.status === 'pending').length,
    approved: proposals.filter((p) => p.status === 'approved').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  };

  const getStatusStyle = (status) => {
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
      case 'approved': return 'You Recommended: Approved';
      case 'rejected': return 'You Recommended: Rejected';
      default:         return 'Your Rec: Pending';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Proposals" />
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Proposals" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      <div className="alert alert-info border-0 shadow-sm mb-4 small">
        <strong>Your role on proposals:</strong> You can submit a non-binding recommendation (Approve or Reject)
        on proposals that name you as the intended supervisor, while the coordinator has not yet made their final decision.
        The coordinator's decision is final — your recommendation is advisory only.
      </div>

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((s) => {
              const style = getStatusStyle(s);
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
                      backgroundColor: s === 'all' ? '#6c757d20' : style.bg,
                      color:           s === 'all' ? '#6c757d'   : style.color,
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

      {/* Proposals List */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No proposals found.</p>
            </div>
          </div>
        ) : (
          filtered.map((proposal) => {
            const style           = getStatusStyle(proposal.status);
            const submittedByName = proposal.submittedBy?.name || '—';
            const isExpanded      = expandedId === proposal._id;
            const hasSubmittedRec = proposal.supervisorRecommendation === 'approved' || proposal.supervisorRecommendation === 'rejected';
            const isChangingThisRec = changingRec[proposal._id] === true;

            return (
              <div key={proposal._id} className="card shadow-sm border-0">
                <div className="card-body p-4">

                  {/* Top row */}
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
                    <div>
                      <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                      <p className="text-muted small mb-0">
                        Submitted by: <strong className="text-dark">{submittedByName}</strong>
                        &nbsp;&bull;&nbsp;Group: <strong className="text-dark">{proposal.groupMembers?.length || 0} student(s)</strong>
                        &nbsp;&bull;&nbsp;{formatDate(proposal.submittedAt)}
                      </p>
                      {proposal.projectId?.title && (
                        <p className="text-muted small mb-0">
                          Project: <strong className="text-dark">{proposal.projectId.title}</strong>
                        </p>
                      )}
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ backgroundColor: style.bg, color: style.color, fontSize: '0.78rem' }}
                      >
                        {proposal.status === 'pending'
                          ? 'Pending Coordinator Review'
                          : proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ ...getRecStyle(proposal.supervisorRecommendation), fontSize: '0.72rem' }}
                      >
                        {getRecLabel(proposal.supervisorRecommendation)}
                      </span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none mt-2 mb-3"
                    onClick={() => toggleExpand(proposal._id)}
                  >
                    {isExpanded ? '▲ Hide Details' : '▼ View Full Proposal'}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
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
                        {proposal.techStack && (
                          <div className="col-12">
                            <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                            <p className="text-muted small mb-0">{proposal.techStack}</p>
                          </div>
                        )}
                      </div>

                      {/* Named Supervisor */}
                      <div className="mb-3">
                        <p className="fw-semibold text-dark small mb-2">Named Supervisor</p>
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

                      {/* Group Members */}
                      {proposal.groupMembers && proposal.groupMembers.length > 0 && (
                        <div className="mb-3">
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
                                </tr>
                              </thead>
                              <tbody>
                                {proposal.groupMembers.map((m, i) => (
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
                      )}

                      {/* ── Supervisor Recommendation Section ── */}
                      <div className="pt-3 border-top mt-1">
                        <p className="fw-semibold text-dark small mb-2">Your Recommendation</p>

                        {proposal.status !== 'pending' ? (
                          <div className="alert alert-secondary border-0 py-2 px-3 small mb-0">
                            This proposal has been finalized by the coordinator
                            ({proposal.status === 'approved' ? 'Approved' : 'Rejected'}).
                            No further recommendations can be submitted.
                          </div>
                        ) : hasSubmittedRec && !isChangingThisRec ? (
                          // Recommendation already submitted — show success view
                          <>
                            <div className="alert alert-success border-0 py-2 px-3 small mb-2">
                              Your recommendation has been saved.
                            </div>
                            <button
                              className="btn btn-link btn-sm p-0 text-primary text-decoration-none small"
                              onClick={() => {
                                setChangingRec((prev) => ({ ...prev, [proposal._id]: true }));
                                setRecFeedback(proposal.supervisorFeedback || '');
                                setRecError(null);
                                setRecSuccess(null);
                              }}
                            >
                              Change Recommendation
                            </button>
                          </>
                        ) : (
                          // Show form + buttons
                          <>
                            <p className="text-muted small mb-3" style={{ fontStyle: 'italic' }}>
                              This is a recommendation for the coordinator. The coordinator's decision is final
                              and will not be overridden by your recommendation.
                            </p>

                            {recError && (
                              <div className="alert alert-danger border-0 py-2 px-3 small mb-2">{recError}</div>
                            )}

                            <label className="form-label fw-medium text-dark small mb-1">
                              Feedback for coordinator
                              <span className="text-muted fw-normal ms-1">(optional)</span>
                            </label>
                            <textarea
                              className="form-control form-control-sm mb-3"
                              rows={2}
                              placeholder="e.g. The topic is relevant but scope needs narrowing."
                              value={recFeedback}
                              onChange={(e) => { setRecFeedback(e.target.value); setRecError(null); }}
                            />

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm px-4 fw-medium"
                                onClick={() => submitRecommendation(proposal, 'approved')}
                                disabled={recSubmitting}
                              >
                                {recSubmitting && <span className="spinner-border spinner-border-sm me-1" role="status" />}
                                Recommend Approval
                              </button>
                              <button
                                className="btn btn-danger btn-sm px-4 fw-medium"
                                onClick={() => submitRecommendation(proposal, 'rejected')}
                                disabled={recSubmitting}
                              >
                                {recSubmitting && <span className="spinner-border spinner-border-sm me-1" role="status" />}
                                Recommend Rejection
                              </button>
                              {isChangingThisRec && (
                                <button
                                  className="btn btn-outline-secondary btn-sm px-3"
                                  onClick={() => setChangingRec((prev) => ({ ...prev, [proposal._id]: false }))}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coordinator feedback */}
                  {proposal.coordinatorFeedback && (
                    <div
                      className={`alert py-2 px-3 mb-0 ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'}`}
                    >
                      <p className="small mb-0">
                        <strong>Coordinator Feedback:</strong> {proposal.coordinatorFeedback}
                      </p>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default SupervisorProposals;
