import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';

/*
  SUPERVISOR — MY STUDENTS
  Shows list of students assigned to this supervisor.
  Click "View Details" to see a student's full work.
  TODO (Backend): GET /api/supervisor/students
  Returns only students assigned to the logged-in supervisor.
*/

const SupervisorStudents = () => {
  const navigate = useNavigate();

  // TODO (Backend): Replace with API call
  // GET /api/supervisor/students
  const [students] = useState([
    { id: 1, name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', batch: '2021-2025', proposalStatus: 'approved',  projectTitle: 'FYP Management System',    progress: 65 },
    { id: 2, name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', batch: '2021-2025', proposalStatus: 'pending',   projectTitle: 'E-Commerce Platform',       progress: 25 },
    { id: 3, name: 'Sara Khan',       rollNumber: 'F2021001003', program: 'BSCS', batch: '2021-2025', proposalStatus: 'approved',  projectTitle: 'Hospital Management System',progress: 50 },
    { id: 4, name: 'Ahmed Raza',      rollNumber: 'F2021001004', program: 'BSCS', batch: '2021-2025', proposalStatus: 'rejected',  projectTitle: 'Library System',            progress: 10 },
    { id: 5, name: 'Usman Tariq',     rollNumber: 'F2021001006', program: 'BSCS', batch: '2021-2025', proposalStatus: 'approved',  projectTitle: 'School ERP System',         progress: 75 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending':  return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default:         return 'bg-secondary';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return '#28a745';
    if (progress >= 50) return '#3c50e0';
    if (progress >= 25) return '#ffc107';
    return '#dc3545';
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Breadcrumb pageName="My Students" />

      <div className="card shadow-sm border-0">

        {/* Header */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <h5 className="fw-semibold text-dark mb-0">
              My Students
              <span className="badge bg-primary ms-2 rounded-pill" style={{ fontSize: '0.75rem' }}>
                {students.length}
              </span>
            </h5>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '280px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Student</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Roll Number</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Project Title</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Proposal</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Progress</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">No students found.</td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                            style={{ width: '36px', height: '36px', minWidth: '36px', backgroundColor: '#3c50e0', fontSize: '0.8rem' }}
                          >
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="fw-medium text-dark small">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted small">{student.rollNumber}</td>
                      <td className="px-4 py-3 text-muted small">{student.projectTitle}</td>
                      <td className="px-4 py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadge(student.proposalStatus)}`} style={{ fontSize: '0.72rem' }}>
                          {student.proposalStatus.charAt(0).toUpperCase() + student.proposalStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: '140px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div
                              className="progress-bar"
                              style={{ width: `${student.progress}%`, backgroundColor: getProgressColor(student.progress) }}
                            />
                          </div>
                          <span className="text-dark small fw-medium" style={{ minWidth: '32px' }}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="btn btn-primary btn-sm px-3"
                          onClick={() => navigate(`/supervisor/students/${student.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupervisorStudents;