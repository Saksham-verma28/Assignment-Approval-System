const mongoose = require('mongoose');
require('dotenv').config();

module.exports.connectDB = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log("DB connected successfully..."))
        .catch((err) => console.log("DB not connected..."))
}