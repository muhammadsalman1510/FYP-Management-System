import React, { useState } from 'react';
import axios from 'axios';

/*
  COORDINATOR — MANAGE STUDENTS
  - View all students in a table
  - Add new student (modal form)
  - Edit student details
  - Delete student account
  TODO (Backend): Replace hardcoded data with API calls
  GET    /api/coordinator/students
  POST   /api/coordinator/students
  PUT    /api/coordinator/students/:id
  DELETE /api/coordinator/students/:id
*/

const CoordinatorStudents = () => {

  const [students, setStudents] = useState([
    { id: 1, name: 'Muhammad Salman', rollNumber: 'F2021001001', email: 'salman@university.edu', program: 'BSCS', semester: '7th', section: 'A', batch: '2021-2025', supervisor: 'Mr. Shoaib', password: 'student123' },
    { id: 2, name: 'Ali Hassan', rollNumber: 'F2021001002', email: 'ali@university.edu', program: 'BSCS', semester: '7th', section: 'A', batch: '2021-2025', supervisor: 'Mr. Shoaib', password: 'student123' },
    { id: 3, name: 'Sara Khan', rollNumber: 'F2021001003', email: 'sara@university.edu', program: 'BSSE', semester: '7th', section: 'B', batch: '2021-2025', supervisor: 'Mr. Omer', password: 'student123' },
    { id: 4, name: 'Usman Ahmed', rollNumber: 'F2021001004', email: 'usman@university.edu', program: 'BSIT', semester: '7th', section: 'A', batch: '2021-2025', supervisor: 'Unassigned', password: 'student123' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const emptyForm = { name: '', rollNumber: '', email: '', program: 'BSCS', semester: '7th', section: 'A', batch: '', password: '' };
  const [form, setForm] = useState(emptyForm);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setForm({ name: student.name, rollNumber: student.rollNumber, email: student.email, program: student.program, semester: student.semester, section: student.section, batch: student.batch, password: student.password });
    setIsEditing(true);
    setEditingId(student.id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isEditing) {
      setStudents(prev => prev.map(s => s.id === editingId ? { ...s, ...form } : s));
      setShowModal(false);
      setForm(emptyForm);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.post('http://localhost:4000/api/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'student',
        rollNumber: form.rollNumber,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(prev => [...prev, { id: data.user._id, ...data.user, ...data.profile }]);
      setShowModal(false);
      setForm(emptyForm);

    } catch (err) {
      console.error('Create student error:', err);
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      alert(message);
    }
  };

  const confirmDelete = (id) => { setDeletingId(id); setShowDeleteConfirm(true); };
  const handleDelete = () => { setStudents(prev => prev.filter(s => s.id !== deletingId)); setShowDeleteConfirm(false); setDeletingId(null); };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <input type="text" className="form-control form-control-sm" placeholder="Search name, roll number, email..."
            style={{ maxWidth: '300px' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                  <th className="px-4 py-3 fw-semibold small text-dark">Supervisor</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-5">No students found.</td></tr>
                ) : filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td className="px-4 py-3 text-muted small">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                          style={{ width: '36px', height: '36px', minWidth: '36px', backgroundColor: '#3c50e0', fontSize: '0.8rem' }}>
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="fw-medium text-dark mb-0 small">{student.name}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>Sem {student.semester} • Sec {student.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 small text-dark">{student.rollNumber}</td>
                    <td className="px-4 py-3 small text-muted">{student.email}</td>
                    <td className="px-4 py-3 small text-dark">{student.program}</td>
                    <td className="px-4 py-3 small text-dark">{student.batch}</td>
                    <td className="px-4 py-3">
                      {student.supervisor === 'Unassigned'
                        ? <span className="badge bg-warning text-dark rounded-pill px-2 small">Unassigned</span>
                        : <span className="badge bg-success rounded-pill px-2 small">{student.supervisor}</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => openEditModal(student)}>Edit</button>
                        <button className="btn btn-outline-danger btn-sm px-3" onClick={() => confirmDelete(student.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="bg-white rounded shadow-lg p-4" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>

            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold text-dark mb-0">{isEditing ? 'Edit Student Account' : 'Add New Student'}</h5>
              <button className="btn btn-sm btn-light border" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Full Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleInputChange} className="form-control" placeholder="e.g. Muhammad Salman" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Roll Number *</label>
                  <input type="text" name="rollNumber" value={form.rollNumber} onChange={handleInputChange} className="form-control" placeholder="e.g. F2021001001" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">University Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleInputChange} className="form-control" placeholder="name@university.edu" required />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Program *</label>
                  <select name="program" value={form.program} onChange={handleInputChange} className="form-select" required>
                    {['BSCS', 'BSSE', 'BSIT', 'BSAI'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Semester *</label>
                  <select name="semester" value={form.semester} onChange={handleInputChange} className="form-select" required>
                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => <option key={s} value={s}>{s} Semester</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Section *</label>
                  <select name="section" value={form.section} onChange={handleInputChange} className="form-select" required>
                    {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-medium text-dark small">Batch *</label>
                  <input type="text" name="batch" value={form.batch} onChange={handleInputChange} className="form-control" placeholder="e.g. 2021-2025" required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">
                    {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <input type="password" name="password" value={form.password} onChange={handleInputChange}
                    className="form-control" placeholder="Set a password for the student" required={!isEditing} />
                  <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.75rem' }}>
                    Share this password with the student manually. They can change it after logging in.
                  </p>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-3 mt-4">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4">{isEditing ? 'Save Changes' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="bg-white rounded shadow-lg p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <h5 className="fw-bold text-dark mb-2">Delete Student?</h5>
            <p className="text-muted small mb-4">This will permanently delete the student account and all their data. This cannot be undone.</p>
            <div className="d-flex justify-content-end gap-3">
              <button className="btn btn-outline-secondary px-4" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn btn-danger px-4" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorStudents;