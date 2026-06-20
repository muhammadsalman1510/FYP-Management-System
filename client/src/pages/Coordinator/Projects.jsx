import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const emptyForm = { title: '', description: '', maxStudents: '' };
  const [form, setForm] = useState(emptyForm);
  const [modalMode, setModalMode] = useState('create');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const navigate = useNavigate();

  const getHeaders = () => ({
    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects', { headers: getHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load projects');
      setProjects(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setModalError('Project title is required.');
      return;
    }
    if (!form.maxStudents || Number(form.maxStudents) < 1) {
      setModalError('Max students must be at least 1.');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      const body = {
        title: form.title.trim(),
        description: form.description,
        maxStudents: Number(form.maxStudents),
      };

      let res;
      if (modalMode === 'create') {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/projects/${selectedProjectId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Operation failed');

      setShowModal(false);
      setForm(emptyForm);
      await fetchProjects();
    } catch (err) {
      setModalError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setModalError(null);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = async (id) => {
    setModalError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, { headers: getHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load project');

      const p = data.data;
      setForm({ title: p.title || '', description: p.description || '', maxStudents: p.maxStudents || '' });
      setSelectedProjectId(id);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      alert(err.message || 'Failed to load project data.');
    }
  };

  const openDeleteConfirm = (id) => {
    setProjectToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectToDeleteId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');

      setShowDeleteConfirm(false);
      setProjectToDeleteId(null);
      await fetchProjects();
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const statusMatch = (p.status || '').toLowerCase().includes(q);
    const supervisorName = (p.supervisors?.[0]?.name || '').toLowerCase();
    const supervisorMatch = supervisorName.includes(q);
    return titleMatch || statusMatch || supervisorMatch;
  });

  const assignedCount = projects.filter(p => p.supervisors?.length > 0).length;
  const unassignedCount = projects.filter(p => !p.supervisors?.length).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':           return 'bg-success';
      case 'pending_proposal': return 'bg-warning text-dark';
      case 'completed':        return 'bg-primary';
      default:                 return 'bg-secondary';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending_proposal': return 'Pending Proposal';
      case 'active':           return 'Active';
      case 'completed':        return 'Completed';
      default:                 return status || '—';
    }
  };

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
      <Breadcrumb pageName="Manage Projects" />

      <div className="card shadow-sm border-0">

        {/* Card Header */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <h5 className="fw-semibold text-dark mb-0">Projects</h5>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by title, supervisor or status"
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
                  <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-5">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project, index) => (
                    <tr
                      key={project._id}
                      onClick={() => navigate(`/coordinator/projects/${project._id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>

                      <td className="px-4 py-3 fw-medium text-dark small">{project.title}</td>

                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(project.status)}`}>
                          {formatStatus(project.status)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {project.supervisors?.[0]?.name ? (
                          <span className="text-dark small fw-medium">
                            {project.supervisors[0].name}
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-pill px-2 small">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm px-3"
                            onClick={(e) => { e.stopPropagation(); openEditModal(project._id); }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-3"
                            onClick={(e) => { e.stopPropagation(); openDeleteConfirm(project._id); }}
                          >
                            Delete
                          </button>
                        </div>
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
                  {modalError && (
                    <div className="alert alert-danger border-0 py-2 mb-3 small">{modalError}</div>
                  )}
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">Project Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleFormChange}
                        className="form-control"
                        placeholder="Enter project title"
                      />
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
                        min="1"
                        max="5"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-medium text-dark small">Description</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        className="form-control"
                        rows="3"
                        placeholder="Optional project description"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3">
                  <button className="btn btn-outline-secondary px-4" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-success px-4 fw-medium"
                    onClick={handleSave}
                    disabled={modalLoading}
                  >
                    {modalLoading
                      ? <span className="spinner-border spinner-border-sm me-2" />
                      : null}
                    {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
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
                  <h6 className="fw-semibold text-dark mb-2">Delete Project</h6>
                  <p className="text-muted small mb-0">
                    This will permanently delete the project. This cannot be undone!
                  </p>
                </div>
                <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger px-4 fw-medium"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading
                      ? <span className="spinner-border spinner-border-sm me-2" />
                      : null}
                    Yes, Delete
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
              Unassigned: <strong className="text-warning">{unassignedCount}</strong>
            </span>
          </div>
        </div>

      </div>
    </>
  );
};

export default Projects;
