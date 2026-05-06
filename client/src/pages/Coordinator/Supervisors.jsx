// 📁 FILE: src/pages/Coordinator/Supervisors.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — MANAGE SUPERVISORS
  - View all supervisors
  - Create new supervisor account
  - Edit existing supervisor
  - Delete supervisor
  TODO (Backend): GET    /api/coordinator/supervisors
  TODO (Backend): POST   /api/coordinator/supervisors
  TODO (Backend): PUT    /api/coordinator/supervisors/:id
  TODO (Backend): DELETE /api/coordinator/supervisors/:id
*/

const CoordinatorSupervisors = () => {

  const [supervisors, setSupervisors] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [supervisorToDelete, setSupervisorToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const emptyForm = { name: '', email: '', password: '', department: 'Computer Science', designation: '', maxProjects: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchSupervisors = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        "http://localhost:4000/api/users",
        {
          params: {
            role: 'supervisor',
          },
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      console.log(response.data.users);
      setSupervisors(response.data.users);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (supervisor) => {
    setForm({ ...supervisor, password: '' });
    setSelectedSupervisor(supervisor);
    setModalMode('edit');
    setShowModal(true);
  };

  const openDeleteConfirm = (supervisor) => {
    setSupervisorToDelete(supervisor);
    setShowDeleteConfirm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (modalMode === 'create') {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/users",
          {
            name: form.name,
            email: form.email,
            password: form.password,
            role: 'supervisor',
            department: form.department,
            designation: form.designation,
            maxProjects: Number(form.maxProjects),
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSupervisors(prev => [...prev, {
          ...response.data.user,
          ...response.data.profile,
        }]);

      } catch (error) {
        console.error(error);
      }

    } else {
      try {
        const body = {
          name: form.name,
          email: form.email,
          department: form.department,
          designation: form.designation,
          maxProjects: Number(form.maxProjects),
        };

        if (form.password) {
          body.password = form.password;
        }

        const response = await axios.put(
          `http://localhost:4000/api/users/${selectedSupervisor._id}`,
          body,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setSupervisors(prev =>
          prev.map(s => s._id === selectedSupervisor._id ? { ...s, ...response.data.user } : s)
        );

      } catch (error) {
        console.error(error);
      }
    }

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');

    try {
      await axios.delete(
        `http://localhost:4000/api/users/${supervisorToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchSupervisors();

    } catch (error) {
      console.error(error);
    }

    setShowDeleteConfirm(false);
    setSupervisorToDelete(null);
  };

  const filteredSupervisors = supervisors.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Breadcrumb pageName="Manage Supervisors" />

      <div className="card shadow-sm border-0">

        {/* Card Header */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <h5 className="fw-semibold text-dark mb-0">
              All Supervisors
              <span className="badge bg-success ms-2 rounded-pill" style={{ fontSize: '0.75rem' }}>
                {supervisors.length}
              </span>
            </h5>
            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search supervisors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: '220px' }}
              />
              <button className="btn btn-success btn-sm px-4 fw-medium" onClick={openCreateModal}>
                + Add Supervisor
              </button>
            </div>
          </div>
        </div>

        {/* Supervisors Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Name</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Email</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Department</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Designation</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Assigned Projects</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupervisors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">No supervisors found.</td>
                  </tr>
                ) : (
                  filteredSupervisors.map((supervisor, index) => (
                    <tr key={supervisor.id}>
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                            style={{ width: '36px', height: '36px', minWidth: '36px', backgroundColor: '#28a745', fontSize: '0.8rem' }}
                          >
                            {supervisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="fw-medium text-dark small">{supervisor.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted small">{supervisor.email}</td>
                      <td className="px-4 py-3 text-muted small">{supervisor.department}</td>
                      <td className="px-4 py-3 text-muted small">{supervisor.designation}</td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div
                              className={`progress-bar ${supervisor.currentProjects >= supervisor.maxProjects
                                  ? 'bg-danger'
                                  : supervisor.currentProjects >= supervisor.maxProjects * 0.7
                                    ? 'bg-warning'
                                    : 'bg-success'
                                }`}
                              style={{
                                width: `${(supervisor.currentProjects / supervisor.maxProjects) * 100}%`
                              }}
                            />
                          </div>
                          <small className="text-muted text-nowrap">
                            {supervisor.currentProjects} / {supervisor.maxProjects}
                          </small>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-primary btn-sm px-3" onClick={() => openEditModal(supervisor)}>Edit</button>
                          <button className="btn btn-outline-danger btn-sm px-3" onClick={() => openDeleteConfirm(supervisor)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {modalMode === 'create' ? 'Add New Supervisor' : 'Edit Supervisor'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <form onSubmit={handleSave} id="supervisorForm">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">Full Name *</label>
                      <input type="text" name="name" value={form.name} onChange={handleFormChange} className="form-control" placeholder="e.g. Mr. Shoaib Ahmed" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">University Email *</label>
                      <input type="email" name="email" value={form.email} onChange={handleFormChange} className="form-control" placeholder="e.g. supervisor@university.edu" required />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">
                        {modalMode === 'create' ? 'Password *' : 'New Password (leave blank to keep)'}
                      </label>
                      <input type="password" name="password" value={form.password} onChange={handleFormChange} className="form-control" placeholder="Enter password" required={modalMode === 'create'} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">Department *</label>
                      <select name="department" value={form.department} onChange={handleFormChange} className="form-select" required>
                        <option>Computer Science</option>
                        <option>Software Engineering</option>
                        <option>Information Technology</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">Designation *</label>
                      <select name="designation" value={form.designation} onChange={handleFormChange} className="form-select" required>
                        <option value="">Select Designation</option>
                        <option>Lecturer</option>
                        <option>Assistant Professor</option>
                        <option>Associate Professor</option>
                        <option>Professor</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">Max Projects *</label>
                      <input
                        type="number"
                        name="maxProjects"
                        value={form.maxProjects}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="Between 1 - 4"
                        min="1"
                        max="4"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" form="supervisorForm" className="btn btn-success px-4 fw-medium">
                  {modalMode === 'create' ? 'Create Account' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#dc354520' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#dc3545">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <h6 className="fw-semibold text-dark mb-2">Delete Supervisor Account</h6>
                <p className="text-muted small mb-0">
                  Are you sure you want to delete <strong>{supervisorToDelete?.name}</strong>'s account? This cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn-danger px-4 fw-medium" onClick={handleDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorSupervisors;