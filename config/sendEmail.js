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
            from: "s282006v@gmail.com",
            to: to,
            subject: sub,
            html: msg
        });

        console.log("MAIL SENT SUCCESSFULLY");

        return true;

    } catch (error) {

        console.log("MAIL ERROR:");
        console.log(error);

        return false;
    }
}

module.exports = { sendMail };