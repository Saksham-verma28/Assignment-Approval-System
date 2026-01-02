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
    },
    profilePic: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
    }
})

const User = mongoose.model("users",userSchema);

module.exports = User