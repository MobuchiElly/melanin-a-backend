const { BadRequestError, UnauthenticatedError, NotFoundError } = require("../errors");
const Users = require("../models/Users");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) {
    throw new BadRequestError("Name, Email and Password are required");
  }
  const user = await Users.create({ name, email, password });
  const token = await user.createJWT();
  return res.status(200).json({ user: { name: user.name, email:user.email, uid:user._id, status:user.role == 'admin' ? user.role : null }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide Email and Password");
  }
  const user = await Users.findOne({ email });
  if (!user) {
    throw new NotFoundError("User does not exist. Please enter correct login credentials");
  }
  const passwordVerified = await user.verifyPassword(password);
  if (!passwordVerified) {
    throw new BadRequestError("Incorrect password. Please enter correct credentials");
  }
  const token = await user.createJWT();
  const userRes = { 
    user: { 
      name: user.name, 
      email:user.email, 
      uid:user._id, 
      status:user.role == 'admin' ? user.role : null 
    }, token 
  };
  if (user.role == "admin") userRes.status = user.role;
  return res.status(200).json(userRes);
};

module.exports = { register, login };