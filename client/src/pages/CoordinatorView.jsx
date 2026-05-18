import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

/*
  STUDENT — VIEW COORDINATOR'S PROFILE
  Read only. Uses DefaultLayout so student sidebar stays visible.
  TODO (Backend): GET /api/student/coordinator
*/

const CoordinatorView = () => {

  // TODO (Backend): Replace with GET /api/student/coordinator
  const coordinator = {
    name: 'Mr. Omer Farooq',
    email: 'omer@university.edu',
    phone: '+92 300 9876543',
    department: 'Computer Science',
    designation: 'Project Coordinator',
    officeRoom: 'Room 101, Admin Block',
    officeHours: 'Daily: 9:00 AM - 1:00 PM',
  };

  return (
    <>
      <Breadcrumb pageName="Coordinator" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Project Coordinator</h5>
            </div>
            <div className="card-body p-4">

              {/* Avatar + Name */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: '72px', height: '72px', minWidth: '72px', backgroundColor: '#3c50e0', fontSize: '1.5rem' }}
                >
                  {coordinator.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-1">{coordinator.name}</h5>
                  <p className="text-muted small mb-1">{coordinator.designation}</p>
                  <p className="text-muted small mb-1">{coordinator.department}</p>
                  <span className="badge bg-primary rounded-pill px-3" style={{ fontSize: '0.7rem' }}>Coordinator</span>
                </div>
              </div>

              {/* Info Fields — all read only */}
              <div className="row g-3">
                {[
                  { label: 'Email',        value: coordinator.email       },
                  { label: 'Phone Number', value: coordinator.phone       },
                  { label: 'Department',   value: coordinator.department  },
                  { label: 'Designation',  value: coordinator.designation },
                  { label: 'Office Room',  value: coordinator.officeRoom  },
                  { label: 'Office Hours', value: coordinator.officeHours },
                ].map((item, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <label className="form-label fw-medium text-dark small">{item.label}</label>
                    <div className="form-control bg-light text-dark small">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Request Meeting Button */}
              <div className="mt-4 pt-3 border-top">
                <a href="/meetings/requests" className="btn btn-primary px-4 fw-medium">
                  Request a Meeting
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoordinatorView;