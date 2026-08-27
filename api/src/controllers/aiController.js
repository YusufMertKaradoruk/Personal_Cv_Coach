const { pool } = require('../config/db');
const { analyzeCvWithLocalAI } = require('../services/aiService');

/**
 * Giriş yapmış kullanıcının en güncel CV'sini yerel AI ile ATS analizine gönderir.
 */
const analyzeMyCv = async (req, res) => {
  try {
    const kullanici_id = req.user.id;

    const sonuc = await pool.query(
      `SELECT cv_verisi
       FROM cvler
       WHERE kullanici_id = $1
       ORDER BY COALESCE(guncellenme_tarihi, olusturulma_tarihi) DESC
       LIMIT 1`,
      [kullanici_id]
    );

    if (sonuc.rows.length === 0) {
      return res.status(404).json({
        durum: 'Hata',
        mesaj: 'Analiz edilecek CV bulunamadı.',
      });
    }

    const result = await analyzeCvWithLocalAI(sonuc.rows[0].cv_verisi);

    return res.status(200).json({
      durum: 'Başarılı',
      analiz: result,
    });
  } catch (error) {
    console.error('[Salvo AI] Analiz hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. ATS analizi tamamlanamadı.',
    });
  }
};

module.exports = {
  analyzeMyCv,
};
