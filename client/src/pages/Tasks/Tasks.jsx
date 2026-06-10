import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  STUDENT — TASKS
  Pending tab: tasks not yet submitted, each row shows project tag + per-task file upload.
  Submitted tab: tasks already submitted, each row shows project tag + status badge + feedback.
*/

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // TODO (Backend): Replace with GET /api/tasks (student's project, pending status)
  const pendingTasks = [
    {
      id: 1,
      title: 'Literature Review',
      project: 'FYP Management System',
      instructions: 'Find and summarize at least 10 relevant research papers on your chosen topic. Include full citation details for each.',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      assignedBy: 'Mr. Shoaib Ahmed (Supervisor)',
      attachedFile: 'literature_review_guidelines.pdf',
    },
    {
      id: 2,
      title: 'Progress Report',
      project: 'FYP Management System',
      instructions: 'Submit your mid-semester progress report covering implementation status, completed milestones, and any blockers.',
      openDate: '15-11-2025',
      dueDate: '25-11-2025',
      assignedBy: 'Mr. Omer Farooq (Coordinator)',
      attachedFile: null,
    },
  ];

  // TODO (Backend): Replace with GET /api/tasks (student's project, submitted status)
  const submittedTasks = [
    {
      id: 3,
      title: 'Project Proposal',
      project: 'FYP Management System',
      openDate: '01-10-2025',
      dueDate: '13-10-2025',
      submitDate: '10-10-2025',
      assignedBy: 'Mr. Shoaib Ahmed (Supervisor)',
      submittedFile: 'project_proposal_draft.pdf',
      status: 'approved',
      feedback: 'Good work. Needs more technical detail in the methodology section.',
    },
    {
      id: 4,
      title: 'System Architecture Diagram',
      project: 'FYP Management System',
      openDate: '14-10-2025',
      dueDate: '25-10-2025',
      submitDate: '22-10-2025',
      assignedBy: 'Mr. Omer Farooq (Coordinator)',
      submittedFile: 'architecture_diagram.pdf',
      status: 'submitted',
      feedback: '',
    },
  ];

  // Per-task upload state keyed by taskId — fixes the shared-state bug
  const [uploadFiles, setUploadFiles] = useState({});

  const handleFileChange = (taskId, file) => {
    setUploadFiles(prev => ({ ...prev, [taskId]: file }));
  };

  const handleSubmitTask = (taskId) => {
    if (!uploadFiles[taskId]) {
      alert('Please select a file before submitting.');
      return;
    }
    // TODO (Backend): POST /api/tasks/:id/submit with multipart/form-data (file)
    alert(`Task submitted successfully with file: ${uploadFiles[taskId].name}`);
    setUploadFiles(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  const getSubmissionBadge = (status) => {
    switch (status) {
      case 'approved': return { bg: '#d1fae5', color: '#065f46', label: 'Approved' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' };
      default:         return { bg: '#dbeafe', color: '#1e40af', label: 'Under Review' };
    }
  };

  const projectTagStyle = {
    backgroundColor: '#ede9fe',
    color: '#5b21b6',
    fontSize: '0.68rem',
    fontWeight: '500',
  };

  return (
    <>
      <Breadcrumb pageName="Tasks" />

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">

            {/* Tab Navigation */}
            <div className="card-header bg-white border-bottom p-0">
              <div className="d-flex">
                {[
                  { key: 'pending',   label: `Pending (${pendingTasks.length})` },
                  { key: 'submitted', label: `Submitted (${submittedTasks.length})` },
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

            <div className="card-body p-0">

              {/* ── PENDING TAB ── */}
              {activeTab === 'pending' && (
                pendingTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No pending tasks. Check back later.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '44px' }}>#</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Title &amp; Details</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Open Date</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Due Date</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '190px' }}>Submit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTasks.map((task, index) => (
                          <tr key={task.id}>
                            <td className="px-4 py-3 text-muted small">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                <span className="fw-semibold text-dark small">{task.title}</span>
                                <span className="badge rounded-pill" style={projectTagStyle}>
                                  {task.project}
                                </span>
                              </div>
                              <p className="text-muted small mb-1">By: {task.assignedBy}</p>
                              <p className="text-muted small mb-0">{task.instructions}</p>
                              {task.attachedFile && (
                                <button
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none mt-1"
                                  style={{ fontSize: '0.8rem' }}
                                  onClick={() => alert(`Downloading ${task.attachedFile}`)}
                                >
                                  📎 {task.attachedFile}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted small">{task.openDate}</td>
                            <td className="px-4 py-3">
                              <span className="small fw-medium" style={{ color: '#dc3545' }}>{task.dueDate}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="d-flex flex-column gap-2">
                                <input
                                  type="file"
                                  id={`file-${task.id}`}
                                  className="d-none"
                                  onChange={(e) => handleFileChange(task.id, e.target.files[0])}
                                />
                                <label
                                  htmlFor={`file-${task.id}`}
                                  className="btn btn-outline-primary btn-sm mb-0"
                                  style={{ cursor: 'pointer', width: 'fit-content' }}
                                >
                                  Upload File
                                </label>
                                {uploadFiles[task.id] && (
                                  <>
                                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                      {uploadFiles[task.id].name}
                                    </span>
                                    <button
                                      className="btn btn-success btn-sm"
                                      style={{ width: 'fit-content' }}
                                      onClick={() => handleSubmitTask(task.id)}
                                    >
                                      Submit
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── SUBMITTED TAB ── */}
              {activeTab === 'submitted' && (
                submittedTasks.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-0">No submitted tasks yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '44px' }}>#</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Title &amp; Details</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '110px' }}>Due Date</th>
                          <th className="px-4 py-3 fw-semibold small text-dark" style={{ width: '120px' }}>Submitted On</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">File</th>
                          <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submittedTasks.map((task, index) => {
                          const badge = getSubmissionBadge(task.status);
                          return (
                            <tr key={task.id}>
                              <td className="px-4 py-3 text-muted small">{index + 1}</td>
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                                  <span className="fw-semibold text-dark small">{task.title}</span>
                                  <span className="badge rounded-pill" style={projectTagStyle}>
                                    {task.project}
                                  </span>
                                </div>
                                <p className="text-muted small mb-0">By: {task.assignedBy}</p>
                              </td>
                              <td className="px-4 py-3 text-muted small">{task.dueDate}</td>
                              <td className="px-4 py-3 text-muted small">{task.submitDate}</td>
                              <td className="px-4 py-3">
                                <button
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none"
                                  style={{ fontSize: '0.82rem' }}
                                  onClick={() => alert(`Downloading ${task.submittedFile}`)}
                                >
                                  📎 {task.submittedFile}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="badge rounded-pill px-3 py-2"
                                  style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.72rem' }}
                                >
                                  {badge.label}
                                </span>
                                {task.feedback && (
                                  <p className="text-muted mt-1 mb-0" style={{ fontSize: '0.72rem' }}>
                                    "{task.feedback}"
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
