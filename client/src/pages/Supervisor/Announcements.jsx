import React from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — ANNOUNCEMENTS
  View-only page. Supervisors can only read announcements posted by the coordinator.
  Supervisors cannot post, edit, or delete announcements.
  TODO (Backend): GET /api/announcements — coordinator announcements only
*/

const SupervisorAnnouncements = () => {

  // TODO (Backend): Replace with GET /api/announcements
  const announcements = [
    {
      _id: 'c1',
      title: 'FYP Defense Schedule Released',
      content: 'The final FYP defense schedule has been released. All students and supervisors are required to check their assigned date and time on the university portal.',
      postedBy: 'FYP Coordinator',
      createdAt: '2024-04-25T10:30:00Z',
    },
    {
      _id: 'c2',
      title: 'Submission Deadline Reminder',
      content: 'All project documentation must be submitted by May 15, 2024. Late submissions will not be accepted. Please ensure all required documents are uploaded to the system.',
      postedBy: 'FYP Coordinator',
      createdAt: '2024-04-22T14:15:00Z',
    },
    {
      _id: 'c3',
      title: 'Mid-Evaluation Marks Uploaded',
      content: 'Mid-evaluation marks have been uploaded to the student portal. Supervisors are requested to verify the marks for their assigned projects by April 30, 2024.',
      postedBy: 'FYP Coordinator',
      createdAt: '2024-04-18T09:00:00Z',
    },
  ];

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <>
      <Breadcrumb pageName="Announcements" />

      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-semibold text-dark mb-0">Coordinator Announcements</h5>
          <p className="text-muted small mb-0">Announcements posted by the FYP coordinator.</p>
        </div>
        <span
          className="badge rounded-pill px-3 py-2"
          style={{ backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: '0.75rem' }}
        >
          Read Only
        </span>
      </div>

      {/* Announcement list */}
      {announcements.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No announcements at this time.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((ann) => (
            <div key={ann._id} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex align-items-start gap-3">
                  {/* Icon */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#3c50e0' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>
                    <p className="text-muted small mb-2">
                      By <strong className="text-dark">{ann.postedBy}</strong>
                      &nbsp;&bull;&nbsp;
                      {formatDate(ann.createdAt)}
                      <span
                        className="badge bg-primary ms-2 rounded-pill px-2"
                        style={{ fontSize: '0.68rem' }}
                      >
                        All Users
                      </span>
                    </p>
                    <p className="text-dark small mb-0" style={{ lineHeight: '1.7' }}>
                      {ann.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default SupervisorAnnouncements;
