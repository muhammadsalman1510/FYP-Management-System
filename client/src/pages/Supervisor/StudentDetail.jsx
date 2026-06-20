import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../../components/Avatar';

const SupervisorStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent]         = useState(null);
  const [project, setProject]         = useState(null);
  const [documents, setDocuments]     = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('overview');

  const token   = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projectsRes, docsRes, subsRes] = await Promise.all([
          fetch('/api/projects/assigned', { headers }),
          fetch('/api/documents',         { headers }),
          fetch('/api/tasks/submissions', { headers }),
        ]);

        const projectsData = await projectsRes.json();
        const docsData     = await docsRes.json();
        const subsData     = await subsRes.json();

        if (!projectsRes.ok || !projectsData.success) throw new Error(projectsData.message || 'Failed to load projects');
        if (!docsRes.ok    || !docsData.success)      throw new Error(docsData.message     || 'Failed to load documents');
        if (!subsRes.ok    || !subsData.success)      throw new Error(subsData.message     || 'Failed to load submissions');

        // Find the project that contains this student
        const projects = projectsData.data || [];
        const foundProject = projects.find((p) =>
          (p.students || []).some((s) => String(s._id || s) === String(id))
        );

        if (foundProject) {
          setProject(foundProject);
          const studentUser = (foundProject.students || []).find(
            (s) => String(s._id || s) === String(id)
          );
          setStudent(studentUser || { _id: id, name: '—', email: '—' });
        }

        // Documents uploaded by this student
        setDocuments(
          (docsData.data || []).filter(
            (d) => String(d.uploadedBy?._id || d.uploadedBy) === String(id)
          )
        );

        // Task submissions from this student
        setSubmissions(
          (subsData.data || []).filter(
            (s) => String(s.submittedBy?._id || s.submittedBy) === String(id)
          )
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':  return 'bg-success';
      case 'pending':   return 'bg-warning text-dark';
      case 'rejected':  return 'bg-danger';
      case 'completed': return 'bg-success';
      default:          return 'bg-secondary';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Student Detail" />
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Breadcrumb pageName="Student Detail" />
        <div className="alert alert-danger border-0">{error}</div>
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Breadcrumb pageName="Student Detail" />
        <button
          className="btn btn-outline-secondary btn-sm px-3 mb-4"
          onClick={() => navigate('/supervisor/students')}
        >
          ← Back to Students
        </button>
        <div className="alert alert-warning border-0">
          Student not found in your assigned projects.
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Student Detail" />

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
            <Avatar name={student.name} size={64} />
            <div>
              <h5 className="fw-semibold text-dark mb-1">{student.name}</h5>
              <p className="text-muted small mb-0">{student.email}</p>
            </div>
            {project && (
              <div className="ms-auto text-end">
                <p className="text-muted small mb-1">Project</p>
                <p className="fw-semibold text-dark small mb-0">{project.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom">
            {['overview', 'documents', 'tasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
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
          {project && (
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <h6 className="fw-semibold text-dark mb-0">Project Progress</h6>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small fw-medium text-dark">Overall Completion</span>
                    <span className="small fw-medium text-dark">{project.progress || 0}%</span>
                  </div>
                  <div className="progress mb-4" style={{ height: '10px' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {(project.milestones || []).map((m, i) => {
                      const status = m.completed ? 'completed' : 'pending';
                      return (
                        <div key={i} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className={`badge rounded-circle p-2 ${getStatusBadge(status)}`}
                              style={{ width: '10px', height: '10px', fontSize: 0 }}
                            />
                            <span className="fw-medium text-dark small">{m.name}</span>
                          </div>
                          <span className={`badge rounded-pill px-3 ${getStatusBadge(status)}`} style={{ fontSize: '0.72rem' }}>
                            {m.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom py-3 px-4">
                <h6 className="fw-semibold text-dark mb-0">Student Information</h6>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {[
                    { label: 'Full Name', value: student.name  },
                    { label: 'Email',     value: student.email },
                  ].map((item, i) => (
                    <div key={i} className="col-12 col-md-6">
                      <label className="form-label fw-medium text-dark small">{item.label}</label>
                      <div className="form-control bg-light text-dark small">{item.value || '—'}</div>
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
          {documents.length === 0 ? (
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No documents uploaded by this student.</p>
            </div>
          ) : (
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark">File Name</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Type</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Date</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Size</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id}>
                        <td className="px-4 py-3 fw-medium text-dark small">📎 {doc.fileName}</td>
                        <td className="px-4 py-3 text-muted small">{doc.type || '—'}</td>
                        <td className="px-4 py-3 text-muted small">{formatDate(doc.uploadedAt || doc.createdAt)}</td>
                        <td className="px-4 py-3 text-muted small">{doc.size || '—'}</td>
                        <td className="px-4 py-3">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline-primary btn-sm px-3"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: Tasks */}
      {activeTab === 'tasks' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white border-bottom py-3 px-4">
            <h6 className="fw-semibold text-dark mb-0">Task Submissions</h6>
          </div>
          {submissions.length === 0 ? (
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No task submissions from this student.</p>
            </div>
          ) : (
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3 fw-semibold small text-dark">Task</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">File</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Submitted</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Status</th>
                      <th className="px-4 py-3 fw-semibold small text-dark">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub._id}>
                        <td className="px-4 py-3 fw-medium text-dark small">
                          {sub.taskId?.title || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-decoration-none small"
                          >
                            📎 {sub.fileName}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-muted small">{formatDate(sub.submittedAt)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge rounded-pill px-3 ${getStatusBadge(sub.status)}`}
                            style={{ fontSize: '0.72rem' }}
                          >
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
          )}
        </div>
      )}
    </>
  );
};

export default SupervisorStudentDetail;
