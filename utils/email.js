const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, type, extra = {}) {
  let subject = "",
    html = "";
  let baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:5000";
  if (type === "signup") {
    subject = "Verify your account";
    html = `<p>Click <a href="${baseUrl}/api/auth/confirm-signup?email=${encodeURIComponent(
      email
    )}">here</a> to verify your account.</p>`;
  } else if (type === "update") {
    const { username, password, dbType } = extra;
    html = `<p>Click <a href="${baseUrl}/api/account/confirm-update?email=${encodeURIComponent(
      email
    )}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(
      password
    )}&dbType=${encodeURIComponent(
      dbType
    )}">here</a> to confirm account update.</p>`;
    subject = "Confirm Account Update";
  } else if (type === "delete") {
    const { dbType } = extra;
    html = `<p>Click <a href="${baseUrl}/api/account/confirm-delete?email=${encodeURIComponent(
      email
    )}&dbType=${encodeURIComponent(
      dbType
    )}">here</a> to confirm account deletion.</p>`;
    subject = "Confirm Account Deletion";
  }
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html,
  });
}

module.exports = { sendVerificationEmail };
