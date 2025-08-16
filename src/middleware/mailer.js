require("dotenv").config();
const nodemailer = require("nodemailer");
const { BadRequestError } = require("../errors");


async function mailSender(to, subject, html){
    try {
        let mailOptions = ({
            from: `"Melanin A. Blog" <${process.env.ADMIN_EMAIL}>`,
            to,
            subject,
            html
        });
        const Transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.CONTACT_EMAIL,
                pass: process.env.MAIL_PASS
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV == "production"
            }
        });
        await Transporter.sendMail(mailOptions);
    } catch (err){
        console.log("error:", err);
        throw new BadRequestError("Unable to send verification email. Kindly provide a valid email");
    }
}


module.exports = mailSender;
