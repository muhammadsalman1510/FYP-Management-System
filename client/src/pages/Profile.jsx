import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Avatar from '../components/Avatar';

const Profile = () => {
  const storedRole = sessionStorage.getItem('role') || 'student';

  const formatRole = (r) => {
    switch (r) {
      case 'student':     return 'Student';
      case 'supervisor':  return 'Supervisor';
      case 'coordinator': return 'Coordinator';
      default:            return r ? r.charAt(0).toUpperCase() + r.slice(1) : 'Student';
    }
  };
  const displayRole = formatRole(storedRole);


  // Safe defaults prevent crash before API loads
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    semester: '',
    section: '',
    rollNumber: '',
    program: '',
    photoUrl: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwAlert, setPwAlert] = useState(false);
  const [pwApiError, setPwApiError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load profile');
        }

        // getMe returns: { success: true, data: { _id, name, email, role, phone, photoUrl, profile: {...} } }
        // User fields are spread at the top level of data.data — there is no nested 'user' key
        const userData = data.data;
        const prof = data.data.profile;

        const loaded = {
          name:        userData.name        || '',
          email:       userData.email       || '',
          phone:       userData.phone       || '',
          photoUrl:    userData.photoUrl    || null,
          semester:    prof?.semester       || '',
          section:     prof?.section        || '',
          rollNumber:  prof?.rollNumber     || '',
          program:     prof?.program        || '',
        };
        setProfile(loaded);
        sessionStorage.setItem('name', userData.name || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEditStart = () => {
    setDraft({ ...profile });
    setEditMode(true);
    setProfileError(null);
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setProfileError(null);
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError(null);
    try {
      const token = sessionStorage.getItem('token');
      const body = {
        name:     draft.name,
        email:    draft.email,
        phone:    draft.phone,
        semester: draft.semester,
        section:  draft.section,
      };
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save profile');
      }
      setProfile((prev) => ({ ...prev, ...draft }));
      sessionStorage.setItem('name', draft.name);
      setEditMode(false);
      setProfileAlert(true);
      setTimeout(() => setProfileAlert(false), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoSaved(false);
    setPhotoError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoSave = async () => {
    if (!photoFile) return;
    setPhotoSaving(true);
    setPhotoError(null);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', photoFile);
      const res = await fetch('/api/users/me/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Photo upload failed');
      }
      setProfile((prev) => ({ ...prev, photoUrl: data.data.photoUrl }));
      try {
        const stored = JSON.parse(sessionStorage.getItem('user') || '{}');
        sessionStorage.setItem('user', JSON.stringify({ ...stored, photoUrl: data.data.photoUrl }));
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('userPhotoUpdated'));
      setPhotoSaved(true);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setPhotoSaved(false), 3000);
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPhotoSaving(false);
    }
  };

  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    setPwErrors((prev) => ({ ...prev, [name]: undefined }));
    setPwApiError(null);
  };

  const handlePwSave = async () => {
    const errors = {};
    if (!pwForm.current.trim())  errors.current = 'Please enter your current password.';
    if (!pwForm.newPw.trim())    errors.newPw   = 'Please enter a new password.';
    if (pwForm.newPw.trim() && !pwForm.confirm.trim()) {
      errors.confirm = 'Please confirm your new password.';
    } else if (pwForm.newPw.trim() && pwForm.confirm.trim() && pwForm.newPw !== pwForm.confirm) {
      errors.confirm = 'Passwords do not match.';
    }
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    setPwApiError(null);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.current,
          newPassword:     pwForm.newPw,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password');
      }
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({});
      setPwAlert(true);
      setTimeout(() => setPwAlert(false), 3000);
    } catch (err) {
      setPwApiError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="My Profile" />
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
        <Breadcrumb pageName="My Profile" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="My Profile" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">

          {/* Profile Card */}
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
                <div className="alert alert-success border-0 mb-4">Profile updated successfully!</div>
              )}
              {profileError && (
                <div className="alert alert-danger border-0 mb-4">{profileError}</div>
              )}

              {/* Photo section */}
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 pb-4 border-bottom">
                <div className="d-flex flex-column align-items-center gap-2 flex-shrink-0">
                  <Avatar name={profile.name} photoUrl={photoPreview || profile.photoUrl} size={80} />
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    <label className="btn btn-outline-primary btn-sm px-3" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      Upload Photo
                      <input type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                    </label>
                    {photoFile && !photoSaved && (
                      <button
                        className="btn btn-primary btn-sm px-3"
                        style={{ fontSize: '0.8rem' }}
                        onClick={handlePhotoSave}
                        disabled={photoSaving}
                      >
                        {photoSaving ? <span className="spinner-border spinner-border-sm me-1" role="status" /> : null}
                        Save Photo
                      </button>
                    )}
                  </div>
                  {photoSaved && <span className="text-success small">Photo saved!</span>}
                  {photoError && <span className="text-danger small">{photoError}</span>}
                </div>
                <div className="text-center text-sm-start mt-2 mt-sm-0">
                  <h5 className="fw-semibold text-dark mb-1">{profile.name || '—'}</h5>
                  <p className="text-muted small mb-2">{displayRole}</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                    {displayRole}
                  </span>
                </div>
              </div>

              {/* Editable fields */}
              <div className="row g-3 mb-3">

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Full Name *</label>
                  {editMode ? (
                    <input type="text" name="name" className="form-control" value={draft.name} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.name || '—'}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Email Address *</label>
                  {editMode ? (
                    <input type="email" name="email" className="form-control" value={draft.email} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.email || '—'}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Phone Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      placeholder="+92 300 0000000"
                      value={draft.phone}
                      onChange={handleDraftChange}
                    />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile.phone || '—'}</div>
                  )}
                </div>

                {/* Semester — only relevant for students */}
                {storedRole === 'student' && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Semester</label>
                    {editMode ? (
                      <select name="semester" className="form-select" value={draft.semester} onChange={handleDraftChange}>
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="3rd Semester">3rd Semester</option>
                        <option value="4th Semester">4th Semester</option>
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </select>
                    ) : (
                      <div className="form-control bg-light text-dark">{profile.semester || '—'}</div>
                    )}
                  </div>
                )}

                {/* Section — only relevant for students */}
                {storedRole === 'student' && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">Section</label>
                    {editMode ? (
                      <select name="section" className="form-select" value={draft.section} onChange={handleDraftChange}>
                        <option value="">Select Section</option>
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                      </select>
                    ) : (
                      <div className="form-control bg-light text-dark">{profile.section || '—'}</div>
                    )}
                  </div>
                )}

              </div>

              {/* Read-only student-only fields */}
              {storedRole === 'student' && (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">
                      Roll Number
                      <span className="ms-2 text-muted" style={{ fontSize: '0.72rem', fontWeight: 'normal' }}>— Cannot be changed</span>
                    </label>
                    <div className="form-control bg-light" style={{ color: '#6c757d' }}>
                      {profile.rollNumber || '—'}
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">
                      Program
                      <span className="ms-2 text-muted" style={{ fontSize: '0.72rem', fontWeight: 'normal' }}>— Cannot be changed</span>
                    </label>
                    <div className="form-control bg-light" style={{ color: '#6c757d' }}>
                      {profile.program || '—'}
                    </div>
                  </div>
                </div>
              )}

              {editMode && (
                <div className="mt-4 d-flex gap-3">
                  <button
                    className="btn btn-primary px-5 fw-medium"
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                  >
                    {profileSaving ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button className="btn btn-outline-secondary px-4" onClick={handleEditCancel}>
                    Cancel
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Change Password Card */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Change Password</h5>
            </div>
            <div className="card-body p-4">

              {pwAlert && (
                <div className="alert alert-success border-0 mb-4">Password changed successfully!</div>
              )}
              {pwApiError && (
                <div className="alert alert-danger border-0 mb-4">{pwApiError}</div>
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
                <button
                  className="btn btn-primary px-5 fw-medium"
                  onClick={handlePwSave}
                  disabled={pwSaving}
                >
                  {pwSaving ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
