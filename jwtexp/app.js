const express = require("express");

const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
dotenv.config({path:'./.env'})
const mongoose = require('mongoose');

const app = express();


mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Import User model
const User = require('./models/User');

const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());


app.set('view engine','ejs')



//Define Routes
app.use('/',require('./routes/pages'))

app.use('/auth',require('./routes/auth'))

app.listen(5000,()=>{
    console.log("Server started on port 5000")
});

