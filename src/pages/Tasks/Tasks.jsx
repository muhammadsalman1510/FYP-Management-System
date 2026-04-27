import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingTasks = [
    {
      id: 1,
      title: 'Task 1',
      instructions: 'Complete the initial project proposal documentation. Include abstract, objectives, and methodology.',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      status: 'pending',
      assignedBy: 'Mr. Shoaib (Supervisor)',
      attachedFile: 'task1_guidelines.pdf',
    },
    {
      id: 2,
      title: 'Task 2',
      instructions: 'Literature review and research methodology. Find at least 10 relevant research papers.',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      status: 'pending',
      assignedBy: 'Mr. Omer (Coordinator)',
      attachedFile: 'literature_review_requirements.pdf',
    },
  ];

  const submittedTasks = [
    {
      id: 3,
      title: 'Task 1',
      instructions: 'Complete the initial project proposal documentation',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      submitDate: '04-11-2025',
      status: 'submitted',
      assignedBy: 'Mr. Shoaib (Supervisor)',
      submittedFile: 'project_proposal_draft.pdf',
      feedback: 'Good work, but need more technical details',
    },
    {
      id: 4,
      title: 'Task 2',
      instructions: 'Literature review and research methodology',
      openDate: '02-11-2025',
      dueDate: '13-11-2025',
      submitDate: '11-11-2025',
      status: 'submitted',
      assignedBy: 'Mr. Omer (Coordinator)',
      submittedFile: 'research_methodology.docx',
      feedback: 'Under review',
    },
  ];

  const [uploadFile, setUploadFile] = useState(null);

  const handleSubmitTask = (taskId) => {
    if (uploadFile) {
      alert(`Task ${taskId} submitted successfully with file: ${uploadFile.name}`);
      setUploadFile(null);
    } else {
      alert('Please select a file to submit');
    }
  };

  return (
    <>
      {/* Page breadcrumb */}
      <Breadcrumb pageName="Tasks" />

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">

            {/* ===== Tab Navigation ===== */}
            <div className="card-header bg-white border-bottom p-0">
              <div className="d-flex">

                {/* Pending Tasks Tab */}
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`btn btn-link flex-fill py-3 text-decoration-none fw-medium rounded-0 border-0 ${
                    activeTab === 'pending'
                      ? 'text-primary border-bottom border-primary border-2'
                      : 'text-muted'
                  }`}
                  style={{
                    borderBottom: activeTab === 'pending' ? '2px solid #3c50e0' : '2px solid transparent',
                  }}
                >
                  Pending Tasks
                </button>

                {/* Submitted Tasks Tab */}
                <button
                  onClick={() => setActiveTab('submitted')}
                  className={`btn btn-link flex-fill py-3 text-decoration-none fw-medium rounded-0 border-0 ${
                    activeTab === 'submitted'
                      ? 'text-primary'
                      : 'text-muted'
                  }`}
                  style={{
                    borderBottom: activeTab === 'submitted' ? '2px solid #3c50e0' : '2px solid transparent',
                  }}
                >
                  Submitted Tasks
                </button>

              </div>
            </div>
            {/* ===== End Tabs ===== */}

            <div className="card-body p-3 p-md-4">

              {/* ===== PENDING TASKS TABLE ===== */}
              {activeTab === 'pending' && (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-3 fw-semibold text-dark">Sr. #</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Title & Instructions</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Open Date</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Due Date</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTasks.map((task, index) => (
                        <tr key={task.id}>

                          {/* Serial number */}
                          <td className="py-3 px-3">{index + 1}</td>

                          {/* Title, assigned by, instructions, attached file */}
                          <td className="py-3 px-3">
                            <p className="fw-medium text-dark mb-1">{task.title}</p>
                            <p className="text-muted small mb-1">By: {task.assignedBy}</p>
                            {task.instructions && (
                              <p className="text-muted small mb-1">
                                <span className="fw-medium">Instructions: </span>
                                {task.instructions}
                              </p>
                            )}
                            {task.attachedFile && (
                              <div className="mt-1">
                                <p className="text-muted small mb-1">Attached Files:</p>
                                <a
                                  href="#"
                                  className="text-primary small text-decoration-none"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    alert(`Downloading ${task.attachedFile}`);
                                  }}
                                >
                                  📎 {task.attachedFile}
                                </a>
                              </div>
                            )}
                          </td>

                          {/* Open date */}
                          <td className="py-3 px-3 small">{task.openDate}</td>

                          {/* Due date - red if overdue */}
                          <td className="py-3 px-3">
                            <span className={`small ${new Date(task.dueDate) < new Date() ? 'text-danger fw-medium' : 'text-dark'}`}>
                              {task.dueDate}
                            </span>
                          </td>

                          {/* Upload + Submit actions */}
                          <td className="py-3 px-3">
                            <div className="d-flex align-items-center flex-wrap gap-2">

                              {/* Hidden file input */}
                              <input
                                type="file"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="d-none"
                                id={`file-upload-${task.id}`}
                              />

                              {/* Upload label styled as button */}
                              <label
                                htmlFor={`file-upload-${task.id}`}
                                className="btn btn-primary btn-sm mb-0"
                                style={{ cursor: 'pointer' }}
                              >
                                Upload File
                              </label>

                              {/* Show file name + submit button after file is chosen */}
                              {uploadFile && (
                                <>
                                  <span className="text-muted small">{uploadFile.name}</span>
                                  <button
                                    onClick={() => handleSubmitTask(task.id)}
                                    className="btn btn-success btn-sm"
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
              )}
              {/* ===== END PENDING TASKS ===== */}

              {/* ===== SUBMITTED TASKS TABLE ===== */}
              {activeTab === 'submitted' && (
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-3 fw-semibold text-dark">Title</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Due Date</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Submit Date</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Submitted File</th>
                        <th className="py-3 px-3 fw-semibold text-dark">Status & Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedTasks.map((task) => (
                        <tr key={task.id}>

                          {/* Title + assigned by + instructions */}
                          <td className="py-3 px-3">
                            <p className="fw-medium text-dark mb-1">{task.title}</p>
                            <p className="text-muted small mb-1">By: {task.assignedBy}</p>
                            {task.instructions && (
                              <p className="text-muted small mb-0">
                                <span className="fw-medium">Instructions: </span>
                                {task.instructions}
                              </p>
                            )}
                          </td>

                          {/* Due date */}
                          <td className="py-3 px-3 small">{task.dueDate}</td>

                          {/* Submit date */}
                          <td className="py-3 px-3 small">{task.submitDate}</td>

                          {/* Submitted file download */}
                          <td className="py-3 px-3">
                            {task.submittedFile ? (
                              <div>
                                <button
                                  className="btn btn-link btn-sm p-0 text-primary text-decoration-none fw-medium"
                                  onClick={() => alert(`Downloading ${task.submittedFile}`)}
                                >
                                  Download
                                </button>
                                <p className="text-muted small mb-0 mt-1">{task.submittedFile}</p>
                              </div>
                            ) : (
                              <span className="text-muted small">No file submitted</span>
                            )}
                          </td>

                          {/* Status badge + feedback */}
                          <td className="py-3 px-3">
                            <span className="text-success fw-medium small">✅ Submitted</span>
                            {task.feedback && (
                              <p className="text-muted small mb-0 mt-1">
                                <span className="fw-medium">Feedback: </span>
                                {task.feedback}
                              </p>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* ===== END SUBMITTED TASKS ===== */}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;