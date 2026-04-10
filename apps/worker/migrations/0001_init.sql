-- ===============================================================
-- مشروع بورتسودان - تهيئة قاعدة البيانات (Cloudflare D1)
-- Migration: 0001_init.sql
-- ===============================================================

-- 1. جدول المستخدمين (users)
-- يخزن بيانات الحسابات والمصادقة
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- المعرف الفريد (UUID)
    email TEXT UNIQUE NOT NULL,                -- البريد الإلكتروني (فريد)
    password_hash TEXT NOT NULL,               -- هاش كلمة المرور (SHA-256)
    name TEXT NOT NULL,                        -- الاسم الكامل
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,  -- تاريخ الإنشاء
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP   -- تاريخ آخر تحديث
);

-- 2. جدول الإعلانات (ads)
-- يخزن إعلانات الخدمات والمهن في بورتسودان
CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,                       -- المعرف الفريد للإعلان
    user_id TEXT NOT NULL,                     -- صاحب الإعلان (مرتبط بجدول المستخدمين)
    title TEXT NOT NULL,                       -- عنوان الإعلان
    description TEXT NOT NULL,                 -- وصف الخدمة بالتفصيل
    profession TEXT NOT NULL,                  -- المهنة (سباك، كهربائي، إلخ)
    neighborhood TEXT NOT NULL,                -- الحي أو المنطقة في بورتسودان
    price INTEGER NOT NULL,                    -- السعر المتوقع أو البداية
    image_url TEXT,                            -- رابط الصورة المخزنة في R2
    status TEXT DEFAULT 'active',              -- حالة الإعلان (active, sold, expired)
    is_premium BOOLEAN DEFAULT 0,              -- هل الإعلان مميز (0 = لا، 1 = نعم)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,  -- تاريخ النشر
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,  -- تاريخ التعديل
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. الفهارس (Indexes) لتحسين سرعة البحث والاستعلام
-- تحسين البحث عن إعلانات مستخدم معين
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);

-- تحسين الفلترة حسب الحالة (نشط/غير نشط)
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);

-- تحسين البحث حسب المهنة (الأكثر استخداماً)
CREATE INDEX IF NOT EXISTS idx_ads_profession ON ads(profession);

-- تحسين البحث حسب المنطقة الجغرافية
CREATE INDEX IF NOT EXISTS idx_ads_neighborhood ON ads(neighborhood);

-- ===============================================================
-- ملاحظة: تم استخدام نوع TEXT للتواريخ ليتناسب مع محرك SQLite في D1
-- يتم التحديث التلقائي لـ updated_at عبر التطبيق (Hono Worker)
-- ===============================================================
