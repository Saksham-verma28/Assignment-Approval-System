const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port:465,
    auth:{
        user: 's282006v@gmail.com',
        pass: 'yjuowigznngugivs'
    }
})

// this is for sending mail

async function sendMail(to,sub,msg){
    transport.sendMail({
        to: to,
        subject: sub,
        html: msg
    })
    
}

module.exports = {sendMail}