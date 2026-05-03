// 📁 FILE: src/pages/Coordinator/Announcements.jsx
// PASTE THIS ENTIRE CODE into your empty Announcements.jsx file

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — ANNOUNCEMENTS
  - Create announcements visible to ALL users (students + supervisors)
  - View all posted announcements
  - Delete any announcement
  TODO (Backend): POST   /api/coordinator/announcements  { title, content }
  TODO (Backend): GET    /api/coordinator/announcements
  TODO (Backend): DELETE /api/coordinator/announcements/:id
*/

const CoordinatorAnnouncements = () => {

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'FYP Defense Schedule Released',
      content: 'The final FYP defense schedule has been released. All students are required to check their assigned date and time. Dress code is formal.',
      postedDate: '2024-04-25',
      postedTime: '10:30 AM',
    },
    {
      id: 2,
      title: 'Submission Deadline Reminder',
      content: 'All project documentation must be submitted by May 15, 2024. Late submissions will not be accepted without prior approval from the coordinator.',
      postedDate: '2024-04-22',
      postedTime: '02:15 PM',
    },
    {
      id: 3,
      title: 'Supervisor Meeting Week',
      content: 'All students must have at least one supervisor meeting this week and get it logged in the system. Supervisors please update meeting statuses by Friday.',
      postedDate: '2024-04-18',
      postedTime: '09:00 AM',
    },
  ]);

  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ title: '', content: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    // TODO (Backend): POST /api/coordinator/announcements
    const now = new Date();
    const newAnnouncement = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      postedDate: now.toISOString().split('T')[0],
      postedTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setForm({ title: '', content: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    // TODO (Backend): DELETE /api/coordinator/announcements/:id
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <>
      <Breadcrumb pageName="Announcements" />

      {/* Page header with Post button */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-semibold text-dark mb-0">Announcements</h5>
          <p className="text-muted small mb-0">
            Announcements are visible to all students and supervisors.
          </p>
        </div>
        <button
          className="btn btn-primary px-4 fw-medium"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Post Announcement'}
        </button>
      </div>

      {/* Create Announcement Form */}
      {showForm && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">New Announcement</h6>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreate}>

              {/* Title */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. FYP Defense Schedule Released"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Content */}
              <div className="mb-3">
                <label className="form-label fw-medium text-dark small">Content *</label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Write your announcement here..."
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-primary px-5 fw-medium">
                  Post Announcement
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => { setShowForm(false); setForm({ title: '', content: '' }); }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No announcements posted yet.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map(ann => (
            <div key={ann.id} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3">

                  <div className="flex-grow-1">
                    {/* Title */}
                    <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>

                    {/* Date + visible to badge */}
                    <p className="text-muted small mb-2">
                      Posted on {ann.postedDate} at {ann.postedTime}
                      &nbsp;&bull;&nbsp;
                      <span
                        className="badge bg-primary rounded-pill px-2"
                        style={{ fontSize: '0.7rem' }}
                      >
                        All Users
                      </span>
                    </p>

                    {/* Content */}
                    <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
                      {ann.content}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    className="btn btn-outline-danger btn-sm px-3 flex-shrink-0"
                    onClick={() => setDeleteConfirm(ann)}
                  >
                    Delete
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '420px' }}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">

                {/* Warning icon */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#dc354520' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc3545">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>

                <h6 className="fw-semibold text-dark mb-2">Delete Announcement</h6>
                <p className="text-muted small mb-0">
                  Are you sure you want to delete{' '}
                  <strong>"{deleteConfirm.title}"</strong>?
                  This cannot be undone.
                </p>
              </div>

              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-4 fw-medium"
                  onClick={() => handleDelete(deleteConfirm.id)}
                >
                  Yes, Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default CoordinatorAnnouncements;