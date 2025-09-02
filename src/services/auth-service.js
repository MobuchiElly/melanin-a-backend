const User = require("../models/Users");
const tokenGenerator = require("../utils/generate_tokens");
const bcrypt = require("bcryptjs");
const { BadRequestError, NotFoundError } = require("../errors");
const emailSender = require("../utils/emailSender");

const redirect_url = `${process.env.FRONTEND_URL}/auth/verify-email`;
const password_reset_url = `${process.env.FRONTEND_URL}/auth/verify-pasword-reset`;

const registerService = async ({ name, email, password }) => {
  if (!name || !password || !email)
    throw new BadRequestError("Name, Email and Password are required");

  const [verificationToken, hashedVerificationToken, verificationTokenExpires] =
    await tokenGenerator();

  const user = await User.create({
    name,
    email,
    password,
    verificationToken: hashedVerificationToken,
    verificationTokenExpires,
  });

  if (process.env.NODE_ENV !== "test") await emailSender(email, redirect_url, verificationToken);
  const data = process.env.NODE_ENV === "test" ? { verificationToken } : null;
  return data;
};

const verifyEmailService = async ({ email, verificationToken }) => {
  if (!email || !verificationToken)
    throw new BadRequestError("email and verificationToken are required");

  const user = await User.findOne({ email }).select("-password");

  if (!user) throw new BadRequestError("No user with this email exists");
  if (user.isVerifiedUser) {throw new BadRequestError("Email is already verified");}
  if (!user.verificationToken)
    throw new BadRequestError("No verification token provided");
  if (user.verificationTokenExpires < new Date())
    throw new ForbiddenError("Verification token expired");

  const isValidVerificationToken = await bcrypt.compare(
    verificationToken,
    user.verificationToken
  );
  if (!isValidVerificationToken) throw new BadRequestError("Invalid Verification Token");

  user.isVerifiedUser = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const authToken = await user.createJWT();
  return {
    token: authToken,
    data: {
      user: {
        name: user.name,
        email: user.email,
        uid: user._id,
        status: null
      },
    },
  };
};

const resendVerificationService = async (email) => {
  if (!email) throw new BadRequestError("Email is required");
  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("No existing user with provided email");
  if (user.isVerifiedUser)
    throw new BadRequestError("Email is already verified");

  const [verificationToken, hashedVerificationToken, verificationTokenExpires] =
    await tokenGenerator();

  user.verificationToken = hashedVerificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  if(process.env.NODE_ENV !== "test") await emailSender(email, redirect_url, verificationToken);
  return process.env.NODE_ENV === "test" ? { verificationToken } : null;
};

const forgotPasswordService = async (email) => {
  if (!email) throw new BadRequestError("Email is required");
  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("No user with this email exists");

  const [verificationToken, hashedVerificationToken, verificationTokenExpires] =
    await tokenGenerator();

  if(process.env.NODE_ENV !== "test") await emailSender(email, password_reset_url, verificationToken);

  user.passwordResetToken = hashedVerificationToken;
  user.passwordResetTokenExpires = verificationTokenExpires;
  await user.save();
  return process.env.NODE_ENV === "test"
    ? { passwordResetToken: verificationToken }
    : null;
};

const verifyPasswordResetTokenService = async ({
  email,
  passwordResetToken,
}) => {
  if (!email || !passwordResetToken)
    throw new BadRequestError("Email and PasswordResetToken required");

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("Invalid email");
  if (!user.passwordResetToken || !user.passwordResetTokenExpires)
    throw new BadRequestError(
      "Invalid verification token. Request to reset password and check your email thereafter"
    );
  if (user.passwordResetTokenExpires < new Date()) {
    throw new ForbiddenError("Token expired");
  }
  const isValid = await bcrypt.compare(
    passwordResetToken,
    user.passwordResetToken
  );
  if (!isValid) throw new BadRequestError("Invalid or expired token");

  return null;
};

const passwordResetService = async ({
  email,
  password,
  passwordResetToken,
}) => {
  if (!email) throw new BadRequestError("Email is required");
  if (!passwordResetToken)
    throw new BadRequestError(
      "Invalid password reset link. No reset token provided"
    );
  if (!password) throw new BadRequestError("Provide new password");

  const user = await User.findOne({ email });
  if (!user)
    throw new BadRequestError("No user with the provided email exists");
  if (!user.passwordResetToken || !user.passwordResetTokenExpires)
    throw new BadRequestError(
      "Invalid verification token. Request to reset password and check your email thereafter"
    );

  const isValid = await bcrypt.compare(
    passwordResetToken,
    user.passwordResetToken
  );
  if (!isValid) throw new BadRequestError("Invalid reset token");
  if (user.passwordResetTokenExpires < new Date())
    throw new ForbiddenError("Verification Token has expired");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  return null;
};

const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new BadRequestError("Please provide Email and Password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError(
      "User does not exist. Please enter correct login credentials"
    );
  }

  if (!user.isVerifiedUser && user.email !== process.env.AUTHEMAIL) {
    const [verificationToken, hashedToken, tokenExpires] =
      await tokenGenerator();
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();

    await emailSender(email, process.env.REDIRECT_URL, verificationToken);

    throw new BadRequestError(
      "Your account is not verified. A verification link has been sent to your email."
    );
  }

  const passwordVerified = await user.verifyPassword(password);
  if (!passwordVerified) {
    throw new BadRequestError(
      "Incorrect password. Please enter correct credentials"
    );
  }

  const token = await user.createJWT();

  return { user, token };
};

module.exports = {
  loginService,
  registerService,
  verifyEmailService,
  resendVerificationService,
  forgotPasswordService,
  verifyPasswordResetTokenService,
  passwordResetService,
};