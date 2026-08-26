const jwt = require('jsonwebtoken');

/**
 * JWT doğrulama katmanı.
 * Authorization: Bearer <token> başlığını okur, token'ı doğrular
 * ve kullanıcı bilgisini req.user üzerine ekler.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      durum: 'Hata',
      mesaj: 'Yetkilendirme başarısız. Token bulunamadı.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      durum: 'Hata',
      mesaj: 'Yetkilendirme başarısız. Token bulunamadı.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      durum: 'Hata',
      mesaj: 'Geçersiz veya süresi dolmuş token.',
    });
  }
};

module.exports = authMiddleware;
