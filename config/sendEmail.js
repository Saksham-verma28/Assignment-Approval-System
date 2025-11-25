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

function sendMail(to,sub,msg){
    transport.sendMail({
        to: to,
        subject: sub,
        html: msg
    })

    console.log("Send!");
    
}

sendMail("saurav24gamer@gmail.com","Kiraya","130 nikal lode")
