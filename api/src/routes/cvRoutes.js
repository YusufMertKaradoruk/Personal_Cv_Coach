const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const cvController = require('../controllers/cvController');

// Herkese açık dijital kartvizit (token yok)
router.get('/public/:id', cvController.getPublicCv);

// Yeni CV oluştur
router.post('/create', authMiddleware, cvController.createCv);

// Kullanıcının tüm CV'lerini listele
router.get('/', authMiddleware, cvController.getMyCvs);

// Mevcut CV'nin JSONB verisini güncelle
router.put('/update/:id', authMiddleware, cvController.updateCv);

module.exports = router;
