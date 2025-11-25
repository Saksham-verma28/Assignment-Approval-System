const express = require('express');
const ejs = require('ejs')
const bcrypt = require('bcrypt');
const path = require('path')
const dotenv = require("dotenv")
const cloudinary = require("cloudinary").v2;
const cookieParser = require('cookie-parser')

dotenv.config()




const authRoute = require('./route/authRoute');
const adminRoute = require('./route/adminRoute');
const userRoute = require('./route/userRoute')
const studentRoute = require('./route/studentRoute')
const {login} = require('./controllers/serveLogin')
const {createdepartment} = require('./controllers/department')



const app = express();



app.set('view engine','ejs')
app.set('views',path.join(__dirname,'view'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/student/uploads', express.static('uploads'));
app.use('/student/status/uploads', express.static('uploads'));
app.use('/student/assignment/uploads', express.static('uploads'));
app.use('/student/assignment/history/uploads', express.static('uploads'));


app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser())


app.use('/auth',authRoute)
app.use('/admin',adminRoute)
app.use('/user',userRoute)
app.use('/student',studentRoute)

app.get('/',login)
app.get('/department/form',createdepartment)


app.listen(process.env.PORT,()=>{
    console.log("Server Started...")
})