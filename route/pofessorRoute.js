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



router.post('/filterAssignment', async (req, res) => {

    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let status;

    if (req.body.status === 'all') {
        status = await Assignment.find({ professor: name }).sort({ createdAt: -1 }).limit(5);
    } else {
        status = await Assignment.find({ professor: name, status: req.body.status }).sort({ createdAt: -1 }).limit(5);
    }

    res.render('user/professor/dashboard', { name: name, assignment: status })
})




router.get('/assignment/all', async(req,res)=>{

    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let assignment = await Assignment.find({professor: name})

    res.render('user/professor/allAssignment', {assignment: assignment})
})


router.post('/allfilterAssignment',async(req,res)=>{

     const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let status;

    if (req.body.status === 'all') {
        status = await Assignment.find({ professor: name })
    } else {
        status = await Assignment.find({ professor: name, status: req.body.status })
    }

    res.render('user/professor/allAssignment', {assignment: status })

})




module.exports= router