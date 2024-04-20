
const mysql = require("mysql");
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');


const db = mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});



exports.login = async (req, res, next) => {
    const { email, password } = req.body;
  
    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).render("login", {
        message: 'Please provide email and password'
      });
    }
  
    // 2) Check if user exists && password is correct
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
      
      if (error) {
        // Handle any database query errors
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length === 0) {
        // If no results found, return invalid email message
        return res.status(401).render("login", {
          message: 'Invalid email or password'
        });
      }
      
      console.log(results);
      console.log(password);
      const isMatch = await bcrypt.compare(password, results[0].password);
      console.log(isMatch);
      if(!results || !isMatch ) {
        return res.status(401).render("login", {
          message: 'Incorrect email or password'
        });
      } else {
        // 3) If everything ok, send token to client
        const id = results[0].id;
        console.log(id);
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });
  
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);
  
        res.status(200).redirect("/logins");
      }
    });
  };
  
exports.register = (req,res)=>{
    console.log(req.body);

    const{name,email,password,passwordConfirm}=req.body;
    db.query('SELECT email FROM users WHERE email = ?', [email] ,async (error,results)=>{
        if(error){
            console.log(error);
        }
        
        if(results.length > 0){
            
            return res.render('register',{
                message:'That email is taken'
            })
        }else if(password !== passwordConfirm){
            
            return res.render('register',{
                message:'password do not match'
            });
           
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?',{name:name,email:email,password:hashedPassword},(error,results)=>{
            if(error){
                console.log(error);
            }else{
                console.log(results);
                return res.render('register',{
                    message:'user registered'
                });

            }
        })
        
    });
    
};
exports.isLoggedIn = async (req, res, next) => {
    console.log(req.cookies);
    if (req.cookies.jwt) {
      try {
        // 1) verify token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.JWT_SECRET
        );
  
        console.log("decoded");
        console.log(decoded);
  
        // 2) Check if user still exists
        db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
          console.log(result)
          if(!result) {
            return next();
          }
          // THERE IS A LOGGED IN USER
          req.user = result[0];
          console.log(req.user);
          // res.locals.user = result[0];
          console.log("next")
          return next();
        });
      } catch (err) {
        return next();
      }
    } else {
      next();
    }
  };

  exports.logout = (req, res) => {
    res.cookie('jwt', 'logout', {
      expires: new Date(Date.now() + 2* 1000),
      httpOnly: true
    });
    res.status(200).redirect("/");
  };