const mailSender = require("../middleware/mailing");

async function emailSender(email, redirect_url, verificationToken){
    const verifyURL = `${redirect_url}?vt=${verificationToken}&email=${encodeURIComponent(email)}`;

    const message = `<p style="font-size: 16px; line-height: 1.5;">
    Please confirm your email by clicking the button below:</p><a href="${verifyURL}" style="display: inline-block;text-decoration: none; background-color: #adad29; padding: 14px 20px; color: white; font-weight: 700; border-radius: 6px; cursor: pointer; font-size: 16px; text-align: center; width: 100%; max-width: 250px; box-sizing: border-box;">Verify Email</a>`;

    await mailSender(email, "Verify your email", message);
}

module.exports = emailSender;