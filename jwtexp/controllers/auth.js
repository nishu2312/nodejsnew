// routes/auth.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render("login", {
            message: 'Please provide email and password'
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).render("login", {
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log('Here the token:',token);

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token });
      
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};
exports.forget = async (req, res) => {
    try {
        const {email} = req.body;

        const existingUser = await User.findOne({ email });
        console.log('user',existingUser);
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: 'No users with this email'
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
       

        existingUser.resetToken = resetToken;
        existingUser.resetTokenExpiration = Date.now() + 3600000;
        await existingUser.save();

        const resetLink = `http://localhost:5000/auth/reset/${resetToken}`;
        console.log('resetToken',resetToken);
        //create smtp
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'odessa.hayes@ethereal.email',
                pass: '8pT7bSeVy7WfX2g7mn'
            }
        });

            // Message object
    let message = {
        from: 'Odessa Hayes <odessa.hayes@ethereal.email>',
        to: 'bar <baz@example.com>',
        subject: 'Password reset',
        text: 'Click <a href="${resetLink}">here</a> to reset your password.',
        html: `Click <a href="${resetLink}">here</a> to reset your password.`

    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
         res.status(200).json({
            success: true,
            message: 'Mail sent '
        });
    });
    
       
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};
exports.reset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({ resetToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        // Set new password
        user.hashedpasswordpassword = await bcrypt.hash(newPassword, 10);
        user.normalpassword = newPassword;

        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
exports.register = async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'That email is taken'
            });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }
       
        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = new User({
            name,
            email,
            hashedpassword: hashedPassword,
            normalpassword: password
        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: 'User registered'
            });
       
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next();
            }

            req.user = user;
            return next();
        }
        next();
    } catch (err) {
        console.error(err);
        next();
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
};
