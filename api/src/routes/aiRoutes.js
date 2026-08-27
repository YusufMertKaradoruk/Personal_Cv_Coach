
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

console.log("🚀 DİKKAT: AI Rotası sisteme başarıyla okundu!");


// Kullanıcının en güncel CV'sini yerel AI ile ATS analizine gönder
router.post('/analyze', authMiddleware, aiController.analyzeMyCv);

module.exports = router;
