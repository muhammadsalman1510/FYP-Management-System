import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROJECT DETAIL
  View and manage a single project:
  - Assign/change supervisor
  - Add/remove students
  - Mark milestones as complete (buttons 2-5, milestone 1 auto-done on proposal approval)

  MILESTONE LOGIC:
  - Milestone 1 (Proposal):     AUTO-completed when coordinator approved the proposal
  - Milestone 2 (Defense):      Coordinator clicks "Mark Complete" after physical defense
  - Milestone 3 (Implementation): Coordinator clicks "Mark Complete"
  - Milestone 4 (Documentation): Coordinator clicks "Mark Complete"
  - Milestone 5 (Final):        Coordinator clicks "Mark Complete"

  TODO (Backend): GET    /api/projects/:id
  TODO (Backend): PUT    /api/projects/:id/supervisor
  TODO (Backend): POST   /api/projects/:id/students
  TODO (Backend): DELETE /api/projects/:id/students/:studentId
  TODO (Backend): PUT    /api/projects/:id/milestones/:milestoneId  { completed: true }
*/

const ProjectDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const token        = localStorage.getItem('token');
  const authHeaders  = { headers: { Authorization: `Bearer ${token}` } };

  const [project,     setProject]     = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState({ show: false, message: '', type: 'success' });

  // Modals
  const [showChangeSupervisor, setShowChangeSupervisor] = useState(false);
  const [showAssignStudent,    setShowAssignStudent]    = useState(false);
  const [supervisorInput,      setSupervisorInput]      = useState('');
  const [studentInput,         setStudentInput]         = useState('');

  // Remove confirm
  const [showRemoveConfirm,  setShowRemoveConfirm]  = useState(false);
  const [removingStudentId,  setRemovingStudentId]  = useState(null);

  // Milestone confirm
  const [milestoneConfirm,   setMilestoneConfirm]   = useState(null); // milestone object

  // Local milestones state (synced with project)
  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Project Proposal',    completed: false, autoCompleted: true,  description: 'Auto-completed when proposal was approved.' },
    { id: 2, name: 'Project Defense',     completed: false, autoCompleted: false, description: 'Mark after physical defense is completed.' },
    { id: 3, name: 'Implementation',      completed: false, autoCompleted: false, description: 'Mark after implementation phase is done.' },
    { id: 4, name: 'Documentation',       completed: false, autoCompleted: false, description: 'Mark after documentation is submitted.' },
    { id: 5, name: 'Final Presentation',  completed: false, autoCompleted: false, description: 'Mark after final presentation.' },
  ]);

  const showAlertMsg = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch project
  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`http://localhost:4000/api/projects/${id}`, authHeaders);
      setProject(data.project);
      // Sync milestones from project data if available
      // TODO (Backend): data.project.milestones should return milestone completion state
      if (data.project.milestones) {
        setMilestones(data.project.milestones);
      }
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to load project.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/users?role=supervisor', authHeaders);
      setSupervisors(data.users || []);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/users?role=student', authHeaders);
      setStudents(data.users || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProject(); fetchSupervisors(); fetchStudents(); }, [id]);

  // Assign supervisor
  const handleAssignSupervisor = async () => {
    if (!supervisorInput) { showAlertMsg('Please select a supervisor.', 'warning'); return; }
    try {
      await axios.put(`http://localhost:4000/api/projects/${id}/supervisor`,
        { supervisorId: supervisorInput }, authHeaders);
      showAlertMsg('Supervisor assigned successfully!');
      fetchProject();
      setShowChangeSupervisor(false);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to assign supervisor.', 'danger');
    }
  };

  // Add student
  const handleAddStudent = async () => {
    if (!studentInput) { showAlertMsg('Please select a student.', 'warning'); return; }
    try {
      await axios.post(`http://localhost:4000/api/projects/${id}/students`,
        { studentId: studentInput }, authHeaders);
      showAlertMsg('Student added successfully!');
      fetchProject();
      setShowAssignStudent(false);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to add student.', 'danger');
    }
  };

  // Remove student
  const handleRemoveStudent = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/projects/${id}/students/${removingStudentId}`, authHeaders);
      showAlertMsg('Student removed.');
      fetchProject();
      setShowRemoveConfirm(false);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to remove student.', 'danger');
    }
  };

  // Mark milestone complete
  const handleMarkMilestone = async () => {
    if (!milestoneConfirm) return;
    try {
      // TODO (Backend): PUT /api/projects/:id/milestones/:milestoneId { completed: true }
      await axios.put(
        `http://localhost:4000/api/projects/${id}/milestones/${milestoneConfirm.id}`,
        { completed: true },
        authHeaders
      );
      // Update local state immediately
      setMilestones(prev =>
        prev.map(m => m.id === milestoneConfirm.id
          ? { ...m, completed: true, completedAt: new Date().toISOString().split('T')[0] }
          : m
        )
      );
      showAlertMsg(`"${milestoneConfirm.name}" marked as complete!`);
      setMilestoneConfirm(null);
      fetchProject();
    } catch (err) {
      // If backend route not ready, just update locally for now
      setMilestones(prev =>
        prev.map(m => m.id === milestoneConfirm.id
          ? { ...m, completed: true, completedAt: new Date().toISOString().split('T')[0] }
          : m
        )
      );
      showAlertMsg(`"${milestoneConfirm.name}" marked as complete! (local only - connect backend)`);
      setMilestoneConfirm(null);
    }
  };

  const completedMilestones = milestones.filter(m => m.completed).length;
  const progressPercent     = (completedMilestones / milestones.length) * 100;
  const currentMilestoneIdx = milestones.findIndex(m => !m.completed);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!project) return (
    <div className="card shadow-sm border-0">
      <div className="card-body text-center py-5">
        <p className="text-muted mb-2">Project not found.</p>
        <button className="btn btn-primary px-4" onClick={() => navigate('/coordinator/accounts/projects')}>
          Back to Projects
        </button>
      </div>
    </div>
  );

  // Students not already in project (for dropdown)
  const assignedStudentIds = (project.students || []).map(s => s._id);
  const availableStudents  = students.filter(s => !assignedStudentIds.includes(s._id));

  return (
    <>
      <Breadcrumb pageName="Project Detail" />

      {/* Back */}
      <button className="btn btn-outline-secondary btn-sm px-3 mb-4"
        onClick={() => navigate('/coordinator/accounts/projects')}>
        ← Back to Projects
      </button>

      {/* Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm mb-4`}>
          {alert.message}
        </div>
      )}

      {/* Project Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <h5 className="fw-semibold text-dark mb-1">{project.title}</h5>
              <p className="text-muted small mb-0">{project.description}</p>
            </div>
            <div className="text-end">
              <span className="badge bg-success rounded-pill px-3 py-2 mb-1">Active</span>
              <p className="text-muted small mb-0">
                Capacity: {(project.students || []).length}/{project.maxStudents} students
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        {/* LEFT: Supervisor + Students */}
        <div className="col-12 col-xl-5">

          {/* Supervisor */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Supervisor</h6>
              <button className="btn btn-outline-primary btn-sm px-3"
                onClick={() => setShowChangeSupervisor(true)}>
                {project.supervisor ? 'Change' : 'Assign'}
              </button>
            </div>
            <div className="card-body p-4">
              {project.supervisor ? (
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                    style={{ width: '44px', height: '44px', minWidth: '44px', backgroundColor: '#28a745', fontSize: '0.9rem' }}
                  >
                    {(project.supervisor.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="fw-semibold text-dark mb-0 small">{project.supervisor.name}</p>
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{project.supervisor.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted small mb-0">No supervisor assigned yet.</p>
              )}
            </div>
          </div>

          {/* Students */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">
                Students
                <span className="badge bg-primary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                  {(project.students || []).length}/{project.maxStudents}
                </span>
              </h6>
              {(project.students || []).length < project.maxStudents && (
                <button className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => setShowAssignStudent(true)}>
                  + Add
                </button>
              )}
            </div>
            <div className="card-body p-3">
              {(project.students || []).length === 0 ? (
                <p className="text-muted small mb-0 text-center py-3">No students added yet.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {project.students.map(student => (
                    <div key={student._id}
                      className="d-flex align-items-center justify-content-between p-2 rounded border">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                          style={{ width: '32px', height: '32px', minWidth: '32px', backgroundColor: '#3c50e0', fontSize: '0.72rem' }}
                        >
                          {(student.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="fw-medium text-dark mb-0" style={{ fontSize: '0.82rem' }}>{student.name}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{student.email}</p>
                        </div>
                      </div>
                      <button className="btn btn-outline-danger btn-sm px-2"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => { setRemovingStudentId(student._id); setShowRemoveConfirm(true); }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Milestones */}
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-dark mb-0">Project Milestones</h6>
                  <p className="text-muted small mb-0 mt-1">
                    {completedMilestones}/{milestones.length} completed
                  </p>
                </div>
                <span className="fw-bold text-primary">{Math.round(progressPercent)}%</span>
              </div>
              {/* Mini progress bar */}
              <div className="progress mt-3" style={{ height: '6px', borderRadius: '4px' }}>
                <div className="progress-bar bg-primary"
                  style={{ width: `${progressPercent}%`, borderRadius: '4px' }} />
              </div>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`d-flex align-items-center justify-content-between p-3 rounded border ${
                      milestone.completed
                        ? 'border-success bg-success bg-opacity-10'
                        : index === currentMilestoneIdx
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                    }`}
                  >
                    {/* Left */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                        style={{
                          width: '36px', height: '36px', minWidth: '36px',
                          backgroundColor: milestone.completed ? '#28a745' : index === currentMilestoneIdx ? '#3c50e0' : '#e9ecef',
                          color: milestone.completed || index === currentMilestoneIdx ? '#fff' : '#adb5bd',
                          fontSize: '0.82rem',
                        }}
                      >
                        {milestone.completed ? '✓' : milestone.id}
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{milestone.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{milestone.description}</p>
                        {milestone.completed && milestone.completedAt && (
                          <p className="text-success mb-0" style={{ fontSize: '0.68rem' }}>
                            Completed: {milestone.completedAt}
                            {milestone.autoCompleted && ' (auto)'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex-shrink-0 ms-3">
                      {milestone.completed ? (
                        <span className="badge bg-success rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>
                          Done
                        </span>
                      ) : milestone.autoCompleted ? (
                        <span className="badge bg-secondary rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>
                          Auto
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm px-3"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setMilestoneConfirm(milestone)}
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODAL: Change Supervisor ── */}
      {showChangeSupervisor && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">Assign Supervisor</h5>
                <button className="btn-close" onClick={() => setShowChangeSupervisor(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <label className="form-label fw-medium text-dark small">Select Supervisor</label>
                <select className="form-select" value={supervisorInput}
                  onChange={e => setSupervisorInput(e.target.value)}>
                  <option value="">-- Select --</option>
                  {supervisors.map(s => (
                    <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4"
                  onClick={() => setShowChangeSupervisor(false)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium"
                  onClick={handleAssignSupervisor}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Student ── */}
      {showAssignStudent && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">Add Student</h5>
                <button className="btn-close" onClick={() => setShowAssignStudent(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <label className="form-label fw-medium text-dark small">Select Student</label>
                <select className="form-select" value={studentInput}
                  onChange={e => setStudentInput(e.target.value)}>
                  <option value="">-- Select --</option>
                  {availableStudents.map(s => (
                    <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4"
                  onClick={() => setShowAssignStudent(false)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium"
                  onClick={handleAddStudent}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Remove Student Confirm ── */}
      {showRemoveConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <h6 className="fw-semibold text-dark mb-2">Remove Student?</h6>
                <p className="text-muted small mb-0">This student will be removed from the project.</p>
              </div>
              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-4"
                  onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
                <button className="btn btn-danger px-4 fw-medium"
                  onClick={handleRemoveStudent}>Yes, Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Mark Milestone Complete Confirm ── */}
      {milestoneConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#3c50e020' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3c50e0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
                <h6 className="fw-semibold text-dark mb-2">
                  Mark "{milestoneConfirm.name}" as Complete?
                </h6>
                <p className="text-muted small mb-0">
                  This will update the project progress bar for all students in this project.
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-4"
                  onClick={() => setMilestoneConfirm(null)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium"
                  onClick={handleMarkMilestone}>Yes, Mark Complete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ProjectDetail;