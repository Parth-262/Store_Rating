import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle style={{ color: 'var(--accent-emerald)', width: 18, height: 18 }} />,
    error: <AlertCircle style={{ color: 'var(--accent-rose)', width: 18, height: 18 }} />,
    info: <Info style={{ color: 'var(--accent-sky)', width: 18, height: 18 }} />
  };

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
