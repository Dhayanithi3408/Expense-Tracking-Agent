# Expense Tracking Agent - ExpenseAI

Full-stack Indian expense tracker: **React + Tailwind CSS + Node.js + MongoDB Atlas**

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (free cloud - no local install needed)
- **Auth**: JWT + bcryptjs

## Features
- Register / Login with email or mobile number
- Bank account management (Add, View, Remove)
- Online transactions (Add, Flag, Filter, Delete)
- Dashboard with charts and stats
- Multi-language: English, Hindi, Tamil, Telugu, Marathi, Bengali
- Currency switcher (INR default + 9 currencies)
- Settings: Profile, Preferences, Notifications, Security, Budget Limits

---

## Quick Setup

### Step 1 - Get MongoDB Atlas URI (FREE)
1. Go to https://cloud.mongodb.com and sign up free
2. Create a free M0 cluster
3. Click Connect, then Drivers, copy the connection string
4. Looks like: `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/expenseai`

### Step 2 - Configure Backend
```
cd server
copy .env.example .env
```
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxx.mongodb.net/expenseai?retryWrites=true
JWT_SECRET=any_random_secret
NODE_ENV=development
```

### Step 3 - Install and Run

Terminal 1 (Backend):
```
cd server
npm install
npm run dev
```
Should print: MongoDB connected + API running on https://preview-chat-0832a396-0b13-40e1-89b3-139576c6f56f.space-z.ai/

Terminal 2 (Frontend):
```
cd client
npm install
npm run dev
```
Open: https://preview-chat-0832a396-0b13-40e1-89b3-139576c6f56f.space-z.ai/

---

## Demo
- Email: demo@expenseai.in
- Password: Demo@1234

## API Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/profile
PATCH  /api/auth/password
GET    /api/accounts
POST   /api/accounts
DELETE /api/accounts/:id
GET    /api/transactions
POST   /api/transactions
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/stats
GET    /api/currencies
```
