import React, { useState, useEffect } from 'react';
import Avatar from '../../components/Avatar';

const CoordinatorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const emptyForm = {
    name: '', rollNumber: '', email: '', program: 'BSCS',
    semester: 7, section: 'A', batch: '', password: '',
  };
  const [form, setForm] = useState(emptyForm);

  const getHeaders = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/users?role=student', { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load students');
      // getUsers returns { users: [...] }
      setStudents(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = async (id) => {
    setFormError(null);
    try {
      const res = await fetch(`/api/users/${id}`, { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load student data');

      // getUserById returns { user: { _id, name, email, rollNumber, program, ... } }
      const u = data.user;
      setForm({
        name:       u.name        || '',
        email:      u.email       || '',
        rollNumber: u.rollNumber  || '',
        program:    u.program     || 'BSCS',
        semester:   u.semester    || 7,
        section:    u.section     || 'A',
        batch:      u.batch       || '',
        password:   '',
      });
      setIsEditing(true);
      setEditingId(id);
      setShowModal(true);
    } catch (err) {
      alert(err.message || 'Failed to load student data.');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Full name is required.'); return; }
    if (!form.email.trim()) { setFormError('Email is required.'); return; }
    if (!form.rollNumber.trim()) { setFormError('Roll number is required.'); return; }
    if (!form.batch.trim()) { setFormError('Batch is required.'); return; }
    if (!isEditing && !form.password.trim()) { setFormError('Password is required for new students.'); return; }

    setFormLoading(true);
    setFormError(null);

    try {
      const body = {
        name:       form.name.trim(),
        email:      form.email.trim(),
        role:       'student',
        rollNumber: form.rollNumber.trim(),
        program:    form.program,
        batch:      form.batch.trim(),
        semester:   Number(form.semester),
        section:    form.section,
      };
      if (form.password.trim()) body.password = form.password.trim();

      const url    = isEditing ? `/api/users/${editingId}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        // Keep modal open and show inline error (e.g. duplicate email or roll number)
        setFormError(data.message || 'Operation failed. Please try again.');
        return;
      }

      setShowModal(false);
      setForm(emptyForm);
      await fetchStudents();
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${deletingId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchStudents();
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    (s.name       || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email      || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Manage Students</h4>
          <p className="text-muted small mb-0">Create, edit and manage all student accounts.</p>
        </div>
        <button className="btn btn-primary px-4 fw-medium" onClick={openAddModal}>
          + Add New Student
        </button>
      </div>

      {/* Main Card */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4 flex-wrap gap-3">
          <h6 className="fw-semibold text-dark mb-0">
            All Students
            <span className="badge bg-primary ms-2 rounded-pill">{students.length}</span>
          </h6>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search name, roll number, email..."
            style={{ maxWidth: '300px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Roll Number</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Email</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Program</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Batch</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">No students found.</td>
                  </tr>
                ) : filteredStudents.map((student, index) => (
                  <tr key={student._id}>
                    <td className="px-4 py-3 text-muted small">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={student.name} size={36} />
                        <div>
                          <p className="fw-medium text-dark mb-0 small">{student.name}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                            Sem {student.semester || '—'} • Sec {student.section || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 small text-dark">{student.rollNumber || '—'}</td>
                    <td className="px-4 py-3 small text-muted">{student.email}</td>
                    <td className="px-4 py-3 small text-dark">{student.program || '—'}</td>
                    <td className="px-4 py-3 small text-dark">{student.batch || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => openEditModal(student._id)}>Edit</button>
                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => confirmDelete(student._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold text-dark mb-0">
                {isEditing ? 'Edit Student Account' : 'Add New Student'}
              </h5>
              <button className="btn btn-sm btn-light border" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Inline error — shown for duplicate email, roll number, etc. */}
            {formError && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.875rem' }}>
                {formError}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-medium text-dark small">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. Muhammad Salman"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">Roll Number *</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. F2021001001"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">University Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="name@university.edu"
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">Program *</label>
                <select name="program" value={form.program} onChange={handleInputChange} className="form-select">
                  {['BSCS', 'BSSE', 'BSIT', 'BSAI'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">Semester *</label>
                <select name="semester" value={form.semester} onChange={handleInputChange} className="form-select">
                  {[7, 8].map((s) => (
                    <option key={s} value={s}>{s}th</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">Section *</label>
                <select name="section" value={form.section} onChange={handleInputChange} className="form-select">
                  {['A', 'B', 'C', 'D'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label fw-medium text-dark small">Batch *</label>
                <input
                  type="text"
                  name="batch"
                  value={form.batch}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. 2021-2025"
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-medium text-dark small">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Set a password for the student"
                />
                <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
                  Share this password with the student manually. They can change it after logging in.
                </p>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => setShowModal(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4"
                onClick={handleSave}
                disabled={formLoading}
              >
                {formLoading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving...</>
                  : isEditing ? 'Save Changes' : 'Create Account'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {showDeleteConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
        >
          <div className="bg-white rounded shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <h5 className="fw-bold text-dark mb-2">Delete Student?</h5>
            <p className="text-muted small mb-4">
              This will permanently delete the student account and all their data. This cannot be undone.
            </p>
            <div className="d-flex justify-content-end gap-3">
              <button
                className="btn btn-outline-secondary px-4"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger px-4"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Deleting...</>
                  : 'Yes, Delete'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorStudents;
