require("dotenv").config();
const connectDb = require("../db/connection");
require("express-async-errors");
const express = require("express");
const blogRouter = require("../routes/blogs");
const authRouter = require("../routes/auth");
const commentRouter = require("../routes/comments");
const mailRouter = require("../routes/mail");
const authmiddleware = require("../middleware/authmiddleware");
const cors = require("cors");
const NotFound = require("../middleware/Not-found");
const errorHandlerMiddleware = require("../middleware/errorhandlermiddleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/blog", blogRouter);
app.use("/api/v2/comments", authmiddleware, commentRouter);
app.use("/api/v2/mail", mailRouter);

// Error Handling Middleware
app.use(errorHandlerMiddleware);
app.use(NotFound);


// Start server only if NOT in test mode
const PORT = process.env.PORT || 5000;
const startup = async () => {
  try {
    await connectDb().then(console.log("Connected to DB"));
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

startup();

// Export app for testing (Mocha will use this)
module.exports = app;
