import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — PROPOSALS (READ-ONLY)
  Proposals are submitted directly by students to the coordinator.
  The supervisor can view proposals from their assigned projects for reference only.
  The coordinator makes all approval decisions.

  TODO (Backend): GET /api/proposals?assignedSupervisor=true
*/

// TODO (Backend): Replace with GET /api/proposals?assignedSupervisor=true
const DUMMY_PROPOSALS = [
  {
    _id: 'p1',
    project: 'FYP Management System',
    title: 'FYP Management & Tracking System',
    description: 'A web-based system to manage and track Final Year Projects for students, supervisors, and coordinators using the MERN stack.',
    problemStatement: 'Universities lack a unified digital platform for managing FYP workflows, leading to miscommunication, missed deadlines, and poor progress tracking.',
    stack: 'React.js, Node.js, Express.js, MongoDB',
    expectedOutcome: 'A fully functional multi-role web application that streamlines FYP management.',
    submittedDate: '2024-04-25',
    status: 'approved',
    coordinatorFeedback: 'Excellent proposal. Proceed with project creation and team assignment.',
    groupMembers: [
      { name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7', section: 'A' },
      { name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7', section: 'A' },
    ],
  },
  {
    _id: 'p2',
    project: 'Smart Attendance System',
    title: 'Smart Attendance System using Face Recognition',
    description: 'An AI-powered attendance tracking system using face recognition integrated with university portals.',
    problemStatement: 'Manual attendance is time-consuming and prone to proxy attendance fraud.',
    stack: 'React.js, Python (Flask), OpenCV, TensorFlow, MongoDB',
    expectedOutcome: 'A face-recognition-based attendance system that integrates with the university portal.',
    submittedDate: '2024-04-22',
    status: 'pending',
    coordinatorFeedback: '',
    groupMembers: [
      { name: 'Usman Tariq', rollNumber: 'F2021002001', program: 'BSCS', semester: '7', section: 'B' },
      { name: 'Sara Ahmed',  rollNumber: 'F2021002002', program: 'BSCS', semester: '7', section: 'B' },
      { name: 'Bilal Khan',  rollNumber: 'F2021002003', program: 'BSCS', semester: '7', section: 'B' },
    ],
  },
];

const SupervisorProposals = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId,   setExpandedId]   = useState(null);

  const filtered = DUMMY_PROPOSALS.filter(p =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const counts = {
    all:      DUMMY_PROPOSALS.length,
    pending:  DUMMY_PROPOSALS.filter(p => p.status === 'pending').length,
    approved: DUMMY_PROPOSALS.filter(p => p.status === 'approved').length,
    rejected: DUMMY_PROPOSALS.filter(p => p.status === 'rejected').length,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: '#28a74520', color: '#28a745' };
      case 'rejected': return { bg: '#dc354520', color: '#dc3545' };
      default:         return { bg: '#ffc10730', color: '#d39e00' };
    }
  };

  return (
    <>
      <Breadcrumb pageName="Proposals" />

      {/* Info Banner */}
      <div className="alert alert-info border-0 shadow-sm mb-4 small">
        <strong>Read-only view.</strong> Proposals are submitted directly by students to the coordinator.
        You can view them here for reference. The coordinator makes all approval decisions.
      </div>

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-0">
          <div className="d-flex border-bottom flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map(s => {
              const style = getStatusStyle(s);
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="btn btn-link flex-fill py-3 text-decoration-none fw-medium border-0 rounded-0"
                  style={{
                    color: filterStatus === s ? '#3c50e0' : '#6c757d',
                    borderBottom: filterStatus === s ? '2px solid #3c50e0' : '2px solid transparent',
                    fontSize: '0.875rem',
                    minWidth: '100px',
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  <span
                    className="badge ms-2 rounded-pill"
                    style={{
                      backgroundColor: s === 'all' ? '#6c757d20' : style.bg,
                      color: s === 'all' ? '#6c757d' : style.color,
                      fontSize: '0.7rem',
                    }}
                  >
                    {counts[s]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="d-flex flex-column gap-3">
        {filtered.length === 0 ? (
          <div className="card shadow-sm border-0">
            <div className="card-body text-center py-5">
              <p className="text-muted mb-0">No proposals found.</p>
            </div>
          </div>
        ) : (
          filtered.map(proposal => {
            const style = getStatusStyle(proposal.status);
            return (
              <div key={proposal._id} className="card shadow-sm border-0">
                <div className="card-body p-4">

                  {/* Top row */}
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
                    <div>
                      <h6 className="fw-semibold text-dark mb-1">{proposal.title}</h6>
                      <p className="text-muted small mb-0">
                        Project: <strong className="text-dark">{proposal.project}</strong>
                      </p>
                      <p className="text-muted small mb-0">
                        Group size: <strong className="text-dark">{proposal.groupMembers.length} students</strong>
                        &nbsp;&bull;&nbsp;Submitted: {proposal.submittedDate}
                      </p>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{ backgroundColor: style.bg, color: style.color, fontSize: '0.78rem' }}
                      >
                        {proposal.status === 'pending' ? 'Pending Coordinator Review' : proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none mt-2 mb-3"
                    onClick={() => setExpandedId(expandedId === proposal._id ? null : proposal._id)}
                  >
                    {expandedId === proposal._id ? '▲ Hide Details' : '▼ View Full Proposal'}
                  </button>

                  {/* Expanded details */}
                  {expandedId === proposal._id && (
                    <div className="border rounded p-3 mb-3 bg-light">

                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <p className="fw-semibold text-dark small mb-1">Description</p>
                          <p className="text-muted small mb-0">{proposal.description}</p>
                        </div>
                        <div className="col-12">
                          <p className="fw-semibold text-dark small mb-1">Problem Statement</p>
                          <p className="text-muted small mb-0">{proposal.problemStatement}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p className="fw-semibold text-dark small mb-1">Technology Stack</p>
                          <p className="text-muted small mb-0">{proposal.stack}</p>
                        </div>
                        <div className="col-12 col-md-6">
                          <p className="fw-semibold text-dark small mb-1">Expected Outcome</p>
                          <p className="text-muted small mb-0">{proposal.expectedOutcome}</p>
                        </div>
                      </div>

                      {/* Group Members Table */}
                      <div>
                        <p className="fw-semibold text-dark small mb-2">
                          Group Members ({proposal.groupMembers.length})
                        </p>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0 bg-white">
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
                              {proposal.groupMembers.map((m, i) => (
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

                    </div>
                  )}

                  {/* Coordinator feedback */}
                  {proposal.coordinatorFeedback && (
                    <div
                      className={`alert py-2 px-3 mb-0 ${proposal.status === 'approved' ? 'alert-success' : 'alert-danger'}`}
                    >
                      <p className="small mb-0">
                        <strong>Coordinator Feedback:</strong> {proposal.coordinatorFeedback}
                      </p>
                    </div>
                  )}

                  {/* No action buttons — supervisor is read-only */}

                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default SupervisorProposals;
