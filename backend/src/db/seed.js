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

  // Insert Users (All names are between 20 and 60 characters)
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

  const owner1Result = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Owner One Store Manager',
      'owner1@storerating.com',
      defaultPassword,
      '456 Retail Boulevard, New York, NY 10001',
      'STORE_OWNER'
    ]
  );

  const owner2Result = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Owner Two Retail Partner',
      'owner2@storerating.com',
      defaultPassword,
      '789 Commercial Avenue, Austin, TX 78701',
      'STORE_OWNER'
    ]
  );

  const user1Result = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Johnathan Dough User Account',
      'john.user@storerating.com',
      defaultPassword,
      '123 Maple Street, Apartment 4B, Chicago, IL 60601',
      'USER'
    ]
  );

  const user2Result = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Jane Smith Registered User',
      'jane.user@storerating.com',
      defaultPassword,
      '555 Pine Lane, Seattle, WA 98101',
      'USER'
    ]
  );

  const user3Result = await db.run(
    `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
    [
      'Alex Turner Customer Account',
      'alex.user@storerating.com',
      defaultPassword,
      '888 Oak Avenue, Denver, CO 80202',
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
      owner1Result.lastID
    ]
  );

  const store2Result = await db.run(
    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
    [
      'Green Grocery Organic Mart',
      'info@greengrocery.com',
      '789 Commercial Avenue, Austin, TX 78701',
      owner2Result.lastID
    ]
  );

  const store3Result = await db.run(
    `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)`,
    [
      'Urban Books & Café Corner',
      'hello@urbanbooks.com',
      '321 Broadway Street, Seattle, WA 98102',
      null // Unassigned owner for testing admin store management
    ]
  );

  // Insert Ratings
  // Store 1 Ratings
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user1Result.lastID, store1Result.lastID, 5]
  );
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user2Result.lastID, store1Result.lastID, 4]
  );
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user3Result.lastID, store1Result.lastID, 4]
  );

  // Store 2 Ratings
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user1Result.lastID, store2Result.lastID, 3]
  );
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user2Result.lastID, store2Result.lastID, 5]
  );

  // Store 3 Ratings
  await db.run(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)`,
    [user3Result.lastID, store3Result.lastID, 2]
  );

  console.log('Database seeded successfully!');
  console.log('Demo Credentials (Password for all: Pass@123456):');
  console.log('- Admin: admin@storerating.com');
  console.log('- Store Owner 1: owner1@storerating.com');
  console.log('- Store Owner 2: owner2@storerating.com');
  console.log('- Normal User 1: john.user@storerating.com');
  console.log('- Normal User 2: jane.user@storerating.com');
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
