const express = require("express");
const {
  login,
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  passwordReset,
  verifyPasswordResetToken,
} = require("../controllers/auth");

const router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerification);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-password-reset-token").post(verifyPasswordResetToken);
router.route("/reset-password").patch(passwordReset);

module.exports = router;
