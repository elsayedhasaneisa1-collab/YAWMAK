const ALLOWED_ORIGINS = new Set([
  'https://yawmak.vercel.app'
]);

function clean(value, max = 100) {
  return String(value || '').replace(/[<>`]/g, '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const origin = req.headers.origin || '';
  if (!ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(500).json({ ok: false });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const type = body.type === 'name_saved' ? 'name_saved' : body.type === 'visit' ? 'visit' : '';
  if (!type) return res.status(400).json({ ok: false });

  const name = clean(body.name, 30);
  const page = clean(body.page, 80) || '/';
  const time = new Intl.DateTimeFormat('ar-EG', {
    timeZone: 'Africa/Cairo',
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date());

  const message = type === 'name_saved'
    ? `📝 تم تسجيل اسم جديد في يومك\nالاسم: ${name || 'غير محدد'}\nالصفحة: ${page}\nالوقت: ${time}`
    : `👋 زائر جديد دخل يومك\nالاسم المحفوظ: ${name || 'لم يسجل اسمه بعد'}\nالصفحة: ${page}\nالوقت: ${time}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    if (!response.ok) return res.status(502).json({ ok: false });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false });
  }
};
