const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user')
const {sendMail} = require('../config/sendEmail')
const {generateSecureOTP} = require('../config/generateOTP')


const {userLogin, moveToDashboard} = require('../controllers/user');
const hashPass = require('../hashPassword');

router.get('/login',userLogin)

router.post('/login',moveToDashboard);


router.get('/forget',(req,res)=>{
    res.render("user/forgetPass", {err: ''})
})

let storedOTP = "";
let storedEmail = "";


router.post("/send-otp", async (req, res) => {
    const email = req.body.email;

    const exist = await User.findOne({ email });

    if (!exist) {
        return res.json({
            success: false,
            message: "User not found! Please enter a registered university email."
        });
    }

    const otp = generateSecureOTP();

    storedOTP = otp;
    storedEmail = email;

    sendMail(
        email,
        "University Assignment Portal - OTP Verification",
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f5f5;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 25px; border-radius: 10px;">
                <h2 style="color:#333; text-align: center;">University Assignment Approval System</h2>
                <p style="font-size: 15px;">Dear Student,</p>
                <p style="font-size: 15px;">
                    You have requested to reset your password. Use the One-Time Password provided below:
                </p>
                <h1 style="letter-spacing: 5px; text-align:center; color:#e68b74;">${otp}</h1>
                <p style="font-size: 14px;">Valid for 10 minutes. Do not share this OTP.</p>
                <p style="font-size: 14px;">Regards,<br>University Assignment Approval System</p>
            </div>
        </div>`
    );

    return res.json({
        success: true,
        email,
        message: "OTP sent successfully!"
    });
});

router.post("/reset-password", async(req, res) => {
    const { otp, newPassword, confirmPassword } = req.body;

    if (otp !== storedOTP) {
        return res.json({ success: false, message: "Invalid OTP" });
    }

    if (newPassword !== confirmPassword) {
        return res.json({ success: false, message: "Passwords do not match" });
        
    }

    const hashPassword = await hashPass(newPassword)

    await User.findOneAndUpdate({email: storedEmail}, {$set: {password: hashPassword}});

    return res.json({ success: true, message: "Password updated successfully" });
});
module.exports = router