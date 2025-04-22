const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/email");
const {
  createUserSQL,
  getUserByEmailSQL,
  updateUserSQL,
} = require("../sql/user");
const { User: MongoUser } = require("../nosql/user");

// Sign up (both SQL and NoSQL)
router.post("/signup", async (req, res) => {
  const { email, username, password, dbType = "sql" } = req.body;
  try {
    if (dbType === "sql") {
      const existing = await getUserByEmailSQL(email);
      if (existing)
        return res.status(400).json({ message: "User already exists (SQL)." });
      const hash = await bcrypt.hash(password, 10);
      await createUserSQL(email, username, hash, false);
    } else {
      const existing = await MongoUser.findOne({ email });
      if (existing)
        return res
          .status(400)
          .json({ message: "User already exists (NoSQL)." });
      const hash = await bcrypt.hash(password, 10);
      await MongoUser.create({
        email,
        username,
        password: hash,
        verified: false,
      });
    }
    await sendVerificationEmail(email, "signup");
    res.json({ message: "Verification email sent." });
  } catch (err) {
    res.status(500).json({ message: "Signup error." });
  }
});

// Confirm signup (from email link)
router.get("/confirm-signup", async (req, res) => {
  const { email } = req.query;
  try {
    // SQL
    let user = await getUserByEmailSQL(email);
    if (user) {
      await updateUserSQL(email, user.username, user.password, true);
      return res.send("Account verified (SQL). You can now log in.");
    }
    // NoSQL
    user = await MongoUser.findOne({ email });
    if (user) {
      user.verified = true;
      await user.save();
      return res.send("Account verified (NoSQL). You can now log in.");
    }
    res.status(404).send("User not found.");
  } catch (err) {
    res.status(500).send("Signup verification error.");
  }
});

// Login (both SQL and NoSQL)
router.post("/login", async (req, res) => {
  const { email, password, dbType = "sql" } = req.body;
  try {
    let user, valid;
    if (dbType === "sql") {
      user = await getUserByEmailSQL(email);
      if (!user)
        return res.status(400).json({ message: "User not found (SQL)." });
      if (!user.verified)
        return res
          .status(403)
          .json({ message: "Please verify your email before logging in." });
      valid = await bcrypt.compare(password, user.password);
    } else {
      user = await MongoUser.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "User not found (NoSQL)." });
      if (!user.verified)
        return res
          .status(403)
          .json({ message: "Please verify your email before logging in." });
      valid = await bcrypt.compare(password, user.password);
    }
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials." });
    const token = jwt.sign({ email, dbType }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error." });
  }
});

// Get user info
router.get("/userinfo", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, dbType } = decoded;
    let user;
    if (dbType === "sql") {
      user = await getUserByEmailSQL(email);
    } else {
      user = await MongoUser.findOne({ email });
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    // Never send hashed password to frontend
    return res.json({ username: user.username, password: "********" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
