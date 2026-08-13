import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  Star,
  UserPlus,
  Store as StoreIcon,
  Search,
  ArrowUpDown,
  Eye,
  X,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function AdminDashboardPage() {
  const { token, API_BASE, showToast } = useAuth();

  // Dashboard Stats
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });

  // Tab Selection ('USERS' or 'STORES')
  const [activeTab, setActiveTab] = useState('USERS');

  // Users List & Filters
  const [users, setUsers] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [userSort, setUserSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

  // Stores List & Filters
  const [stores, setStores] = useState([]);
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Form states for Add User
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [userFormErrors, setUserFormErrors] = useState({});

  // Form states for Add Store
  const [storeFormData, setStoreFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });
  const [storeFormError, setStoreFormError] = useState('');

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...userFilters,
        sortBy: userSort.sortBy,
        sortOrder: userSort.sortOrder
      });
      const res = await fetch(`${API_BASE}/admin/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  // Fetch Stores
  const fetchStores = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...storeFilters,
        sortBy: storeSort.sortBy,
        sortOrder: storeSort.sortOrder
      });
      const res = await fetch(`${API_BASE}/admin/stores?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'USERS') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, userFilters, userSort, storeFilters, storeSort]);

  // Handle Sort Click
  const handleUserSort = (field) => {
    setUserSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleStoreSort = (field) => {
    setStoreSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Submit Add User
  const handleAddUser = async (e) => {
    e.preventDefault();
    setUserFormErrors({});

    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(userFormData)
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setUserFormErrors(data.errors);
        else showToast(data.message || 'Failed to create user', 'error');
        return;
      }

      showToast(`User ${data.user.name} created successfully!`);
      setIsAddUserOpen(false);
      setUserFormData({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchStats();
      fetchUsers();
    } catch (err) {
      showToast('Error creating user', 'error');
    }
  };

  // Submit Add Store
  const handleAddStore = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    try {
      const payload = { ...storeFormData };
      if (!payload.owner_id) delete payload.owner_id;

      const res = await fetch(`${API_BASE}/admin/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setStoreFormError(data.message || 'Failed to create store');
        return;
      }

      showToast(`Store ${data.store.name} created successfully!`);
      setIsAddStoreOpen(false);
      setStoreFormData({ name: '', email: '', address: '', owner_id: '' });
      fetchStats();
      fetchStores();
    } catch (err) {
      setStoreFormError('Error creating store');
    }
  };

  // View User Details
  const handleViewUserDetail = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUserDetail(data);
      }
    } catch (err) {
      showToast('Failed to fetch user details', 'error');
    }
  };

  // Store Owners dropdown options for Add Store modal
  const storeOwners = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>System Administrator Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage platform users, stores, system metrics, and permissions
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
            <UserPlus size={18} /> Add New User
          </button>
          <button className="btn btn-secondary" onClick={() => setIsAddStoreOpen(true)}>
            <StoreIcon size={18} color="var(--accent-sky)" /> Add New Store
          </button>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--accent-sky)' }}>
            <Store size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalStores}</div>
            <div className="stat-label">Total Stores</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Star size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalRatings}</div>
            <div className="stat-label">Submitted Ratings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('USERS')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'USERS' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'USERS' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Users size={18} /> User Management Listing
        </button>

        <button
          onClick={() => setActiveTab('STORES')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'STORES' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'STORES' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Store size={18} /> Store Management Listing
        </button>
      </div>

      {/* USERS TAB CONTENT */}
      {activeTab === 'USERS' && (
        <div>
          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter by Name..."
                value={userFilters.name}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter by Email..."
                value={userFilters.email}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter by Address..."
                value={userFilters.address}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="filter-input">
              <select
                className="form-control"
                value={userFilters.role}
                onChange={(e) => setUserFilters((prev) => ({ ...prev, role: e.target.value }))}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>


            {(userFilters.name || userFilters.email || userFilters.address || userFilters.role) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setUserFilters({ name: '', email: '', address: '', role: '' })}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleUserSort('name')}>
                    Name <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('email')}>
                    Email <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('address')}>
                    Address <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleUserSort('role')}>
                    Role <ArrowUpDown size={14} />
                  </th>
                  <th style={{ width: 100, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No users match the search filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.address}
                      </td>
                      <td>
                        <span className={`role-pill ${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewUserDetail(u.id)}
                          title="View user details"
                        >
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STORES TAB CONTENT */}
      {activeTab === 'STORES' && (
        <div>
          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter Store Name..."
                value={storeFilters.name}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter Store Email..."
                value={storeFilters.email}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="filter-input" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-subtle)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Filter Address..."
                value={storeFilters.address}
                onChange={(e) => setStoreFilters((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>


            {(storeFilters.name || storeFilters.email || storeFilters.address) && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setStoreFilters({ name: '', email: '', address: '' })}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Stores Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleStoreSort('name')}>
                    Store Name <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('email')}>
                    Store Email <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('address')}>
                    Address <ArrowUpDown size={14} />
                  </th>
                  <th className="sortable" onClick={() => handleStoreSort('rating')}>
                    Overall Rating <ArrowUpDown size={14} />
                  </th>
                  <th>Assigned Owner</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No stores found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.address}
                      </td>
                      <td>
                        {s.rating ? (
                          <StarRating rating={s.rating} />
                        ) : (
                          <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>No Ratings</span>
                        )}
                      </td>
                      <td>
                        {s.owner_name ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--accent-sky)' }}>
                            {s.owner_name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserOpen && (
        <div className="modal-overlay" onClick={() => setIsAddUserOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={20} color="var(--primary)" /> Add New System User
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddUserOpen(false)}
                style={{ padding: 4, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">
                  <span>Name (Min 20 - Max 60 chars)</span>
                  <span style={{ fontSize: '0.78rem', color: userFormData.name.length >= 20 && userFormData.name.length <= 60 ? 'var(--accent-emerald)' : 'var(--text-subtle)' }}>
                    {userFormData.name.length}/60
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Administrator Johnathan Doe"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                {userFormErrors.name && <div className="form-error"><AlertCircle size={14} />{userFormErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="user@storerating.com"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                {userFormErrors.email && <div className="form-error"><AlertCircle size={14} />{userFormErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password (8-16 chars, 1 uppercase, 1 special)</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Pass@123456"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                {userFormErrors.password && <div className="form-error"><AlertCircle size={14} />{userFormErrors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Address (Max 400 chars)</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: 70 }}
                  placeholder="Physical street address"
                  value={userFormData.address}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, address: e.target.value }))}
                  maxLength={400}
                  required
                />
                {userFormErrors.address && <div className="form-error"><AlertCircle size={14} />{userFormErrors.address}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">User Role</label>
                <select
                  className="form-control"
                  value={userFormData.role}
                  onChange={(e) => setUserFormData((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW STORE */}
      {isAddStoreOpen && (
        <div className="modal-overlay" onClick={() => setIsAddStoreOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StoreIcon size={20} color="var(--accent-sky)" /> Add New Store
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddStoreOpen(false)}
                style={{ padding: 4, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {storeFormError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: 'var(--accent-rose)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                {storeFormError}
              </div>
            )}

            <form onSubmit={handleAddStore}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Apex Electronics Store"
                  value={storeFormData.name}
                  onChange={(e) => setStoreFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="store@example.com"
                  value={storeFormData.email}
                  onChange={(e) => setStoreFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address (Max 400 chars)</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: 70 }}
                  placeholder="Store location address"
                  value={storeFormData.address}
                  onChange={(e) => setStoreFormData((prev) => ({ ...prev, address: e.target.value }))}
                  maxLength={400}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Store Owner (Optional)</label>
                <select
                  className="form-control"
                  value={storeFormData.owner_id}
                  onChange={(e) => setStoreFormData((prev) => ({ ...prev, owner_id: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {storeOwners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW USER DETAILS */}
      {selectedUserDetail && (
        <div className="modal-overlay" onClick={() => setSelectedUserDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Detail Profile</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUserDetail(null)}
                style={{ padding: 4, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block' }}>Name</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedUserDetail.user.name}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block' }}>Email</span>
                <span style={{ color: 'var(--text-main)' }}>{selectedUserDetail.user.email}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block' }}>Address</span>
                <span style={{ color: 'var(--text-muted)' }}>{selectedUserDetail.user.address}</span>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'block' }}>System Role</span>
                <span className={`role-pill ${selectedUserDetail.user.role}`} style={{ marginTop: 4 }}>
                  {selectedUserDetail.user.role}
                </span>
              </div>

              {/* STORE OWNER SPECIFIC DETAILS */}
              {selectedUserDetail.user.role === 'STORE_OWNER' && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    border: '1px solid rgba(14, 165, 233, 0.25)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <h4 style={{ color: 'var(--accent-sky)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Store Owner Rating Information
                  </h4>
                  {selectedUserDetail.store ? (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{selectedUserDetail.store.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Overall Store Rating:</span>
                        {selectedUserDetail.store.rating ? (
                          <StarRating rating={selectedUserDetail.store.rating} />
                        ) : (
                          <span style={{ color: 'var(--text-subtle)' }}>No Ratings Yet</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Total No. Of Ratings Received: {selectedUserDetail.store.total_ratings}
                      </div>

                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                      No store currently assigned to this owner.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedUserDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
