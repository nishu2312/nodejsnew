const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hashedpassword: {
        type: String,
        required: true
    },
    normalpassword: {
        type: String,
        required: true
    },
    resetToken: String, // Add resetToken field
    resetTokenExpiration: Date // Add resetTokenExpiration field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
