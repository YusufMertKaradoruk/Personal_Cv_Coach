const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';

const SYSTEM_PROMPT =
  "Sen uluslararası standartlarda, objektif ve acımasız bir Kurumsal İK Uzmanısın. Amacın, adayın CV'sini ATS (Aday Takip Sistemi) standartlarına göre analiz etmek. Eksikleri (eksik linkler, belirsiz teknolojiler vb.) ve sektörel tavsiyeleri doğrudan söyle. Kesinlikle hayal ürünü sertifikalar önerme. Yanıtını sadece geçerli bir JSON nesnesi olarak döndür.";

/**
 * Yerel Ollama modeline CV JSONB verisini gönderir ve ATS analizini döner.
 */
const analyzeCvWithLocalAI = async (cvData) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000);

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: 'json',
        think: false,
        system: SYSTEM_PROMPT,
        prompt: `Aşağıdaki CV verisini analiz et ve JSON formatında ATS skoru (100 üzerinden), eksikler ve öneriler listesi dön:\n\n${JSON.stringify(cvData)}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama yanıt hatası: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.response || data.thinking;

    if (!raw) {
      throw new Error('Ollama boş yanıt döndü.');
    }

    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  analyzeCvWithLocalAI,
};
