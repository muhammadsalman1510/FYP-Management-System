// 📁 FILE: src/pages/Supervisor/ProjectDetail.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — PROJECT DETAIL PAGE
  Full detail view for a single assigned project.
  Accessed via clicking a project card on /supervisor/projects.

  Sections:
  - Project info + progress
  - Milestones timeline
  - Group members
  - Tasks (created by this supervisor for this project)
  - Task Submissions (to review)
  - Documents uploaded by students

  TODO (Backend): GET /api/projects/:id  (with full population)
  Replace hardcoded data below with real API response.
*/

// ── Hardcoded dummy data ──────────────────────────────────────────────────────
const dummyProjects = {
  p001: {
    _id: 'p001',
    title: 'FYP Management System',
    description: 'A web-based system to manage final year projects for students, supervisors, and coordinators using the MERN stack.',
    status: 'active',
    progress: 20,
    coordinator: { name: 'Mr. Omer Farooq', email: 'omer@university.edu', department: 'Computer Science' },
    students: [
      { _id: 's1', name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7th', section: 'A', email: 'salman@student.edu' },
      { _id: 's2', name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7th', section: 'A', email: 'ali@student.edu' },
    ],
    milestones: [
      { id: 1, name: 'Project Proposal',   description: 'Proposal submitted and approved by coordinator.', completed: true,  completedAt: '2024-04-10' },
      { id: 2, name: 'Project Defense',    description: 'Initial defense presented to supervisor and coordinator.', completed: false, completedAt: null },
      { id: 3, name: 'Implementation',     description: 'Core development and implementation phase.', completed: false, completedAt: null },
      { id: 4, name: 'Documentation',      description: 'Full project documentation submitted and approved.', completed: false, completedAt: null },
      { id: 5, name: 'Final Presentation', description: 'Final project presented and signed off.', completed: false, completedAt: null },
    ],
    tasks: [
      { _id: 't1', title: 'Task 1 — Project Proposal Documentation', instructions: 'Complete the initial project proposal documentation. Include abstract, objectives, and methodology.', openDate: '02-11-2025', dueDate: '13-11-2025', submissionsCount: 1, totalStudents: 2 },
      { _id: 't2', title: 'Task 2 — Literature Review', instructions: 'Literature review and research methodology. Find at least 10 relevant research papers.', openDate: '15-11-2025', dueDate: '25-11-2025', submissionsCount: 0, totalStudents: 2 },
    ],
    submissions: [
      { _id: 'sub1', taskTitle: 'Task 1 — Project Proposal Documentation', studentName: 'Muhammad Salman', rollNumber: 'F2021001001', fileName: 'proposal_salman.pdf', submittedAt: '2025-11-10', status: 'pending' },
    ],
    documents: [
      { _id: 'd1', name: 'Project Proposal.pdf',   type: 'Proposal',         uploadedBy: 'Muhammad Salman', uploadedAt: '2024-01-15', size: '2.4 MB' },
      { _id: 'd2', name: 'Literature Review.docx', type: 'Literature Review', uploadedBy: 'Ali Hassan',      uploadedAt: '2024-01-20', size: '1.8 MB' },
    ],
  },
  p002: {
    _id: 'p002',
    title: 'Smart Attendance System',
    description: 'An AI-powered attendance tracking system using face recognition integrated with university portals.',
    status: 'active',
    progress: 40,
    coordinator: { name: 'Mr. Omer Farooq', email: 'omer@university.edu', department: 'Computer Science' },
    students: [
      { _id: 's3', name: 'Usman Tariq', rollNumber: 'F2021002001', program: 'BSCS', semester: '7th', section: 'B', email: 'usman@student.edu' },
      { _id: 's4', name: 'Sara Ahmed',  rollNumber: 'F2021002002', program: 'BSCS', semester: '7th', section: 'B', email: 'sara@student.edu' },
      { _id: 's5', name: 'Bilal Khan',  rollNumber: 'F2021002003', program: 'BSCS', semester: '7th', section: 'B', email: 'bilal@student.edu' },
    ],
    milestones: [
      { id: 1, name: 'Project Proposal',   description: 'Proposal submitted and approved.', completed: true,  completedAt: '2024-03-05' },
      { id: 2, name: 'Project Defense',    description: 'Initial defense completed.', completed: true,  completedAt: '2024-04-20' },
      { id: 3, name: 'Implementation',     description: 'Core development and implementation phase.', completed: false, completedAt: null },
      { id: 4, name: 'Documentation',      description: 'Full project documentation.', completed: false, completedAt: null },
      { id: 5, name: 'Final Presentation', description: 'Final project presented.', completed: false, completedAt: null },
    ],
    tasks: [
      { _id: 't3', title: 'Task 1 — System Architecture', instructions: 'Design the system architecture diagram and explain each module.', openDate: '05-03-2025', dueDate: '15-03-2025', submissionsCount: 3, totalStudents: 3 },
    ],
    submissions: [],
    documents: [
      { _id: 'd3', name: 'Architecture Diagram.pdf', type: 'Implementation', uploadedBy: 'Usman Tariq', uploadedAt: '2024-03-10', size: '1.1 MB' },
    ],
  },
};
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const avatarColors = ['#3c50e0', '#28a745', '#17a2b8', '#e83e8c', '#fd7e14'];

const docTypeColors = {
  'Proposal':         '#3c50e0',
  'Literature Review':'#28a745',
  'Implementation':   '#17a2b8',
  'Progress Report':  '#fd7e14',
  'Final Report':     '#6f42c1',
};

const SupervisorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewModal, setReviewModal] = useState(null); // submission being reviewed
  const [feedback, setFeedback] = useState('');

  // TODO (Backend): Replace with GET /api/projects/:id
  const project = dummyProjects[id];

  if (!project) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Project not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/supervisor/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const completedCount = project.milestones.filter(m => m.completed).length;
  const currentMilestoneIdx = project.milestones.findIndex(m => !m.completed);

  const tabs = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'tasks',        label: `Tasks (${project.tasks.length})`  },
    { key: 'submissions',  label: `Submissions (${project.submissions.length})` },
    { key: 'documents',    label: `Documents (${project.documents.length})` },
  ];

  const handleReview = (submission) => {
    setReviewModal(submission);
    setFeedback('');
  };

  return (
    <>
      <Breadcrumb pageName={project.title} />

      {/* ── Back Button ── */}
      <button
        className="btn btn-outline-secondary btn-sm mb-4 d-flex align-items-center gap-2"
        onClick={() => navigate('/supervisor/projects')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Projects
      </button>

      {/* ── Project Header Card ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold text-dark mb-0">{project.title}</h4>
                <span
                  className="badge"
                  style={{
                    backgroundColor: project.status === 'active' ? '#28a74520' : '#ffc10720',
                    color: project.status === 'active' ? '#28a745' : '#d39e00',
                    fontSize: '0.72rem',
                  }}
                >
                  {project.status === 'active' ? 'Active' : 'Proposal Pending'}
                </span>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem', maxWidth: '600px' }}>
                {project.description}
              </p>
            </div>

            {/* Progress circle-style stat */}
            <div className="text-center">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white mx-auto"
                style={{ width: '64px', height: '64px', backgroundColor: '#3c50e0', fontSize: '1.1rem' }}
              >
                {project.progress}%
              </div>
              <p className="text-muted small mt-1 mb-0">Progress</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
              <div
                className="progress-bar bg-primary"
                style={{ width: `${project.progress}%`, borderRadius: '4px' }}
              />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                {completedCount} of {project.milestones.length} milestones completed
              </span>
              <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                Coordinator: {project.coordinator.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
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
          TAB: OVERVIEW
          ══════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="d-flex flex-column gap-4">

          {/* Milestones */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Milestones</h6>
              <p className="text-muted small mb-0 mt-1">Marked complete by the coordinator.</p>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {project.milestones.map((m, i) => (
                  <div
                    key={m.id}
                    className={`d-flex align-items-center justify-content-between p-3 rounded border ${
                      m.completed
                        ? 'border-success bg-success bg-opacity-10'
                        : i === currentMilestoneIdx
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                        style={{
                          width: '36px', height: '36px', minWidth: '36px',
                          backgroundColor: m.completed ? '#28a745' : i === currentMilestoneIdx ? '#3c50e0' : '#e9ecef',
                          color: m.completed || i === currentMilestoneIdx ? '#fff' : '#adb5bd',
                          fontSize: '0.8rem',
                        }}
                      >
                        {m.completed ? '✓' : m.id}
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{m.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>{m.description}</p>
                        {m.completed && m.completedAt && (
                          <p className="text-success mb-0" style={{ fontSize: '0.7rem' }}>
                            ✓ Completed on {m.completedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className="badge rounded-pill px-3 py-2 flex-shrink-0 ms-2"
                      style={{
                        backgroundColor: m.completed ? '#28a745' : i === currentMilestoneIdx ? '#3c50e0' : '#6c757d',
                        color: '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {m.completed ? 'Completed' : i === currentMilestoneIdx ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Group Members</h6>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {project.students.map((student, i) => (
                  <div key={student._id} className="col-12 col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 border rounded">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold flex-shrink-0"
                        style={{ width: '42px', height: '42px', backgroundColor: avatarColors[i % avatarColors.length], fontSize: '0.85rem' }}
                      >
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <p className="fw-semibold text-dark mb-0 small">{student.name}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.73rem' }}>
                          {student.rollNumber} &bull; {student.program} &bull; Sem {student.semester} &bull; Sec {student.section}
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{student.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coordinator Info */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-semibold text-dark mb-0">Coordinator</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: '48px', height: '48px', backgroundColor: '#3c50e0', fontSize: '1rem' }}
                >
                  {getInitials(project.coordinator.name)}
                </div>
                <div>
                  <p className="fw-semibold text-dark mb-0">{project.coordinator.name}</p>
                  <p className="text-muted small mb-0">{project.coordinator.department}</p>
                  <p className="text-muted small mb-0">{project.coordinator.email}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════
          TAB: TASKS
          ══════════════════════════════════════════ */}
      {activeTab === 'tasks' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div>
              <h6 className="fw-semibold text-dark mb-0">Tasks</h6>
              <p className="text-muted small mb-0 mt-1">Tasks assigned to this project group.</p>
            </div>
            <button
              className="btn btn-primary btn-sm px-3"
              onClick={() => navigate('/supervisor/tasks')}
            >
              + Create Task
            </button>
          </div>
          <div className="card-body p-0">
            {project.tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No tasks created for this project yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>TITLE & INSTRUCTIONS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>OPEN DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>DUE DATE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>SUBMISSIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.tasks.map((task, i) => (
                      <tr key={task._id}>
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-semibold text-dark mb-1 small">{task.title}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>{task.instructions}</p>
                        </td>
                        <td className="px-4 py-3 text-muted small">{task.openDate}</td>
                        <td className="px-4 py-3 text-muted small">{task.dueDate}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{
                              backgroundColor: task.submissionsCount === task.totalStudents ? '#28a74520' : '#ffc10720',
                              color: task.submissionsCount === task.totalStudents ? '#28a745' : '#d39e00',
                              fontSize: '0.72rem',
                            }}
                          >
                            {task.submissionsCount}/{task.totalStudents}
                          </span>
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

      {/* ══════════════════════════════════════════
          TAB: SUBMISSIONS
          ══════════════════════════════════════════ */}
      {activeTab === 'submissions' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
            <p className="text-muted small mb-0 mt-1">Review files submitted by students for tasks.</p>
          </div>
          <div className="card-body p-0">
            {project.submissions.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No submissions yet for this project.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>#</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>TASK</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>STUDENT</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>FILE</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>SUBMITTED</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>STATUS</th>
                      <th className="px-4 py-3 fw-semibold text-muted border-0" style={{ fontSize: '0.78rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.submissions.map((sub, i) => (
                      <tr key={sub._id}>
                        <td className="px-4 py-3 text-muted">{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.taskTitle}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="fw-medium text-dark mb-0 small">{sub.studentName}</p>
                          <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>{sub.rollNumber}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3c50e0" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span className="text-primary small" style={{ cursor: 'pointer' }}>{sub.fileName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted small">{sub.submittedAt}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge rounded-pill px-3"
                            style={{
                              backgroundColor: sub.status === 'approved' ? '#28a74520' : sub.status === 'rejected' ? '#dc354520' : '#ffc10720',
                              color: sub.status === 'approved' ? '#28a745' : sub.status === 'rejected' ? '#dc3545' : '#d39e00',
                              fontSize: '0.72rem',
                            }}
                          >
                            {sub.status === 'pending' ? 'Pending Review' : sub.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {sub.status === 'pending' && (
                            <button
                              className="btn btn-sm btn-outline-primary px-3"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleReview(sub)}
                            >
                              Review
                            </button>
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

      {/* ══════════════════════════════════════════
          TAB: DOCUMENTS
          ══════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Documents</h6>
            <p className="text-muted small mb-0 mt-1">Files uploaded by students for this project.</p>
          </div>
          <div className="card-body p-4">
            {project.documents.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-0">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {project.documents.map((doc) => (
                  <div key={doc._id} className="d-flex align-items-center justify-content-between p-3 border rounded">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded"
                        style={{
                          width: '42px', height: '42px',
                          backgroundColor: docTypeColors[doc.type] || '#6c757d',
                          flexShrink: 0,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
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
          REVIEW MODAL
          ══════════════════════════════════════════ */}
      {reviewModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={() => setReviewModal(null)}
        >
          <div
            className="card border-0 shadow-lg p-4"
            style={{ width: '100%', maxWidth: '480px', borderRadius: '12px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-semibold text-dark mb-0">Review Submission</h6>
              <button className="btn btn-sm p-0 border-0" onClick={() => setReviewModal(null)}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M1 1L17 17M17 1L1 17" stroke="#6c757d" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
              <p className="fw-medium text-dark mb-1 small">{reviewModal.taskTitle}</p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                Submitted by: {reviewModal.studentName} ({reviewModal.rollNumber})
              </p>
              <p className="text-muted mb-0" style={{ fontSize: '0.78rem' }}>
                File: <span className="text-primary">{reviewModal.fileName}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium small">Feedback (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter feedback for the student..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-success flex-fill fw-medium"
                onClick={() => {
                  // TODO (Backend): PUT /api/tasks/submissions/:id/review  { status: 'approved', feedback }
                  alert('Submission approved! (Backend not connected yet)');
                  setReviewModal(null);
                }}
              >
                ✓ Approve
              </button>
              <button
                className="btn btn-danger flex-fill fw-medium"
                onClick={() => {
                  // TODO (Backend): PUT /api/tasks/submissions/:id/review  { status: 'rejected', feedback }
                  alert('Submission rejected! (Backend not connected yet)');
                  setReviewModal(null);
                }}
              >
                ✗ Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default SupervisorProjectDetail;