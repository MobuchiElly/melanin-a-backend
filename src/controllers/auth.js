require("dotenv").config();
const {
  loginService, 
  registerService, 
  verifyEmailService,
  resendVerificationService,
  forgotPasswordService,
  verifyPasswordResetTokenService,
  passwordResetService
} = require("../services/auth-service");
const setAuthCookie = require("../utils/setAuthCookie");


const register = async (req, res) => {
  const { name, email, password } = req.body;

  const data = await registerService({name, email, password});
  
  return res.status(201).json({
    success: true,
    data,
    message:
      "Please check your email to verify your account. Verification link sent."
    });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  
  const { token, data } = await verifyEmailService({email, verificationToken});

  setAuthCookie(res, token);
  return res.status(200).json({
      success: true,
      message: "Email verification successfull",  
      data
    });
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  const data = await resendVerificationService(email);

  return res.status(200).json({
    success: true,
    data,
    message: "Verification email resent. Please check your inbox."
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginService({ email, password });

  const userRes = {
    name: user.name,
    email: user.email,
    uid: user._id,
    status: user.role === "admin" ? user.role : null
  };
  const data = { user: userRes, token }; 
  
  res.status(200).json({
    success: true,
    message:"Login successfull",
    data
  });
};

const forgotPassword = async (req, res) => {
  const {email} = req.body;

  const data = await forgotPasswordService(email);

  return res.status(200).json({
    success: true,
    message: "Verification mail has been sent to your email",
    data
  });
};

const verifyPasswordResetToken = async (req, res) => {
  const { email, passwordResetToken } = req.body;

  const data = await verifyPasswordResetTokenService({email, passwordResetToken});

  return res.status(200).json({ 
    success: true,
    message: "Token verified",
    data 
  });
};


const passwordReset = async (req, res) => {
  const { email, password, passwordResetToken } = req.body;

  const data = await passwordResetService({email, password, passwordResetToken});

  return res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
    data
  });
};

module.exports = { register, login, verifyEmail, resendVerification, forgotPassword, verifyPasswordResetToken, passwordReset };