import express from 'express';
import { getDb } from '../db/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Middleware: Require Store Owner role
router.use(authenticateToken, authorizeRoles('STORE_OWNER'));

// Store Owner Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'user_name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['user_name', 'user_email', 'rating', 'created_at'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'user_name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const db = await getDb();

    // Fetch store owned by this owner
    const store = await db.get(
      `SELECT s.id, s.name, s.email, s.address,
              ROUND(AVG(r.rating), 1) as average_rating,
              COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [ownerId]
    );

    if (!store) {
      return res.json({
        hasStore: false,
        message: 'No store registered for your store owner account.',
        averageRating: 0,
        totalRatings: 0,
        ratings: []
      });
    }

    // Sort mappings for SQL query
    let sortColumn = 'u.name';
    if (field === 'user_email') sortColumn = 'u.email';
    if (field === 'rating') sortColumn = 'r.rating';
    if (field === 'created_at') sortColumn = 'r.updated_at';

    // Fetch users who submitted ratings for this store
    const ratingsQuery = `
      SELECT r.id, r.rating, r.updated_at as submitted_at,
             u.id as user_id, u.name as user_name, u.email as user_email, u.address as user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
      ORDER BY ${sortColumn} ${order}
    `;

    const ratingsList = await db.all(ratingsQuery, [store.id]);

    res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: store.average_rating || 0,
        totalRatings: store.total_ratings || 0
      },
      ratings: ratingsList
    });
  } catch (err) {
    console.error('Store owner dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch store owner dashboard details.' });
  }
});

export default router;
