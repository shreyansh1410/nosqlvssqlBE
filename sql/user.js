const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(process.env.SQLITE_DB || "./account.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    username TEXT,
    password TEXT,
    verified INTEGER
  )`);
});

function createUserSQL(email, username, password, verified) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (email, username, password, verified) VALUES (?, ?, ?, ?)",
      [email, username, password, verified ? 1 : 0],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getUserByEmailSQL(email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function updateUserSQL(email, username, password, verified) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE users SET username = ?, password = ?, verified = ? WHERE email = ?",
      [username, password, verified ? 1 : 0, email],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function deleteUserSQL(email) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM users WHERE email = ?", [email], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  createUserSQL,
  getUserByEmailSQL,
  updateUserSQL,
  deleteUserSQL,
};
