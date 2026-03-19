import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const formatDateTime = (isoLike) => {
    if (!isoLike) return '—';
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getMyProfile();
        setProfile(data);
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load profile.';
        setError(msg);
        toast.error(msg);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await authService.updateMyProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
      });
      setProfile(updated);
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      setSuccess('Profile updated successfully.');
      toast.success('Profile updated.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = authLoading || !profile;

  return (
    <div className="page-wrapper">
      <section className="page-content">
        <div className="container-sm" style={{ paddingTop: '96px', paddingBottom: '64px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <span className="spinner spinner-dark" />
            </div>
          ) : (
            <div className="card animate-fade-in-up">
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your profile</h1>
              <p style={{ marginBottom: '1.5rem' }}>
                Manage your personal details. Booking history and status tracking will appear here as the
                booking microservice UI is wired.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ padding: '12px', borderRadius: '16px', background: 'var(--airbnb-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`badge ${profile.role === 'HOST' ? 'badge-red' : 'badge-gray'}`}>
                      {profile.role || user?.role || '—'}
                    </span>
                    <span className={`badge ${profile.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                      {profile.status || '—'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Email verified: <strong>{profile.emailVerified ? 'Yes' : 'No'}</strong>
                  </p>
                </div>

                <div style={{ padding: '12px', borderRadius: '16px', background: 'var(--airbnb-bg)' }}>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Joined: <strong>{formatDateTime(profile.createdAt)}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Last login: <strong>{formatDateTime(profile.lastLoginAt)}</strong>
                  </p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>
                    Updated: <strong>{formatDateTime(profile.updatedAt)}</strong>
                  </p>
                </div>
              </div>

              {profile.role === 'HOST' && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'var(--airbnb-white)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {profile.superhost && <span className="badge badge-red">Superhost</span>}
                    <span className="badge badge-gray">Host stats</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--airbnb-gray)' }}>Listings</p>
                      <p style={{ margin: 0, fontWeight: 800 }}>{profile.totalListings ?? '—'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--airbnb-gray)' }}>Rating</p>
                      <p style={{ margin: 0, fontWeight: 800 }}>
                        {typeof profile.averageRating === 'number' ? profile.averageRating.toFixed(2) : '—'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--airbnb-gray)' }}>Response rate</p>
                      <p style={{ margin: 0, fontWeight: 800 }}>
                        {typeof profile.responseRate === 'number' ? `${profile.responseRate}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
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

              {success && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                  <span>{success}</span>
                  <button
                    type="button"
                    onClick={() => setSuccess(null)}
                    style={{ marginLeft: 'auto', background: 'none', color: 'inherit', fontSize: '0.8rem' }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="form-input"
                    value={profile.firstName || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="lastName">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="form-input"
                    value={profile.lastName || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={profile.email || user?.email || ''}
                    disabled
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" htmlFor="phoneNumber">
                    Phone number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    className="form-input"
                    value={profile.phoneNumber || ''}
                    onChange={handleChange}
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="bio">
                    About
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-input"
                    style={{ minHeight: '96px', resize: 'vertical' }}
                    value={profile.bio || ''}
                    onChange={handleChange}
                    placeholder="Tell guests a little about yourself."
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Save changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;

