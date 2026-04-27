import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import userThree from '../images/user/user-03.png';

const Settings = () => {
  return (
    <>
      {/* Page breadcrumb */}
      <Breadcrumb pageName="Settings" />

      <div className="row g-4">

        {/* ===== LEFT COLUMN: Personal Information Form ===== */}
        <div className="col-12 col-xl-7">
          <div className="card shadow-sm">

            {/* Card Header */}
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Personal Information</h5>
            </div>

            {/* Card Body */}
            <div className="card-body p-4">
              <form>

                {/* Full Name + Phone Number - side by side on sm+ screens */}
                <div className="row g-3 mb-3">

                  {/* Full Name */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="fullName" className="form-label fw-medium text-dark small">
                      Full Name
                    </label>
                    <div className="position-relative">
                      {/* Person icon inside input */}
                      <span
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                        style={{ pointerEvents: 'none' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" opacity="0.6">
                          <path fillRule="evenodd" clipRule="evenodd" d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="form-control ps-5"
                        placeholder="Devid Jhon"
                        defaultValue="Devid Jhon"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="col-12 col-sm-6">
                    <label htmlFor="phoneNumber" className="form-label fw-medium text-dark small">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      className="form-control"
                      placeholder="+990 3343 7865"
                      defaultValue="+990 3343 7865"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label htmlFor="emailAddress" className="form-label fw-medium text-dark small">
                    Email Address
                  </label>
                  <div className="position-relative">
                    {/* Email icon inside input */}
                    <span
                      className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                      style={{ pointerEvents: 'none' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" opacity="0.6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      id="emailAddress"
                      name="emailAddress"
                      className="form-control ps-5"
                      placeholder="devidjond45@gmail.com"
                      defaultValue="devidjond45@gmail.com"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="mb-3">
                  <label htmlFor="Username" className="form-label fw-medium text-dark small">
                    Username
                  </label>
                  <input
                    type="text"
                    id="Username"
                    name="Username"
                    className="form-control"
                    placeholder="devidjhon24"
                    defaultValue="devidjhon24"
                  />
                </div>

                {/* Bio textarea */}
                <div className="mb-4">
                  <label htmlFor="bio" className="form-label fw-medium text-dark small">
                    BIO
                  </label>
                  <div className="position-relative">
                    {/* Edit icon inside textarea */}
                    <span
                      className="position-absolute text-muted"
                      style={{ top: '12px', left: '12px', pointerEvents: 'none' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" opacity="0.6">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.6664 2.39884C16.4185 2.39884 16.1809 2.49729 16.0056 2.67253L8.25216 10.426L7.81167 12.188L9.57365 11.7475L17.3271 3.99402C17.5023 3.81878 17.6008 3.5811 17.6008 3.33328C17.6008 3.08545 17.5023 2.84777 17.3271 2.67253C17.1519 2.49729 16.9142 2.39884 16.6664 2.39884Z" />
                      </svg>
                    </span>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={5}
                      className="form-control ps-5"
                      placeholder="Write your bio here"
                      defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque posuere fermentum urna, eu condimentum mauris tempus ut. Donec fermentum blandit aliquet."
                    />
                  </div>
                </div>

                {/* Cancel + Save buttons */}
                <div className="d-flex justify-content-end gap-3">
                  <button type="button" className="btn btn-outline-secondary px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Save
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
        {/* ===== END LEFT COLUMN ===== */}

        {/* ===== RIGHT COLUMN: Photo Upload ===== */}
        <div className="col-12 col-xl-5">
          <div className="card shadow-sm">

            {/* Card Header */}
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-semibold text-dark mb-0">Your Photo</h5>
            </div>

            {/* Card Body */}
            <div className="card-body p-4">
              <form>

                {/* Current photo + edit/delete actions */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <img
                    src={userThree}
                    alt="User"
                    className="rounded-circle"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                  <div>
                    <p className="fw-medium text-dark mb-1">Edit your photo</p>
                    <div className="d-flex gap-3">
                      <button type="button" className="btn btn-link btn-sm p-0 text-muted text-decoration-none">
                        Delete
                      </button>
                      <button type="button" className="btn btn-link btn-sm p-0 text-muted text-decoration-none">
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* File upload drop zone */}
                <div
                  className="position-relative border border-primary border-dashed rounded text-center py-4 mb-4 bg-light"
                  style={{ cursor: 'pointer' }}
                >
                  {/* Hidden real file input covering the whole zone */}
                  <input
                    type="file"
                    accept="image/*"
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                    style={{ cursor: 'pointer', zIndex: 10 }}
                  />

                  {/* Upload icon */}
                  <div className="d-flex flex-column align-items-center gap-2">
                    <span
                      className="d-flex align-items-center justify-content-center rounded-circle border bg-white"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z" fill="#3C50E0" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z" fill="#3C50E0" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z" fill="#3C50E0" />
                      </svg>
                    </span>
                    <p className="mb-0 small">
                      <span className="text-primary fw-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-muted mb-0 small">SVG, PNG, JPG or GIF</p>
                    <p className="text-muted mb-0 small">(max 800 x 800px)</p>
                  </div>
                </div>

                {/* Cancel + Save buttons */}
                <div className="d-flex justify-content-end gap-3">
                  <button type="button" className="btn btn-outline-secondary px-4">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Save
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
        {/* ===== END RIGHT COLUMN ===== */}

      </div>
    </>
  );
};

export default Settings;