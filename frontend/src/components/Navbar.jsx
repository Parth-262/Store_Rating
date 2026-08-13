import React, { useState } from 'react';
import { Store, LogOut, Key, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpdatePasswordModal from './UpdatePasswordModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const roleLabels = {
    ADMIN: 'System Administrator',
    STORE_OWNER: 'Store Owner',
    USER: 'Normal User'
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <div className="brand-icon">
              <Store size={20} />
            </div>
            <span>StoreRating Platform</span>
          </div>

          <div className="nav-actions">
            <div className="user-badge">
              <UserCheck size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span className={`role-pill ${user.role}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsPasswordModalOpen(true)}
              title="Change your password"
            >
              <Key size={16} />
              <span>Password</span>
            </button>

            <button className="btn btn-danger btn-sm" onClick={logout} title="Log out from system">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
