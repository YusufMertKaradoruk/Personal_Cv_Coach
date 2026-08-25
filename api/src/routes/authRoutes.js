const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Kullanıcı kayıt
router.post('/register', register);

// Kullanıcı giriş
router.post('/login', login);

module.exports = router;
