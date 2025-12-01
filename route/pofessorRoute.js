const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const Assignment = require('../models/assignment');
const {generateSecureOTP} = require('../config/generateOTP')
const {sendMail} = require('../config/sendEmail')
const User = require('../models/user')
const {professorDashboard, reviewAssignment, sendOTP, verifyOTP} = require('../controllers/professor')

router.get('/dashboard',professorDashboard)

router.get('/review/:id',reviewAssignment)




router.post('/send-otp/:action', sendOTP);



router.post('/verify-otp/:id', verifyOTP)


module.exports= router