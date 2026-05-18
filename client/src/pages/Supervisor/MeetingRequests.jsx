import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — MEETING REQUESTS
  Two sections:
  1. Requests FROM students → Supervisor can approve or reject
  2. Request TO Coordinator → Supervisor can request a meeting with coordinator

  TODO (Backend):
    GET /api/supervisor/meetings/requests         — incoming requests from students
    PUT /api/supervisor/meetings/:id/respond      — approve/reject student request
    POST /api/supervisor/meetings/request-coordinator — request meeting with coordinator
*/

const SupervisorMeetingRequests = () => {

  const [activeTab, setActiveTab] = useState('incoming');

  // Requests FROM students to this supervisor
  const [incomingRequests, setIncomingRequests] = useState([
    { id: 1, from: 'Muhammad Salman', rollNumber: 'F2021001001', title: 'Proposal Discussion',  date: '2024-05-05', time: '14:00', duration: 45, submittedDate: '2024-04-28', status: 'pending',  response: '' },
    { id: 2, from: 'Ali Hassan',      rollNumber: 'F2021001002', title: 'Technical Help',        date: '2024-05-08', time: '10:00', duration: 30, submittedDate: '2024-04-27', status: 'pending',  response: '' },
    { id: 3, from: 'Sara Khan',       rollNumber: 'F2021001003', title: 'Progress Review',       date: '2024-05-10', time: '11:00', duration: 60, submittedDate: '2024-04-25', status: 'approved', response: 'Confirmed. Please bring your progress report.' },
    { id: 4, from: 'Ahmed Raza',      rollNumber: 'F2021001004', title: 'Proposal Revision',     date: '2024-05-03', time: '09:00', duration: 30, submittedDate: '2024-04-24', status: 'rejected', response: 'Please reschedule to next week.' },
  ]);

  // Form for requesting meeting WITH coordinator
  const [coordinatorForm, setCoordinatorForm] = useState({
    title: '', date: '', startTime: '', endTime: '', description: ''
  });
  const [coordinatorRequestSent, setCoordinatorRequestSent] = useState(false);

  // Respond modal state
  const [respondModal, setRespondModal]       = useState(false);
  const [respondRequest, setRespondRequest]   = useState(null);
  const [respondDecision, setRespondDecision] = useState('');
  const [respondMessage, setRespondMessage]   = useState('');

  const counts = {
    pending:  incomingRequests.filter(r => r.status === 'pending').length,
    approved: incomingRequests.filter(r => r.status === 'approved').length,
    rejected: incomingRequests.filter(r => r.status === 'rejected').length,
  };

  const openRespond = (request, decision) => {
    setRespondRequest(request);
    setRespondDecision(decision);
    setRespondMessage('');
    setRespondModal(true);
  };

  const submitResponse = () => {
    if (!respondMessage.trim()) { alert('Please provide a response message.'); return; }
    // TODO (Backend): PUT /api/supervisor/meetings/:id/respond
    setIncomingRequests(prev =>
      prev.map(r => r.id === respondRequest.id ? { ...r, status: respondDecision, response: respondMessage } : r)
    );
    setRespondModal(false);
  };

  const handleCoordinatorFormChange = (e) => {
    const { name, value } = e.target;
    setCoordinatorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordinatorRequest = (e) => {
    e.preventDefault();
    // TODO (Backend): POST /api/supervisor/meetings/request-coordinator
    setCoordinatorRequestSent(true);
    setCoordinatorForm({ title: '', date: '', startTime: '', endTime: '', description: '' });
    setTimeout(() => setCoordinatorRequestSent(false), 4000);
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
      <Breadcrumb pageName="Meeting Requests" />

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            <button onClick={() => setActiveTab('incoming')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{ color: activeTab === 'incoming' ? '#3c50e0' : '#6c757d', borderBottom: activeTab === 'incoming' ? '2px solid #3c50e0' : '2px solid transparent' }}>
              From Students
              {counts.pending > 0 && (
                <span className="badge bg-warning text-dark ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>{counts.pending}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('outgoing')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{ color: activeTab === 'outgoing' ? '#3c50e0' : '#6c757d', borderBottom: activeTab === 'outgoing' ? '2px solid #3c50e0' : '2px solid transparent' }}>
              Request Coordinator Meeting
            </button>
          </div>
        </div>
      </div>

      {/* INCOMING REQUESTS FROM STUDENTS */}
      {activeTab === 'incoming' && (
        <div className="d-flex flex-column gap-3">
          {incomingRequests.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No meeting requests from students.</p>
              </div>
            </div>
          ) : (
            incomingRequests.map(req => (
              <div key={req.id} className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1">
                      <h6 className="fw-semibold text-dark mb-1">{req.title}</h6>
                      <p className="text-muted small mb-1">
                        From: <strong className="text-dark">{req.from}</strong> ({req.rollNumber})
                      </p>
                      <p className="text-muted small mb-1">
                        Requested for: <strong className="text-dark">{req.date}</strong> at <strong className="text-dark">{req.time}</strong> ({req.duration} mins)
                      </p>
                      <p className="text-muted small mb-0">Submitted on: {req.submittedDate}</p>
                    </div>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(req.status)}`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  {req.response && (
                    <div className={`alert ${req.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mt-3 mb-2`}>
                      <p className="small mb-0"><strong>Your Response:</strong> {req.response}</p>
                    </div>
                  )}

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
      )}

      {/* REQUEST MEETING WITH COORDINATOR */}
      {activeTab === 'outgoing' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Request Meeting with Coordinator</h5>
            <p className="text-muted small mb-0 mt-1">
              The coordinator will approve or reject your request.
            </p>
          </div>
          <div className="card-body p-4">

            {coordinatorRequestSent && (
              <div className="alert alert-success border-0 mb-4">
                <strong>Request Sent!</strong> The coordinator will respond to your meeting request.
              </div>
            )}

            <form onSubmit={handleCoordinatorRequest}>
              <div className="row g-3">

                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Meeting Title *</label>
                  <input type="text" name="title" value={coordinatorForm.title} onChange={handleCoordinatorFormChange}
                    className="form-control" placeholder="e.g. FYP Progress Discussion" required />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-dark small">Preferred Date *</label>
                  <input type="date" name="date" value={coordinatorForm.date} onChange={handleCoordinatorFormChange}
                    className="form-control" required />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-dark small">Start Time *</label>
                  <input type="time" name="startTime" value={coordinatorForm.startTime} onChange={handleCoordinatorFormChange}
                    className="form-control" required />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-medium text-dark small">End Time *</label>
                  <input type="time" name="endTime" value={coordinatorForm.endTime} onChange={handleCoordinatorFormChange}
                    className="form-control" required />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Description / Agenda <span className="text-muted fw-normal">(Optional)</span></label>
                  <textarea name="description" value={coordinatorForm.description} onChange={handleCoordinatorFormChange}
                    rows={3} className="form-control" placeholder="What would you like to discuss?" />
                </div>

                <div className="col-12 d-flex gap-3 mt-2">
                  <button type="submit" className="btn btn-primary px-5 fw-medium">Send Request</button>
                  <button type="button" className="btn btn-outline-secondary px-4"
                    onClick={() => setCoordinatorForm({ title: '', date: '', startTime: '', endTime: '', description: '' })}>
                    Clear
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

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
                  From: <strong className="text-dark">{respondRequest?.from}</strong><br/>
                  Title: <strong className="text-dark">{respondRequest?.title}</strong><br/>
                  Date: <strong className="text-dark">{respondRequest?.date} at {respondRequest?.time}</strong>
                </p>
                <label className="form-label fw-medium text-dark small">Response Message *</label>
                <textarea className="form-control" rows={3}
                  placeholder={respondDecision === 'approved' ? 'e.g. Confirmed. See you then.' : 'e.g. I am unavailable. Please reschedule.'}
                  value={respondMessage}
                  onChange={(e) => setRespondMessage(e.target.value)}
                />
                {respondDecision === 'approved' && (
                  <p className="text-success small mt-2 mb-0">✓ This meeting will be added to the calendar.</p>
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

export default SupervisorMeetingRequests;