require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {adminLogin} = require('../controllers/serveLogin')



router.post('/login',adminLogin)

module.exports = router;
