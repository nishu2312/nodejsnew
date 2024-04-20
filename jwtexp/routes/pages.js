const express = require('express');
const authController = require('../controllers/auth'); 
const mysql = require("mysql");

const router = express.Router();

const db = mysql.createConnection({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  password:process.env.DATABASE_PASSWORD,
  database:process.env.DATABASE
});


router.get("/",(req,res)=>{
  res.render("index")
});

router.get("/student",(req,res)=>{
  res.render("student")
});


// router.get("/add",(req,res)=>{
//   res.render("teacher_add");
// });


// router.get("/logins",(req,res)=>{
//   res.render("teacher_portal")
// });

// search student
router.get("/search",(req,res)=>{
  res.render("student_search");
});

// for  teacher register
router.get("/register",(req,res)=>{
    res.render("register")
  });

  //for teacher login
  router.get("/login",(req,res)=>{
    res.render("login")
  });
  
  // for rendering teacherportal
  router.get('/logins', authController.isLoggedIn, (req, res) => {
    console.log("inside");
    console.log(req.user);
    if(req.user) {
      res.render('teacher_portal', {
        user: req.user
      });
    } else {
      res.redirect("/login");
    }
    
  });

  // FOR RENDERING TEACHER VIEW

  router.get("/teacher_view", authController.isLoggedIn, (req, res) => {
    if (req.user) {
      // Render the teacher page with user data if the user is logged in
      const userData = req.user; // Assuming your authController provides user data
      var sql = "SELECT * FROM teacherview";
      db.query(sql, function (error, result) {
        if (error) {
          console.log("Error Connecting to DB:", error);
          res.render('login'); // You might want to render an error page here
        } else {
          const studentData = result; // Assuming the result contains student data
          res.render('teacher_view', { user: userData, data: studentData });
        }
      });
    } else {
      // Redirect to login page if the user is not logged in
      res.redirect("/login");
    }
  });

  //for rendering edit page


  router.get('/edit/:Rollno', authController.isLoggedIn, (req, res) => {
    if (req.user) {
      const recordRollno = req.params.Rollno;

      db.query('SELECT * FROM teacherview WHERE Rollno = ?', [recordRollno], (err, result) => {
        if (err) {
          console.log("Error querying the database:", err);
          
        } else {
          if (result.length === 0) {
            // Handle case where the record doesn't exist
            res.status(404).send('Record not found');
          } else {
            // Render the edit page with user data and student record
            res.render('teacher_edit', { user: req.user, item: result[0] });
          }
        }
      });
    } else {
      // Redirect to login page if the user is not logged in
      res.redirect("/login");
    }
  });


  //for rendering add student

  router.get('/add', authController.isLoggedIn, (req, res) => {
    if (req.user) {

      res.render('teacher_add', {
        user: req.user
      });
    } else {

      res.redirect("/login");
    }
  });


  // for rendering index page
  router.get('/', authController.isLoggedIn, (req, res) => {
    console.log("inside");
    console.log(req.user);
    res.render('index', {
      user: req.user
    });
  });
  
  module.exports =router;