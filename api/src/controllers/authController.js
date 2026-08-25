const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Kullanıcı kayıt işlemi
 */
const register = async (req, res) => {
  try {
    const { ad_soyad, email, sifre } = req.body;

    if (!ad_soyad || !email || !sifre) {
      return res.status(400).json({
        durum: 'Hata',
        mesaj: 'ad_soyad, email ve sifre alanları zorunludur.',
      });
    }

    // Email daha önce kayıtlı mı?
    const mevcutKullanici = await pool.query(
      'SELECT id FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (mevcutKullanici.rows.length > 0) {
      return res.status(400).json({
        durum: 'Hata',
        mesaj: 'Bu e-posta adresi zaten kayıtlı.',
      });
    }

    // Şifreyi hash'le
    const sifre_hash = await bcrypt.hash(sifre, 10);

    // Yeni kullanıcıyı kaydet
    const sonuc = await pool.query(
      `INSERT INTO kullanicilar (ad_soyad, email, sifre_hash)
       VALUES ($1, $2, $3)
       RETURNING id, ad_soyad, email, kayit_tarihi`,
      [ad_soyad, email, sifre_hash]
    );

    const kullanici = sonuc.rows[0];

    // JWT token üret
    const token = jwt.sign(
      { id: kullanici.id, email: kullanici.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      durum: 'Başarılı',
      mesaj: 'Kayıt işlemi tamamlandı.',
      token,
      kullanici: {
        id: kullanici.id,
        ad_soyad: kullanici.ad_soyad,
        email: kullanici.email,
      },
    });
  } catch (error) {
    console.error('[Salvo Auth] Kayıt hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. Kayıt işlemi tamamlanamadı.',
    });
  }
};

/**
 * Kullanıcı giriş işlemi
 */
const login = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({
        durum: 'Hata',
        mesaj: 'email ve sifre alanları zorunludur.',
      });
    }

    // Kullanıcıyı bul
    const sonuc = await pool.query(
      'SELECT id, ad_soyad, email, sifre_hash FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (sonuc.rows.length === 0) {
      return res.status(401).json({
        durum: 'Hata',
        mesaj: 'E-posta veya şifre hatalı.',
      });
    }

    const kullanici = sonuc.rows[0];

    // Şifreyi doğrula
    const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre_hash);

    if (!sifreDogruMu) {
      return res.status(401).json({
        durum: 'Hata',
        mesaj: 'E-posta veya şifre hatalı.',
      });
    }

    // JWT token üret
    const token = jwt.sign(
      { id: kullanici.id, email: kullanici.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      durum: 'Başarılı',
      mesaj: 'Giriş başarılı.',
      token,
      kullanici: {
        id: kullanici.id,
        ad_soyad: kullanici.ad_soyad,
        email: kullanici.email,
      },
    });
  } catch (error) {
    console.error('[Salvo Auth] Giriş hatası:', error);
    return res.status(500).json({
      durum: 'Hata',
      mesaj: 'Sunucu hatası. Giriş işlemi tamamlanamadı.',
    });
  }
};

module.exports = {
  register,
  login,
};
