# Store Rating Web Application

Full-stack web application built for the **FullStack Intern Coding Challenge**.

## 🛠️ Tech Stack
- **Backend**: Express.js (Node.js) with JWT Auth & bcrypt password hashing
- **Database**: PostgreSQL / MySQL / SQLite (Embedded relational SQL engine by default for zero-setup local runs; PostgreSQL schema & Docker configuration included)
- **Frontend**: React.js (Vite) + Lucide Icons + Responsive CSS Design System

---

## 👥 User Roles & Features

### 1. System Administrator (`ADMIN`)
- Real-time Metrics Dashboard (Total Users, Total Stores, Total Ratings).
- Add new users (Normal, Store Owner, Admin) with role assignment.
- Add new stores (Name, Email, Address, Assign Owner).
- View & filter sortable user and store listings.
- User detail profile modal (includes store rating if Store Owner).

### 2. Normal User (`USER`)
- Sign up page with live validation rules.
- Single login system.
- Browse stores & search by Name or Address.
- Submit or modify store ratings (1 to 5 stars).
- Sort store listings.
- Change password after logging in.

### 3. Store Owner (`STORE_OWNER`)
- Store dashboard showing overall average rating score.
- Table of customer rating submitters with timestamps and ratings.
- Table column sorting.
- Change password after logging in.

---

## 📋 Form Validation Rules Verified

- **Name**: 20 to 60 characters
- **Address**: Maximum 400 characters
- **Password**: 8–16 characters, 1 uppercase letter, 1 special character
- **Email**: Standard email format

---

## 🔑 Demo Credentials (Password: `Pass@123456`)

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Pass@123456` |
| **Store Owner 1** | `owner1@storerating.com` | `Pass@123456` |
| **Store Owner 2** | `owner2@storerating.com` | `Pass@123456` |
| **Normal User 1** | `john.user@storerating.com` | `Pass@123456` |
| **Normal User 2** | `jane.user@storerating.com` | `Pass@123456` |

---

## 🚀 How to Run Locally

### Option A: Zero-Config Run (Using built-in SQLite engine)

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run seed
   npm start
   ```
   *(Backend starts on `http://localhost:5000`)*

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Frontend app opens on `http://localhost:5173`)*

---

### Option B: Running with PostgreSQL

1. **Start PostgreSQL via Docker**:
   ```bash
   cd backend
   docker-compose up -d
   ```
2. **Execute PostgreSQL Schema**:
   Import `schema.sql` into your PostgreSQL database instance (`storerating_db`).
