
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("./models/userSchema")
const Course = require("./models/courseSchema")
const dotenv = require("dotenv").config()
const enrollment = require("./models/enrollment")
const nodemailer = require("nodemailer")
const cors = require("cors")
app.use(cors())
const routes = require("./Router")


const PORT = process.env.PORT || 7000

app.use(express.json())


mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
        console.log("Mongodb connected...")})


app.listen(PORT, ()=>{

    console.log(`server started running on port ${PORT}`) 
     })


app.get("/", (req, res)=>{
        res.status(200).json({message: "Welcome To CareerEx"})
})


app.use(routes)