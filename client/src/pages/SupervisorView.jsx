import React from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

/*
  STUDENT — VIEW MY SUPERVISOR'S PROFILE
  Read only. Uses DefaultLayout so student sidebar stays visible.
  TODO (Backend): GET /api/student/supervisor
*/

const SupervisorView = () => {

  // TODO (Backend): Replace with GET /api/student/supervisor
  const supervisor = {
    name: 'Mr. Shoaib Ahmed',
    email: 'shoaib@university.edu',
    phone: '+92 301 1234567',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    specialization: 'Artificial Intelligence & Web Technologies',
    officeRoom: 'Room 301, CS Block',
    officeHours: 'Mon-Wed: 10:00 AM - 12:00 PM',
  };

  return (
    <>
      <Breadcrumb pageName="My Supervisor" />

      <div className="row justify-content-center">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">My Supervisor</h5>
            </div>
            <div className="card-body p-4">

              {/* Avatar + Name */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
                  style={{ width: '72px', height: '72px', minWidth: '72px', backgroundColor: '#28a745', fontSize: '1.5rem' }}
                >
                  {supervisor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h5 className="fw-semibold text-dark mb-1">{supervisor.name}</h5>
                  <p className="text-muted small mb-1">{supervisor.designation}</p>
                  <p className="text-muted small mb-1">{supervisor.department}</p>
                  <span className="badge bg-success rounded-pill px-3" style={{ fontSize: '0.7rem' }}>Supervisor</span>
                </div>
              </div>

              {/* Info Fields — all read only */}
              <div className="row g-3">
                {[
                  { label: 'Email',          value: supervisor.email          },
                  { label: 'Phone Number',   value: supervisor.phone          },
                  { label: 'Department',     value: supervisor.department     },
                  { label: 'Designation',    value: supervisor.designation    },
                  { label: 'Specialization', value: supervisor.specialization },
                  { label: 'Office Room',    value: supervisor.officeRoom     },
                  { label: 'Office Hours',   value: supervisor.officeHours    },
                ].map((item, i) => (
                  <div key={i} className={item.label === 'Specialization' ? 'col-12' : 'col-12 col-md-6'}>
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

export default SupervisorView;