const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

async function sendMail(to, sub, msg) {
    try {
        const info = await transport.sendMail({
            from: process.env.MAIL_USER,
            to: to,
            subject: sub,
            html: msg
        });

        console.log("Mail Sent:", info.messageId);

    } catch (error) {
        console.log("Mail Error:", error);
    }
}

module.exports = { sendMail };