const { pool } = require('../config/db');

/**
 * Yeni CV kaydı oluşturur.
 * kullanici_id JWT'den, meslek_grubu ve cv_verisi body'den alınır.
 */
const createCv = async (req, res) => {
  try {
    const kullanici_id = req.user.id;
    const { meslek_grubu, cv_verisi } = req.body;

    if (!meslek_grubu || !cv_verisi) {
      return res.status(400).json({
        durum: 'Hata',
        mesaj: 'meslek_grubu ve cv_verisi alanları zorunludur.',
      });
    }

    const sonuc = await pool.query(
      `INSERT INTO cvler (kullanici_id, meslek_grubu, cv_verisi)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [kullanici_id, meslek_grubu, JSON.stringify(cv_verisi)]
    );

    return res.status(201).json({
      durum: 'Başarılı',
      mesaj: 'CV başarıyla kaydedildi.',
      cv: sonuc.rows[0],
    });
  } catch (error) {
    console.error('[Salvo CV] Oluşturma hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. CV kaydedilemedi.',
    });
  }
};

/**
 * Giriş yapmış kullanıcının tüm CV'lerini listeler.
 */
const getMyCvs = async (req, res) => {
  try {
    const kullanici_id = req.user.id;

    const sonuc = await pool.query(
      `SELECT * FROM cvler
       WHERE kullanici_id = $1
       ORDER BY olusturulma_tarihi DESC`,
      [kullanici_id]
    );

    return res.status(200).json({
      durum: 'Başarılı',
      mesaj: 'CV listesi getirildi.',
      cvler: sonuc.rows,
    });
  } catch (error) {
    console.error('[Salvo CV] Listeleme hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. CV listesi getirilemedi.',
    });
  }
};

/**
 * Kullanıcıya ait bir CV'nin cv_verisi (JSONB) sütununu günceller.
 */
const updateCv = async (req, res) => {
  try {
    const kullanici_id = req.user.id;
    const { id } = req.params;
    const { cv_verisi } = req.body;

    if (!cv_verisi) {
      return res.status(400).json({
        durum: 'Hata',
        mesaj: 'cv_verisi alanı zorunludur.',
      });
    }

    const sonuc = await pool.query(
      `UPDATE cvler
       SET cv_verisi = $1,
           guncellenme_tarihi = NOW()
       WHERE id = $2 AND kullanici_id = $3
       RETURNING *`,
      [JSON.stringify(cv_verisi), id, kullanici_id]
    );

    if (sonuc.rows.length === 0) {
      return res.status(404).json({
        durum: 'Hata',
        mesaj: 'CV bulunamadı veya bu işlem için yetkiniz yok.',
      });
    }

    return res.status(200).json({
      durum: 'Başarılı',
      mesaj: 'CV başarıyla güncellendi.',
      cv: sonuc.rows[0],
    });
  } catch (error) {
    console.error('[Salvo CV] Güncelleme hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. CV güncellenemedi.',
    });
  }
};

/**
 * Herkese açık dijital kartvizit.
 * Token doğrulaması yoktur; yalnızca CV UUID'si ile okunur.
 */
const getPublicCv = async (req, res) => {
  try {
    const { id } = req.params;

    const sonuc = await pool.query(
      `SELECT id, meslek_grubu, cv_verisi, ats_skoru, guncellenme_tarihi
       FROM cvler
       WHERE id = $1`,
      [id]
    );

    if (sonuc.rows.length === 0) {
      return res.status(404).json({
        durum: 'Hata',
        mesaj: 'Kartvizit/CV bulunamadı.',
      });
    }

    return res.status(200).json({
      durum: 'Başarılı',
      mesaj: 'Kartvizit getirildi.',
      cv: sonuc.rows[0],
    });
  } catch (error) {
    console.error('[Salvo CV] Genel kartvizit hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. Kartvizit getirilemedi.',
    });
  }
};

module.exports = {
  createCv,
  getMyCvs,
  updateCv,
  getPublicCv,
};
