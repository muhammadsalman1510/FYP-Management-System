import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — PROJECT DETAIL
  Tab-based view for managing a single project.

  TODO (Backend): GET    /api/projects/:id
  TODO (Backend): PUT    /api/projects/:id/supervisor
  TODO (Backend): POST   /api/projects/:id/students
  TODO (Backend): DELETE /api/projects/:id/students/:studentId
  TODO (Backend): PUT    /api/projects/:id/milestones/:milestoneId { completed: true }
  TODO (Backend): GET    /api/documents?projectId=:id  (Documents tab)
  TODO (Backend): GET    /api/proposals?projectId=:id  (Proposal tab)
*/

// TODO (Backend): Replace with GET /api/documents?projectId=:id
const DUMMY_DOCUMENTS = [
  { _id: 'd1', name: 'Project Proposal.pdf',   type: 'Proposal',         uploadedBy: 'Muhammad Salman', uploadedAt: '2024-01-15', size: '2.4 MB' },
  { _id: 'd2', name: 'Literature Review.docx', type: 'Literature Review', uploadedBy: 'Ali Hassan',      uploadedAt: '2024-01-20', size: '1.8 MB' },
  { _id: 'd3', name: 'Progress Report Q1.pdf', type: 'Progress Report',   uploadedBy: 'Muhammad Salman', uploadedAt: '2024-02-10', size: '3.2 MB' },
];

// TODO (Backend): Replace with GET /api/proposals?projectId=:id
const DUMMY_PROPOSAL = {
  title: 'FYP Management & Tracking System',
  description: 'A web-based system to manage and track Final Year Projects for students, supervisors, and coordinators using the MERN stack.',
  problemStatement: 'Universities lack a unified digital platform for managing FYP workflows, leading to miscommunication, missed deadlines, and poor tracking.',
  stack: 'React.js, Node.js, Express.js, MongoDB',
  expectedOutcome: 'A fully functional multi-role web application that streamlines FYP management.',
  submittedDate: '2024-04-25',
  status: 'approved',
  feedback: 'Excellent proposal. Proceed with project creation and team assignment.',
  groupMembers: [
    { name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7', section: 'A' },
    { name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7', section: 'A' },
  ],
};

const docTypeColors = {
  'Proposal':          '#3c50e0',
  'Literature Review': '#28a745',
  'Implementation':    '#17a2b8',
  'Progress Report':   '#fd7e14',
  'Screenshots':       '#17a2b8',
  'Final Report':      '#6f42c1',
  'Other':             '#6c757d',
};

const ProjectDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const token       = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [project,     setProject]     = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [alert,       setAlert]       = useState({ show: false, message: '', type: 'success' });
  const [activeTab,   setActiveTab]   = useState('overview');

  // Modals
  const [showChangeSupervisor, setShowChangeSupervisor] = useState(false);
  const [showAssignStudent,    setShowAssignStudent]    = useState(false);
  const [supervisorInput,      setSupervisorInput]      = useState('');
  const [studentInput,         setStudentInput]         = useState('');
  const [showRemoveConfirm,    setShowRemoveConfirm]    = useState(false);
  const [removingStudentId,    setRemovingStudentId]    = useState(null);
  const [milestoneConfirm,     setMilestoneConfirm]     = useState(null);

  const [milestones, setMilestones] = useState([
    { id: 1, name: 'Project Proposal',   completed: false, autoCompleted: true,  description: 'Auto-completed when proposal was approved.' },
    { id: 2, name: 'Project Defense',    completed: false, autoCompleted: false, description: 'Mark after physical defense is completed.' },
    { id: 3, name: 'Implementation',     completed: false, autoCompleted: false, description: 'Mark after implementation phase is done.' },
    { id: 4, name: 'Documentation',      completed: false, autoCompleted: false, description: 'Mark after documentation is submitted.' },
    { id: 5, name: 'Final Presentation', completed: false, autoCompleted: false, description: 'Mark after final presentation.' },
  ]);

  const showAlertMsg = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3500);
  };

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(`http://localhost:4000/api/projects/${id}`, authHeaders);
      setProject(data.project);
      if (data.project.milestones) setMilestones(data.project.milestones);
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

  const handleAssignSupervisor = async () => {
    if (!supervisorInput) { showAlertMsg('Please select a supervisor.', 'warning'); return; }
    try {
      await axios.put(`http://localhost:4000/api/projects/${id}/supervisor`, { supervisorId: supervisorInput }, authHeaders);
      showAlertMsg('Supervisor assigned successfully!');
      fetchProject();
      setShowChangeSupervisor(false);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to assign supervisor.', 'danger');
    }
  };

  const handleAddStudent = async () => {
    if (!studentInput) { showAlertMsg('Please select a student.', 'warning'); return; }
    try {
      await axios.post(`http://localhost:4000/api/projects/${id}/students`, { studentId: studentInput }, authHeaders);
      showAlertMsg('Student added successfully!');
      fetchProject();
      setShowAssignStudent(false);
    } catch (err) {
      showAlertMsg(err.response?.data?.message || 'Failed to add student.', 'danger');
    }
  };

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

  const handleMarkMilestone = async () => {
    if (!milestoneConfirm) return;
    try {
      // TODO (Backend): PUT /api/projects/:id/milestones/:milestoneId { completed: true }
      await axios.put(
        `http://localhost:4000/api/projects/${id}/milestones/${milestoneConfirm.id}`,
        { completed: true },
        authHeaders
      );
    } catch (_) {
      // Backend route not ready yet — update locally
    }
    setMilestones(prev =>
      prev.map(m => m.id === milestoneConfirm.id
        ? { ...m, completed: true, completedAt: new Date().toISOString().split('T')[0] }
        : m
      )
    );
    showAlertMsg(`"${milestoneConfirm.name}" marked as complete!`);
    setMilestoneConfirm(null);
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
        <p className="text-muted mb-3">Project not found.</p>
        <button className="btn btn-primary px-4"
          onClick={() => navigate('/coordinator/accounts/projects')}>
          Back to Projects
        </button>
      </div>
    </div>
  );

  const assignedStudentIds = (project.students || []).map(s => s._id);
  const availableStudents  = students.filter(s => !assignedStudentIds.includes(s._id));

  const tabs = [
    { key: 'overview',   label: 'Overview' },
    { key: 'milestones', label: `Milestones (${completedMilestones}/${milestones.length})` },
    { key: 'documents',  label: `Documents (${DUMMY_DOCUMENTS.length})` },
    { key: 'proposal',   label: 'Proposal' },
  ];

  const statusLabel = project.status === 'active'
    ? 'Active'
    : project.status === 'completed'
    ? 'Completed'
    : 'Pending Proposal';

  const statusColor = project.status === 'active'
    ? { bg: '#28a74520', text: '#28a745' }
    : project.status === 'completed'
    ? { bg: '#3c50e020', text: '#3c50e0' }
    : { bg: '#ffc10720', text: '#d39e00' };

  return (
    <>
      <Breadcrumb pageName="Project Detail" />

      <button
        className="btn btn-outline-secondary btn-sm px-3 mb-4 d-flex align-items-center gap-2"
        onClick={() => navigate('/coordinator/accounts/projects')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Projects
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
              <h4 className="fw-bold text-dark mb-1">{project.title}</h4>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem', maxWidth: '600px' }}>
                {project.description}
              </p>
            </div>
            <div className="text-end">
              <span
                className="badge mb-2 px-3 py-2 d-block"
                style={{ backgroundColor: statusColor.bg, color: statusColor.text, fontSize: '0.78rem' }}
              >
                {statusLabel}
              </span>
              <p className="text-muted small mb-0">
                Capacity: {(project.students || []).length}/{project.maxStudents} students
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                {completedMilestones}/{milestones.length} milestones completed
              </span>
              <span className="fw-semibold text-primary" style={{ fontSize: '0.78rem' }}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="progress" style={{ height: '6px', borderRadius: '4px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${progressPercent}%`, borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4" style={{ borderBottom: '2px solid #e9ecef' }}>
        <div className="d-flex gap-1 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="btn btn-sm fw-medium px-4 py-2"
              style={{
                borderRadius: '6px 6px 0 0',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #3c50e0' : '2px solid transparent',
                backgroundColor: activeTab === tab.key ? '#3c50e010' : 'transparent',
                color: activeTab === tab.key ? '#3c50e0' : '#6c757d',
                marginBottom: '-2px',
                fontSize: '0.85rem',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAB: OVERVIEW — Supervisor + Students
          ══════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="row g-4">

          {/* Supervisor */}
          <div className="col-12 col-xl-5">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Supervisor</h6>
                <button
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => setShowChangeSupervisor(true)}
                >
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
                  <p className="text-muted small mb-0 text-center py-2">No supervisor assigned yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Students */}
          <div className="col-12 col-xl-7">
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
                      <div
                        key={student._id}
                        className="d-flex align-items-center justify-content-between p-2 rounded border"
                      >
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
                        <button
                          className="btn btn-outline-danger btn-sm px-2"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => { setRemovingStudentId(student._id); setShowRemoveConfirm(true); }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: MILESTONES
          ══════════════════════════════════════════ */}
      {activeTab === 'milestones' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="fw-semibold text-dark mb-0">Project Milestones</h6>
                <p className="text-muted small mb-0 mt-1">
                  {completedMilestones}/{milestones.length} completed — only the coordinator can mark milestones complete.
                </p>
              </div>
              <span className="fw-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <div className="progress mt-3" style={{ height: '6px', borderRadius: '4px' }}>
              <div className="progress-bar bg-primary" style={{ width: `${progressPercent}%`, borderRadius: '4px' }} />
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
                          Completed: {milestone.completedAt}{milestone.autoCompleted && ' (auto)'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-3">
                    {milestone.completed ? (
                      <span className="badge bg-success rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>Done</span>
                    ) : milestone.autoCompleted ? (
                      <span className="badge bg-secondary rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>Auto</span>
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
      )}

      {/* ══════════════════════════════════════════
          TAB: DOCUMENTS
          ══════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Project Documents</h6>
            <p className="text-muted small mb-0 mt-1">Files uploaded by students for this project.</p>
          </div>
          <div className="card-body p-4">
            {DUMMY_DOCUMENTS.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {DUMMY_DOCUMENTS.map(doc => (
                  <div key={doc._id} className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded"
                        style={{
                          width: '42px', height: '42px', flexShrink: 0,
                          backgroundColor: docTypeColors[doc.type] || '#6c757d',
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{doc.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                          {doc.type} &bull; {doc.uploadedAt} &bull; {doc.size} &bull; By {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm px-3" style={{ fontSize: '0.75rem' }}>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: PROPOSAL
          ══════════════════════════════════════════ */}
      {activeTab === 'proposal' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-semibold text-dark mb-0">Project Proposal</h6>
              <p className="text-muted small mb-0 mt-1">Submitted by the student group.</p>
            </div>
            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                backgroundColor: DUMMY_PROPOSAL.status === 'approved' ? '#28a74520' : DUMMY_PROPOSAL.status === 'rejected' ? '#dc354520' : '#ffc10720',
                color: DUMMY_PROPOSAL.status === 'approved' ? '#28a745' : DUMMY_PROPOSAL.status === 'rejected' ? '#dc3545' : '#d39e00',
                fontSize: '0.78rem',
              }}
            >
              {DUMMY_PROPOSAL.status.charAt(0).toUpperCase() + DUMMY_PROPOSAL.status.slice(1)}
            </span>
          </div>
          <div className="card-body p-4">
            <div className="row g-4 mb-4">
              <div className="col-12">
                <p className="fw-semibold text-dark small mb-1">Project Title</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.title}</p>
              </div>
              <div className="col-12">
                <p className="fw-semibold text-dark small mb-1">Description</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.description}</p>
              </div>
              <div className="col-12">
                <p className="fw-semibold text-dark small mb-1">Problem Statement</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.problemStatement}</p>
              </div>
              <div className="col-12 col-md-6">
                <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.stack}</p>
              </div>
              <div className="col-12 col-md-6">
                <p className="fw-semibold text-dark small mb-1">Expected Outcome</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.expectedOutcome}</p>
              </div>
              <div className="col-12 col-md-6">
                <p className="fw-semibold text-dark small mb-1">Submitted On</p>
                <p className="text-muted small mb-0">{DUMMY_PROPOSAL.submittedDate}</p>
              </div>
            </div>

            {/* Group Members */}
            <div className="mb-4">
              <p className="fw-semibold text-dark small mb-2">
                Group Members ({DUMMY_PROPOSAL.groupMembers.length})
              </p>
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small fw-semibold">#</th>
                      <th className="small fw-semibold">Name</th>
                      <th className="small fw-semibold">Roll No.</th>
                      <th className="small fw-semibold">Program</th>
                      <th className="small fw-semibold">Semester</th>
                      <th className="small fw-semibold">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUMMY_PROPOSAL.groupMembers.map((m, i) => (
                      <tr key={i}>
                        <td className="small text-muted">{i + 1}</td>
                        <td className="small fw-medium text-dark">{m.name}</td>
                        <td className="small text-muted">{m.rollNumber}</td>
                        <td className="small text-muted">{m.program}</td>
                        <td className="small text-muted">{m.semester}</td>
                        <td className="small text-muted">{m.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feedback */}
            {DUMMY_PROPOSAL.feedback && (
              <div className={`alert ${DUMMY_PROPOSAL.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-0`}>
                <p className="small mb-0">
                  <strong>Coordinator Feedback:</strong> {DUMMY_PROPOSAL.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Assign Supervisor ── */}
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

      {/* ── MODAL: Mark Milestone Confirm ── */}
      {milestoneConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                  style={{ width: '56px', height: '56px', backgroundColor: '#3c50e020' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#3c50e0">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <h6 className="fw-semibold text-dark mb-2">
                  Mark "{milestoneConfirm.name}" as Complete?
                </h6>
                <p className="text-muted small mb-0">
                  This updates the project progress for all students. This action cannot be undone.
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
