import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

// coordinator posts announcements for everyone to see
// there's no delete endpoint in the backend so that button is gone

const CoordinatorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  // grab whatever's been posted so far
  useEffect(() => {
    const load = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/announcements', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load announcements');
        setAnnouncements(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setPostError('Title and content are both required.');
      return;
    }
    setPosting(true);
    setPostError(null);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to post');

      setAnnouncements((prev) => [data.data, ...prev]);
      setForm({ title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <>
      <Breadcrumb pageName="Announcements" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="Announcements" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  return (
    <>
      <Breadcrumb pageName="Announcements" />

      {/* header + post button */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-semibold text-dark mb-0">Announcements</h5>
          <p className="text-muted small mb-0">
            Announcements are visible to all students and supervisors.
          </p>
        </div>
        <button
          className="btn btn-primary px-4 fw-medium"
          onClick={() => {
            setShowForm(!showForm);
            setPostError(null);
            setForm({ title: '', content: '' });
          }}
        >
          {showForm ? 'Cancel' : '+ Post Announcement'}
        </button>
      </div>

      {/* create form */}
      {showForm && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">New Announcement</h6>
          </div>
          <div className="card-body p-4">
            {postError && (
              <div className="alert alert-danger border-0 py-2 px-3 mb-3" style={{ fontSize: '0.875rem' }}>
                {postError}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-medium text-dark small">Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. FYP Defense Schedule Released"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-medium text-dark small">Content *</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Write your announcement here..."
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-3">
              <button
                className="btn btn-primary px-5 fw-medium"
                onClick={handlePost}
                disabled={posting}
              >
                {posting ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                Post Announcement
              </button>
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => { setShowForm(false); setForm({ title: '', content: '' }); setPostError(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* announcements list */}
      {announcements.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No announcements posted yet.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {announcements.map((ann) => (
            <div key={ann._id} className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>
                <p className="text-muted small mb-2">
                  Posted on {formatDate(ann.createdAt)}
                  &nbsp;&bull;&nbsp;
                  <span className="badge bg-primary rounded-pill px-2" style={{ fontSize: '0.7rem' }}>
                    All Users
                  </span>
                </p>
                <p className="text-dark small mb-0" style={{ lineHeight: '1.6' }}>
                  {ann.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CoordinatorAnnouncements;
