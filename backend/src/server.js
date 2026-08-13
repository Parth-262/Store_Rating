import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import { getDb } from './db/db.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root route: Redirect to Frontend UI on port 5173
app.get('/', (req, res) => {
  res.redirect('http://localhost:5173');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api', userRoutes);


// Auto-initialize DB and seed if empty
async function startServer() {
  try {
    const db = await getDb();
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');

    if (userCount.count === 0) {
      console.log('Database empty. Auto-seeding default records...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Store Rating API Server running on port ${PORT}`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
