const express = require("express");
const mysql = require("mysql");
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
dotenv.config({path:'./.env'})


const app = express();

const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());


app.set('view engine','ejs')

db.connect(function (error){
    if(error){
        console.log(error)
    }else{
        console.log("MYSql connected")
    }
})

//Define Routes
app.use('/',require('./routes/pages'))

app.use('/auth',require('./routes/auth'))

app.listen(5000,()=>{
    console.log("Server started on port 5000")
});

       //Search Student
       app.post('/search', (req, res) => {
        const inputRollno = req.body.Rollno;
        const inputDOB = req.body.DateofBirth;
    
        db.query('SELECT * FROM teacherview WHERE Rollno = ? AND DateofBirth = ?', [inputRollno, inputDOB],(err, results) => {
          if (err) throw err;
    
          if (results.length > 0) {
            res.render('student_search', { record: results[0] });
          } else {
            res.send('No matching record found.');
          }
        });
      });

  //Create or ADD the Records
app.post("/api/teacherview/add", (req, res) => {
    let details = {
        Name: req.body.Name,
        Rollno: req.body.Rollno,
        DateofBirth: req.body.DateofBirth,
        Score: req.body.Score
    };
    let sql = "INSERT INTO teacherview SET ?";
    db.query(sql, details, (error) => {
        if (error) {
            res.status(500).json({success:false});
        } else {
            res.json({ success:true});
        }
    });
});

  app.post('/edit/:Rollno', (req, res) => {
    const recordRollno = req.params.Rollno;
    const updatedName = req.body.updatedName;
    const updatedDOB = req.body.updatedDOB;
    const updatedScore = req.body.updatedScore;

    db.query(
      'UPDATE teacherview SET Name = ?, DateofBirth = ?, Score = ? WHERE Rollno = ?',
      [updatedName, updatedDOB, updatedScore,recordRollno],
      (err, result) => {
        if (err) throw err;
        res.redirect('/teacher_view');
      });
  });

  //Delete the Records
app.post("/api/teacherview/delete/:Rollno", (req, res) => {
    const recordRollno = req.params.Rollno;
    db.query("DELETE FROM teacherview WHERE Rollno= ?",[recordRollno], (err,result) => {
        if (err) throw err;
        res.redirect("/teacher_view");
    });
  
        });