const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config();


const dbConnect = async () => {
  try {
    if (process.env.NODE_ENV === "test"){
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri).then(() => console.log("Connected to Test Db"));
    } else {
      const uri = process.env.MONGO_URI;
      await mongoose.connect(uri).then(() => {console.log("Connected to DB")});
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConnect;