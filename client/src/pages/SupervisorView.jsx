import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

// student sees their supervisor's info here — read only, no editing
// supervisor profile fields (department, designation) come from the populated user doc

const SupervisorView = () => {
  const [supervisor, setSupervisor] = useState(null);
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
        // supervisors is an array — grab the first one
        const sup = project.supervisors?.[0] || project.supervisorId || null;
        if (!sup) throw new Error('No supervisor assigned to your project yet.');
        setSupervisor(sup);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'SV';

  if (loading) return (
    <>
      <Breadcrumb pageName="My Supervisor" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="My Supervisor" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  return (
    <>
      <Breadcrumb pageName="My Supervisor" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">My Supervisor</h5>
            </div>
            <div className="card-body p-4">

              {/* avatar + name */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                {supervisor.photoUrl ? (
                  <img
                    src={supervisor.photoUrl.startsWith('http') ? supervisor.photoUrl : `http://localhost:4000${supervisor.photoUrl}`}
                    alt="Supervisor"
                    className="rounded-circle"
                    style={{ width: '72px', height: '72px', objectFit: 'cover', minWidth: '72px' }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '72px', height: '72px', minWidth: '72px', backgroundColor: '#28a745', fontSize: '1.5rem' }}
                  >
                    {getInitials(supervisor.name)}
                  </div>
                )}
                <div>
                  <h5 className="fw-semibold text-dark mb-1">{supervisor.name}</h5>
                  {supervisor.profile?.designation && (
                    <p className="text-muted small mb-1">{supervisor.profile.designation}</p>
                  )}
                  {supervisor.profile?.department && (
                    <p className="text-muted small mb-1">{supervisor.profile.department}</p>
                  )}
                  <span className="badge bg-success rounded-pill px-3" style={{ fontSize: '0.7rem' }}>Supervisor</span>
                </div>
              </div>

              {/* contact + profile fields */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Email</label>
                  <div className="form-control bg-light text-dark small">{supervisor.email || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Phone Number</label>
                  <div className="form-control bg-light text-dark small">{supervisor.phone || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Department</label>
                  <div className="form-control bg-light text-dark small">{supervisor.profile?.department || '—'}</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Designation</label>
                  <div className="form-control bg-light text-dark small">{supervisor.profile?.designation || '—'}</div>
                </div>
                {supervisor.profile?.specialization && (
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Specialization</label>
                    <div className="form-control bg-light text-dark small">{supervisor.profile.specialization}</div>
                  </div>
                )}
                {supervisor.profile?.officeRoom && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Office Room</label>
                    <div className="form-control bg-light text-dark small">{supervisor.profile.officeRoom}</div>
                  </div>
                )}
                {supervisor.profile?.officeHours && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Office Hours</label>
                    <div className="form-control bg-light text-dark small">{supervisor.profile.officeHours}</div>
                  </div>
                )}
              </div>

              {/* meeting request button stays here */}
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

export default SupervisorView;
