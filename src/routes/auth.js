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

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *     responses:
 *       200:
 *         description: Login successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successfull
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                        type: string
 *                        format: email
 *                        example: johndoe@gmail.com
 *                     uid:
 *                        type: string
 *                        example: 43tddgdt6eg3y
 *                     status:
 *                        type: string
 *                        example: admin
 *                     token:
 *                        type: string
 *                        example: eyhjdy73637373g37ghHHH7
 */
router.route("/login").post(login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Please check your email to verify your account. Verification link sent.
 *                 data:
 *                   oneOf:
 *                     - type: "null"
 *                       example: null
 *                     - type: object
 *                       properties:
 *                         verificationToken:
 *                           type: string
 *                           example: "2344hryf7474r772he73"
 */
router.route("/register").post(register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationToken
 *               - email
 *             properties:
 *               verificationToken:
 *                 type: string
 *                 example: uyret3633u3g383heheie83h3
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Email verification successfull
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verification successfull
 *                 user:
 *                   type: object
 *                   properties:
 *                     name: 
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     uid:
 *                       type: string
 *                       example: 6373333y3yyfgff773yggf373yrh
 *                     status:
 *                       type: string
 *                       example: null
 */
router.route("/verify-email").post(verifyEmail);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Resend email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@gmail.com
 *     responses:
 *       200:
 *         description: Verification email resent. Please check your inbox.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification email resent. Please check your inbox.
 *                 data: 
 *                   oneOf:
 *                     - type: "null"
 *                       example: null
 *                     - type: object
 *                       properties:
 *                         verificationToken:
 *                           type: string
 *                           example: te5et363t6r7t36truryr73y373y6r
 */
router.route("/resend-verification").post(resendVerification);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request a password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification mail has been sent to your email 
 *                 data:
 *                   oneOf:
 *                     - type: "null"
 *                       example: null
 *                     - type: object
 *                       properties:
 *                         passwordResetToken:
 *                           type: string
 *                           example: tyeiehe8333h38hrf83y383y
 */                               
router.route("/forgot-password").post(forgotPassword);

/**
 * @swagger
 * /auth/verify-password-reset-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - email
 *             properties:
 *               token:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset token verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token verified
 *                 data:
 *                   type: "null"
 *                   example: null
 */
                        
router.route("/verify-password-reset-token").post(verifyPasswordResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password has been reset successfully
 *                 data:
 *                   type: "null"
 *                   example: null
 */
router.route("/reset-password").patch(passwordReset);

module.exports = router;