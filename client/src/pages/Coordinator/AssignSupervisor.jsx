// 📁 FILE: src/pages/Coordinator/AssignSupervisor.jsx

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  COORDINATOR — ASSIGN SUPERVISOR TO STUDENT
  This page shows ALL students.
  Coordinator selects a supervisor for each student from a dropdown.
  TODO (Backend): GET /api/coordinator/students
  TODO (Backend): GET /api/coordinator/supervisors
  TODO (Backend): PUT /api/coordinator/students/:id/assign-supervisor
*/

const CoordinatorAssignSupervisor = () => {

  // Sample supervisors list for the dropdown
  const supervisorsList = [
    { id: 1, name: 'Mr. Shoaib Ahmed' },
    { id: 2, name: 'Mr. Omer Khan'    },
    { id: 3, name: 'Ms. Ayesha Tariq' },
  ];

  // Sample students with their current supervisor assignment
  const [students, setStudents] = useState([
    { id: 1, name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', batch: '2021-2025', supervisorId: 1 },
    { id: 2, name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', batch: '2021-2025', supervisorId: 1 },
    { id: 3, name: 'Sara Khan',       rollNumber: 'F2021001003', program: 'BSCS', batch: '2021-2025', supervisorId: 2 },
    { id: 4, name: 'Ahmed Raza',      rollNumber: 'F2021001004', program: 'BSCS', batch: '2021-2025', supervisorId: null },
    { id: 5, name: 'Fatima Malik',    rollNumber: 'F2021001005', program: 'BSCS', batch: '2021-2025', supervisorId: null },
    { id: 6, name: 'Usman Tariq',     rollNumber: 'F2021001006', program: 'BSCS', batch: '2021-2025', supervisorId: 3 },
  ]);

  const [savedAlert, setSavedAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update supervisor selection for a student
  const handleSupervisorChange = (studentId, newSupervisorId) => {
    setStudents(prev =>
      prev.map(s =>
        s.id === studentId
          ? { ...s, supervisorId: newSupervisorId ? parseInt(newSupervisorId) : null }
          : s
      )
    );
  };

  // Save all changes
  const handleSaveAll = () => {
    // TODO (Backend): Send updated assignments to API
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  // Get supervisor name by ID
  const getSupervisorName = (id) => {
    if (!id) return null;
    const s = supervisorsList.find(s => s.id === id);
    return s ? s.name : null;
  };

  // Filter students by search
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count stats
  const assignedCount   = students.filter(s => s.supervisorId).length;
  const unassignedCount = students.filter(s => !s.supervisorId).length;

  return (
    <>
      <Breadcrumb pageName="Assign Supervisor" />

      {/* Success Alert */}
      {savedAlert && (
        <div className="alert alert-success border-0 shadow-sm mb-4">
          <strong>Saved!</strong> Supervisor assignments updated successfully.
        </div>
      )}

      <div className="card shadow-sm border-0">

        {/* Card Header */}
        <div className="card-header bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <h5 className="fw-semibold text-dark mb-0">Assign Supervisors to Students</h5>
              <p className="text-muted small mb-0 mt-1">
                Use the dropdown in each row to assign or change a student's supervisor.
              </p>
            </div>
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: '200px' }}
              />
              <button
                className="btn btn-primary btn-sm px-4 fw-medium"
                onClick={handleSaveAll}
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 fw-semibold small text-dark">#</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Student Name</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Roll Number</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Program</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Batch</th>
                  <th className="px-4 py-3 fw-semibold small text-dark">Current Supervisor</th>
                  <th className="px-4 py-3 fw-semibold small text-dark" style={{ minWidth: '220px' }}>
                    Assign Supervisor
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-5">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>

                      {/* # */}
                      <td className="px-4 py-3 text-muted small">{index + 1}</td>

                      {/* Student Name with avatar */}
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                            style={{
                              width: '34px', height: '34px', minWidth: '34px',
                              backgroundColor: '#3c50e0', fontSize: '0.75rem'
                            }}
                          >
                            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="fw-medium text-dark small">{student.name}</span>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="px-4 py-3 text-muted small">{student.rollNumber}</td>

                      {/* Program */}
                      <td className="px-4 py-3 text-muted small">{student.program}</td>

                      {/* Batch */}
                      <td className="px-4 py-3 text-muted small">{student.batch}</td>

                      {/* Current Supervisor */}
                      <td className="px-4 py-3">
                        {getSupervisorName(student.supervisorId) ? (
                          <span className="text-dark small fw-medium">
                            {getSupervisorName(student.supervisorId)}
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark rounded-pill px-2 small">
                            Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Assign Supervisor Dropdown */}
                      <td className="px-4 py-3">
                        <select
                          className="form-select form-select-sm"
                          value={student.supervisorId || ''}
                          onChange={(e) => handleSupervisorChange(student.id, e.target.value)}
                        >
                          <option value="">-- Not Assigned --</option>
                          {supervisorsList.map(sv => (
                            <option key={sv.id} value={sv.id}>{sv.name}</option>
                          ))}
                        </select>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="card-footer bg-white border-top px-4 py-3">
          <div className="d-flex flex-wrap gap-4 small">
            <span className="text-muted">
              Total Students: <strong className="text-dark">{students.length}</strong>
            </span>
            <span className="text-muted">
              Assigned: <strong className="text-success">{assignedCount}</strong>
            </span>
            <span className="text-muted">
              Not Assigned: <strong className="text-warning">{unassignedCount}</strong>
            </span>
          </div>
        </div>

      </div>
    </>
  );
};

export default CoordinatorAssignSupervisor;