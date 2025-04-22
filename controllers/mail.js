const Mailgun = require("mailgun.js");
const FormData = require("form-data");
const { BadRequestError } = require("../errors");
require("dotenv").config();


const sendMail = async(req, res) => {
    const { email } = req.body;
    if(!email){
        throw new BadRequestError('email must be provided')
    }
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
        username: "api",
        key: API_KEY,
    });

    const messageData = {
        from: `Contact Form ${process.env.EMAIL_DOMAIN}`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Subscriber",
        text: 
        `Hello,
      
        You have a new email subscription from: ${email}`,
    };
    try{
        const emailResponse = await mg.messages.create(DOMAIN, messageData);
        return res.status(200).json('email sent successfully')
    } catch(err){
        console.error(err.status);
        console.log(err.details)
        res.status(err.status).json({ error: err.details });
    }
}

module.exports = sendMail;