import React, { useState, useEffect } from 'react';
import { Store, Star, Users, ArrowUpDown, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function OwnerDashboardPage() {
  const { token, API_BASE } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ sortBy: 'user_name', sortOrder: 'ASC' });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder
      });
      const res = await fetch(`${API_BASE}/owner/dashboard?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to fetch store owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [sort]);

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  if (loading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading store dashboard...</p>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.hasStore) {
    return (
      <div className="main-content">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Store size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3>No Store Assigned</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Your account does not currently have a registered store assigned to it.
            Please contact the System Administrator to bind your store account.
          </p>
        </div>
      </div>
    );
  }

  const { store, ratings } = dashboardData;

  return (
    <div className="main-content">
      {/* Store Owner Dashboard Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>{store.name}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {store.address} • {store.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}
          >
            <Star size={26} />
          </div>
          <div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {store.averageRating ? Number(store.averageRating).toFixed(1) : '0.0'}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>
            <div className="stat-label">Store Overall Average Rating</div>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}
          >
            <Users size={26} />
          </div>
          <div>
            <div className="stat-value">{store.totalRatings}</div>
            <div className="stat-label">Total Users Who Rated Your Store</div>
          </div>
        </div>
      </div>

      {/* Ratings Table Title */}
      <div style={{ marginBottom: '1rem' }}>
        <h3>Customer Rating Submissions</h3>
        <p style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
          List of users who have submitted ratings for {store.name}
        </p>
      </div>

      {/* Ratings Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('user_name')}>
                Customer Name <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('user_email')}>
                Customer Email <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('rating')}>
                Submitted Rating <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('created_at')}>
                Submitted / Updated Date <ArrowUpDown size={14} />
              </th>
            </tr>
          </thead>
          <tbody>
            {ratings.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No customer ratings submitted for this store yet.
                </td>
              </tr>
            ) : (
              ratings.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{r.user_email}</td>
                  <td>
                    <StarRating rating={r.rating} />
                  </td>
                  <td style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} />
                      {new Date(r.submitted_at).toLocaleDateString()} {new Date(r.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
