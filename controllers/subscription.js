const { BadRequestError } = require("../errors");
const mailSender = require("../middleware/mailing.js");

const subscribe = async (req, res) => {
    const {email} = req.body;
    if (!email) throw new BadRequestError("Email address is required");
    const message = `<p style="font-size: 16px; line-height:1.5;">Hello Admin. You have a new subscriber</p><p>Email: ${email}</p>`
    await mailSender(process.env.ADMIN_EMAIL, "New Subscriber", message);
    return res.status(201).json({message: "Email subscription successful"});
};

module.exports = subscribe;