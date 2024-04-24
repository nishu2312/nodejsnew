const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register)
  
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/forget',authController.forget);

router.post('/reset',authController.reset);

  module.exports =router;