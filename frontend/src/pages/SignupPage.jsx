import React, { useState } from 'react';
import { User, Mail, MapPin, Lock, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage({ onNavigateLogin }) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Client-side validations matching coding challenge PDF rules
  const validateForm = () => {
    const newErrors = {};

    const nameTrimmed = formData.name.trim();
    if (nameTrimmed.length < 20) {
      newErrors.name = 'Name must be at least 20 characters long.';
    } else if (nameTrimmed.length > 60) {
      newErrors.name = 'Name must not exceed 60 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const addressTrimmed = formData.address.trim();
    if (addressTrimmed.length === 0) {
      newErrors.address = 'Address is required.';
    } else if (addressTrimmed.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters.';
    }

    const pwd = formData.password;
    if (pwd.length < 8 || pwd.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters.';
    } else if (!/[A-Z]/.test(pwd)) {
      newErrors.password = 'Password must include at least one uppercase letter.';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      newErrors.password = 'Password must include at least one special character.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await signup(formData);
    } catch (err) {
      setServerError(err.message || 'Registration failed.');
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const nameLength = formData.name.trim().length;

  return (
    <div className="auth-wrapper">
      <div className="card auth-card" style={{ maxWidth: 540 }}>
        <button
          type="button"
          onClick={onNavigateLogin}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={16} /> Back to Sign In
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Register as a Normal User to browse stores and submit ratings
          </p>
        </div>

        {serverError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <AlertCircle size={18} /> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label">
              <span>Full Name</span>
              <span style={{ fontSize: '0.78rem', color: nameLength >= 20 && nameLength <= 60 ? 'var(--accent-emerald)' : 'var(--text-subtle)' }}>
                {nameLength}/60 chars (Min 20)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)'
                }}
              />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="e.g. Johnathan Dough Registered User"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="form-hint">Must be between 20 and 60 characters long.</div>
            {errors.name && <div className="form-error"><AlertCircle size={14} />{errors.name}</div>}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)'
                }}
              />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            {errors.email && <div className="form-error"><AlertCircle size={14} />{errors.email}</div>}
          </div>

          {/* Address Field */}
          <div className="form-group">
            <label className="form-label">
              <span>Physical Address</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                {formData.address.length}/400 chars
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 14,
                  color: 'var(--text-subtle)'
                }}
              />
              <textarea
                className="form-control"
                style={{ paddingLeft: 40, minHeight: 80 }}
                placeholder="123 Main Street, Suite 400, San Francisco, CA"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                maxLength={400}
                required
              />
            </div>
            {errors.address && <div className="form-error"><AlertCircle size={14} />{errors.address}</div>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)'
                }}
              />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: 40 }}
                placeholder="8-16 chars, Uppercase & Special"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>
            {errors.password && <div className="form-error"><AlertCircle size={14} />{errors.password}</div>}
          </div>

          {/* Password Rules Checklist */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.25rem',
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ color: formData.password.length >= 8 && formData.password.length <= 16 ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> 8-16 characters
            </div>
            <div style={{ color: /[A-Z]/.test(formData.password) ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> At least 1 uppercase letter
            </div>
            <div style={{ color: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> At least 1 special character
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Register Account'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
