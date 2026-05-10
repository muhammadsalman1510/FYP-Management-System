// 📁 FILE: src/pages/Coordinator/ProjectDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROJECT DETAIL
  View and manage a single project: supervisor, assigned students, capacity.
  TODO (Backend): GET  /api/projects/:id
  TODO (Backend): PUT  /api/projects/:id/supervisor
  TODO (Backend): POST /api/projects/:id/students
  TODO (Backend): DELETE /api/projects/:id/students/:studentId
*/

const ProjectDetail = () => {
    const { id } = useParams();
    const token = localStorage.getItem('token');

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // ── Modals ──────────────────────────────────────────────
    const [showChangeSupervisor, setShowChangeSupervisor] = useState(false);
    const [showAssignStudent, setShowAssignStudent] = useState(false);
    const [supervisorInput, setSupervisorInput] = useState('');
    const [studentInput, setStudentInput] = useState('');

    // ── Confirm remove ───────────────────────────────────────
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [removingStudentId, setRemovingStudentId] = useState(null);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    };

    // ── Fetch project ────────────────────────────────────────
    const fetchProject = async () => {
        try {
            const { data } = await axios.get(`http://localhost:4000/api/projects/${id}`, authHeaders);
            setProject(data.project);
        } catch (err) {
            console.error('Fetch project error:', err);
            showAlert(err.response?.data?.message || 'Failed to load project.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    // ── Change supervisor ────────────────────────────────────
    const handleChangeSupervisor = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:4000/api/projects/${id}/supervisor`,
                { supervisorId: supervisorInput },
                authHeaders
            );
            showAlert('Supervisor updated successfully.');
            setShowChangeSupervisor(false);
            setSupervisorInput('');
            await fetchProject();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to update supervisor.', 'danger');
        }
    };

    // ── Assign student ───────────────────────────────────────
    const handleAssignStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `http://localhost:4000/api/projects/${id}/students`,
                { studentId: studentInput },
                authHeaders
            );
            showAlert('Student assigned successfully.');
            setShowAssignStudent(false);
            setStudentInput('');
            await fetchProject();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to assign student.', 'danger');
        }
    };

    // ── Remove student ───────────────────────────────────────
    const handleRemoveStudent = async () => {
        try {
            await axios.delete(
                `http://localhost:4000/api/projects/${id}/students/${removingStudentId}`,
                authHeaders
            );
            showAlert('Student removed successfully.');
            setShowRemoveConfirm(false);
            setRemovingStudentId(null);
            await fetchProject();
        } catch (err) {
            showAlert(err.response?.data?.message || 'Failed to remove student.', 'danger');
        }
    };

    const openRemoveConfirm = (studentId) => {
        setRemovingStudentId(studentId);
        setShowRemoveConfirm(true);
    };

    const getInitials = (name = '') =>
        name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const capacityPercent = project
        ? Math.round((project.students.length / project.maxStudents) * 100)
        : 0;

    const capacityColor =
        capacityPercent >= 100 ? '#dc3545' : capacityPercent >= 70 ? '#ffc107' : '#3c50e0';

    // ── Render ───────────────────────────────────────────────
    if (loading) {
        return (
            <>
                <Breadcrumb pageName="Project Detail" />
                <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            </>
        );
    }

    if (!project) {
        return (
            <>
                <Breadcrumb pageName="Project Detail" />
                <div className="alert alert-danger border-0">Project not found.</div>
            </>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Project Detail" />

            <div className="row justify-content-center">
                <div className="col-12 col-xl-8">

                    {/* Alert */}
                    {alert.show && (
                        <div className={`alert alert-${alert.type} border-0 mb-4`}>
                            {alert.message}
                        </div>
                    )}

                    {/* ── Project Details Card ── */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                            <h5 className="fw-semibold text-dark mb-0">Project details</h5>
                            <span
                                className="badge rounded-pill px-3"
                                style={{ fontSize: '0.7rem', backgroundColor: '#e6f1fb', color: '#0c447c' }}
                            >
                                {project.status ?? 'Active'}
                            </span>
                        </div>
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <p className="text-muted small mb-1">Project title</p>
                                <p className="fw-semibold fs-5 text-dark mb-0">{project.title}</p>
                            </div>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <div className="p-3 rounded-3" style={{ background: 'var(--bs-gray-100, #f8f9fa)' }}>
                                        <p className="text-muted small mb-1">Session</p>
                                        <p className="fw-medium text-dark mb-0">{project.session ?? '—'}</p>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="p-3 rounded-3" style={{ background: 'var(--bs-gray-100, #f8f9fa)' }}>
                                        <p className="text-muted small mb-1">Program</p>
                                        <p className="fw-medium text-dark mb-0">{project.program ?? '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Supervisor Card ── */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                            <h5 className="fw-semibold text-dark mb-0">Supervisor</h5>
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setShowChangeSupervisor(true)}
                            >
                                <i className="ti ti-refresh me-1" style={{ fontSize: '14px' }} />
                                Change
                            </button>
                        </div>
                        <div className="card-body p-4">
                            {project.supervisor ? (
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded-circle fw-medium"
                                        style={{
                                            width: '44px', height: '44px', minWidth: '44px',
                                            backgroundColor: '#e6f1fb', color: '#0c447c', fontSize: '14px',
                                        }}
                                    >
                                        {getInitials(project.supervisor.name)}
                                    </div>
                                    <div>
                                        <p className="fw-medium text-dark mb-0">{project.supervisor.name}</p>
                                        <p className="text-muted small mb-0">{project.supervisor.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted small mb-0">No supervisor assigned yet.</p>
                            )}
                        </div>
                    </div>

                    {/* ── Students Card ── */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                            <h5 className="fw-semibold text-dark mb-0">Students</h5>
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => setShowAssignStudent(true)}
                                disabled={project.students.length >= project.maxStudents}
                            >
                                <i className="ti ti-user-plus me-1" style={{ fontSize: '14px' }} />
                                Assign student
                            </button>
                        </div>
                        <div className="card-body p-4">

                            {project.students.length === 0 ? (
                                <p className="text-muted small mb-0">No students assigned yet.</p>
                            ) : (
                                project.students.map((student) => (
                                    <div
                                        key={student._id}
                                        className="d-flex align-items-center justify-content-between py-2 border-bottom"
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="d-flex align-items-center justify-content-center rounded-circle text-muted fw-medium"
                                                style={{
                                                    width: '34px', height: '34px', minWidth: '34px',
                                                    backgroundColor: '#f0f0f0', fontSize: '12px',
                                                }}
                                            >
                                                {getInitials(student.name)}
                                            </div>
                                            <div>
                                                <p className="fw-medium text-dark mb-0" style={{ fontSize: '14px' }}>{student.name}</p>
                                                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>{student.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => openRemoveConfirm(student._id)}
                                        >
                                            <i className="ti ti-user-minus me-1" style={{ fontSize: '13px' }} />
                                            Remove
                                        </button>
                                    </div>
                                ))
                            )}

                            {/* Capacity bar */}
                            <div className="mt-4 pt-3 border-top">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="text-muted small mb-0">Student capacity</p>
                                    <p className="text-muted small mb-0">
                                        {project.students.length} / {project.maxStudents}
                                    </p>
                                </div>
                                <div className="progress" style={{ height: '8px' }}>
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${capacityPercent}%`, backgroundColor: capacityColor }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* ── Change Supervisor Modal ── */}
            {showChangeSupervisor && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-semibold">Change supervisor</h5>
                                <button className="btn-close" onClick={() => setShowChangeSupervisor(false)} />
                            </div>
                            <form onSubmit={handleChangeSupervisor}>
                                <div className="modal-body p-4">
                                    <label className="form-label fw-medium text-dark small">Supervisor ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter supervisor ID"
                                        value={supervisorInput}
                                        onChange={(e) => setSupervisorInput(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowChangeSupervisor(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assign Student Modal ── */}
            {showAssignStudent && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-semibold">Assign student</h5>
                                <button className="btn-close" onClick={() => setShowAssignStudent(false)} />
                            </div>
                            <form onSubmit={handleAssignStudent}>
                                <div className="modal-body p-4">
                                    <label className="form-label fw-medium text-dark small">Student ID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter student ID"
                                        value={studentInput}
                                        onChange={(e) => setStudentInput(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="modal-footer border-top">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAssignStudent(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Assign</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Remove Student Confirm Modal ── */}
            {showRemoveConfirm && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-bottom">
                                <h5 className="modal-title fw-semibold">Remove student</h5>
                                <button className="btn-close" onClick={() => setShowRemoveConfirm(false)} />
                            </div>
                            <div className="modal-body p-4">
                                <p className="text-muted mb-0">Are you sure you want to remove this student from the project?</p>
                            </div>
                            <div className="modal-footer border-top">
                                <button className="btn btn-outline-secondary" onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
                                <button className="btn btn-danger px-4" onClick={handleRemoveStudent}>Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectDetail;