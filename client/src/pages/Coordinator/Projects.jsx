// 📁 FILE: src/pages/Coordinator/AssignSupervisor.jsx

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useEffect } from 'react';
import axios from 'axios'

/*
  COORDINATOR — ASSIGN SUPERVISOR TO STUDENT
  This page shows ALL students.
  Coordinator selects a supervisor for each student from a dropdown.
  TODO (Backend): GET /api/coordinator/students
  TODO (Backend): GET /api/coordinator/supervisors
  TODO (Backend): PUT /api/coordinator/students/:id/assign-supervisor
*/

const Projects = () => {

  // Supervisors list for the dropdown
  const [supervisors, setSupervisors] = useState([]);

  // Projects list
  const [projects, setProjects] = useState([]);

  const [savedAlert, setSavedAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const emptyForm = { title: '', description: '', maxStudents: '' };
  const [form, setForm] = useState(emptyForm);
  const [modalMode, setModalMode] = useState('create');
  const [showModal, setShowModal] = useState(false);



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
      setSupervisors(response.data.users);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchProjects = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );
      setProjects(data.projects);
    } catch (error) {
      console.error(error);
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (modalMode === 'create') {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/projects",
          {
            title: form.title,
            description: form.description,
            maxStudents: form.maxStudents
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        fetchProjects();

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
          `http://localhost:4000/api/users/${selectedSupervisorId}`,
          body,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        fetchSupervisors();

      } catch (error) {
        console.error(error);
      }
    }

    setShowModal(false);
    setForm(emptyForm);

  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Get All SUpervisors
  useEffect(() => {
    fetchSupervisors()
  }, []);

  useEffect(() => {
    fetchProjects()
  }, []);

  // Update supervisor for a project
  const handleSupervisorChange = async (projectId, newSupervisorId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.put(
        `http://localhost:4000/api/projects/${projectId}/supervisor`,
        { supervisorId: (newSupervisorId !== '' ? newSupervisorId : null) },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchProjects()

    } catch (error) {
      console.error(error);
    }
  };

  // Get supervisor name by ID
  const getSupervisorName = (id) => {
    if (!id) return null;
    console.log('getSupervisorName', id)
    const s = supervisors?.find(s => s._id === id);
    return s ? s.name : null;
  };

  // Filter students by search
  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supervisorId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count stats
  const assignedCount = projects.filter(s => s.supervisorId).length;
  const unassignedCount = projects.filter(s => !s.supervisorId).length;

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalMode('create');
    setShowModal(true);
  };

  return (
    <>
      <Breadcrumb pageName="Manage Projects" />

      {/* Success Alert */}
      {savedAlert && (
        <div className="alert alert-success border-0 shadow-sm mb-4">
          <strong>Saved!</strong> Supervisor assignments updated successfully.
        </div>
      )}

      <div className="card shadow-sm border-0">

        {/* Card Header */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h5 className="fw-semibold text-dark mb-0">Projects</h5>
              <p className="text-muted small mb-0 mt-1">
                Use the dropdown in each row to assign or change a projects's supervisor.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search project titles, supervisors and status"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: '300px' }}
              />
              <button className="btn btn-success btn-sm px-4 fw-medium" onClick={openCreateModal}>
                + Add Project
              </button>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Project Title</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Current Supervisor</th>
                  <th className="px-4 py-3 fw-semibold small text-dark" style={{ minWidth: '220px' }}>
                    Assign Supervisor
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects?.map((project, index) => (
                    <tr key={project._id}>

                      {/* # */}
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>

                      {/* Student Name with avatar */}
                      <td className="px-4 py-3">
                        {project.title}
                      </td>

                      {/* Roll Number */}
                      <td className="px-4 py-3 text-muted small">{project.status}</td>

                      {/* Current Supervisor */}
                      <td className="px-4 py-3">
                        {project.supervisorId?.name ? (
                          <span className="text-dark small fw-medium">
                            {project.supervisorId.name}
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-pill px-2 small">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Assign Supervisor Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          className="form-select form-select-sm"
                          value={project.supervisorId?._id || ''}
                          onChange={(e) => handleSupervisorChange(project._id, e.target.value)}
                        >
                          <option value=''>-- Not Assigned --</option>
                          {supervisors?.map(sv => (
                            <option key={sv._id} value={sv._id}>{sv.name}</option>
                          ))}
                        </select>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="modal-title fw-semibold text-dark">
                    {modalMode === 'create' ? 'Add New Project' : 'Edit Project'}
                  </h5>
                  <button className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body px-4 py-4">
                  <form onSubmit={handleSave} id="projectForm">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-medium text-dark small">Project Title *</label>
                        <input type="text" name="title" value={form.title} onChange={handleFormChange} className="form-control" placeholder="Project Title" required />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-medium text-dark small">Max Students *</label>
                        <input
                          type="number"
                          name="maxStudents"
                          value={form.maxStudents}
                          onChange={handleFormChange}
                          className="form-control"
                          placeholder="Between 2 - 5"
                          min="2"
                          max="5"
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-medium text-dark small">Description</label>
                        <textarea type="text" name="description" value={form.description} onChange={handleFormChange} className="form-control" />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer border-top px-4 py-3">
                  <button className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" form="projectForm" className="btn btn-success px-4 fw-medium">
                    {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex flex-wrap gap-4 small">
            <span className="text-muted">
              Total Projects: <strong className="text-dark">{projects.length}</strong>
            </span>
            <span className="text-muted">
              Assigned: <strong className="text-success">{assignedCount}</strong>
            </span>
            <span className="text-muted">
              Not Assigned: <strong className="text-warning">{unassignedCount}</strong>
            </span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Projects;