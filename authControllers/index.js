const bcrypt = require("bcrypt");
require('dotenv').config();
const User = require("../models/userSchema");
const Course = require("../models/courseSchema");
const Enrollment = require("../models/enrollment")
const jwt = require("jsonwebtoken");
const enrollmentSchema = require("../models/enrollment");
const Student = require("../models/enrollment")
const nodemailer = require("nodemailer")




const handleSignUp = async (req, res)=>{

    try {
        
        const { email, password, firstName, lastName, phoneNumber, role } = req.body

        if(!email){
            return res.status(400).json({message: "Please add your email"})
        }
    
        if(!password){
            return res.status(400).json({message: "Please enter password"})
        }
    
        const existingUser = await User.findOne({ email })
    
        if(existingUser){
            return res.status(400).json({message: "User account already exist"})
        }
    
        if(password.length < 8){
            return res.status(400).json({message: "Password should be a min of 8 character"}) 
        }

        const hashedPassword = await bcrypt.hash(password, 10)
    
        const newUser = new User({ 
            email, 
            password: hashedPassword, 
            firstName, 
            lastName, 
            phoneNumber,
            role
        })
    
        await newUser.save()

        
        res.status(201).json({
            message: "User account created successfully",
            newUser: { email, firstName, lastName, phoneNumber, role }
        })


    } catch (error) {
        res.status(500).json({message: error.message})
    }

}

const handleLogin = async (req, res)=>{

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if(!user){
        return res.status(404).json({message: "User account does not exist."})
    }

    const isMatch = await bcrypt.compare(password, user?.password)

    if(!isMatch){
        return res.status(400).json({message: "Incorrect email or password."})
    }


    const accessToken = jwt.sign(
        {id: user?._id },
        process.env.ACCESS_TOKEN,
        {expiresIn: "720d"}
    )

    const refreshToken = jwt.sign(
        {id: user?._id},
        process.env.REFRESH_TOKEN,
        {expiresIn: "720d"}
    )


    res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            phoneNumber: user?.phoneNumber,
            role: user?.role
        },
        refreshToken

    })

}

const handleInstructorCreateCourse = async (req, res) => {

try {
  const {instructor, title, description} = req.body


  if(!instructor){
    return res.status(400).json({message:"please add instructor"})
  }

  if(!title){
    return res.status(400).json({messgae: "please add title"})
  }

if(!description){
  return res.status(400).json({message: "please add description"})
}

  const course = new Course({
    instructor,
    title,
    description
  })

  await course.save()
  res.status(201).json({messge: "course created succefully",
    course: {instructor, title, description}
  })

} catch (error) {
   res.status(500).json({message: error.message})

}

}

const handleEnrolled = async (req, res) => {

  const studentId = req.user?._id;
  const { courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ message: "studentId and courseId are required" });
  }

  try {
    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if(!course){
      return res.status(404).json({message: "course not found"})
    }

    
    if (student.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Student already enrolled in this course" });
    }

    student.enrolledCourses.push(courseId);
    course.enrolledStudents.push(studentId);

    await student.save();
    await course.save();

    console.log(" Course enrolled successfully");

    return res.status(200).json({ message: "Enrollment successful" });

  } catch (error) {
    console.error(" Enrollment error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const handleAllCourse =  async (req, res) => {
  

  try {

    const courses = await Course.find()

    if (!courses) {
      return res.status(404).json({ message: "No courses found for this instructor." });
    }

    res.status(200).json({ total: courses.length, courses })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch courses" })
  }
}

const handleStudentCourse= async (req, res) => {
  const { id: courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  try {
    const course = await Course.findById(courseId).populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      courseId: course._id,
      courseName: course.name,
      students: course.enrolledStudents,
    });

  } catch (error) {
    console.error("❌ Error fetching course students:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const handleErolledCourses = async (req, res) => {

  const {title, description, instructor, enrolledcourses} = req.body

  const enrolledCourses = await Course.find().populate()

  if(!Course){
    return res.status(404).json({message: "no course found"})
  }

  if(Course){
res.status(200).json({
    message: "successful",
    enrolledCourses
  })
  }

}

const sendForgotPasswordEmail = async (req, res, token) => {
  const { email } = req.body;

  console.log("Sending email to:", email);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: "exampple@gmail.com",
      subject: "Reset Password Notification",
      html: `<h1>Your reset token: ${token}</h1>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    return res.status(200).json({ message: 'Email sent successfully!' });
  } 
  catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

const handleResetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "user account not found" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  await user.save();

  res.status(200).json({ message: "password reset successful" });
};


   module.exports = {
    handleLogin,
    handleResetPassword,
    handleStudentCourse,
    handleErolledCourses,
    handleAllCourse,
    sendForgotPasswordEmail,
    handleEnrolled,
    handleSignUp,
    handleInstructorCreateCourse
   }