const { Pool } = require('pg');

// PostgreSQL bağlantı havuzu (.env üzerinden okunur)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Veritabanı bağlantısını test eder.
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('[Salvo DB] PostgreSQL veritabanına başarıyla bağlanıldı! 🐘');
    client.release();
  } catch (error) {
    console.error('[Salvo DB] PostgreSQL bağlantı hatası:', error);
  }
};

module.exports = {
  pool,
  connectDB,
};
