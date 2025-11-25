const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user')


const {userLogin, moveToDashboard} = require('../controllers/user')

// user login
router.get('/login',userLogin)

// check role move to dashboard
router.post('/login',moveToDashboard);






module.exports = router