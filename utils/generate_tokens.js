const crypto = require("crypto");
const bcrypt = require("bcryptjs");

async function tokenGenerator() {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedVerificationToken = await bcrypt.hash(verificationToken, 10); 
      const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60);
      return [ verificationToken, hashedVerificationToken, verificationTokenExpires ]
}

module.exports = tokenGenerator