import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register: registerUser, loading, error, setError } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'GUEST' } });
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      navigate('/profile');
    }
  };

  const selectedRole = watch('role');

  return (
    <div className="page-wrapper">
      <section className="page-content">
        <div className="container-sm animate-fade-in-up" style={{ paddingTop: '96px', paddingBottom: '64px' }}>
          <div className="card">
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Join ISD Airbnb</h1>
            <p style={{ marginBottom: '1.75rem' }}>
              Create an account to book unique stays or start hosting guests.
            </p>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  style={{ marginLeft: 'auto', background: 'none', color: 'inherit', fontSize: '0.8rem' }}
                >
                  Dismiss
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="John"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
                {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="lastName">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Doe"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'At least 2 characters' },
                  })}
                />
                {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <span className="form-label">Account type</span>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <label
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border:
                        selectedRole === 'GUEST'
                          ? '2px solid var(--airbnb-dark)'
                          : '1.5px solid var(--airbnb-light-gray)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="radio"
                      value="GUEST"
                      {...register('role')}
                      style={{ display: 'none' }}
                    />
                    <strong>Guest</strong>
                    <p style={{ marginTop: '0.25rem', color: 'var(--airbnb-gray)', fontSize: '0.8rem' }}>
                      Book unique homes around the world.
                    </p>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border:
                        selectedRole === 'HOST'
                          ? '2px solid var(--airbnb-dark)'
                          : '1.5px solid var(--airbnb-light-gray)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    <input
                      type="radio"
                      value="HOST"
                      {...register('role')}
                      style={{ display: 'none' }}
                    />
                    <strong>Host</strong>
                    <p style={{ marginTop: '0.25rem', color: 'var(--airbnb-gray)', fontSize: '0.8rem' }}>
                      List your space and earn from it.
                    </p>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Agree and continue'}
              </button>
            </form>

            <p style={{ fontSize: '0.9rem', marginTop: '1.5rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;

