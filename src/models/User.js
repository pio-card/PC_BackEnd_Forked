//9.1 - create a new file - User.js
//import dependencie(s)
const mongoose = require("mongoose");

//create schema object/prototype
const Schema = mongoose.Schema;

// Create Schema: new object literal
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model("user", UserSchema);
