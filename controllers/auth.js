require("dotenv").config();
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  Unauthorisederror,
} = require("../errors");
const Users = require("../models/Users");
const bcrypt = require("bcryptjs");
const tokenGenerator = require("../utils/generate_tokens");
const emailSender = require("../utils/emailSender");


const redirect_url = process.env.REDIRECT_URL_PROD;
const password_reset_url = process.env.PASSW_REDIRECT_URL_PROD;

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !password || !email) throw new BadRequestError("Name, Email and Password are required");

  const [ verificationToken, hashedVerificationToken, verificationTokenExpires ] = await tokenGenerator();
  const user = await Users.create({
    name,
    email,
    password,
    verificationToken:hashedVerificationToken,
    verificationTokenExpires
  });
  await emailSender(email, redirect_url, verificationToken);
  return res
    .status(201)
    .json({
      message:
        "Please check your email to verify your account. Verification link sent.",
    });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  
  if(!email || !verificationToken ) throw new BadRequestError("email and verificationToken are required");
  
  const user = await Users.findOne({ email });
  if (!user) throw new BadRequestError("No user with this email exists");
  if (user.isVerifiedUser) throw new BadRequestError("Email is already verified");
  if (!user.verificationToken) throw new BadRequestError("No verification token provided");
  if (user.verificationTokenExpires < new Date()) throw new Unauthorisederror("Verification token expired");
  
  const isValidVerificationToken = await bcrypt.compare(verificationToken, user.verificationToken);
  if(!isValidVerificationToken) throw new BadRequestError("Invalid Verification Token");

  user.isVerifiedUser = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const authToken = await user.createJWT();
  return res
    .status(200)
    .json({
      user: {
        name: user.name,
        email: user.email,
        uid: user._id,
        status: user.role == "admin" ? user.role : null,
      },
      token: authToken,
    });
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  
  if(!email) throw new BadRequestError("email is required");
  const user = await Users.findOne({email});
  if (!user) throw new BadRequestError("No existing user with provided email");
  if (user.isVerifiedUser) throw new BadRequestError("Email is already verified");

  const [ verificationToken, hashedVerificationToken, verificationTokenExpires ] = await tokenGenerator();

  user.verificationToken = hashedVerificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();
  
  await emailSender(email, redirect_url, verificationToken);

  return res.status(201).json("Verification email resent. Please check your inbox.");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide Email and Password");
  };
  const user = await Users.findOne({ email });
  if (!user) {
    throw new NotFoundError(
      "User does not exist. Please enter correct login credentials"
    );
  };

  if (!user.isVerifiedUser && user.email !== process.env.AUTHEMAIL) {
    const [ verificationToken, hashedVerificationToken, verificationTokenExpires ] = await tokenGenerator();
  
    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();  
    await emailSender(email, redirect_url, verificationToken);
  
    throw new BadRequestError("Your account is not verified. A verification link has been sent to your email.");
  }

  const passwordVerified = await user.verifyPassword(password);
  if (!passwordVerified) throw new BadRequestError( "Incorrect password. Please enter correct credentials");

  const token = await user.createJWT();
  const userRes = {
    user: {
      name: user.name,
      email: user.email,
      uid: user._id,
      status: user.role === "admin" ? user.role : null,
    },
    token,
  };
  // res.cookie("token", token, {
  //   secure: true,
  //   httpOnly: true,
  //   sameSite: "Strict",
  //   expires: new Date(Date.now() + 3600000)
  // });
  return res.status(200).json(userRes);
};

const forgotPassword = async (req, res) => {
  const {email} = req.body;
  if(!email) throw new BadRequestError("email is required");
  
  const user = await Users.findOne({email});
  if(!user) throw new BadRequestError("No user with this email exists");
  
  const [ verificationToken, hashedVerificationToken, verificationTokenExpires ] = await tokenGenerator();
  
  await emailSender(email, password_reset_url, verificationToken);

  user.passwordResetToken = hashedVerificationToken;
  user.passwordResetTokenExpires = verificationTokenExpires;
  await user.save();
  return res.status(201).json("Success Message. Verification Email has been sent to your email");
};

const verifyPasswordResetToken = async (req, res) => {
  const { email, pvt:passwordResetToken } = req.body;

  if (!email || !passwordResetToken) throw new BadRequestError("Missing email or token");

  const user = await Users.findOne({ email });
  if (!user) throw new BadRequestError("Invalid email");
  if(!user.passwordResetToken || !user.passwordResetTokenExpires) throw new BadRequestError("Invalid verification token. Request to reset password and check your email thereafter");

  const isValid = await bcrypt.compare(passwordResetToken, user.passwordResetToken);
  if (!isValid) throw new BadRequestError("Invalid or expired token");
  if (user.passwordResetTokenExpires < new Date()) {
    throw new Unauthorisederror("Token expired");
  }

  return res.status(201).json({ success: true, message: "Token verified" });
};


const passwordReset = async (req, res) => {
  const { email, password, pvt:passwordResetToken } = req.body;
  if(!email) throw new BadRequestError("email is required");
  if(!passwordResetToken) throw new BadRequestError("invalid password reset link. No reset token provided");
  if (!password) throw new BadRequestError("No password provided. Provide new password");

  const user = await Users.findOne({email});
  if(!user) throw new BadRequestError("no user with the provided email exists");
  if(!user.passwordResetToken || !user.passwordResetTokenExpires) throw new BadRequestError("Invalid verification token. Request to reset password and check your email thereafter");

  const isValid = await bcrypt.compare(passwordResetToken, user.passwordResetToken);
  if (!isValid) throw new BadRequestError("invalid reset token");
  if (user.passwordResetTokenExpires < new Date()) throw new Unauthorisederror("Verification Token has expired");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  return res.status(201).json("Success message. Password reset successful"); 
};

module.exports = { register, login, verifyEmail, resendVerification, forgotPassword, verifyPasswordResetToken, passwordReset };