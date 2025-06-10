const jwt = require("jsonwebtoken")
const User = require("../models/userSchema")
const Course = require("../models/courseSchema")



const validateRegister = (req, res, next) => {

const { email, password, firstName, lastName, phoneNumber, role} = req.body

const error = []

if(!email) {
    errors.push("please add your email")

    if(!password){
        errors.push("please at password")
    }

    if(errors.length > 0){
        return res.status(400).json({message: errors})
    }
}


next()
}

const authorization = async (req, res, next) => {

    const token = req.header("Authorization")

    console.log({token})

    if(!token){

        return res.status(401).json({message: "please login!"})
    }

    const splitToken = token.split(" ")


    const realToken = splitToken[1]

    console.log({realToken})

    const decoded = jwt.verify(realToken, `${process.env.ACCESS_TOKEN}`)

    console.log({decoded})

    if(!decoded){

     return res.status(401).json({message: "invalid authentication"})
    }

    const user = await User.findById(decoded.id)

    if(!user){
        return res.status(404).json({message: "User does not exist"})
    }
    req.user = user

    next()
}



module.exports = {
    validateRegister,
    authorization
}