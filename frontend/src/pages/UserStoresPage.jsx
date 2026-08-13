import React, { useState, useEffect } from 'react';
import { Store, Search, ArrowUpDown, Star, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function UserStoresPage() {
  const { token, API_BASE, showToast } = useAuth();
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'ASC' });
  const [loading, setLoading] = useState(true);

  // Store ID being rated / modified in modal
  const [ratingTargetStore, setRatingTargetStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder
      });
      const res = await fetch(`${API_BASE}/stores?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters, sort]);

  const handleSort = (field) => {
    setSort((prev) => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const handleOpenRatingModal = (store) => {
    setRatingTargetStore(store);
    setSelectedRating(store.user_rating || 5);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingTargetStore) return;

    try {
      setSubmittingRating(true);
      const res = await fetch(`${API_BASE}/stores/${ratingTargetStore.id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: selectedRating })
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || 'Failed to submit rating', 'error');
        return;
      }

      showToast(data.message || 'Rating saved successfully!');
      setRatingTargetStore(null);
      fetchStores();
    } catch (err) {
      showToast('Error submitting rating', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="main-content">
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Explore & Rate Stores</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Browse registered stores, search by name or location, and share your ratings
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-input" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36, height: 40, fontSize: '0.9rem' }}
            placeholder="Search stores by Name..."
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="filter-input" style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-subtle)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36, height: 40, fontSize: '0.9rem' }}
            placeholder="Search by Address or City..."
            value={filters.address}
            onChange={(e) => setFilters((prev) => ({ ...prev, address: e.target.value }))}
          />
        </div>

        {(filters.name || filters.address) && (
          <button className="btn btn-secondary" onClick={() => setFilters({ name: '', address: '' })}>
            Reset Search
          </button>
        )}
      </div>

      {/* Stores Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('name')}>
                Store Name <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('address')}>
                Address <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('overall_rating')}>
                Overall Average Rating <ArrowUpDown size={14} />
              </th>
              <th className="sortable" onClick={() => handleSort('user_rating')}>
                My Submitted Rating <ArrowUpDown size={14} />
              </th>
              <th style={{ width: 160, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  Loading stores...
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No stores found matching your search.
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id}>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Store size={18} color="var(--primary)" />
                      {store.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{store.address}</td>
                  <td>
                    {store.overall_rating ? (
                      <div>
                        <StarRating rating={store.overall_rating} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: 4 }}>
                          ({store.rating_count} reviews)
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>No Ratings Yet</span>
                    )}
                  </td>
                  <td>
                    {store.user_rating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StarRating rating={store.user_rating} />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--accent-emerald)',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700
                          }}
                        >
                          Rated
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Not rated</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className={`btn ${store.user_rating ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      onClick={() => handleOpenRatingModal(store)}
                    >
                      {store.user_rating ? (
                        <>
                          <Edit3 size={14} /> Modify Rating
                        </>
                      ) : (
                        <>
                          <Star size={14} /> Submit Rating
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* RATING SUBMISSION MODAL */}
      {ratingTargetStore && (
        <div className="modal-overlay" onClick={() => setRatingTargetStore(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>{ratingTargetStore.user_rating ? 'Modify Store Rating' : 'Submit Rating'}</h3>
            </div>

            <div style={{ textAlign: 'center', margin: '1rem 0 1.5rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                {ratingTargetStore.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ratingTargetStore.address}</div>

              <div style={{ margin: '1.5rem 0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
                  Click to select your rating (1 to 5 Stars):
                </div>
                <StarRating
                  rating={selectedRating}
                  interactive={true}
                  onRatingSelect={(r) => setSelectedRating(r)}
                  size={32}
                />
                <div style={{ marginTop: '0.5rem', fontWeight: 700, color: 'var(--accent-amber)', fontSize: '1.1rem' }}>
                  {selectedRating} / 5 Stars
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setRatingTargetStore(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitRating} disabled={submittingRating}>
                {submittingRating ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
