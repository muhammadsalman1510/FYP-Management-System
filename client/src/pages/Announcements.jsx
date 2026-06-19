import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

const Announcements = () => {
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
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load announcements');
        }
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
                    CO
                  </div>
                  <span className="text-muted small">
                    Posted by <strong className="text-dark">Coordinator</strong>
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
