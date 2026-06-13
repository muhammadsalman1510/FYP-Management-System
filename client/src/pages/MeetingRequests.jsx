import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

// TODO (Backend): Replace meetingRequests with GET /api/meetings?submittedBy=me
// TODO (Backend): POST /api/meetings — submit new meeting request

const MeetingRequests = () => {

  const meetingRequests = [
    {
      id: 1,
      title: 'Project Proposal Discussion',
      person: 'Mr. Shoaib Ahmed (Supervisor)',
      date: '2024-02-15',
      time: '14:00',
      duration: 45,
      status: 'approved',
      submittedDate: '2024-02-10',
      response: 'Meeting approved. Please bring your project documentation.',
      responseDate: '2024-02-11',
    },
    {
      id: 2,
      title: 'Progress Review Meeting',
      person: 'Mr. Omer Farooq (Coordinator)',
      date: '2024-02-18',
      time: '11:00',
      duration: 30,
      status: 'pending',
      submittedDate: '2024-02-12',
      response: '',
      responseDate: '',
    },
    {
      id: 3,
      title: 'Technical Issues Discussion',
      person: 'Mr. Shoaib Ahmed (Supervisor)',
      date: '2024-02-20',
      time: '15:30',
      duration: 60,
      status: 'rejected',
      submittedDate: '2024-02-08',
      response: 'Please reschedule for next week. I have a conflict at this time.',
      responseDate: '2024-02-09',
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending':  return 'Pending Review';
      case 'rejected': return 'Rejected';
      default:         return 'Unknown';
    }
  };

  const getResponseAlert = (status) =>
    status === 'approved' ? 'alert-success' : 'alert-danger';

  // ── New Meeting Request modal state ──
  const [showModal, setShowModal]     = useState(false);
  const [meetWith, setMeetWith]       = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [topic, setTopic]             = useState('');
  const [modalErrors, setModalErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const openModal = () => {
    setMeetWith('');
    setProposedDate('');
    setProposedTime('');
    setTopic('');
    setModalErrors({});
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleModalSubmit = () => {
    const errors = {};
    if (!meetWith)             errors.meetWith      = 'Please select who to meet with.';
    if (!proposedDate)         errors.proposedDate  = 'Please select a date.';
    if (!proposedTime)         errors.proposedTime  = 'Please select a time.';
    if (!topic.trim())         errors.topic         = 'Please enter a topic or reason.';

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setModalErrors({});
    // TODO (Backend): POST /api/meetings — { meetWith, proposedDate, proposedTime, topic }
    setSubmitSuccess(true);
    setTimeout(() => { setSubmitSuccess(false); closeModal(); }, 1800);
  };

  return (
    <>
      <Breadcrumb pageName="Meeting Requests" />

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">

            {/* Card Header */}
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-semibold text-dark mb-0">My Meeting Requests</h5>
              <button
                className="btn btn-primary btn-sm px-3 fw-medium"
                onClick={openModal}
              >
                + New Meeting Request
              </button>
            </div>

            {/* Card Body */}
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-4">

                {meetingRequests.map((request) => (
                  <div key={request.id} className="border rounded p-4">

                    {/* Top row: title + status badge */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-semibold text-dark mb-1">{request.title}</h5>
                        <p className="text-muted mb-1 small">With: {request.person}</p>
                        <p className="text-muted mb-1 small">
                          Requested for: {request.date} at {request.time} ({request.duration} minutes)
                        </p>
                        <p className="text-muted mb-0 small">
                          Submitted on: {request.submittedDate}
                        </p>
                      </div>
                      <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    {/* Response box */}
                    {request.response && (
                      <div className={`alert ${getResponseAlert(request.status)} mt-3`}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold small">
                            {request.status === 'approved' ? 'Approval Message' : 'Rejection Reason'}
                          </span>
                          {request.responseDate && (
                            <span className="small">Responded on: {request.responseDate}</span>
                          )}
                        </div>
                        <p className="mb-0 small">{request.response}</p>
                      </div>
                    )}

                    {/* Reschedule button — rejected only */}
                    {request.status === 'rejected' && (
                      <div className="mt-3">
                        <button className="btn btn-primary btn-sm px-4">
                          Reschedule Meeting
                        </button>
                      </div>
                    )}

                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── New Meeting Request Modal ── */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">

              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">New Meeting Request</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body px-4 py-4">

                {submitSuccess && (
                  <div className="alert alert-success border-0 mb-3">
                    Meeting request submitted successfully!
                  </div>
                )}

                {/* Meet With */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Meet With *</label>
                  <select
                    className={`form-select ${modalErrors.meetWith ? 'is-invalid' : ''}`}
                    value={meetWith}
                    onChange={(e) => setMeetWith(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Coordinator">Coordinator</option>
                  </select>
                  {modalErrors.meetWith && (
                    <div className="invalid-feedback">{modalErrors.meetWith}</div>
                  )}
                </div>

                {/* Proposed Date */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Date *</label>
                  <input
                    type="date"
                    className={`form-control ${modalErrors.proposedDate ? 'is-invalid' : ''}`}
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                  />
                  {modalErrors.proposedDate && (
                    <div className="invalid-feedback">{modalErrors.proposedDate}</div>
                  )}
                </div>

                {/* Proposed Time */}
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark small">Proposed Time *</label>
                  <input
                    type="time"
                    className={`form-control ${modalErrors.proposedTime ? 'is-invalid' : ''}`}
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                  {modalErrors.proposedTime && (
                    <div className="invalid-feedback">{modalErrors.proposedTime}</div>
                  )}
                </div>

                {/* Topic / Reason */}
                <div className="mb-0">
                  <label className="form-label fw-medium text-dark small">Topic / Reason *</label>
                  <input
                    type="text"
                    className={`form-control ${modalErrors.topic ? 'is-invalid' : ''}`}
                    placeholder="e.g. Progress update discussion"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  {modalErrors.topic && (
                    <div className="invalid-feedback">{modalErrors.topic}</div>
                  )}
                </div>

              </div>

              <div className="modal-footer border-top px-4 py-3 gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4 fw-medium"
                  onClick={handleModalSubmit}
                >
                  Submit Request
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetingRequests;
