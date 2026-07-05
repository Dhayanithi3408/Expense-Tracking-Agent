# Expense Tracking Agent — ExpenseAI

A full-stack Indian expense tracking dashboard built with **React + Tailwind CSS + Node.js + MongoDB**.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs

## Features
- User registration & login (email or mobile)
- Bank account management (add, remove, view)
- Online transaction tracking (CRUD, flag, filter)
- Dashboard with charts & stats
- Multi-language support (EN, Hindi, Tamil, Telugu, Marathi, Bengali)
- Currency switcher (INR default + 9 others)
- Full settings (profile, preferences, notifications, security, budget limits)

## Run Locally

### 1. Start Backend
```bash
cd server
npm install
# Edit .env: set MONGO_URI to your MongoDB Atlas URI
npm run dev
```

### 2. Start Frontend
```bash
cd client
npm install
npm run dev
```

Open: http://localhost:5173

**Demo credentials:** `demo@expenseai.in` / `Demo@1234`

## Project Structure
```
├── client/          # React + Tailwind frontend
│   └── src/
│       ├── pages/   # Overview, Accounts, Transactions, Settings, Chat, Insights, Sources
│       ├── components/Layout.jsx
│       └── context/AuthContext.jsx
├── server/          # Express + MongoDB backend
│   ├── models/      # User, Account, Transaction
│   ├── routes/      # auth, accounts, transactions
│   └── middleware/  # JWT auth
└── README.md
```
