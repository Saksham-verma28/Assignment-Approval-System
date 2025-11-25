const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    department:{
        type: String,
        enum: ["CS","EE","ME","PH","CH","AR","HI"],
        required: true
    },
    role:{
        type: String,
        enum: ["Student","Hod","Professor"],
        required: true
    }
})

const User = mongoose.model("users",userSchema);

module.exports = User