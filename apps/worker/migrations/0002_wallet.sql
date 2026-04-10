-- ===============================================================
-- مشروع بورتسودان - نظام محفظة التمكين (Cloudflare D1)
-- Migration: 0002_wallet.sql
-- ===============================================================

-- 1. جدول محافظ المستخدمين
CREATE TABLE IF NOT EXISTS user_wallets (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 0,                 -- الرصيد بالقرش (لتجنب مشاكل الفواصل العشرية)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. جدول طلبات الشحن
CREATE TABLE IF NOT EXISTS deposit_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_method TEXT,                       -- بنكك، فوري، إلخ
    slip_image_url TEXT,                       -- رابط صورة الإيصال في R2
    status TEXT DEFAULT 'pending',             -- pending, approved, rejected
    admin_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. جدول سجل العمليات المالية
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,                        -- deposit, withdraw, transfer_in, transfer_out, payment
    amount INTEGER NOT NULL,
    balance_before INTEGER,
    balance_after INTEGER,
    description TEXT,
    reference_id TEXT,                         -- معرف خارجي (رقم إيصال أو معرف طلب)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. جدول الإحالات والمكافآت
CREATE TABLE IF NOT EXISTS referral_rewards (
    id TEXT PRIMARY KEY,
    referrer_id TEXT NOT NULL,                 -- الشخص الذي قام بالإحالة
    referred_user_id TEXT NOT NULL,            -- الشخص الجديد
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',             -- pending, paid
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_rewards(referrer_id);
