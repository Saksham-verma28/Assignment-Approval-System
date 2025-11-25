const bcrypt = require("bcrypt");

function hashPass(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            resolve(hash);
        });
    });
}

module.exports = hashPass;
