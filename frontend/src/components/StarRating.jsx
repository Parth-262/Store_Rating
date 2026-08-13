import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, interactive = false, onRatingSelect, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive ? (hoverRating || rating) : rating;

  return (
    <div className="interactive-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${isFilled ? 'active' : ''}`}
            disabled={!interactive}
            onClick={() => interactive && onRatingSelect && onRatingSelect(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            title={interactive ? `Rate ${star} out of 5 stars` : `${rating} stars`}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Star
              size={size}
              fill={isFilled ? 'var(--accent-amber)' : 'transparent'}
              color={isFilled ? 'var(--accent-amber)' : 'var(--text-subtle)'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {!interactive && rating > 0 && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: 4, color: 'var(--text-muted)' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
