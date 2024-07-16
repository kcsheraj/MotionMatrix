const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  texts: [{ type: String }], // New field for storing text entries
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
