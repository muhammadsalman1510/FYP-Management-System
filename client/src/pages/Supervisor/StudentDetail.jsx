import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useParams, useNavigate } from 'react-router-dom';

/*
  SUPERVISOR — STUDENT DETAIL PAGE
  View a specific student's complete work:
  - Profile info
  - Proposal details
  - Uploaded documents
  - Task submissions
  - Project progress/milestones
  TODO (Backend): GET /api/supervisor/students/:id
*/

const SupervisorStudentDetail = () => {
  const { id } = useParams(); // Gets student id from URL
  const navigate = useNavigate();

  // TODO (Backend): Replace with API call using the id param
  // GET /api/supervisor/students/:id
  const student = {
    _id: id,
    name: 'Muhammad Salman',
    rollNumber: 'F2021001001',
    email: 'salman@university.edu',
    phone: '+92 300 1234567',
    program: 'BSCS',
    semester: '7th',
    section: 'A',
    batch: '2021-2025',
    projectTitle: 'FYP Management System',
    progress: 65,
    milestones: [
      { name: 'Proposal',        status: 'completed', progress: 100 },
      { name: 'Implementation',  status: 'in-progress', progress: 65 },
      { name: 'Documentation',   status: 'pending',   progress: 0   },
      { name: 'Final',           status: 'pending',   progress: 0   },
    ],
  };

  // TODO (Backend): GET /api/supervisor/students/:id/documents
  const documents = [
    { _id: '1', name: 'Project Proposal.pdf',  type: 'Proposal',  uploadedDate: '2024-01-15', size: '2.4 MB', status: 'approved'    },
    { _id: '2', name: 'Literature Review.docx', type: 'Literature', uploadedDate: '2024-01-20', size: '1.8 MB', status: 'under_review' },
    { _id: '3', name: 'Project Timeline.xlsx',  type: 'Timeline',  uploadedDate: '2024-01-25', size: '0.8 MB', status: 'approved'    },
  ];

  // TODO (Backend): GET /api/supervisor/students/:id/tasks
  const taskSubmissions = [
    { _id: '1', taskTitle: 'Literature Review', submittedFile: 'lit_review.pdf', submitDate: '2024-11-10', status: 'approved', feedback: 'Good work.' },
    { _id: '2', taskTitle: 'Progress Report',   submittedFile: 'progress.pdf',   submitDate: '2024-11-20', status: 'submitted', feedback: '' },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':     return 'bg-success';
      case 'pending':      return 'bg-warning text-dark';
      case 'under_review': return 'bg-warning text-dark';
      case 'submitted':    return 'bg-primary';
      case 'rejected':     return 'bg-danger';
      case 'in-progress':  return 'bg-primary';
      case 'completed':    return 'bg-success';
      default:             return 'bg-secondary';
    }
  };

  const getProgressColor = (status) => {
    if (status === 'completed')   return 'bg-success';
    if (status === 'in-progress') return 'bg-primary';
    return 'bg-secondary';
  };

  return (
    <>
      <Breadcrumb pageName="Student Detail" />

      {/* Back button */}
      <button
        className="btn btn-outline-secondary btn-sm px-3 mb-4"
        onClick={() => navigate('/supervisor/students')}
      >
        ← Back to Students
      </button>

      {/* Student Header Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-4 flex-wrap">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
              style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: '#3c50e0', fontSize: '1.4rem' }}
            >
              {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h5 className="fw-semibold text-dark mb-1">{student.name}</h5>
              <p className="text-muted small mb-1">{student.rollNumber} &bull; {student.program} &bull; {student.semester} Semester</p>
              <p className="text-muted small mb-0">{student.email}</p>
            </div>
            <div className="ms-auto text-end">
              <p className="text-muted small mb-1">Project Title</p>
              <p className="fw-semibold text-dark small mb-0">{student.projectTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {['overview', 'documents', 'tasks'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0 text-capitalize"
                style={{
                  color: activeTab === tab ? '#3c50e0' : '#6c757d',
                  borderBottom: activeTab === tab ? '2px solid #3c50e0' : '2px solid transparent',
                }}
              >
                {tab === 'overview' ? 'Overview & Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Progress Bar */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Overall Project Progress</h6>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-medium text-dark">Project Completion</span>
                  <span className="small fw-medium text-dark">{student.progress}%</span>
                </div>
                <div className="progress mb-4" style={{ height: '10px' }}>
                  <div className="progress-bar bg-primary" style={{ width: `${student.progress}%` }} />
                </div>

                {/* Milestones */}
                <div className="d-flex flex-column gap-3">
                  {student.milestones.map((m, i) => (
                    <div key={i} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge rounded-circle p-2 ${getStatusBadge(m.status)}`}
                          style={{ width: '10px', height: '10px', fontSize: 0 }}
                        />
                        <span className="fw-medium text-dark small">{m.name}</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className={`badge rounded-pill px-3 ${getStatusBadge(m.status)}`} style={{ fontSize: '0.72rem' }}>
                          {m.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <div className="progress" style={{ width: '80px', height: '6px' }}>
                          <div className={`progress-bar ${getProgressColor(m.status)}`} style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="small text-dark" style={{ minWidth: '32px' }}>{m.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Student Information</h6>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {[
                    { label: 'Full Name',    value: student.name        },
                    { label: 'Roll Number',  value: student.rollNumber  },
                    { label: 'Email',        value: student.email       },
                    { label: 'Phone',        value: student.phone       },
                    { label: 'Program',      value: student.program     },
                    { label: 'Semester',     value: student.semester    },
                    { label: 'Section',      value: student.section     },
                    { label: 'Batch',        value: student.batch       },
                  ].map((item, i) => (
                    <div key={i} className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">{item.label}</label>
                      <div className="form-control bg-light text-dark small">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Documents */}
      {activeTab === 'documents' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Uploaded Documents</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold small text-dark">File Name</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Type</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Date</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Size</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc._id}>
                      <td className="px-4 py-3 fw-medium text-dark small">📎 {doc.name}</td>
                      <td className="px-4 py-3 text-muted small">{doc.type}</td>
                      <td className="px-4 py-3 text-muted small">{doc.uploadedDate}</td>
                      <td className="px-4 py-3 text-muted small">{doc.size}</td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill px-3 ${getStatusBadge(doc.status)}`} style={{ fontSize: '0.72rem' }}>
                          {doc.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="btn btn-outline-primary btn-sm px-3" onClick={() => alert(`Downloading ${doc.name}`)}>
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Tasks */}
      {activeTab === 'tasks' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold small text-dark">Task</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Submitted File</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Date</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                    <th className="px-4 py-3 fw-semibold small text-dark">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {taskSubmissions.map(sub => (
                    <tr key={sub._id}>
                      <td className="px-4 py-3 fw-medium text-dark small">{sub.taskTitle}</td>
                      <td className="px-4 py-3">
                        <button className="btn btn-link btn-sm p-0 text-primary text-decoration-none" onClick={() => alert(`Downloading ${sub.submittedFile}`)}>
                          📎 {sub.submittedFile}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted small">{sub.submitDate}</td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill px-3 ${getStatusBadge(sub.status)}`} style={{ fontSize: '0.72rem' }}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted small">{sub.feedback || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupervisorStudentDetail;