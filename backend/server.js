
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors({
  origin: 'https://qqwox1337.github.io'
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype === 'image/jpeg');
  }
});

app.get('/', (req, res) => {
  res.send('Photo API is running');
});

app.post('/api/send-photo', upload.single('photo'), async (req, res) => {
  try {
    const token = process.env.TG_TOKEN;
    const chatId = process.env.TG_CHAT_ID;

    if (!token || !chatId || !req.file) {
      return res.status(400).json({
        ok: false,
        error: 'Missing configuration or photo'
      });
    }

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append(
      'photo',
      new Blob([req.file.buffer], { type: 'image/jpeg' }),
      'snapshot.jpg'
    );

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: 'POST', body: form }
    );

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      return res.status(502).json({
        ok: false,
        error: 'Telegram rejected the photo'
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: 'Server error'
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('API server started');
});

