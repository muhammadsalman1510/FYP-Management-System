import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const SupervisorAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
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
    fetchAnnouncements();
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Announcements" />
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
        <Breadcrumb pageName="Announcements" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Announcements" />

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
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '42px', height: '42px', backgroundColor: '#e0e7ff', color: '#3c50e0' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                    </svg>
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold text-dark mb-1">{ann.title}</h6>
                    <p className="text-muted small mb-2">
                      By <strong className="text-dark">Coordinator</strong>
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
