const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendVerificationEmail } = require("../utils/email");
const {
  updateUserSQL,
  deleteUserSQL,
  getUserByEmailSQL,
} = require("../sql/user");
const { User: MongoUser } = require("../nosql/user");

// Request update (send verification email)
router.post("/request-update", async (req, res) => {
  const { username, password, token } = req.body;
  try {
    const { email, dbType } = jwt.verify(token, process.env.JWT_SECRET);
    await sendVerificationEmail(email, "update", {
      username,
      password,
      dbType,
    });
    res.json({ message: "Verification email sent for update." });
  } catch (err) {
    res.status(500).json({ message: "Update request error." });
  }
});

// Request delete (send verification email)
router.post("/request-delete", async (req, res) => {
  const { email, token } = req.body;
  try {
    const { dbType } = jwt.verify(token, process.env.JWT_SECRET);
    await sendVerificationEmail(email, "delete", { dbType });
    res.json({ message: "Verification email sent for deletion." });
  } catch (err) {
    res.status(500).json({ message: "Delete request error." });
  }
});

// Confirm update (from email link)
router.get("/confirm-update", async (req, res) => {
  const { email, username, password, dbType } = req.query;
  try {
    if (dbType === "sql") {
      // Fetch current user to preserve fields
      const user = await getUserByEmailSQL(email);
      if (!user) return res.status(404).send("User not found");
      const newUsername = username || user.username;
      let newPassword = user.password;
      if (password) {
        // Hash the new password before saving
        newPassword = await bcrypt.hash(password, 10);
      }
      const verified = user.verified; // preserve verified status
      await updateUserSQL(email, newUsername, newPassword, verified);
    } else {
      const user = await MongoUser.findOne({ email });
      if (!user) return res.status(404).send("User not found");
      if (username) user.username = username;
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      // preserve verified
      await user.save();
    }
    res.send("Account updated successfully.");
  } catch (err) {
    res.status(500).send("Update confirmation error.");
  }
});

// Confirm signup (verification link)
router.get("/confirm-signup", async (req, res) => {
  const { email, dbType } = req.query;
  try {
    if (dbType === "sql") {
      const user = await getUserByEmailSQL(email);
      if (!user) return res.status(404).send("User not found");
      await updateUserSQL(email, user.username, user.password, 1);
      return res.send("Account verified (SQL). You can now log in.");
    } else {
      const user = await MongoUser.findOne({ email });
      if (!user) return res.status(404).send("User not found");
      user.verified = true;
      await user.save();
      return res.send("Account verified (NoSQL). You can now log in.");
    }
  } catch (err) {
    res.status(500).send("Signup verification error.");
  }
});

// Confirm delete (from email link)
router.get("/confirm-delete", async (req, res) => {
  const { email, dbType } = req.query;
  try {
    if (dbType === "sql") {
      await deleteUserSQL(email);
    } else {
      await MongoUser.deleteOne({ email });
    }
    res.send("Account deleted successfully.");
  } catch (err) {
    res.status(500).send("Delete confirmation error.");
  }
});

module.exports = router;
