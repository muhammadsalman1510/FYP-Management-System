import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — ANNOUNCEMENTS
  Two sections:
  1. Post announcements to assigned students only
  2. View announcements posted by coordinator (read only)

  TODO (Backend):
    POST   /api/supervisor/announcements  { title, content }
    GET    /api/supervisor/announcements  (own announcements)
    DELETE /api/supervisor/announcements/:id
    GET    /api/coordinator/announcements (coordinator announcements - read only)
*/

const SupervisorAnnouncements = () => {

  const [activeTab, setActiveTab] = useState('post');

  // Supervisor's own announcements to their students
  const [myAnnouncements, setMyAnnouncements] = useState([
    {
      _id: '1',
      title: 'Weekly Progress Meeting Reminder',
      content: 'All students are reminded to prepare a brief progress update for our weekly meeting this Friday at 2 PM.',
      createdAt: '2024-04-24T10:00:00Z',
    },
    {
      _id: '2',
      title: 'Literature Review Submission',
      content: 'Please submit your literature review documents by end of this week. Make sure to follow the provided template.',
      createdAt: '2024-04-20T09:00:00Z',
    },
  ]);

  // Coordinator announcements — read only
  // TODO (Backend): GET /api/coordinator/announcements
  const coordinatorAnnouncements = [
    {
      _id: 'c1',
      title: 'FYP Defense Schedule Released',
      content: 'The final FYP defense schedule has been released. All students are required to check their assigned date and time.',
      postedBy: 'Mr. Omer Farooq (Coordinator)',
      createdAt: '2024-04-25T10:30:00Z',
    },
    {
      _id: 'c2',
      title: 'Submission Deadline Reminder',
      content: 'All project documentation must be submitted by May 15, 2024. Late submissions will not be accepted.',
      postedBy: 'Mr. Omer Farooq (Coordinator)',
      createdAt: '2024-04-22T14:15:00Z',
    },
  ];

  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState({ title: '', content: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    // TODO (Backend): POST /api/supervisor/announcements
    const now = new Date();
    const newAnn = {
      _id: Date.now().toString(),
      title: form.title,
      content: form.content,
      createdAt: now.toISOString(),
    };
    setMyAnnouncements(prev => [newAnn, ...prev]);
    setForm({ title: '', content: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    // TODO (Backend): DELETE /api/supervisor/announcements/:id
    setMyAnnouncements(prev => prev.filter(a => a._id !== id));
    setDeleteConfirm(null);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Breadcrumb pageName="Announcements" />

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            <button onClick={() => setActiveTab('post')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{ color: activeTab === 'post' ? '#3c50e0' : '#6c757d', borderBottom: activeTab === 'post' ? '2px solid #3c50e0' : '2px solid transparent' }}>
              My Announcements
              <span className="badge bg-primary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>{myAnnouncements.length}</span>
            </button>
            <button onClick={() => setActiveTab('coordinator')}
              className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
              style={{ color: activeTab === 'coordinator' ? '#3c50e0' : '#6c757d', borderBottom: activeTab === 'coordinator' ? '2px solid #3c50e0' : '2px solid transparent' }}>
              From Coordinator
              <span className="badge bg-secondary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>{coordinatorAnnouncements.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MY ANNOUNCEMENTS TAB */}
      {activeTab === 'post' && (
        <>
          {/* Header with post button */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
            <div>
              <h5 className="fw-semibold text-dark mb-0">My Announcements</h5>
              <p className="text-muted small mb-0">Visible to your assigned students only.</p>
            </div>
            <button className="btn btn-primary px-4 fw-medium" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Post Announcement'}
            </button>
          </div>

          {/* Create form */}
          {showForm && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">New Announcement</h6>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleCreate}>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark small">Title *</label>
                    <input type="text" className="form-control"
                      placeholder="e.g. Weekly Meeting Reminder"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                      required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark small">Content *</label>
                    <textarea className="form-control" rows={4}
                      placeholder="Write your announcement here..."
                      value={form.content}
                      onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                      required />
                  </div>
                  <div className="alert alert-info border-0 small py-2 mb-3">
                    <strong>Note:</strong> This announcement will be visible to your assigned students only.
                  </div>
                  <div className="d-flex gap-3">
                    <button type="submit" className="btn btn-primary px-5 fw-medium">Post</button>
                    <button type="button" className="btn btn-outline-secondary px-4"
                      onClick={() => { setShowForm(false); setForm({ title: '', content: '' }); }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My announcements list */}
          {myAnnouncements.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No announcements posted yet.</p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {myAnnouncements.map(ann => (
                <div key={ann._id} className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div className="flex-grow-1">
                        <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>
                        <p className="text-muted small mb-2">
                          Posted on {formatDate(ann.createdAt)} &bull;
                          <span className="badge bg-info text-dark ms-2 rounded-pill px-2" style={{ fontSize: '0.7rem' }}>My Students</span>
                        </p>
                        <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>{ann.content}</p>
                      </div>
                      <button className="btn btn-outline-danger btn-sm px-3 flex-shrink-0"
                        onClick={() => setDeleteConfirm(ann)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COORDINATOR ANNOUNCEMENTS TAB */}
      {activeTab === 'coordinator' && (
        <>
          <div className="mb-4">
            <h5 className="fw-semibold text-dark mb-0">Coordinator Announcements</h5>
            <p className="text-muted small mb-0">Read-only announcements from the project coordinator.</p>
          </div>

          {coordinatorAnnouncements.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">
                <p className="text-muted mb-0">No coordinator announcements.</p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {coordinatorAnnouncements.map(ann => (
                <div key={ann._id} className="card shadow-sm border-0">
                  <div className="card-body p-4">
                    <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>
                    <p className="text-muted small mb-2">
                      By {ann.postedBy} &bull; {formatDate(ann.createdAt)} &bull;
                      <span className="badge bg-primary ms-2 rounded-pill px-2" style={{ fontSize: '0.7rem' }}>All Users</span>
                    </p>
                    <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>{ann.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#dc354520' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc3545">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <h6 className="fw-semibold text-dark mb-2">Delete Announcement</h6>
                <p className="text-muted small mb-0">
                  Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
                </p>
              </div>
              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn btn-danger px-4 fw-medium" onClick={() => handleDelete(deleteConfirm._id)}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorAnnouncements;