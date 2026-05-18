import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — PROFILE
  View and update supervisor's own profile information.
  TODO (Backend): GET /api/supervisor/profile
  TODO (Backend): PUT /api/supervisor/profile
*/

const SupervisorProfile = () => {

  // TODO (Backend): Replace with API call
  // GET /api/supervisor/profile
  const [profile, setProfile] = useState({
    name: 'Mr. Shoaib Ahmed',
    email: 'shoaib@university.edu',
    phone: '+92 301 1234567',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    specialization: 'Artificial Intelligence & Web Technologies',
    officeRoom: 'Room 301, CS Block',
    officeHours: 'Mon-Wed: 10:00 AM - 12:00 PM',
  });

  const [profileAlert, setProfileAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO (Backend): PUT /api/supervisor/profile
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

              {/* Avatar + name */}
              <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: '#28a745', fontSize: '1.4rem' }}
                >
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-0">{profile.name}</h5>
                  <p className="text-muted small mb-1">{profile.designation}</p>
                  <span className="badge bg-success rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                    Supervisor
                  </span>
                </div>
              </div>

              {/* Editable form */}
              <form onSubmit={handleSave}>
                <div className="row g-3">

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Full Name *</label>
                    <input type="text" name="name" value={profile.name}
                      onChange={handleChange} className="form-control" required />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Email *</label>
                    <input type="email" name="email" value={profile.email}
                      onChange={handleChange} className="form-control" required />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Phone Number</label>
                    <input type="text" name="phone" value={profile.phone}
                      onChange={handleChange} className="form-control" placeholder="+92 300 0000000" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Department</label>
                    <select name="department" value={profile.department}
                      onChange={handleChange} className="form-select">
                      <option>Computer Science</option>
                      <option>Software Engineering</option>
                      <option>Information Technology</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Designation</label>
                    <select name="designation" value={profile.designation}
                      onChange={handleChange} className="form-select">
                      <option>Lecturer</option>
                      <option>Assistant Professor</option>
                      <option>Associate Professor</option>
                      <option>Professor</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Office Room</label>
                    <input type="text" name="officeRoom" value={profile.officeRoom}
                      onChange={handleChange} className="form-control" placeholder="e.g. Room 301, CS Block" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Office Hours</label>
                    <input type="text" name="officeHours" value={profile.officeHours}
                      onChange={handleChange} className="form-control" placeholder="e.g. Mon-Wed: 10AM - 12PM" />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Specialization</label>
                    <input type="text" name="specialization" value={profile.specialization}
                      onChange={handleChange} className="form-control" placeholder="e.g. Artificial Intelligence" />
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

export default SupervisorProfile;