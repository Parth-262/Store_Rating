import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

export async function seedDatabase() {
  const db = await getDb();
  console.log('Seeding database with initial data...');

  // Password for seeded users: "Pass@123456" (Complies with 8-16 chars, 1 uppercase, 1 special char)
  const defaultPassword = await bcrypt.hash('Pass@123456', 10);

  // Clear existing data for clean seed
  await db.exec('DELETE FROM ratings;');
  await db.exec('DELETE FROM stores;');
  await db.exec('DELETE FROM users;');
  await db.exec('DELETE FROM sqlite_sequence;');

  // Insert Users
  const adminResult = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'System Administrator Account',
      'admin@storerating.com',
      defaultPassword,
      '100 Tech Park Way, Suite 500, San Francisco, CA 94107',
      'ADMIN'
    ]
  );

  const parthResult = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Parthjigarkumarjoshi182621',
      'parth@gmail.com',
      defaultPassword,
      'Navsari, Gujarat, India',
      'USER'
    ]
  );

  // Insert Stores
  const store1Result = await db.run(
    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
    [
      'Tech Gadgets Superstore',
      'contact@techgadgets.com',
      '456 Retail Boulevard, Suite A, New York, NY 10001',
      null
    ]
  );

  const store2Result = await db.run(
    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
    [
      'Green Grocery Organic Mart',
      'info@greengrocery.com',
      '789 Commercial Avenue, Austin, TX 78701',
      null
    ]
  );

  const store3Result = await db.run(
    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
    [
      'Urban Books & Café Corner',
      'hello@urbanbooks.com',
      '321 Broadway Street, Seattle, WA 98102',
      null
    ]
  );

  // Insert Ratings for Parth
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [parthResult.lastID, store1Result.lastID, 5]
  );
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [parthResult.lastID, store2Result.lastID, 4]
  );

  console.log('Database seeded successfully!');
  console.log('Credentials (Password for all: Pass@123456):');
  console.log('- Admin: admin@storerating.com');
  console.log('- Parth: parth@gmail.com');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
