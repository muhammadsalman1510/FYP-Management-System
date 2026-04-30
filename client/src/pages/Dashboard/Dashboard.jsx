import { Link } from 'react-router-dom';
import CardDataStats from '../../components/CardDataStats';

const Dashboard = () => {
  return (
    <>
      {/*
        Top Stats Row - 4 cards
        row: Bootstrap grid row
        g-4: gap between columns
        row-cols-1: 1 card per row on mobile
        row-cols-md-2: 2 cards per row on medium screens
        row-cols-xl-4: 4 cards per row on large screens
      */}
      <div className="row g-4 row-cols-1 row-cols-md-2 row-cols-xl-4">

        {/* Total Tasks Card */}
        <div className="col">
          <CardDataStats title="Total Tasks" total="12" rate="75%" levelUp>
            <svg className="text-primary" width="22" height="22" viewBox="0 0 22 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6656 19.4907 19.0438 19.2157 19.3531Z" />
            </svg>
          </CardDataStats>
        </div>

        {/* Pending Submissions Card */}
        <div className="col">
          <CardDataStats title="Pending Submissions" total="3" rate="2 days left" levelDown>
            <svg className="text-primary" width="20" height="22" viewBox="0 0 20 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.0937 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4219 12.2343 19.8687 11.7531 19.8687Z" />
            </svg>
          </CardDataStats>
        </div>

        {/* Project Status Card */}
        <div className="col">
          <CardDataStats title="Project Status" total="Under Review" rate="">
            <svg className="text-primary" width="22" height="18" viewBox="0 0 22 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z" />
            </svg>
          </CardDataStats>
        </div>

        {/* Upcoming Meetings Card */}
        <div className="col">
          <CardDataStats title="Upcoming Meetings" total="2" rate="Tomorrow" levelUp>
            <svg className="text-primary" width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.7499 2.9812H14.2874V2.36245C14.2874 2.02495 14.0062 1.71558 13.6405 1.71558C13.2749 1.71558 12.9937 1.99683 12.9937 2.36245V2.9812H4.97803V2.36245C4.97803 2.02495 4.69678 1.71558 4.33115 1.71558C3.96553 1.71558 3.68428 1.99683 3.68428 2.36245V2.9812H2.2499C1.29365 2.9812 0.478027 3.7687 0.478027 4.75308V14.5406C0.478027 15.4968 1.26553 16.3125 2.2499 16.3125H15.7499C16.7062 16.3125 17.5218 15.525 17.5218 14.5406V4.72495C17.5218 3.7687 16.7062 2.9812 15.7499 2.9812ZM1.77178 8.21245H4.1624V10.9968H1.77178V8.21245Z" />
            </svg>
          </CardDataStats>
        </div>

      </div>
      {/* End Top Stats Row */}

      {/*
        Bottom Section - Charts and panels
        row: Bootstrap grid row
        g-4: gap between columns
        mt-4: top margin
      */}
      <div className="row g-4 mt-2">

        {/* ===== Project Progress Chart - takes 8 of 12 columns on large screens ===== */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4">

              {/* Card header area */}
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div className="d-flex align-items-center gap-2">
                  {/* Blue dot indicator */}
                  <span
                    className="d-flex align-items-center justify-content-center rounded-circle border border-primary"
                    style={{ width: '16px', height: '16px' }}
                  >
                    <span
                      className="rounded-circle bg-primary"
                      style={{ width: '10px', height: '10px', display: 'block' }}
                    ></span>
                  </span>
                  <div>
                    <p className="fw-semibold text-primary mb-0">Project Completion</p>
                    <p className="small text-muted mb-0">75% Complete</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: '75%' }}
                    aria-valuenow="75"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                {/* Stage labels below the progress bar */}
                <div className="d-flex justify-content-between mt-2">
                  <span className="small text-muted">Proposal</span>
                  <span className="small text-muted">Review</span>
                  <span className="small text-muted">Implementation</span>
                  <span className="small text-muted">Final</span>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* ===== End Project Progress ===== */}

        {/* ===== Recent Feedback - takes 4 of 12 columns on large screens ===== */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4">

              <h5 className="fw-semibold text-dark mb-4">Recent Feedback</h5>

              {/* Feedback item 1 */}
              <div className="border-bottom pb-3 mb-3">
                <p className="small fw-medium text-dark mb-1">From Supervisor</p>
                <p className="small text-muted mb-1">
                  Good progress on the proposal. Please add more technical details.
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>2 hours ago</span>
              </div>

              {/* Feedback item 2 */}
              <div className="border-bottom pb-3">
                <p className="small fw-medium text-dark mb-1">From Coordinator</p>
                <p className="small text-muted mb-1">
                  Project approved. You can start implementation phase.
                </p>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>1 day ago</span>
              </div>

            </div>
          </div>
        </div>
        {/* ===== End Recent Feedback ===== */}

        {/* ===== Upcoming Deadlines - takes 6 of 12 columns on large screens ===== */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4">

              <h5 className="fw-semibold text-dark mb-4">Upcoming Deadlines</h5>

              {/* Deadline item 1 */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <p className="fw-medium text-dark mb-1">Project Documentation</p>
                  <p className="small text-muted mb-0">Due in 3 days</p>
                </div>
                {/* High priority badge - yellow/warning */}
                <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
                  High Priority
                </span>
              </div>

              {/* Deadline item 2 */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="fw-medium text-dark mb-1">Meeting with Supervisor</p>
                  <p className="small text-muted mb-0">Tomorrow, 2:00 PM</p>
                </div>
                {/* Medium priority badge - blue/info */}
                <span className="badge bg-info text-white rounded-pill px-3 py-2">
                  Medium
                </span>
              </div>

            </div>
          </div>
        </div>
        {/* ===== End Upcoming Deadlines ===== */}

        {/* ===== Quick Actions - takes 6 of 12 columns on large screens ===== */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-body p-4">

              <h5 className="fw-semibold text-dark mb-4">Quick Actions</h5>

              {/*
                2-column grid of buttons
                row g-3: Bootstrap grid with gap
                col-6: each button takes half the width
              */}
              <div className="row g-3">
                <div className="col-6">
                  <button className="btn btn-primary w-100 py-3 fw-medium">
                    Submit Proposal
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-primary w-100 py-3 fw-medium">
                    Upload Document
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-primary w-100 py-3 fw-medium">
                    Request Meeting
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-primary w-100 py-3 fw-medium">
                    View Tasks
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* ===== End Quick Actions ===== */}

      </div>
      {/* End Bottom Section */}

    </>
  );
};

export default Dashboard;