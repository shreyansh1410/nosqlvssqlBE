require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const accountRoutes = require("./routes/account");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nosqlvssql-fe.vercel.app/"],
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
