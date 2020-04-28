//7.3 create a new file - db.js - db connection
const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

//create a function
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MongoDB connected...");
  } catch (err) {
    console.error(err.message);
    //exit process with failure
    process.exit(1);
  }
};

//export function
module.exports = connectDB(); //make sure code exactly as it is
