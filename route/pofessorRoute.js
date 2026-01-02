const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const Assignment = require('../models/assignment');
const { generateSecureOTP } = require('../config/generateOTP')
const { sendMail } = require('../config/sendEmail')
const User = require('../models/user')
const { professorDashboard, reviewAssignment, sendOTP, verifyOTP } = require('../controllers/professor')
const hashPass = require('../hashPassword')
const {verifyToken,professorOnly} = require('../middleware/userAuth')

router.get('/dashboard', verifyToken,professorOnly, professorDashboard)

router.get('/review/:id', verifyToken,professorOnly, reviewAssignment)




router.post('/send-otp/:action',verifyToken,professorOnly, sendOTP);



router.post('/verify-otp/:id', verifyToken,professorOnly,verifyOTP)



router.post('/filterAssignment', verifyToken,professorOnly,async (req, res) => {

    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let status;
    let find = await User.find({ name: name })
    let user = find[0]


    if (req.body.status === 'all') {
        status = await Assignment.find({ professor: name }).sort({ createdAt: -1 }).limit(5);
    } else {
        status = await Assignment.find({ professor: name, status: req.body.status }).sort({ createdAt: -1 }).limit(5);
    }

    res.render('user/professor/dashboard', { name: name, assignment: status, profilePic: user.profilePic })
})




router.get('/assignment/all',verifyToken,professorOnly, async (req, res) => {

    const token = req.cookies['User']
    let name;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        name = decoded.name
    })

    let assignment = await Assignment.find({ professor: name })

    res.render('user/professor/allAssignment', { assignment: assignment })
})


router.post('/allfilterAssignment',verifyToken,professorOnly, async (req, res) => {

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

    res.render('user/professor/allAssignment', { assignment: status })

})



router.get('/settings',verifyToken,professorOnly, async (req, res) => {
    let name = req.query.name;
    let find = await User.find({ name: name })
    let user = find[0]

    res.render('user/editProfile', { user: user, success: false })
})






module.exports = router