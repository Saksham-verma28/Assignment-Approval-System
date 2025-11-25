const jwt = require('jsonwebtoken');
const token = req.cookies['User']
    let userdetail;
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        userdetail = decoded;
    })

    module.exports = userdetail