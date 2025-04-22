# Backend Setup (Express + SQLite + MongoDB)

## 1. Install dependencies
```
npm install
```

## 2. Configure environment variables
- Copy `.env.example` to `.env` and fill in your credentials:
```
cp .env.example .env
```
- Set up your MongoDB URI, SQLite DB path, JWT secret, and email credentials.

## 3. Start the backend server
```
npm start
```

The backend will run at [http://localhost:5000](http://localhost:5000).

---

# Project Structure
- `routes/auth.js`: Signup/Login routes (SQL & NoSQL)
- `routes/account.js`: Update/Delete routes (with email verification)
- `sql/user.js`: SQLite user helpers
- `nosql/user.js`: MongoDB user schema
- `utils/email.js`: Nodemailer email utilities

---

# Notes
- Both SQL (SQLite) and NoSQL (MongoDB) are supported. Use the `dbType` parameter in API calls to select.
- Email verification is required for all sensitive actions.
