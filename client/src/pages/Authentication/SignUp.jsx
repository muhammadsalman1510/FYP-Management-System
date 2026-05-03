import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [rollNumber, setRollNumber] = useState(null);
  const [maxProjects, setMaxProjects] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
      };

      // Only include rollNumber if signing up as a student
      if (userType === 'student') {
        payload.rollNumber = rollNumber;
      }

      // Only include maxProjects if signing up as a supervisor
      if (userType === 'supervisor') {
        if (!maxProjects || maxProjects < 1 || maxProjects > 5) {
          alert('Maximum projects must be between 1 and 5.');
          return;
        }
        payload.maxProjects = maxProjects;
      }

      const token = localStorage.getItem('token');

      const { data } = await axios.post('http://localhost:4000/api/users', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(data.message);
      navigate('/login');

    } catch (err) {
      console.error('Signup error:', err);
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      alert(message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    /*
      min-vh-100: full screen height
      d-flex align-items-center justify-content-center: center card on screen
      bg-light: light gray background
      py-4: top and bottom padding for small screens
    */
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">

          {/*
            col-12: full width on mobile
            col-md-8: 8 columns on medium
            col-lg-6: 6 columns on large
            col-xl-5: 5 columns on extra large
          */}
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body p-4 p-md-5">

                {/* ===== Page Title ===== */}
                <h2 className="fw-bold text-dark mb-4 fs-4">
                  Create Account
                </h2>

                {/* ===== User Type Selection Buttons ===== */}
                <div className="mb-4">
                  <label className="form-label fw-medium text-dark small">
                    Register As
                  </label>
                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => setUserType('student')}
                        className={`btn w-100 ${userType === 'student'
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                          }`}
                      >
                        Student
                      </button>
                    </div>
                    <div className="col-6">
                      <button
                        type="button"
                        onClick={() => setUserType('supervisor')}
                        className={`btn w-100 ${userType === 'supervisor'
                          ? 'btn-primary'
                          : 'btn-outline-secondary'
                          }`}
                      >
                        Supervisor
                      </button>
                    </div>
                  </div>
                </div>
                {/* ===== End User Type Selection ===== */}

                {/* ===== Sign Up Form ===== */}
                <form onSubmit={handleSubmit}>

                  {/* Full Name Field */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      required
                    />
                  </div>

                  {/*
                    Roll Number Field
                    Only shown if userType is 'student'
                  */}
                  {userType === 'student' && (
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        name="rollNumber"
                        placeholder="Enter your roll number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        className="form-control form-control-lg"
                      />
                    </div>
                  )}

                  {/*
                    Maximum Projects Field
                    Only shown if userType is 'supervisor'
                  */}
                  {userType === 'supervisor' && (
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        Maximum Projects
                      </label>
                      <input
                        type="number"
                        name="maxProjects"
                        placeholder="Enter maximum number of projects (1-5)"
                        value={maxProjects}
                        onChange={(e) => setMaxProjects(e.target.value)}
                        className="form-control form-control-lg"
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  )}

                  {/* Password Field */}
                  <div className="mb-3">
                    <label className="form-label fw-medium text-dark">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      required
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label className="form-label fw-medium text-dark">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-medium"
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center mt-3">
                    <p className="mb-0 small">
                      Already have an account?{' '}
                      <Link to="/login" className="text-primary fw-medium">
                        Sign In
                      </Link>
                    </p>
                  </div>

                </form>
                {/* ===== End Form ===== */}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignUp;