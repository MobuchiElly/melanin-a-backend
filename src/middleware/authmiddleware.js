require("dotenv").config();
const { UnauthenticatedError, BadRequestError } = require("../errors");
const jwt = require("jsonwebtoken");

const authmiddleware = async (req, res, next) => {
  if(!req.headers || !req.headers.authorization){
    throw new BadRequestError("No authentication token provided")
  };
  if(!req.headers.authorization.startsWith("Bearer")) throw new BadRequestError("Invalid authentication");
  const token = req.headers.authorization.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      name: payload.name,
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch (err) {
    throw new UnauthenticatedError("Invalid authentication");
  }
  next();
};

module.exports = authmiddleware;
