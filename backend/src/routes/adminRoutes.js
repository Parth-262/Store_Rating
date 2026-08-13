import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { validateUserRegistration, validateEmail, validateAddress } from '../utils/validation.js';

const router = express.Router();

// Middleware: All routes in this router require System Administrator role
router.use(authenticateToken, authorizeRoles('ADMIN'));

// Admin Dashboard stats: Total users, total stores, total submitted ratings
router.get('/dashboard', async (req, res) => {
  try {
    const db = await getDb();

    const userCountResult = await db.get('SELECT COUNT(*) as count FROM users');
    const storeCountResult = await db.get('SELECT COUNT(*) as count FROM stores');
    const ratingCountResult = await db.get('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: userCountResult.count,
      totalStores: storeCountResult.count,
      totalRatings: ratingCountResult.count
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Error retrieving admin dashboard stats.' });
  }
});

// Add new user (Normal User, Admin User, or Store Owner)
router.post('/users', async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    const targetRole = role ? role.toUpperCase() : 'USER';

    if (!validRoles.includes(targetRole)) {
      return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}.` });
    }

    const validation = validateUserRegistration({ name, email, address, password });
    if (!validation.isValid) {
      return res.status(400).json({ message: 'Validation failed', errors: validation.errors });
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, address.trim(), targetRole]
    );

    const createdUser = await db.get('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'User added successfully', user: createdUser });
  } catch (err) {
    console.error('Admin add user error:', err);
    res.status(500).json({ message: 'Failed to add new user.' });
  }
});

// Add new store
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Store name is required.' });
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      return res.status(400).json({ message: emailErr });
    }

    const addrErr = validateAddress(address);
    if (addrErr) {
      return res.status(400).json({ message: addrErr });
    }

    const db = await getDb();
    const existingStore = await db.get('SELECT id FROM stores WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingStore) {
      return res.status(400).json({ message: 'A store with this email already exists.' });
    }

    let validOwnerId = null;
    if (owner_id) {
      const owner = await db.get('SELECT id, role FROM users WHERE id = ?', [owner_id]);
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Selected owner must be a user with STORE_OWNER role.' });
      }
      validOwnerId = owner.id;
    }

    const result = await db.run(
      `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), address.trim(), validOwnerId]
    );

    const createdStore = await db.get('SELECT * FROM stores WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Store added successfully', store: createdStore });
  } catch (err) {
    console.error('Admin add store error:', err);
    res.status(500).json({ message: 'Failed to add store.' });
  }
});

// List users with search filters and column sorting
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             s.name as store_name,
             ROUND(AVG(r.rating), 1) as store_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ` AND u.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      query += ` AND u.email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      query += ` AND u.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }
    if (role) {
      query += ` AND u.role = ?`;
      params.push(role.toUpperCase().trim());
    }

    query += ` GROUP BY u.id ORDER BY u.${field} ${order}`;

    const db = await getDb();
    const users = await db.all(query, params);

    res.json({ users });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ message: 'Failed to fetch users list.' });
  }
});

// List stores with search filters, sorting and overall rating
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'rating', 'created_at'];
    const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
             u.name as owner_name,
             ROUND(AVG(r.rating), 1) as rating,
             COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ` AND s.name LIKE ?`;
      params.push(`%${name.trim()}%`);
    }
    if (email) {
      query += ` AND s.email LIKE ?`;
      params.push(`%${email.trim()}%`);
    }
    if (address) {
      query += ` AND s.address LIKE ?`;
      params.push(`%${address.trim()}%`);
    }

    query += ` GROUP BY s.id`;

    if (field === 'rating') {
      query += ` ORDER BY rating ${order} NULLS LAST`;
    } else {
      query += ` ORDER BY s.${field} ${order}`;
    }

    const db = await getDb();
    const stores = await db.all(query, params);

    res.json({ stores });
  } catch (err) {
    console.error('Admin list stores error:', err);
    res.status(500).json({ message: 'Failed to fetch stores list.' });
  }
});

// View specific user details (including store rating if Store Owner)
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at
       FROM users u WHERE u.id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let storeDetails = null;
    if (user.role === 'STORE_OWNER') {
      storeDetails = await db.get(
        `SELECT s.id, s.name, s.email, s.address,
                ROUND(AVG(r.rating), 1) as rating,
                COUNT(r.id) as total_ratings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [user.id]
      );
    }

    res.json({
      user,
      store: storeDetails
    });
  } catch (err) {
    console.error('Admin view user detail error:', err);
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
});

export default router;
