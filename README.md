# دليل خدمتك - بورتسودان (Dlilak Port Sudan) 🇸🇩

المنصة الموحدة لربط المهنيين والأسر المنتجة في مدينة بورتسودان، السودان. تهدف المنصة إلى تسهيل الوصول للخدمات المحلية ودعم الاقتصاد المحلي باستخدام تقنيات الذكاء الاصطناعي.

## 🚀 التقنيات المستخدمة

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **AI:** [Google Gemini](https://ai.google.dev/) (تحليل الهويات) & [DeepSeek](https://www.deepseek.com/) (تحليل النصوص)
- **Storage:** [Cloudinary](https://cloudinary.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Deployment:** [Vercel](https://vercel.com/)

## 📁 هيكل المشروع

```text
src/
├── app/          # صفحات التطبيق (Next.js App Router)
├── components/   # المكونات القابلة لإعادة الاستخدام
├── lib/          # الإعدادات والأدوات المساعدة
├── hooks/        # الخطافات المخصصة (Custom Hooks)
├── services/     # خدمات الربط مع APIs (Supabase, AI, Cloudinary)
└── types/        # تعريفات TypeScript
```

## 🛠️ البدء في العمل

1. **استنساخ المستودع:**
   ```bash
   git clone https://github.com/your-username/port-sudan-services.git
   cd port-sudan-services
   ```

2. **تثبيت الحزم:**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة:**
   قم بنسخ `.env.example` إلى `.env.local` وقم بتعبئة القيم المطلوبة.

4. **تشغيل المشروع:**
   ```bash
   npm run dev
   ```

## 🧪 الاختبارات

- **Unit Tests:** `npm test`
- **E2E Tests:** `npm run test:e2e`

## 📄 التراخيص

هذا المشروع مرخص تحت رخصة MIT.
