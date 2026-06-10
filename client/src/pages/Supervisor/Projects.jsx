// 📁 FILE: src/pages/Supervisor/Projects.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

/*
  SUPERVISOR — PROJECTS LIST PAGE
  Shows all projects assigned to this supervisor.
  Clicking a project card opens the Project Detail page.

  TODO (Backend): GET /api/projects/assigned
  Replace hardcoded data below with real API response.
*/

// ── Hardcoded dummy data ──────────────────────────────────────────────────────
const dummyProjects = [
  {
    _id: 'p001',
    title: 'FYP Management System',
    description: 'A web-based system to manage final year projects for students, supervisors, and coordinators using the MERN stack.',
    status: 'active',
    progress: 20,
    students: [
      { name: 'Muhammad Salman', rollNumber: 'F2021001001' },
      { name: 'Ali Hassan',      rollNumber: 'F2021001002' },
    ],
    milestones: [
      { name: 'Project Proposal',  completed: true  },
      { name: 'Project Defense',   completed: false },
      { name: 'Implementation',    completed: false },
      { name: 'Documentation',     completed: false },
      { name: 'Final Presentation',completed: false },
    ],
    pendingTasks: 3,
    pendingSubmissions: 1,
  },
  {
    _id: 'p002',
    title: 'Smart Attendance System',
    description: 'An AI-powered attendance tracking system using face recognition integrated with university portals.',
    status: 'active',
    progress: 40,
    students: [
      { name: 'Usman Tariq',  rollNumber: 'F2021002001' },
      { name: 'Sara Ahmed',   rollNumber: 'F2021002002' },
      { name: 'Bilal Khan',   rollNumber: 'F2021002003' },
    ],
    milestones: [
      { name: 'Project Proposal',  completed: true  },
      { name: 'Project Defense',   completed: true  },
      { name: 'Implementation',    completed: false },
      { name: 'Documentation',     completed: false },
      { name: 'Final Presentation',completed: false },
    ],
    pendingTasks: 2,
    pendingSubmissions: 0,
  },
  {
    _id: 'p003',
    title: 'E-Commerce Mobile App',
    description: 'A cross-platform mobile application for local vendors to manage inventory and sales online.',
    status: 'proposal-pending',
    progress: 0,
    students: [
      { name: 'Hamza Raza', rollNumber: 'F2021003001' },
    ],
    milestones: [
      { name: 'Project Proposal',  completed: false },
      { name: 'Project Defense',   completed: false },
      { name: 'Implementation',    completed: false },
      { name: 'Documentation',     completed: false },
      { name: 'Final Presentation',completed: false },
    ],
    pendingTasks: 0,
    pendingSubmissions: 0,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const statusConfig = {
  'active':           { label: 'Active',           bg: '#28a74520', color: '#28a745', dot: '#28a745' },
  'proposal-pending': { label: 'Proposal Pending',  bg: '#ffc10720', color: '#d39e00', dot: '#ffc107' },
  'completed':        { label: 'Completed',         bg: '#3c50e020', color: '#3c50e0', dot: '#3c50e0' },
};

const getInitials = (name) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const avatarColors = ['#3c50e0', '#28a745', '#17a2b8', '#e83e8c', '#fd7e14'];

const Projects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // TODO (Backend): Replace with real data from GET /api/projects/assigned
  const projects = dummyProjects;

  const filtered = projects.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.students.some(s => s.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Breadcrumb pageName="Projects" />

      {/* ── Summary Stats Row ── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 text-center">
              <h3 className="fw-bold text-primary mb-0">{projects.length}</h3>
              <p className="text-muted small mb-0">Total Projects</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 text-center">
              <h3 className="fw-bold text-success mb-0">
                {projects.filter(p => p.status === 'active').length}
              </h3>
              <p className="text-muted small mb-0">Active</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 text-center">
              <h3 className="fw-bold text-warning mb-0">
                {projects.reduce((sum, p) => sum + p.pendingSubmissions, 0)}
              </h3>
              <p className="text-muted small mb-0">Pending Submissions</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3 text-center">
              <h3 className="fw-bold text-info mb-0">
                {projects.reduce((sum, p) => sum + p.students.length, 0)}
              </h3>
              <p className="text-muted small mb-0">Total Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-7">
              <div className="position-relative">
                <svg
                  className="position-absolute top-50 translate-middle-y ms-3"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by project title or student name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-5">
              <div className="d-flex gap-2 flex-wrap">
                {['all', 'active', 'proposal-pending', 'completed'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="btn btn-sm fw-medium"
                    style={{
                      backgroundColor: filterStatus === s ? '#3c50e0' : '#f8f9fa',
                      color: filterStatus === s ? '#fff' : '#6c757d',
                      border: 'none',
                      fontSize: '0.78rem',
                    }}
                  >
                    {s === 'all' ? 'All' : statusConfig[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Projects Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="1.5" className="mb-3">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <p className="mb-0">No projects found matching your search.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((project) => {
            const st = statusConfig[project.status] || statusConfig['active'];
            const completedCount = project.milestones.filter(m => m.completed).length;

            return (
              <div key={project._id} className="col-12 col-lg-6">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                  onClick={() => navigate(`/supervisor/projects/${project._id}`)}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="card-body p-4">

                    {/* Title Row */}
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {project.title}
                      </h6>
                      <span
                        className="badge ms-2 flex-shrink-0"
                        style={{
                          backgroundColor: st.bg,
                          color: st.color,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                        }}
                      >
                        <span
                          className="rounded-circle d-inline-block me-1"
                          style={{ width: '6px', height: '6px', backgroundColor: st.dot }}
                        />
                        {st.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-muted mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.5',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Progress</span>
                        <span className="fw-medium text-dark" style={{ fontSize: '0.75rem' }}>
                          {project.progress}% &nbsp;·&nbsp; {completedCount}/{project.milestones.length} milestones
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px', borderRadius: '4px' }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${project.progress}%`, borderRadius: '4px' }}
                        />
                      </div>
                    </div>

                    {/* Students Row */}
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        {/* Avatar stack */}
                        <div className="d-flex" style={{ marginRight: '4px' }}>
                          {project.students.map((s, i) => (
                            <div
                              key={i}
                              title={`${s.name} — ${s.rollNumber}`}
                              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                              style={{
                                width: '30px', height: '30px',
                                fontSize: '0.65rem',
                                backgroundColor: avatarColors[i % avatarColors.length],
                                marginLeft: i > 0 ? '-8px' : '0',
                                border: '2px solid #fff',
                                zIndex: project.students.length - i,
                              }}
                            >
                              {getInitials(s.name)}
                            </div>
                          ))}
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {project.students.length} student{project.students.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Pending indicators */}
                      <div className="d-flex gap-2">
                        {project.pendingSubmissions > 0 && (
                          <span
                            className="badge rounded-pill"
                            style={{ backgroundColor: '#ffc10720', color: '#d39e00', fontSize: '0.7rem' }}
                          >
                            {project.pendingSubmissions} submission{project.pendingSubmissions !== 1 ? 's' : ''}
                          </span>
                        )}
                        {project.pendingTasks > 0 && (
                          <span
                            className="badge rounded-pill"
                            style={{ backgroundColor: '#3c50e020', color: '#3c50e0', fontSize: '0.7rem' }}
                          >
                            {project.pendingTasks} task{project.pendingTasks !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div
                    className="card-footer border-0 py-2 px-4 d-flex align-items-center justify-content-between"
                    style={{ backgroundColor: '#f8f9fa', fontSize: '0.75rem' }}
                  >
                    <span className="text-muted">Click to view full details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
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

export default Projects;