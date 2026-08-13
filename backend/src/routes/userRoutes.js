import express from 'express';
import { getDb } from '../db/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Require Normal User or Admin role (Admins can also view user stores if desired, but primarily USER)
router.use(authenticateToken);

// Get list of all registered stores with search (Name, Address), sorting, overall rating, and current user's submitted rating
router.get('/stores', async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ['name', 'address', 'overall_rating', 'user_rating'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.address, s.email,
             ROUND(AVG(r.rating), 1) as overall_rating,
             COUNT(r.id) as rating_count,
             ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    query += ` GROUP BY s.id`;

    if (field === 'overall_rating') {
      query += ` ORDER BY overall_rating ${order} NULLS LAST`;
    } else if (field === 'user_rating') {
      query += ` ORDER BY user_rating ${order} NULLS LAST`;
    } else {
      query += ` ORDER BY s.${field} ${order}`;
    }

    const db = await getDb();
    const stores = await db.all(query, params);

    res.json({ stores });
  } catch (err) {
    console.error('User fetch stores error:', err);
    res.status(500).json({ message: 'Failed to fetch store listings.' });
  }
});

// Submit rating or modify existing rating (1 to 5) for a store
router.post('/stores/:id/rating', authorizeRoles('USER'), async (req, res) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const { rating } = req.body;

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const db = await getDb();
    const store = await db.get('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Insert or update rating (UPSERT using SQLite ON CONFLICT)
    await db.run(
      `INSERT INTO ratings (user_id, store_id, rating, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, store_id)
       DO UPDATE SET rating = excluded.rating, updated_at = CURRENT_TIMESTAMP`,
      [userId, storeId, numRating]
    );

    // Fetch updated average rating for the store
    const updatedStoreStats = await db.get(
      `SELECT ROUND(AVG(rating), 1) as overall_rating, COUNT(id) as rating_count
       FROM ratings WHERE store_id = ?`,
      [storeId]
    );

    res.json({
      message: 'Rating submitted successfully!',
      userRating: numRating,
      overallRating: updatedStoreStats.overall_rating,
      ratingCount: updatedStoreStats.rating_count
    });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ message: 'Failed to submit rating.' });
  }
});

export default router;
