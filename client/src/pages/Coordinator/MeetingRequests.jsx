// 📁 FILE: src/pages/Coordinator/MeetingRequests.jsx

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — MEETING REQUESTS
  Shows all meeting requests sent TO the coordinator by:
  - Students
  - Supervisors
  Coordinator can Accept or Reject with a response message.
  After approval → meeting automatically appears on the calendar.

  TODO (Backend): GET /api/coordinator/meetings/requests
  TODO (Backend): PUT /api/coordinator/meetings/:id/respond  { status, response }
*/

const CoordinatorMeetingRequests = () => {

  const [requests, setRequests] = useState([
    { id: 1, from: 'Muhammad Salman', role: 'Student',    title: 'Proposal Discussion',   date: '2024-05-05', time: '14:00', duration: 45, submittedDate: '2024-04-28', status: 'pending',  response: '' },
    { id: 2, from: 'Mr. Shoaib',      role: 'Supervisor', title: 'Progress Review Sync',  date: '2024-05-08', time: '10:00', duration: 30, submittedDate: '2024-04-27', status: 'pending',  response: '' },
    { id: 3, from: 'Ali Hassan',      role: 'Student',    title: 'Technical Discussion',  date: '2024-05-10', time: '11:00', duration: 60, submittedDate: '2024-04-25', status: 'approved', response: 'Confirmed. See you then.' },
    { id: 4, from: 'Sara Khan',       role: 'Student',    title: 'Document Submission',   date: '2024-05-03', time: '09:00', duration: 30, submittedDate: '2024-04-24', status: 'rejected', response: 'Please reschedule to next week.' },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  const [respondModal, setRespondModal] = useState(false);
  const [respondRequest, setRespondRequest] = useState(null);
  const [respondDecision, setRespondDecision] = useState('');
  const [respondMessage, setRespondMessage] = useState('');

  const filtered = requests.filter(r => filterStatus === 'all' ? true : r.status === filterStatus);

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const openRespond = (request, decision) => {
    setRespondRequest(request);
    setRespondDecision(decision);
    setRespondMessage('');
    setRespondModal(true);
  };

  const submitResponse = () => {
    if (!respondMessage.trim()) { alert('Please provide a response message.'); return; }
    // TODO (Backend): PUT /api/coordinator/meetings/:id/respond
    setRequests(prev =>
      prev.map(r => r.id === respondRequest.id ? { ...r, status: respondDecision, response: respondMessage } : r)
    );
    setRespondModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  const getRoleBadge = (role) => role === 'Student' ? 'bg-primary' : 'bg-info text-dark';

  return (
    <>
      <Breadcrumb pageName="Meeting Requests" />

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button key={status} onClick={() => setFilterStatus(status)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0 text-capitalize"
                style={{ color: filterStatus === status ? '#3c50e0' : '#6c757d', borderBottom: filterStatus === status ? '2px solid #3c50e0' : '2px solid transparent' }}
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

      {/* Requests List */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card shadow-sm border-0"><div className="card-body text-center py-5"><p className="text-muted mb-0">No meeting requests found.</p></div></div>
        ) : (
          filtered.map(req => (
            <div key={req.id} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">

                  {/* Left: request info */}
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className={`badge rounded-pill px-2 small ${getRoleBadge(req.role)}`}>{req.role}</span>
                      <h6 className="fw-semibold text-dark mb-0">{req.title}</h6>
                    </div>
                    <p className="text-muted small mb-1">From: <strong className="text-dark">{req.from}</strong></p>
                    <p className="text-muted small mb-1">Requested for: <strong className="text-dark">{req.date}</strong> at <strong className="text-dark">{req.time}</strong> ({req.duration} mins)</p>
                    <p className="text-muted small mb-0">Submitted on: {req.submittedDate}</p>
                  </div>

                  {/* Right: status badge */}
                  <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(req.status)}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>

                {/* Response box (shown after decision) */}
                {req.response && (
                  <div className={`alert ${req.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mt-3 mb-2`}>
                    <p className="small mb-0"><strong>Your Response:</strong> {req.response}</p>
                  </div>
                )}

                {/* Action buttons — only for pending */}
                {req.status === 'pending' && (
                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success btn-sm px-4 fw-medium" onClick={() => openRespond(req, 'approved')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm px-4 fw-medium"  onClick={() => openRespond(req, 'rejected')}>✕ Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Respond Modal */}
      {respondModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {respondDecision === 'approved' ? '✓ Approve Meeting' : '✕ Reject Meeting'}
                </h5>
                <button className="btn-close" onClick={() => setRespondModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted small mb-3">
                  Request from: <strong className="text-dark">{respondRequest?.from}</strong><br/>
                  Title: <strong className="text-dark">{respondRequest?.title}</strong><br/>
                  Date: <strong className="text-dark">{respondRequest?.date} at {respondRequest?.time}</strong>
                </p>
                <label className="form-label fw-medium text-dark small">Response Message *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={respondDecision === 'approved' ? 'e.g. Confirmed. See you then.' : 'e.g. Please reschedule to next week.'}
                  value={respondMessage}
                  onChange={(e) => setRespondMessage(e.target.value)}
                />
                {respondDecision === 'approved' && (
                  <p className="text-success small mt-2 mb-0">✓ This meeting will be added to the calendar automatically.</p>
                )}
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setRespondModal(false)}>Cancel</button>
                <button className={`btn px-4 fw-medium ${respondDecision === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={submitResponse}>
                  Confirm {respondDecision === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorMeetingRequests;