// Çevresel değişkenleri (.env) sisteme yüklüyoruz
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const cvRoutes = require('./src/routes/cvRoutes');
const aiRoutes = require('./src/routes/aiRoutes');


// Express uygulamasını başlatıyoruz
const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARE'LER ===
// İleride Flutter (Frontend) tarafının bu sunucuya takılmadan istek atabilmesi için:
app.use(cors());
// Gelen JSON formatındaki verileri (Örn: CV verisi) backend'in okuyabilmesi için:
app.use(express.json());

// === ROTALAR (ROUTES) ===
app.use('/api/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/ai', aiRoutes);

// === SUNUCUYU AYAĞA KALDIRMA ===
app.listen(PORT, async () => {
  console.log(`[Salvo Backend] Sunucu http://localhost:${PORT} adresinde başarıyla ayağa kalktı.`);
  await connectDB();
});
