require("dotenv").config();
const connectDb = require("./config/db");
require("express-async-errors");
const express = require("express");
const blogRouter = require("./routes/blogs");
const authRouter = require("./routes/auth");
const commentRouter = require("./routes/comments");
const mailRouter = require("./routes/mail");
const authmiddleware = require("./middleware/authmiddleware");
const cors = require("cors");
const NotFound = require("./middleware/Not-found");
const errorHandlerMiddleware = require("./middleware/errorhandlermiddleware");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static("./public"));
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/blog", blogRouter);
app.use("/api/v2/comments", authmiddleware, commentRouter);
app.use("/api/v2", mailRouter);

app.use(NotFound);
app.use(errorHandlerMiddleware);


const PORT = process.env.PORT || 5000;
const startup = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    // if (process.env.NODE_ENV !== "test") {
    //   app.listen(PORT, () => {
    //     console.log(`Server running on port ${PORT}`);
    //   });
    // }
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

startup();

module.exports = app;