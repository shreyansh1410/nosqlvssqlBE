const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/accountdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

module.exports = { User };
