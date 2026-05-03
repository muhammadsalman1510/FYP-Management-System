// 📁 FILE: src/pages/Authentication/SignIn.jsx
// Replace your entire existing SignIn.jsx with this file

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        const { data } = await axios.post('http://localhost:4000/api/auth/login', {
          email,
          password,
        });

        // Store token & user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate based on role from API response
        switch (data.user.role) {
          case 'student':
            navigate('/dashboard');
            break;
          case 'supervisor':
            navigate('/supervisor/dashboard');
            break;
          case 'coordinator':
            navigate('/coordinator/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } catch (err) {
        console.error('Login error:', err);
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';
        alert(message);
      }
    } else {
      alert('Please enter your email and password.');
    }
  };

  // Sample credentials for testing each role
  const sampleCredentials = {
    student: { email: 'student@university.edu', password: 'student123' },
    supervisor: { email: 'shoaib@university.edu', password: 'supervisor123' },
    coordinator: { email: 'omer@university.edu', password: 'coordinator123' },
  };

  const fillSampleCredentials = () => {
    setEmail(sampleCredentials[userType].email);
    setPassword(sampleCredentials[userType].password);
  };

  return (
    /*
      Full screen centered layout.
      min-vh-100: takes full screen height
      bg-light: light gray background
    */
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body p-4 p-md-5">

                {/* Page Title */}
                <h2 className="fw-bold text-dark mb-4 fs-4">
                  Sign In to FYP System
                </h2>

                {/* ── Login Form ── */}
                <form onSubmit={handleSubmit}>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">Email</label>
                    <div className="position-relative">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-control form-control-lg pe-5"
                        required
                      />
                      {/* Email icon */}
                      <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" opacity="0.5">
                          <path d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692L11.0016 10.2094L2.64844 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.8782 19.5953 17.1532 19.2516 17.1532Z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">Password</label>
                    <div className="position-relative">
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control form-control-lg pe-5"
                        required
                      />
                      {/* Lock icon */}
                      <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" style={{ pointerEvents: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" opacity="0.5">
                          <path d="M16.1547 6.80626V5.91251C16.1547 3.16251 14.0922 0.825009 11.4797 0.618759C10.0359 0.481259 8.59219 0.996884 7.52656 1.95938C6.46094 2.92188 5.84219 4.29688 5.84219 5.70626V6.80626C3.84844 7.18438 2.33594 8.93751 2.33594 11.0688V17.2906C2.33594 19.5594 4.19219 21.3813 6.42656 21.3813H15.5016C17.7703 21.3813 19.6266 19.525 19.6266 17.2563V11C19.6609 8.93751 18.1484 7.21876 16.1547 6.80626Z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Remember Me + Fill Sample Credentials */}
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">

                    {/* Remember Me checkbox */}
                    <label className="d-flex align-items-center gap-2 mb-0" style={{ cursor: 'pointer' }}>
                      <div className="position-relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="visually-hidden"
                        />
                        <div
                          className="d-flex align-items-center justify-content-center rounded border"
                          style={{
                            width: '20px', height: '20px',
                            backgroundColor: rememberMe ? '#3c50e0' : 'transparent',
                            borderColor: rememberMe ? '#3c50e0' : '#ced4da',
                          }}
                        >
                          {rememberMe && (
                            <svg className="text-white" height="12" width="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="small">Remember me</span>
                    </label>

                    {/* Fill Sample Credentials button */}
                    <button
                      type="button"
                      onClick={fillSampleCredentials}
                      className="btn btn-link btn-sm p-0 text-primary text-decoration-underline"
                    >
                      Fill Sample Credentials
                    </button>
                  </div>

                  {/* Submit button */}
                  <div className="mb-3">
                    <button type="submit" className="btn btn-primary w-100 py-3 fw-medium">
                      Sign In
                    </button>
                  </div>

                  {/* Sign Up link */}
                  <div className="text-center mt-3">
                    <p className="mb-0 small">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-primary fw-medium">Sign Up</Link>
                    </p>
                  </div>

                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;