// 📁 FILE: src/pages/Announcements.jsx

import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

/*
  STUDENT — ANNOUNCEMENTS PAGE
  Read-only. Shows announcements posted by coordinator.
  TODO (Backend): GET /api/announcements
  Replace useState data with API call.
*/

const Announcements = () => {

  // TODO (Backend): Replace with API call
  const [announcements] = useState([
    {
      _id: '1',
      title: 'FYP Defense Schedule Released',
      content: 'The final FYP defense schedule has been released. All students are required to check their assigned date and time on the noticeboard. Dress code is formal.',
      postedBy: { name: 'Dr. Asadullah Ehsan (Coordinator)' },
      createdAt: '2024-04-25T10:30:00Z',
    },
    {
      _id: '2',
      title: 'Submission Deadline Reminder',
      content: 'All project documentation must be submitted by May 15, 2024. Late submissions will not be accepted without prior approval from the coordinator.',
      postedBy: { name: 'Dr. Asadullah Ehsan (Coordinator)' },
      createdAt: '2024-04-22T14:15:00Z',
    },
    {
      _id: '3',
      title: 'Supervisor Meeting Week',
      content: 'All students must have at least one supervisor meeting this week and get it logged in the system. Supervisors please update meeting statuses by Friday.',
      postedBy: { name: 'Dr. Asadullah Ehsan (Coordinator)' },
      createdAt: '2024-04-18T09:00:00Z',
    },
  ]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Breadcrumb pageName="Announcements" />

      <div className="mb-4">
        <h5 className="fw-semibold text-dark mb-1">Announcements</h5>
        <p className="text-muted small mb-0">Announcements from your Project Coordinator.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="mb-3" style={{ fontSize: '2.5rem' }}>📢</div>
            <h6 className="fw-semibold text-dark mb-1">No Announcements Yet</h6>
            <p className="text-muted small mb-0">Check back later.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((ann) => (
            <div key={ann._id} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h6 className="fw-semibold text-dark mb-2">{ann.title}</h6>
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '28px', height: '28px', minWidth: '28px', backgroundColor: '#3c50e0', fontSize: '0.7rem' }}
                  >
                    {ann.postedBy.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-muted small">
                    Posted by <strong className="text-dark">{ann.postedBy.name}</strong>
                  </span>
                  <span className="text-muted small">•</span>
                  <span className="text-muted small">{formatDate(ann.createdAt)}</span>
                </div>
                <p className="text-dark small mb-0" style={{ lineHeight: '1.7' }}>{ann.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default Announcements;