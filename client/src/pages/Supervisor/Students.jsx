// NOTE: This file is still named Students.jsx for routing compatibility
// but now shows PROJECTS with grouped students underneath each project

import React, { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';

/*
  SUPERVISOR — MY PROJECTS
  Shows all projects assigned to this supervisor.
  Each project card shows: title, student list, progress bar.
  Click "View Details" to go to a student's detail page.

  TODO (Backend): GET /api/supervisor/projects
  Returns projects where supervisor._id === logged-in supervisor
*/

const SupervisorStudents = () => {
  const navigate = useNavigate();

  // TODO (Backend): Replace with GET /api/supervisor/projects
  const [projects] = useState([
    {
      _id: 'proj1',
      title: 'FYP Management System',
      description: 'A web-based system to manage FYP workflows.',
      maxStudents: 3,
      progress: 40,
      milestones: [
        { name: 'Proposal',       completed: true  },
        { name: 'Defense',        completed: true  },
        { name: 'Implementation', completed: false },
        { name: 'Documentation',  completed: false },
        { name: 'Final',          completed: false },
      ],
      students: [
        { _id: 's1', name: 'Muhammad Salman', rollNumber: 'F2021001001', program: 'BSCS', semester: '7th', section: 'A' },
        { _id: 's2', name: 'Ali Hassan',      rollNumber: 'F2021001002', program: 'BSCS', semester: '7th', section: 'A' },
      ],
    },
    {
      _id: 'proj2',
      title: 'Hospital Management System',
      description: 'Complete hospital records and appointment management.',
      maxStudents: 3,
      progress: 20,
      milestones: [
        { name: 'Proposal',       completed: true  },
        { name: 'Defense',        completed: false },
        { name: 'Implementation', completed: false },
        { name: 'Documentation',  completed: false },
        { name: 'Final',          completed: false },
      ],
      students: [
        { _id: 's3', name: 'Sara Khan',   rollNumber: 'F2021001003', program: 'BSCS', semester: '7th', section: 'B' },
        { _id: 's4', name: 'Ahmed Raza',  rollNumber: 'F2021001004', program: 'BSCS', semester: '7th', section: 'B' },
        { _id: 's5', name: 'Fatima Tariq', rollNumber: 'F2021001005', program: 'BSCS', semester: '7th', section: 'B' },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#28a745';
    if (progress >= 40) return '#3c50e0';
    if (progress >= 20) return '#ffc107';
    return '#dc3545';
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.students.some(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <Breadcrumb pageName="My Projects" />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h5 className="fw-semibold text-dark mb-0">
            My Projects
            <span className="badge bg-primary ms-2 rounded-pill" style={{ fontSize: '0.75rem' }}>
              {projects.length}
            </span>
          </h5>
          <p className="text-muted small mb-0 mt-1">
            Projects assigned to you by the coordinator.
          </p>
        </div>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search projects or students..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No projects found.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredProjects.map(project => {
            const completedCount   = project.milestones.filter(m => m.completed).length;
            const progressPercent  = (completedCount / project.milestones.length) * 100;
            const currentMilestone = project.milestones.find(m => !m.completed);

            return (
              <div key={project._id} className="card shadow-sm border-0">

                {/* Project Header */}
                <div className="card-header bg-white border-bottom py-3 px-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                    <div>
                      <h6 className="fw-semibold text-dark mb-1">{project.title}</h6>
                      <p className="text-muted small mb-0">{project.description}</p>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-success rounded-pill px-3 py-1 mb-1 d-block" style={{ fontSize: '0.72rem' }}>
                        Active
                      </span>
                      <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                        {project.students.length}/{project.maxStudents} students
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-4">

                    {/* Left: Progress */}
                    <div className="col-12 col-md-5">
                      <p className="fw-medium text-dark small mb-2">Project Progress</p>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <div className="progress flex-grow-1" style={{ height: '8px', borderRadius: '4px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${progressPercent}%`,
                              backgroundColor: getProgressColor(progressPercent),
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                        <span className="fw-medium text-dark small">{Math.round(progressPercent)}%</span>
                      </div>
                      <p className="text-muted mb-3" style={{ fontSize: '0.75rem' }}>
                        Current: <strong className="text-dark">
                          {currentMilestone ? currentMilestone.name : 'All Done!'}
                        </strong>
                      </p>

                      {/* Milestone dots */}
                      <div className="d-flex gap-1 flex-wrap">
                        {project.milestones.map((m, i) => (
                          <span
                            key={i}
                            className="badge rounded-pill px-2 py-1"
                            style={{
                              fontSize: '0.65rem',
                              backgroundColor: m.completed ? '#28a745' : '#e9ecef',
                              color: m.completed ? '#fff' : '#adb5bd',
                            }}
                            title={m.name}
                          >
                            {m.name.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Students */}
                    <div className="col-12 col-md-7">
                      <p className="fw-medium text-dark small mb-2">
                        Students ({project.students.length})
                      </p>
                      <div className="d-flex flex-column gap-2">
                        {project.students.map(student => (
                          <div key={student._id}
                            className="d-flex align-items-center justify-content-between p-2 border rounded">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                                style={{ width: '32px', height: '32px', minWidth: '32px', backgroundColor: '#3c50e0', fontSize: '0.72rem' }}
                              >
                                {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="fw-medium text-dark mb-0" style={{ fontSize: '0.82rem' }}>
                                  {student.name}
                                </p>
                                <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                                  {student.rollNumber} &bull; {student.program} &bull; Sem {student.semester} &bull; Sec {student.section}
                                </p>
                              </div>
                            </div>
                            <button
                              className="btn btn-outline-primary btn-sm px-3"
                              style={{ fontSize: '0.72rem' }}
                              onClick={() => navigate(`/supervisor/students/${student._id}`)}
                            >
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SupervisorStudents;