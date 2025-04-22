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
                user: process.env.ADMIN_EMAIL,
                pass: process.env.MAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        await Transporter.sendMail(mailOptions);
    } catch (err){
        throw new BadRequestError("Unable to send verification email. Kindly provide a valid email");
    }
}


module.exports = mailSender;
