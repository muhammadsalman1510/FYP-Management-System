import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

// student sees their coordinator's info here — read only
// coordinator details come from project.coordinator (populated user doc)

const CoordinatorView = () => {
  const [coordinator, setCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/projects/my', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load project');

        const project = data.data;
        if (!project.coordinator) throw new Error('No coordinator assigned to your project yet.');
        setCoordinator(project.coordinator);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CO';

  if (loading) return (
    <>
      <Breadcrumb pageName="Coordinator" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="Coordinator" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  return (
    <>
      <Breadcrumb pageName="Coordinator" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Project Coordinator</h5>
            </div>
            <div className="card-body p-4">

              {/* avatar + name */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                {coordinator.photoUrl ? (
                  <img
                    src={coordinator.photoUrl.startsWith('http') ? coordinator.photoUrl : `http://localhost:4000${coordinator.photoUrl}`}
                    alt="Coordinator"
                    className="rounded-circle"
                    style={{ width: '72px', height: '72px', objectFit: 'cover', minWidth: '72px' }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '72px', height: '72px', minWidth: '72px', backgroundColor: '#3c50e0', fontSize: '1.5rem' }}
                  >
                    {getInitials(coordinator.name)}
                  </div>
                )}
                <div>
                  <h5 className="fw-semibold text-dark mb-1">{coordinator.name}</h5>
                  <p className="text-muted small mb-1">Project Coordinator</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>Coordinator</span>
                </div>
              </div>

              {/* contact info */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Email</label>
                  <div className="form-control bg-light text-dark small">{coordinator.email || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Phone Number</label>
                  <div className="form-control bg-light text-dark small">{coordinator.phone || '—'}</div>
                </div>
              </div>

              {/* meeting request button */}
              <div className="mt-4 pt-3 border-top">
                <a href="/meetings/requests" className="btn btn-primary px-4 fw-medium">
                  Request a Meeting
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordinatorView;
