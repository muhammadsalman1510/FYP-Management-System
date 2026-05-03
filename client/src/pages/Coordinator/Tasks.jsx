import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — TASKS
  Tabs:
    1. Create Task   — Create new task, assign to All Students or Specific Students
    2. All Tasks     — View all tasks coordinator has created
    3. Submissions   — View student submissions, accept/reject with feedback

  TODO (Backend):
    POST   /api/coordinator/tasks             — Create task
    GET    /api/coordinator/tasks             — Get all tasks
    GET    /api/coordinator/tasks/submissions — Get all submissions
    PUT    /api/coordinator/tasks/submissions/:id/review  { status, feedback }
*/

const CoordinatorTasks = () => {

  const [activeTab, setActiveTab] = useState('create');

  // ── Sample students list (for specific assignment) ──
  const allStudents = [
    { id: 1, name: 'Muhammad Salman', rollNumber: 'F2021001001' },
    { id: 2, name: 'Ali Hassan',      rollNumber: 'F2021001002' },
    { id: 3, name: 'Sara Khan',       rollNumber: 'F2021001003' },
    { id: 4, name: 'Ahmed Raza',      rollNumber: 'F2021001004' },
  ];

  // ── Created tasks ──
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Literature Review',  instructions: 'Find and summarize 10 research papers.', openDate: '2025-11-02', dueDate: '2025-11-13', assignTo: 'all',      assignedStudents: [], submissionsCount: 3 },
    { id: 2, title: 'Progress Report',    instructions: 'Submit your mid-semester progress report.', openDate: '2025-11-15', dueDate: '2025-11-25', assignTo: 'specific', assignedStudents: [1, 2], submissionsCount: 1 },
  ]);

  // ── Submissions ──
  const [submissions, setSubmissions] = useState([
    { id: 1, taskTitle: 'Literature Review', student: 'Muhammad Salman', rollNumber: 'F2021001001', submittedFile: 'lit_review_salman.pdf', submitDate: '2025-11-10', status: 'submitted', feedback: '' },
    { id: 2, taskTitle: 'Literature Review', student: 'Ali Hassan',      rollNumber: 'F2021001002', submittedFile: 'lit_review_ali.pdf',    submitDate: '2025-11-11', status: 'approved',  feedback: 'Good work.' },
    { id: 3, taskTitle: 'Progress Report',   student: 'Muhammad Salman', rollNumber: 'F2021001001', submittedFile: 'progress_salman.pdf',  submitDate: '2025-11-20', status: 'submitted', feedback: '' },
  ]);

  // ── Create Task form ──
  const emptyTask = { title: '', instructions: '', openDate: '', dueDate: '', assignTo: 'all', assignedStudents: [], attachFile: null };
  const [taskForm, setTaskForm] = useState(emptyTask);

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStudentCheckbox = (studentId) => {
    setTaskForm(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId]
    }));
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    // TODO (Backend): POST /api/coordinator/tasks
    const newTask = { ...taskForm, id: Date.now(), submissionsCount: 0 };
    setTasks(prev => [...prev, newTask]);
    setTaskForm(emptyTask);
    setActiveTab('tasks');
    alert('Task created successfully!');
  };

  // ── Review submission ──
  const [reviewModal, setReviewModal]         = useState(false);
  const [reviewSubmission, setReviewSubmission] = useState(null);
  const [reviewDecision, setReviewDecision]   = useState('');
  const [reviewFeedback, setReviewFeedback]   = useState('');

  const openReview = (submission, decision) => {
    setReviewSubmission(submission);
    setReviewDecision(decision);
    setReviewFeedback('');
    setReviewModal(true);
  };

  const submitReview = () => {
    if (!reviewFeedback.trim()) { alert('Please provide feedback.'); return; }
    // TODO (Backend): PUT /api/coordinator/tasks/submissions/:id/review
    setSubmissions(prev =>
      prev.map(s => s.id === reviewSubmission.id ? { ...s, status: reviewDecision, feedback: reviewFeedback } : s)
    );
    setReviewModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':  return 'bg-success';
      case 'rejected':  return 'bg-danger';
      case 'submitted': return 'bg-primary';
      default:          return 'bg-secondary';
    }
  };

  return (
    <>
      <Breadcrumb pageName="Tasks" />

      {/* Tab Navigation */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {[
              { key: 'create',      label: 'Create Task'  },
              { key: 'tasks',       label: `All Tasks (${tasks.length})`       },
              { key: 'submissions', label: `Submissions (${submissions.filter(s => s.status === 'submitted').length} Pending)` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
                style={{
                  color: activeTab === tab.key ? '#3c50e0' : '#6c757d',
                  borderBottom: activeTab === tab.key ? '2px solid #3c50e0' : '2px solid transparent',
                  fontSize: '0.9rem',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TAB 1: CREATE TASK ══ */}
      {activeTab === 'create' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Create New Task</h5>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleCreateTask}>
              <div className="row g-3">

                {/* Task Title */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Task Title *</label>
                  <input type="text" name="title" value={taskForm.title} onChange={handleTaskFormChange} className="form-control" placeholder="e.g. Literature Review" required />
                </div>

                {/* Assign To */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Assign To *</label>
                  <select name="assignTo" value={taskForm.assignTo} onChange={handleTaskFormChange} className="form-select" required>
                    <option value="all">All Students (Entire System)</option>
                    <option value="specific">Specific Students</option>
                  </select>
                </div>

                {/* Specific Students checkboxes */}
                {taskForm.assignTo === 'specific' && (
                  <div className="col-12">
                    <label className="form-label fw-medium text-dark small">Select Students *</label>
                    <div className="border rounded p-3 d-flex flex-wrap gap-3">
                      {allStudents.map(student => (
                        <div key={student.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={taskForm.assignedStudents.includes(student.id)}
                            onChange={() => handleStudentCheckbox(student.id)}
                          />
                          <label className="form-check-label small text-dark" htmlFor={`student-${student.id}`}>
                            {student.name} <span className="text-muted">({student.rollNumber})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Instructions *</label>
                  <textarea name="instructions" value={taskForm.instructions} onChange={handleTaskFormChange} className="form-control" rows={4} placeholder="Describe the task requirements in detail..." required />
                </div>

                {/* Open Date */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Open Date *</label>
                  <input type="date" name="openDate" value={taskForm.openDate} onChange={handleTaskFormChange} className="form-control" required />
                </div>

                {/* Due Date */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-medium text-dark small">Due Date *</label>
                  <input type="date" name="dueDate" value={taskForm.dueDate} onChange={handleTaskFormChange} className="form-control" required />
                </div>

                {/* Attach File (optional) */}
                <div className="col-12">
                  <label className="form-label fw-medium text-dark small">Attach File <span className="text-muted fw-normal">(Optional — guidelines, templates, etc.)</span></label>
                  <input type="file" className="form-control" onChange={(e) => setTaskForm(prev => ({ ...prev, attachFile: e.target.files[0] }))} />
                </div>

                {/* Submit button */}
                <div className="col-12 d-flex gap-3 mt-2">
                  <button type="submit" className="btn btn-primary px-5 fw-medium">Create Task</button>
                  <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setTaskForm(emptyTask)}>Clear</button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ TAB 2: ALL TASKS ══ */}
      {activeTab === 'tasks' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">All Created Tasks</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Title</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Assigned To</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Open Date</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Due Date</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id}>
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>
                      <td className="px-4 py-3">
                        <p className="fw-medium text-dark small mb-0">{task.title}</p>
                        <p className="text-muted small mb-0">{task.instructions.slice(0, 60)}...</p>
                      </td>
                      <td className="px-4 py-3">
                        {task.assignTo === 'all' ? (
                          <span className="badge bg-primary rounded-pill px-3 small">All Students</span>
                        ) : (
                          <span className="badge bg-info text-dark rounded-pill px-3 small">{task.assignedStudents.length} Students</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted small">{task.openDate}</td>
                      <td className="px-4 py-3 text-muted small">{task.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-secondary rounded-pill px-3">{task.submissionsCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB 3: SUBMISSIONS ══ */}
      {activeTab === 'submissions' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h5 className="fw-semibold text-dark mb-0">Task Submissions</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Task</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Submitted File</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Submit Date</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub.id}>
                      <td className="px-4 py-3">
                        <p className="fw-medium text-dark small mb-0">{sub.student}</p>
                        <p className="text-muted small mb-0">{sub.rollNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-muted small">{sub.taskTitle}</td>
                      <td className="px-4 py-3">
                        <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none" onClick={() => alert(`Downloading ${sub.submittedFile}`)}>
                          📎 {sub.submittedFile}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted small">{sub.submitDate}</td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(sub.status)}`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                        {sub.feedback && <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>"{sub.feedback}"</p>}
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === 'submitted' && (
                          <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm px-3" onClick={() => openReview(sub, 'approved')}>✓ Accept</button>
                            <button className="btn btn-danger btn-sm px-3"  onClick={() => openReview(sub, 'rejected')}>✕ Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-semibold text-dark">
                  {reviewDecision === 'approved' ? '✓ Accept Submission' : '✕ Reject Submission'}
                </h5>
                <button className="btn-close" onClick={() => setReviewModal(false)} />
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted small mb-3">
                  Student: <strong className="text-dark">{reviewSubmission?.student}</strong><br/>
                  Task: <strong className="text-dark">{reviewSubmission?.taskTitle}</strong>
                </p>
                <label className="form-label fw-medium text-dark small">Feedback *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Provide feedback for the student..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn btn-outline-secondary px-4" onClick={() => setReviewModal(false)}>Cancel</button>
                <button className={`btn px-4 fw-medium ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={submitReview}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoordinatorTasks;