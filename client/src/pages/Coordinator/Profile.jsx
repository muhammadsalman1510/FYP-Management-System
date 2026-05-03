// 📁 FILE: src/pages/Coordinator/Profile.jsx

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROFILE
  View and update coordinator's own profile information.
  Change password removed as requested.
  TODO (Backend): GET /api/coordinator/profile
  TODO (Backend): PUT /api/coordinator/profile
*/

const CoordinatorProfile = () => {

  const [profile, setProfile] = useState({
    name: 'Mr. Omer Farooq',
    email: 'omer@university.edu',
    phone: '+92 300 9876543',
    department: 'Computer Science',
    designation: 'Project Coordinator',
  });

  const [profileAlert, setProfileAlert] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    // TODO (Backend): PUT /api/coordinator/profile
    setProfileAlert(true);
    setTimeout(() => setProfileAlert(false), 3000);
  };

  return (
    <>
      <Breadcrumb pageName="My Profile" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">

            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Profile Information</h5>
            </div>

            <div className="card-body p-4">

              {/* Success alert */}
              {profileAlert && (
                <div className="alert alert-success border-0 mb-4">
                  Profile updated successfully!
                </div>
              )}

              {/* Avatar + name display */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{
                    width: '64px', height: '64px', minWidth: '64px',
                    backgroundColor: '#3c50e0', fontSize: '1.4rem'
                  }}
                >
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-0">{profile.name}</h5>
                  <p className="text-muted small mb-1">{profile.designation}</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                    Coordinator
                  </span>
                </div>
              </div>

              {/* Editable form */}
              <form onSubmit={handleProfileSave}>
                <div className="row g-3">

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="form-control"
                      placeholder="+92 300 0000000"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Department</label>
                    <select
                      name="department"
                      value={profile.department}
                      onChange={handleProfileChange}
                      className="form-select"
                    >
                      <option>Computer Science</option>
                      <option>Software Engineering</option>
                      <option>Information Technology</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={profile.designation}
                      onChange={handleProfileChange}
                      className="form-control"
                    />
                  </div>

                </div>

                <div className="mt-4 d-flex gap-3">
                  <button type="submit" className="btn btn-primary px-5 fw-medium">
                    Save Changes
                  </button>
                  <button type="button" className="btn btn-outline-secondary px-4">
                    Cancel
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordinatorProfile;