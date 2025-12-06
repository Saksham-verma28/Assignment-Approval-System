const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port:465,
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

async function sendMail(to,sub,msg){
   return transport.sendMail({
        form: process.env.MAIL_USER,
        to: to,
        subject: sub,
        html: msg
    })
    
}

module.exports = {sendMail}