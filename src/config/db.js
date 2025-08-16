const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
require("dotenv").config();


const dbConnect = async () => {
  try {
    // if (process.env.NODE_ENV === "test"){
    //   const mongoServer = await MongoMemoryServer.create();
    //   const uri = mongoServer.getUri();
    //   await mongoose.connect(uri);
    //   console.log("Connected to Test Database");
    //   return;
    // }
    const uri = process.env.NODE_ENV === "production" ? process.env.MONGO_URI : process.env.LOCAL_MONGO_URI;
    await mongoose.connect(uri);
    console.log("Connected to Database");
  } catch (err) {
    console.log(err);
  }
};

module.exports = dbConnect;