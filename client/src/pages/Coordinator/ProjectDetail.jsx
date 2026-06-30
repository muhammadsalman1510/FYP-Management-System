import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Avatar from '../../components/Avatar';

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
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]         = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [students, setStudents]       = useState([]);
  const [documents, setDocuments]     = useState([]);
  const [proposal, setProposal]       = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [alert, setAlert]             = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab]     = useState('overview');

  const [showChangeSupervisor, setShowChangeSupervisor] = useState(false);
  const [showAssignStudent, setShowAssignStudent]       = useState(false);
  const [supervisorInput, setSupervisorInput]           = useState('');
  const [studentInput, setStudentInput]                 = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm]       = useState(false);
  const [removingStudentId, setRemovingStudentId]       = useState(null);
  const [milestoneConfirm, setMilestoneConfirm]         = useState(null);

  const [selectedStudent, setSelectedStudent]     = useState(null);
  const [showStudentModal, setShowStudentModal]   = useState(false);

  const [reviewModal, setReviewModal]       = useState(false);
  const [reviewSub, setReviewSub]           = useState(null);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewing, setReviewing]           = useState(false);

  const showAlertMsg = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3500);
  };

  const token = sessionStorage.getItem('token');
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const load = async () => {
      try {
        const [projectRes, supervisorsRes, studentsRes, docsRes, proposalsRes, tasksRes, subsRes] = await Promise.all([
          fetch(`/api/projects/${id}`, { headers: authHeaders }),
          fetch('/api/users?role=supervisor', { headers: authHeaders }),
          fetch('/api/users?role=student', { headers: authHeaders }),
          fetch('/api/documents', { headers: authHeaders }),
          fetch('/api/proposals', { headers: authHeaders }),
          fetch('/api/tasks', { headers: authHeaders }),
          fetch('/api/tasks/submissions', { headers: authHeaders }),
        ]);

        const [projectData, supervisorsData, studentsData, docsData, proposalsData, tasksData, subsData] = await Promise.all([
          projectRes.json(), supervisorsRes.json(), studentsRes.json(),
          docsRes.json(), proposalsRes.json(), tasksRes.json(), subsRes.json(),
        ]);

        if (!projectRes.ok) throw new Error(projectData.message || 'Failed to load project');

        setProject(projectData.data);
        setSupervisors(supervisorsData.users || []);
        setStudents(studentsData.users || []);

        if (docsData.success) {
          setDocuments((docsData.data || []).filter(
            (d) => d.projectId?._id?.toString() === id || d.projectId?.toString() === id
          ));
        }
        if (proposalsData.success) {
          const match = (proposalsData.data || []).find(
            (p) => p.projectId?._id?.toString() === id || p.projectId?.toString() === id
          );
          setProposal(match || null);
        }
        if (tasksData.success) {
          setTasks((tasksData.data || []).filter((t) => {
            const pid = t.projectId?._id || t.projectId;
            return String(pid) === String(id);
          }));
        }
        if (subsData.success) {
          setSubmissions((subsData.data || []).filter((s) => {
            const pid = s.projectId?._id || s.projectId;
            return String(pid) === String(id);
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const refreshProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to refresh');
      setProject(data.data);
    } catch (err) {
      showAlertMsg(err.message, 'danger');
    }
  };

  const handleAssignSupervisor = async () => {
    if (!supervisorInput) { showAlertMsg('Please select a supervisor.', 'warning'); return; }
    try {
      const res = await fetch(`/api/projects/${id}/supervisor`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ supervisorId: supervisorInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign supervisor');
      showAlertMsg('Supervisor assigned successfully!');
      await refreshProject();
      setShowChangeSupervisor(false);
      setSupervisorInput('');
    } catch (err) {
      showAlertMsg(err.message, 'danger');
    }
  };

  const handleAddStudent = async () => {
    if (!studentInput) { showAlertMsg('Please select a student.', 'warning'); return; }
    try {
      const res = await fetch(`/api/projects/${id}/students`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ studentId: studentInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add student');
      showAlertMsg('Student added successfully!');
      await refreshProject();
      setShowAssignStudent(false);
      setStudentInput('');
    } catch (err) {
      showAlertMsg(err.message, 'danger');
    }
  };

  const handleRemoveStudent = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/students/${removingStudentId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove student');
      showAlertMsg('Student removed.');
      await refreshProject();
      setShowRemoveConfirm(false);
      setRemovingStudentId(null);
    } catch (err) {
      showAlertMsg(err.message, 'danger');
    }
  };

  const handleMarkMilestone = async () => {
    if (!milestoneConfirm) return;
    try {
      const res = await fetch(`/api/projects/${id}/milestones/${milestoneConfirm.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ completed: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update milestone');
      setProject(data.data);
      showAlertMsg(`"${milestoneConfirm.name}" marked as complete!`);
    } catch (err) {
      showAlertMsg(err.message, 'danger');
    }
    setMilestoneConfirm(null);
  };

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    setShowStudentModal(false);
    setSelectedStudent(null);
  };

  const openReview = (sub, decision) => {
    setReviewSub(sub);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    setReviewing(true);
    try {
      const res = await fetch(`/api/tasks/submissions/${reviewSub._id}/review`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: reviewDecision, feedback: reviewFeedback }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Review failed');
      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === reviewSub._id ? { ...s, status: reviewDecision, feedback: reviewFeedback } : s
        )
      );
      setReviewModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return (
    <>
      <Breadcrumb pageName="Project Detail" />
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Breadcrumb pageName="Project Detail" />
      <div className="alert alert-danger border-0">{error}</div>
    </>
  );

  if (!project) return (
    <>
      <Breadcrumb pageName="Project Detail" />
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-5">
          <p className="text-muted mb-3">Project not found.</p>
          <button className="btn btn-primary px-4" onClick={() => navigate('/coordinator/accounts/projects')}>
            Back to Projects
          </button>
        </div>
      </div>
    </>
  );

  const milestones = project.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercent = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : (project.progress || 0);
  const currentMilestoneIdx = milestones.findIndex((m) => !m.completed);

  const supervisor = project.supervisors?.[0];
  const assignedStudentIds = (project.students || []).map((s) => s._id);
  const availableStudents = students.filter((s) => !assignedStudentIds.includes(s._id));
  const pendingSubsCount = submissions.filter((s) => s.status === 'pending').length;

  const studentSubs = selectedStudent
    ? submissions.filter((s) => String(s.submittedBy?._id) === String(selectedStudent._id))
    : [];
  const studentDocs = selectedStudent
    ? documents.filter((d) => String(d.uploadedBy?._id) === String(selectedStudent._id))
    : [];

  const statusLabel =
    project.status === 'active'           ? 'Active' :
    project.status === 'completed'        ? 'Completed' :
    'Pending Proposal';

  const statusColor =
    project.status === 'active'    ? { bg: '#28a74520', text: '#28a745' } :
    project.status === 'completed' ? { bg: '#3c50e020', text: '#3c50e0' } :
    { bg: '#ffc10720', text: '#d39e00' };

  const tabs = [
    { key: 'overview',    label: 'Overview' },
    { key: 'milestones',  label: `Milestones (${completedMilestones}/${milestones.length})` },
    { key: 'tasks',       label: `Tasks (${tasks.length})` },
    { key: 'submissions', label: `Submissions (${pendingSubsCount} Pending)` },
    { key: 'documents',   label: `Documents (${documents.length})` },
    { key: 'proposal',    label: 'Proposal' },
  ];

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

      {alert.show && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm mb-4`}>
          {alert.message}
        </div>
      )}

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

      <div className="mb-4" style={{ borderBottom: '2px solid #e9ecef' }}>
        <div className="d-flex gap-1 flex-wrap">
          {tabs.map((tab) => (
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

      {activeTab === 'overview' && (
        <div className="d-flex flex-column gap-4">

          <div
            className="card border-0 shadow-sm"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('tasks')}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
          >
            <div className="card-body p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: '40px', height: '40px', minWidth: '40px', backgroundColor: '#3c50e015' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#3c50e0">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                  </svg>
                </div>
                <div>
                  <p className="fw-semibold text-dark mb-0 small">
                    {tasks.length} Task{tasks.length !== 1 ? 's' : ''} assigned
                    &nbsp;&bull;&nbsp;
                    {pendingSubsCount} Submission{pendingSubsCount !== 1 ? 's' : ''} pending review
                  </p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>Click to view tasks and submissions</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3c50e0" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>

          <div className="row g-4">

            <div className="col-12 col-xl-5">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3 px-4">
                  <h6 className="fw-semibold text-dark mb-0">Supervisor</h6>
                  <button
                    className="btn btn-outline-primary btn-sm px-3"
                    onClick={() => { setSupervisorInput(''); setShowChangeSupervisor(true); }}
                  >
                    {supervisor ? 'Change' : 'Assign'}
                  </button>
                </div>
                <div className="card-body p-4">
                  {supervisor ? (
                    <div className="d-flex align-items-center gap-3">
                      <Avatar name={supervisor.name} photoUrl={supervisor.photoUrl} size={44} />
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{supervisor.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{supervisor.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted small mb-0 text-center py-2">No supervisor assigned yet.</p>
                  )}
                </div>
              </div>
            </div>

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
                    <button
                      className="btn btn-outline-primary btn-sm px-3"
                      onClick={() => { setStudentInput(''); setShowAssignStudent(true); }}
                    >
                      + Add
                    </button>
                  )}
                </div>
                <div className="card-body p-3">
                  {(project.students || []).length === 0 ? (
                    <p className="text-muted small mb-0 text-center py-3">No students added yet.</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {project.students.map((student) => (
                        <div
                          key={student._id}
                          className="d-flex align-items-center justify-content-between p-2 rounded border"
                          style={{ cursor: 'pointer', transition: 'background-color 0.15s, border-color 0.15s' }}
                          onClick={() => openStudentModal(student)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f4ff';
                            e.currentTarget.style.borderColor = '#3c50e0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '';
                            e.currentTarget.style.borderColor = '';
                          }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Avatar name={student.name} photoUrl={student.photoUrl} size={32} />
                            <div>
                              <p className="fw-medium text-dark mb-0" style={{ fontSize: '0.82rem' }}>{student.name}</p>
                              <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{student.email}</p>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2">
                              <path d="M9 18l6-6-6-6"/>
                            </svg>
                            <button
                              className="btn btn-outline-danger btn-sm px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setRemovingStudentId(student._id);
                                setShowRemoveConfirm(true);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(project.students || []).length > 0 && (
                    <p className="text-muted text-center mt-2 mb-0" style={{ fontSize: '0.72rem' }}>
                      Click a student to view their submissions and documents
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

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
                          Completed: {formatDate(milestone.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ms-3">
                    {milestone.completed ? (
                      <span className="badge bg-success rounded-pill px-3 py-2" style={{ fontSize: '0.72rem' }}>Done</span>
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

      {activeTab === 'tasks' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-semibold text-dark mb-0">Tasks</h6>
              <p className="text-muted small mb-0 mt-1">Tasks assigned to this project.</p>
            </div>
            <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/coordinator/tasks')}>
              + Create Task
            </button>
          </div>
          <div className="card-body p-0">
            {tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No tasks assigned to this project yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">TITLE &amp; INSTRUCTIONS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">CREATED BY</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">OPEN DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">DUE DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">SUBMISSIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task, i) => {
                      const subCount = submissions.filter((s) => {
                        const tid = s.taskId?._id || s.taskId;
                        return String(tid) === String(task._id);
                      }).length;
                      return (
                        <tr key={task._id}>
                          <td className="px-4 py-3 text-muted small">{i + 1}</td>
                          <td className="px-4 py-3">
                            <p className="fw-semibold text-dark mb-1 small">{task.title}</p>
                            {task.instructions && (
                              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                                {task.instructions.length > 80 ? task.instructions.slice(0, 80) + '...' : task.instructions}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted small">{task.createdBy?.name || '—'}</td>
                          <td className="px-4 py-3 text-muted small">{formatDate(task.openDate)}</td>
                          <td className="px-4 py-3 text-muted small">{formatDate(task.dueDate)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="badge rounded-pill px-3"
                              style={{
                                backgroundColor: subCount > 0 ? '#28a74520' : '#ffc10720',
                                color: subCount > 0 ? '#28a745' : '#d39e00',
                                fontSize: '0.72rem',
                              }}
                            >
                              {subCount} submission{subCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
            <p className="text-muted small mb-0 mt-1">Review files submitted by students.</p>
          </div>
          <div className="card-body p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No submissions yet for this project.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">TASK</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">STUDENT</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">FILE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">SUBMITTED</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">STATUS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0 small">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, i) => (
                      <tr key={sub._id}>
                        <td className="px-4 py-3 text-muted small">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.taskId?.title || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.submittedBy?.name || '—'}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{sub.submittedBy?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="btn btn-link btn-sm p-0 text-primary text-decoration-none small"
                            onClick={() => window.open(sub.fileUrl, '_blank')}
                          >
                            📎 {sub.fileName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted small">{formatDate(sub.submittedAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{
                              backgroundColor: sub.status === 'approved' ? '#28a74520' : sub.status === 'rejected' ? '#dc354520' : '#ffc10720',
                              color: sub.status === 'approved' ? '#28a745' : sub.status === 'rejected' ? '#dc3545' : '#d39e00',
                              fontSize: '0.72rem',
                            }}
                          >
                            {sub.status === 'pending' ? 'Pending Review' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                          {sub.feedback && (
                            <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.7rem' }}>"{sub.feedback}"</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'pending' && (
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-success px-2" onClick={() => openReview(sub, 'approved')}>✓</button>
                              <button className="btn btn-sm btn-danger px-2"  onClick={() => openReview(sub, 'rejected')}>✕</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Project Documents</h6>
            <p className="text-muted small mb-0 mt-1">Files uploaded by students for this project.</p>
          </div>
          <div className="card-body p-4">
            {documents.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {documents.map((doc) => (
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
                        <p className="fw-semibold text-dark mb-0 small">{doc.fileName}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                          {doc.type} &bull; {formatDate(doc.uploadedAt)} &bull; {doc.size} &bull; By {doc.uploadedBy?.name || '—'}
                        </p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm px-3"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'proposal' && (
        <div className="card shadow-sm border-0">
          {!proposal ? (
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No proposal submitted yet for this project.</p>
            </div>
          ) : (
            <>
              <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-semibold text-dark mb-0">Project Proposal</h6>
                  <p className="text-muted small mb-0 mt-1">
                    Submitted by {proposal.submittedBy?.name || '—'} on {formatDate(proposal.submittedAt || proposal.createdAt)}
                  </p>
                </div>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{
                    backgroundColor: proposal.status === 'approved' ? '#28a74520' : proposal.status === 'rejected' ? '#dc354520' : '#ffc10720',
                    color: proposal.status === 'approved' ? '#28a745' : proposal.status === 'rejected' ? '#dc3545' : '#d39e00',
                    fontSize: '0.78rem',
                  }}
                >
                  {proposal.status ? proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1) : '—'}
                </span>
              </div>
              <div className="card-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-12">
                    <p className="fw-semibold text-dark small mb-1">Project Title</p>
                    <p className="text-muted small mb-0">{proposal.title || '—'}</p>
                  </div>
                  <div className="col-12">
                    <p className="fw-semibold text-dark small mb-1">Description</p>
                    <p className="text-muted small mb-0">{proposal.description || '—'}</p>
                  </div>
                  <div className="col-12">
                    <p className="fw-semibold text-dark small mb-1">Problem Statement</p>
                    <p className="text-muted small mb-0">{proposal.problemStatement || '—'}</p>
                  </div>
                  <div className="col-12 col-md-6">
                    <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                    <p className="text-muted small mb-0">{proposal.techStack || '—'}</p>
                  </div>
                </div>

                {(proposal.groupMembers?.length > 0) && (
                  <div className="mb-4">
                    <p className="fw-semibold text-dark small mb-2">
                      Group Members ({proposal.groupMembers.length})
                    </p>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="small fw-semibold">#</th>
                            <th className="small fw-semibold">Name</th>
                            <th className="small fw-semibold">Roll No.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposal.groupMembers.map((m, i) => (
                            <tr key={i}>
                              <td className="small text-muted">{i + 1}</td>
                              <td className="small fw-medium text-dark">{m.name}</td>
                              <td className="small text-muted">{m.rollNumber}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {proposal.coordinatorFeedback && (
                  <div className={`alert ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'} py-2 px-3 mb-0`}>
                    <p className="small mb-0">
                      <strong>Coordinator Feedback:</strong> {proposal.coordinatorFeedback}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

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
                <select
                  className="form-select"
                  value={supervisorInput}
                  onChange={(e) => setSupervisorInput(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {supervisors.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowChangeSupervisor(false)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium" onClick={handleAssignSupervisor}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <select
                  className="form-select"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {availableStudents.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowAssignStudent(false)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium" onClick={handleAddStudent}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRemoveConfirm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-body px-4 py-4 text-center">
                <h6 className="fw-semibold text-dark mb-2">Remove Student?</h6>
                <p className="text-muted small mb-0">This student will be removed from the project.</p>
              </div>
              <div className="modal-footer border-top px-4 py-3 justify-content-center gap-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setShowRemoveConfirm(false)}>Cancel</button>
                <button className="btn btn-danger px-4 fw-medium" onClick={handleRemoveStudent}>Yes, Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <button className="btn btn-outline-secondary px-4" onClick={() => setMilestoneConfirm(null)}>Cancel</button>
                <button className="btn btn-primary px-4 fw-medium" onClick={handleMarkMilestone}>Yes, Mark Complete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStudentModal && selectedStudent && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={closeStudentModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-3">
                  <Avatar name={selectedStudent.name} photoUrl={selectedStudent.photoUrl} size={40} />
                  <div>
                    <h5 className="modal-title fw-semibold text-dark mb-0">{selectedStudent.name}</h5>
                    <p className="text-muted small mb-0">{selectedStudent.email}</p>
                  </div>
                </div>
                <button className="btn-close" onClick={closeStudentModal} />
              </div>

              <div className="modal-body px-4 py-4">

                <h6 className="fw-semibold text-dark mb-3">
                  Task Submissions
                  <span className="badge bg-secondary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                    {studentSubs.length}
                  </span>
                </h6>
                {studentSubs.length === 0 ? (
                  <p className="text-muted small mb-4">No submissions from this student yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2 mb-4">
                    {studentSubs.map((sub) => (
                      <div key={sub._id} className="d-flex align-items-center justify-content-between p-3 border rounded">
                        <div>
                          <p className="fw-medium text-dark small mb-0">{sub.taskId?.title || '—'}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                            Submitted {formatDate(sub.submittedAt)}
                            {sub.feedback && <> &bull; <em>"{sub.feedback}"</em></>}
                          </p>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-shrink-0">
                          {sub.fileUrl && (
                            <button
                              className="btn btn-outline-primary btn-sm px-2"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => window.open(sub.fileUrl, '_blank')}
                            >
                              📎 File
                            </button>
                          )}
                          <span
                            className="badge rounded-pill px-2 py-1"
                            style={{
                              backgroundColor: sub.status === 'approved' ? '#28a74520' : sub.status === 'rejected' ? '#dc354520' : '#ffc10720',
                              color: sub.status === 'approved' ? '#28a745' : sub.status === 'rejected' ? '#dc3545' : '#d39e00',
                              fontSize: '0.7rem',
                            }}
                          >
                            {sub.status === 'pending' ? 'Pending' : sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="my-3" />

                <h6 className="fw-semibold text-dark mb-3">
                  Uploaded Documents
                  <span className="badge bg-secondary ms-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                    {studentDocs.length}
                  </span>
                </h6>
                {studentDocs.length === 0 ? (
                  <p className="text-muted small mb-0">No documents uploaded by this student yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {studentDocs.map((doc) => (
                      <div key={doc._id} className="d-flex align-items-center justify-content-between p-3 border rounded">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="d-flex align-items-center justify-content-center rounded flex-shrink-0"
                            style={{ width: '36px', height: '36px', backgroundColor: docTypeColors[doc.type] || '#6c757d' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div>
                            <p className="fw-medium text-dark mb-0 small">{doc.fileName}</p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                              {doc.type} &bull; {formatDate(doc.uploadedAt || doc.createdAt)} &bull; {doc.size}
                            </p>
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm px-3 flex-shrink-0"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={closeStudentModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000 }}
          onClick={() => setReviewModal(false)}
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-semibold text-dark mb-0">
                {reviewDecision === 'approved' ? '✓ Accept Submission' : '✕ Reject Submission'}
              </h6>
              <button className="btn btn-sm p-0 border-0" onClick={() => setReviewModal(false)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <p className="fw-medium text-dark mb-1 small">{reviewSub?.taskId?.title}</p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                Submitted by: {reviewSub?.submittedBy?.name}
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                File: <span className="text-primary">{reviewSub?.fileName}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="form-label fw-medium small">Feedback *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter feedback for the student..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className={`btn flex-fill fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                onClick={submitReview}
                disabled={reviewing}
              >
                {reviewing ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                Confirm
              </button>
              <button className="btn btn-outline-secondary flex-fill" onClick={() => setReviewModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetail;
