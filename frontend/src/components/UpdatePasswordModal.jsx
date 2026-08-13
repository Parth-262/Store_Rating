import React, { useState } from 'react';
import { X, Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UpdatePasswordModal({ isOpen, onClose }) {
  const { updatePassword, showToast } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validation helpers
  const isLengthValid = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!isLengthValid || !hasUppercase || !hasSpecial) {
      setError('New password does not satisfy requirements.');
      return;
    }

    if (!isMatch) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={20} color="var(--primary)" /> Change Password
          </h3>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: 4, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="8-16 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Validation Checklist */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ color: isLengthValid ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> 8 to 16 characters long
            </div>
            <div style={{ color: hasUppercase ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> At least 1 uppercase letter (A-Z)
            </div>
            <div style={{ color: hasSpecial ? 'var(--accent-emerald)' : 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> At least 1 special character (!@#$%^&*)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && !isMatch && (
              <span className="form-error">Passwords do not match</span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
