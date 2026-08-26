const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createCv, getMyCvs, updateCv } = require('../controllers/cvController');

// Yeni CV oluştur
router.post('/create', authMiddleware, createCv);

// Kullanıcının tüm CV'lerini listele
router.get('/', authMiddleware, getMyCvs);

// Mevcut CV'nin JSONB verisini güncelle
router.put('/update/:id', authMiddleware, updateCv);

module.exports = router;
