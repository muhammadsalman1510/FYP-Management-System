import React from 'react';

const MeetingRequests = () => {
  const meetingRequests = [
    {
      id: 1,
      title: 'Project Proposal Discussion',
      person: 'Mr. Shoaib (Supervisor)',
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
      person: 'Mr. Omer (Coordinator)',
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
      person: 'Mr. Shoaib (Supervisor)',
      date: '2024-02-20',
      time: '15:30',
      duration: 60,
      status: 'rejected',
      submittedDate: '2024-02-08',
      response: 'Please reschedule for next week. I have a conflict at this time.',
      responseDate: '2024-02-09',
    },
  ];

  /* Returns a Bootstrap badge class based on status */
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

  /* Returns Bootstrap alert class for the response box */
  const getResponseAlert = (status) => {
    return status === 'approved' ? 'alert-success' : 'alert-danger';
  };

  return (
    /* Single column layout */
    <div className="row g-4">
      <div className="col-12">
        <div className="card shadow-sm">

          {/* Card Header */}
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">My Meeting Requests</h5>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-4">

              {meetingRequests.map((request) => (
                <div key={request.id} className="border rounded p-4">

                  {/* Top row: title + status badge */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      {/* Meeting title */}
                      <h5 className="fw-semibold text-dark mb-1">{request.title}</h5>

                      {/* With whom */}
                      <p className="text-muted mb-1 small">
                        With: {request.person}
                      </p>

                      {/* Date, time, duration */}
                      <p className="text-muted mb-1 small">
                        Requested for: {request.date} at {request.time} ({request.duration} minutes)
                      </p>

                      {/* Submitted date */}
                      <p className="text-muted mb-0 small">
                        Submitted on: {request.submittedDate}
                      </p>
                    </div>

                    {/* Status badge pill */}
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  {/* Response box (shown only if there is a response) */}
                  {request.response && (
                    <div className={`alert ${getResponseAlert(request.status)} mt-3`}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        {/* Approval or rejection label */}
                        <span className="fw-semibold small">
                          {request.status === 'approved' ? 'Approval Message' : 'Rejection Reason'}
                        </span>
                        {/* Response date */}
                        {request.responseDate && (
                          <span className="small">
                            Responded on: {request.responseDate}
                          </span>
                        )}
                      </div>
                      <p className="mb-0 small">{request.response}</p>
                    </div>
                  )}

                  {/* Reschedule button - only shown for rejected meetings */}
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
  );
};

export default MeetingRequests;