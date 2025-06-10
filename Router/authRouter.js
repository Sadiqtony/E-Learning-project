
const express = require ("express")
const router = express.Router()
const {handleSignUp} = require("../authControllers")
const {handleLogin} = require("../authControllers")
const {handleInstructorCreateCourse} = require("../authControllers")
const {handleEnrolled} = require("../authControllers")
const {handleAllCourse} = require("../authControllers")
const {sendForgotPasswordEmail} = require("../authControllers")
const {handleStudentCourse} = require("../authControllers")
const {handleErolledCourses} = require("../authControllers")
const {validateRegister} = require("../middleware")
const {authorization} = require("../middleware")
const {handleResetPassword} = require("../authControllers")




router.post("/auth/register", validateRegister, handleSignUp)
router.post("/auth/login", authorization, handleLogin)
router.post("/courses-instructor", handleInstructorCreateCourse)
router.get("/courses", handleAllCourse)
router.post("/enroll-student", authorization, handleEnrolled)
router.get("/enrollments", handleErolledCourses)
router.get("/courses/:id/students", authorization, handleStudentCourse)
router.post("/forgot-Password", sendForgotPasswordEmail)
router.patch("/reset-password", authorization, handleResetPassword)



module.exports = router