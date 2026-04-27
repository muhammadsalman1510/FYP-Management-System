import React from 'react';

const Profile = () => {
  return (
    /* Centered container with max width */
    <div className="container-lg">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-7">

          <div className="card shadow-sm">

            {/* Card Header */}
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Student Profile</h5>
            </div>

            {/* Card Body */}
            <div className="card-body p-4">

              {/* Profile Picture + Name Row */}
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start gap-3 mb-4">

                {/* Profile picture circle */}
                <img
                  src="https://via.placeholder.com/96x96/3C50E0/FFFFFF?text=SA"
                  alt="Student"
                  className="rounded-circle"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />

                {/* Name and role */}
                <div className="text-center text-sm-start mt-2 mt-sm-0">
                  <p className="fw-semibold text-dark mb-0">Salman</p>
                  <p className="text-muted small mb-0">Student</p>
                </div>
              </div>

              {/* Profile Info Fields */}
              {/* Each field: label on top, read-only value below */}

              {/* Roll Number */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Roll Number
                </label>
                <div className="form-control bg-light text-dark">
                  F2021001001
                </div>
              </div>

              {/* Program */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Program
                </label>
                <div className="form-control bg-light text-dark">
                  BSCS - Bachelor of Science in Computer Science
                </div>
              </div>

              {/* Semester */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Semester
                </label>
                <div className="form-control bg-light text-dark">
                  7th Semester
                </div>
              </div>

              {/* Section */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Section
                </label>
                <div className="form-control bg-light text-dark">
                  Section A
                </div>
              </div>

              {/* Batch */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Batch
                </label>
                <div className="form-control bg-light text-dark">
                  2021-2025
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="form-label fw-medium text-dark small">
                  Email
                </label>
                <div className="form-control bg-light text-dark">
                  salman@university.edu
                </div>
              </div>

              {/* Contact Number */}
              <div className="mb-2">
                <label className="form-label fw-medium text-dark small">
                  Contact Number
                </label>
                <div className="form-control bg-light text-dark">
                  +92 300 1234567
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;