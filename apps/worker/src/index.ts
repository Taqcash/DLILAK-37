import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// --- Types & Bindings ---
type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  AI: any;
  JWT_SECRET: string;
};

type Variables = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- Middlewares ---
app.use('/api/*', cors());
app.use('*', logger());

// --- Helpers: Crypto & JWT (Pure Web Crypto API) ---

/**
 * تشفير كلمة المرور باستخدام SHA-256
 */
async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء JWT Token يدوياً
 */
async function signJWT(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
  return `${data}.${encodedSignature}`;
}

/**
 * التحقق من JWT Token
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
  const [header, payload, signature] = token.split('.');
  const data = `${header}.${payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  
  const sigUint8 = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const isValid = await crypto.subtle.verify('HMAC', key, sigUint8, encoder.encode(data));
  
  if (!isValid) return null;
  return JSON.parse(atob(payload));
}

// --- Auth Middleware ---
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'غير مصرح لك بالدخول - يرجى تسجيل الدخول أولاً' }, 401);
  }
  
  const token = authHeader.split(' ')[1];
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'انتهت صلاحية الجلسة - يرجى تسجيل الدخول مرة أخرى' }, 401);
  }
  
  c.set('user', { id: payload.sub, email: payload.email, name: payload.name });
  await next();
};

// --- Routes: Auth ---

app.post('/api/auth/sign-up', zValidator('json', z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
})), async (c) => {
  const { email, password, name } = c.req.valid('json');
  
  // التحقق من وجود المستخدم
  const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existingUser) {
    return c.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, 400);
  }
  
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, email, passwordHash, name, now, now).run();
  
  return c.json({ success: true, message: 'تم إنشاء الحساب بنجاح' });
});

app.post('/api/auth/sign-in', zValidator('json', z.object({
  email: z.string().email(),
  password: z.string()
})), async (c) => {
  const { email, password } = c.req.valid('json');
  const passwordHash = await hashPassword(password);
  
  const user: any = await c.env.DB.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?')
    .bind(email, passwordHash).first();
    
  if (!user) {
    return c.json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }, 401);
  }
  
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 أيام
  };
  
  const token = await signJWT(payload, c.env.JWT_SECRET);
  
  return c.json({
    token,
    user: { id: user.id, email: user.email, name: user.name }
  });
});

app.get('/api/auth/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const dbUser = await c.env.DB.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?')
    .bind(user.id).first();
  return c.json(dbUser);
});

// --- Routes: AI ---

app.post('/api/ai/chat', zValidator('json', z.object({
  prompt: z.string().min(1)
})), async (c) => {
  const { prompt } = c.req.valid('json');
  try {
    const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { prompt });
    return c.json({ response: response.response });
  } catch (err: any) {
    return c.json({ error: 'فشل في معالجة طلب الذكاء الاصطناعي', details: err.message }, 500);
  }
});

// --- Routes: R2 Upload ---

app.post('/api/upload-url', zValidator('json', z.object({
  filename: z.string(),
  contentType: z.string()
})), async (c) => {
  const { filename, contentType } = c.req.valid('json');
  const key = `${crypto.randomUUID()}-${filename}`;
  
  // ملاحظة: R2 في Workers لا يدعم createSignedUrl مباشرة عبر الـ Binding حالياً.
  // الطريقة المتبعة هي استخدام S3 API أو رفع مباشر عبر Worker.
  // سنقوم هنا بإرجاع مفتاح الرفع ورابط العرض العام.
  const publicUrl = `https://pub-port-sudan.r2.dev/${key}`;
  
  return c.json({
    key,
    publicUrl,
    message: 'يرجى استخدام PUT لرفع الملف مباشرة إلى هذا المفتاح عبر الـ Worker أو S3 API'
  });
});

// --- Routes: Ads (CRUD) ---

app.get('/api/ads', async (c) => {
  const page = Number(c.req.query('page')) || 1;
  const limit = Number(c.req.query('limit')) || 10;
  const offset = (page - 1) * limit;
  
  const ads = await c.env.DB.prepare(
    'SELECT * FROM ads WHERE status = "active" ORDER BY is_premium DESC, created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();
  
  return c.json(ads.results);
});

app.post('/api/ads', authMiddleware, zValidator('json', z.object({
  title: z.string().min(3),
  description: z.string(),
  profession: z.string(),
  neighborhood: z.string(),
  price: z.number(),
  image_url: z.string().optional()
})), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await c.env.DB.prepare(
    `INSERT INTO ads (id, user_id, title, description, profession, neighborhood, price, image_url, status, is_premium, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?)`
  ).bind(id, user.id, data.title, data.description, data.profession, data.neighborhood, data.price, data.image_url || null, now, now).run();
  
  return c.json({ success: true, id });
});

app.get('/api/ads/:id', async (c) => {
  const id = c.req.param('id');
  const ad = await c.env.DB.prepare('SELECT * FROM ads WHERE id = ?').bind(id).first();
  if (!ad) return c.json({ error: 'الإعلان غير موجود' }, 404);
  return c.json(ad);
});

app.put('/api/ads/:id', authMiddleware, zValidator('json', z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  status: z.enum(['active', 'sold', 'expired']).optional()
})), async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  // التحقق من الملكية
  const ad: any = await c.env.DB.prepare('SELECT user_id FROM ads WHERE id = ?').bind(id).first();
  if (!ad) return c.json({ error: 'الإعلان غير موجود' }, 404);
  if (ad.user_id !== user.id) return c.json({ error: 'غير مسموح لك بتعديل هذا الإعلان' }, 403);
  
  const now = new Date().toISOString();
  await c.env.DB.prepare(
    'UPDATE ads SET title = COALESCE(?, title), description = COALESCE(?, description), price = COALESCE(?, price), status = COALESCE(?, status), updated_at = ? WHERE id = ?'
  ).bind(data.title, data.description, data.price, data.status, now, id).run();
  
  return c.json({ success: true });
});

app.delete('/api/ads/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  
  const ad: any = await c.env.DB.prepare('SELECT user_id FROM ads WHERE id = ?').bind(id).first();
  if (!ad) return c.json({ error: 'الإعلان غير موجود' }, 404);
  if (ad.user_id !== user.id) return c.json({ error: 'غير مسموح لك بحذف هذا الإعلان' }, 403);
  
  await c.env.DB.prepare('DELETE FROM ads WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// --- Routes: Wallet ---

const walletApp = new Hono<{ Bindings: Bindings; Variables: Variables }>();

walletApp.use('*', authMiddleware);

walletApp.get('/balance', async (c) => {
  const user = c.get('user');
  let wallet: any = await c.env.DB.prepare('SELECT balance FROM user_wallets WHERE user_id = ?').bind(user.id).first();
  
  if (!wallet) {
    // إنشاء محفظة لو ما موجودة
    await c.env.DB.prepare('INSERT INTO user_wallets (user_id, balance) VALUES (?, 0)').bind(user.id).run();
    wallet = { balance: 0 };
  }
  
  return c.json(wallet);
});

walletApp.post('/deposit', zValidator('json', z.object({
  amount: z.number().positive(),
  payment_method: z.string(),
  slip_image_url: z.string().url()
})), async (c) => {
  const user = c.get('user');
  const { amount, payment_method, slip_image_url } = c.req.valid('json');
  const id = crypto.randomUUID();
  
  await c.env.DB.prepare(
    'INSERT INTO deposit_requests (id, user_id, amount, payment_method, slip_image_url) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, user.id, amount, payment_method, slip_image_url).run();
  
  return c.json({ success: true, id });
});

walletApp.post('/transfer', zValidator('json', z.object({
  to_user_id: z.string(),
  amount: z.number().positive(),
  description: z.string().optional()
})), async (c) => {
  const user = c.get('user');
  const { to_user_id, amount, description } = c.req.valid('json');
  
  // التحقق من الرصيد
  const senderWallet: any = await c.env.DB.prepare('SELECT balance FROM user_wallets WHERE user_id = ?').bind(user.id).first();
  if (!senderWallet || senderWallet.balance < amount) {
    return c.json({ error: 'رصيدك غير كافٍ لإتمام هذه العملية' }, 400);
  }
  
  const receiverWallet: any = await c.env.DB.prepare('SELECT balance FROM user_wallets WHERE user_id = ?').bind(to_user_id).first();
  if (!receiverWallet) {
    return c.json({ error: 'المستلم غير موجود أو ليس لديه محفظة نشطة' }, 404);
  }

  const txId1 = crypto.randomUUID();
  const txId2 = crypto.randomUUID();
  
  // تنفيذ العملية بشكل ذري (Atomic)
  try {
    await c.env.DB.batch([
      // خصم من المرسل
      c.env.DB.prepare('UPDATE user_wallets SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(amount, user.id),
      // إضافة للمستلم
      c.env.DB.prepare('UPDATE user_wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?').bind(amount, to_user_id),
      // تسجيل العمليات
      c.env.DB.prepare('INSERT INTO transactions (id, user_id, type, amount, balance_before, balance_after, description) VALUES (?, ?, "transfer_out", ?, ?, ?, ?)')
        .bind(txId1, user.id, amount, senderWallet.balance, senderWallet.balance - amount, description || 'تحويل صادق'),
      c.env.DB.prepare('INSERT INTO transactions (id, user_id, type, amount, balance_before, balance_after, description) VALUES (?, ?, "transfer_in", ?, ?, ?, ?)')
        .bind(txId2, to_user_id, amount, receiverWallet.balance, receiverWallet.balance + amount, description || 'تحويل وارد')
    ]);
    
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: 'فشل في إتمام عملية التحويل', details: err.message }, 500);
  }
});

walletApp.get('/transactions', async (c) => {
  const user = c.get('user');
  const txs = await c.env.DB.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').bind(user.id).all();
  return c.json(txs.results);
});

walletApp.post('/ai/verify-slip', zValidator('json', z.object({
  image_url: z.string().url()
})), async (c) => {
  const { image_url } = c.req.valid('json');
  
  try {
    // جلب الصورة وتحويلها لـ base64 أو استخدام الرابط مباشرة لو النموذج يدعم
    // هنا سنستخدم نموذج Vision لتحليل البيانات
    const response = await c.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      prompt: "حلل صورة إيصال الدفع هذه واستخرج: المبلغ، رقم المرجع، التاريخ، واسم البنك. أرجع النتيجة بصيغة JSON فقط.",
      image: image_url // ملاحظة: قد تحتاج لتحميل الصورة أولاً وتمريرها كـ Buffer حسب إصدار الـ SDK
    });
    
    return c.json({ analysis: response });
  } catch (err: any) {
    return c.json({ error: 'فشل في تحليل الإيصال ذكياً', details: err.message }, 500);
  }
});

app.route('/api/wallet', walletApp);

export default app;
