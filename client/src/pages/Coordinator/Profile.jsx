import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

// coordinator profile — name, email, phone + password change
// coordinator has no profile model so there's no department/designation to show

const CoordinatorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwApiError, setPwApiError] = useState(null);

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'CO';

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load profile');

        const u = data.data;
        const merged = {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          photoUrl: u.photoUrl || null,
          role: u.role || 'coordinator',
        };
        setProfile(merged);
        setDraft(merged);
        localStorage.setItem('name', u.name || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: draft.name, email: draft.email, phone: draft.phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save');

      const u = data.data;
      setProfile((prev) => ({ ...prev, name: u.name || '', email: u.email || '', phone: u.phone || '' }));
      localStorage.setItem('name', u.name || '');
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoSuccess(false);
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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', photoFile);
      // no Content-Type header for FormData — browser sets it with the boundary
      const res = await fetch('/api/users/me/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');

      setProfile((prev) => ({ ...prev, photoUrl: data.data.photoUrl }));
      setPhotoFile(null);
      setPhotoPreview(null);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
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
  };

  const handlePwSave = async () => {
    const errors = {};
    if (!pwForm.current.trim()) errors.current = 'Please enter your current password.';
    if (!pwForm.newPw.trim()) errors.newPw = 'Please enter a new password.';
    if (pwForm.newPw.trim() && !pwForm.confirm.trim()) errors.confirm = 'Please confirm your new password.';
    else if (pwForm.newPw.trim() && pwForm.confirm.trim() && pwForm.newPw !== pwForm.confirm) errors.confirm = 'Passwords do not match.';
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPwSaving(true);
    setPwApiError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to change password');

      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwErrors({});
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwApiError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const photoSrc = photoPreview || (profile?.photoUrl ? profile.photoUrl : null);

  if (loading) return (
    <>
      <Breadcrumb pageName="My Profile" />
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="My Profile" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

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
                <button
                  className="btn btn-outline-primary btn-sm px-3 fw-medium"
                  onClick={() => { setDraft({ ...profile }); setEditMode(true); setSaveError(null); }}
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body p-4">

              {saveSuccess && <div className="alert alert-success border-0 mb-4">Profile updated successfully!</div>}
              {saveError && <div className="alert alert-danger border-0 mb-4">{saveError}</div>}

              {/* photo section */}
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-4 mb-4 pb-4 border-bottom">
                <div className="d-flex flex-column align-items-center gap-2 flex-shrink-0">
                  {photoSrc ? (
                    <img
                      src={photoSrc} alt="Profile"
                      className="rounded-circle"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                      style={{ width: '80px', height: '80px', backgroundColor: '#3c50e0', fontSize: '1.6rem' }}
                    >
                      {getInitials(profile?.name)}
                    </div>
                  )}
                  <div className="d-flex gap-2 flex-wrap justify-content-center">
                    <label className="btn btn-outline-primary btn-sm px-3" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      Upload Photo
                      <input type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
                    </label>
                    {photoFile && !photoSuccess && (
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
                  {photoSuccess && <span className="text-success small">Photo saved!</span>}
                  {photoError && <span className="text-danger small">{photoError}</span>}
                </div>
                <div className="text-center text-sm-start mt-2 mt-sm-0">
                  <h5 className="fw-semibold text-dark mb-1">{profile?.name}</h5>
                  <p className="text-muted small mb-2">Project Coordinator</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>
                    Coordinator
                  </span>
                </div>
              </div>

              {/* fields */}
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Full Name *</label>
                  {editMode ? (
                    <input type="text" name="name" className="form-control" value={draft.name} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile?.name}</div>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Email Address *</label>
                  {editMode ? (
                    <input type="email" name="email" className="form-control" value={draft.email} onChange={handleDraftChange} />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile?.email}</div>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Phone Number</label>
                  {editMode ? (
                    <input
                      type="text" name="phone"
                      className="form-control"
                      placeholder="+92 300 0000000"
                      value={draft.phone}
                      onChange={handleDraftChange}
                    />
                  ) : (
                    <div className="form-control bg-light text-dark">{profile?.phone || '—'}</div>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="mt-4 d-flex gap-3">
                  <button
                    className="btn btn-primary px-5 fw-medium"
                    onClick={handleProfileSave}
                    disabled={saving}
                  >
                    {saving ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                    Save Changes
                  </button>
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => { setEditMode(false); setSaveError(null); }}
                  >
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

              {pwSuccess && <div className="alert alert-success border-0 mb-4">Password changed successfully!</div>}
              {pwApiError && <div className="alert alert-danger border-0 mb-4">{pwApiError}</div>}

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Current Password *</label>
                  <input
                    type="password" name="current"
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
                    type="password" name="newPw"
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
                    type="password" name="confirm"
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
                  {pwSaving ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
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
