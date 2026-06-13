import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROFILE
  Name is read from localStorage (set by SignIn on login).
  All other fields are hardcoded until the backend profile API is built.
  TODO (Backend): GET /api/coordinator/profile — replace hardcoded fields
  TODO (Backend): PUT /api/users/me { name, email, phone } — save profile changes
  TODO (Backend): PUT /api/users/me/password { currentPassword, newPassword }
  TODO (Backend): POST /api/users/me/photo — upload profile photo
*/

const CoordinatorProfile = () => {

  const storedName = localStorage.getItem('name') || 'Coordinator';

  const getInitials = (name) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // TODO (Backend): Replace hardcoded fields with GET /api/coordinator/profile
  const [profile, setProfile] = useState({
    name:        storedName,
    email:       'coordinator@university.edu',
    phone:       '+92 300 9876543',
    department:  'Computer Science',
    designation: 'Project Coordinator',
    officeHours: 'Mon-Fri: 9:00 AM - 5:00 PM',
  });

  const [editMode, setEditMode]         = useState(false);
  const [draft, setDraft]               = useState({ ...profile });
  const [profileAlert, setProfileAlert] = useState(false);

  // Photo state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoSaved, setPhotoSaved]     = useState(false);

  // Password state
  const [pwForm, setPwForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwAlert, setPwAlert]   = useState(false);

  const handleEditStart = () => {
    setDraft({ ...profile });
    setEditMode(true);
  };

  const handleEditCancel = () => setEditMode(false);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    // TODO (Backend): PUT /api/users/me  { name, email, phone }
    setProfile({ ...draft });
    localStorage.setItem('name', draft.name);
    setEditMode(false);
    setProfileAlert(true);
    setTimeout(() => setProfileAlert(false), 3000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoSaved(false);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoSave = () => {
    if (!photoFile) return;
    // TODO (Backend): POST /api/users/me/photo — upload photoFile
    setPhotoSaved(true);
    setTimeout(() => setPhotoSaved(false), 3000);
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    setPwErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePwSave = () => {
    const errors = {};
    if (!pwForm.current.trim()) errors.current = 'Please enter your current password.';
    if (!pwForm.newPw.trim())   errors.newPw   = 'Please enter a new password.';
    if (pwForm.newPw.trim() && !pwForm.confirm.trim()) {
      errors.confirm = 'Please confirm your new password.';
    } else if (pwForm.newPw.trim() && pwForm.confirm.trim() && pwForm.newPw !== pwForm.confirm) {
      errors.confirm = 'Passwords do not match.';
    }
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // TODO (Backend): PUT /api/users/me/password { currentPassword, newPassword }
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwErrors({});
    setPwAlert(true);
    setTimeout(() => setPwAlert(false), 3000);
  };

  return (
    <>
      <Breadcrumb pageName="My Profile" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">

          {/* ── Profile Card ── */}
          <div className="card shadow-sm border-0 mb-4">

            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-semibold text-dark mb-0">Profile Information</h5>
              {!editMode && (
                <button className="btn btn-outline-primary btn-sm px-3 fw-medium" onClick={handleEditStart}>
                  Edit Profile
                </button>
              )}
            </div>

            <div className="card-body p-4">

              {profileAlert && (
                <div className="alert alert-success border-0 mb-4">
                  Profile updated successfully!
                </div>
              )}

              {/* Photo section */}
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 pb-4 border-bottom">
                <div className="d-flex flex-column align-items-center gap-2 flex-shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style={{ width: '80px', height: '80px', backgroundColor: '#3c50e0', fontSize: '1.6rem' }}
                    >
                      {getInitials(profile.name)}
                    </div>
                  )}
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    <label className="btn btn-outline-primary btn-sm px-3" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      Upload Photo
                      <input type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                    </label>
                    {photoFile && !photoSaved && (
                      <button className="btn btn-primary btn-sm px-3" style={{ fontSize: '0.8rem' }} onClick={handlePhotoSave}>
                        Save Photo
                      </button>
                    )}
                  </div>
                  {photoSaved && <span className="text-success small">Photo saved!</span>}
                </div>
                <div className="text-center text-sm-start mt-2 mt-sm-0">
                  <h5 className="fw-semibold text-dark mb-1">{profile.name}</h5>
                  <p className="text-muted small mb-2">{profile.designation}</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                    Coordinator
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="row g-3">

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Full Name *</label>
                  {editMode ? (
                    <input type="text" name="name" className="form-control" value={draft.name} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.name}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Email Address *</label>
                  {editMode ? (
                    <input type="email" name="email" className="form-control" value={draft.email} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.email}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Phone Number</label>
                  {editMode ? (
                    <input type="text" name="phone" className="form-control" placeholder="+92 300 0000000" value={draft.phone} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.phone}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Department</label>
                  {editMode ? (
                    <input type="text" name="department" className="form-control" placeholder="e.g. Computer Science" value={draft.department} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.department}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Designation</label>
                  {editMode ? (
                    <input type="text" name="designation" className="form-control" placeholder="e.g. Project Coordinator" value={draft.designation} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.designation}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Office Hours</label>
                  {editMode ? (
                    <input type="text" name="officeHours" className="form-control" placeholder="e.g. Mon-Fri: 9AM - 5PM" value={draft.officeHours} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.officeHours}</div>
                  )}
                </div>

              </div>

              {editMode && (
                <div className="mt-4 d-flex gap-3">
                  <button className="btn btn-primary px-5 fw-medium" onClick={handleProfileSave}>
                    Save Changes
                  </button>
                  <button type="button" className="btn btn-outline-secondary px-4" onClick={handleEditCancel}>
                    Cancel
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ── Change Password Card ── */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Change Password</h5>
            </div>
            <div className="card-body p-4">

              {pwAlert && (
                <div className="alert alert-success border-0 mb-4">
                  Password changed successfully!
                </div>
              )}

              <div className="row g-3">

                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Current Password *</label>
                  <input
                    type="password"
                    name="current"
                    className={`form-control ${pwErrors.current ? 'is-invalid' : ''}`}
                    placeholder="Enter current password"
                    value={pwForm.current}
                    onChange={handlePwChange}
                  />
                  {pwErrors.current && <div className="invalid-feedback">{pwErrors.current}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">New Password *</label>
                  <input
                    type="password"
                    name="newPw"
                    className={`form-control ${pwErrors.newPw ? 'is-invalid' : ''}`}
                    placeholder="Enter new password"
                    value={pwForm.newPw}
                    onChange={handlePwChange}
                  />
                  {pwErrors.newPw && <div className="invalid-feedback">{pwErrors.newPw}</div>}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirm"
                    className={`form-control ${pwErrors.confirm ? 'is-invalid' : ''}`}
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={handlePwChange}
                  />
                  {pwErrors.confirm && <div className="invalid-feedback">{pwErrors.confirm}</div>}
                </div>

              </div>

              <div className="mt-4">
                <button className="btn btn-primary px-5 fw-medium" onClick={handlePwSave}>
                  Update Password
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CoordinatorProfile;
