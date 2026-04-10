# دليل خدمتك - بورتسودان (Dlilak Port Sudan) 🇸🇩

المنصة الموحدة لربط المهنيين والأسر المنتجة في مدينة بورتسودان، السودان. تهدف المنصة إلى تسهيل الوصول للخدمات المحلية ودعم الاقتصاد المحلي باستخدام تقنيات الذكاء الاصطناعي.

## 🚀 التقنيات المستخدمة (Cloudflare Ecosystem)

- **Frontend Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Backend Framework:** [Hono](https://hono.dev/) on Cloudflare Workers
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/) (Object Storage)
- **AI:** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (Llama, Mistral, DeepSeek models)
- **Authentication:** JWT-based self-hosted auth using D1 and Web Crypto API
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (Frontend) + [Cloudflare Workers](https://workers.cloudflare.com/) (Backend)

## 📁 هيكل المشروع (Monorepo with Turborepo)

```text
apps/
├── frontend/      # تطبيق Next.js (الواجهة الأمامية)
│   ├── src/
│   │   ├── app/          # صفحات التطبيق (App Router)
│   │   ├── components/   # المكونات القابلة لإعادة الاستخدام
│   │   ├── lib/          # الأدوات المساعدة و Cloudflare bindings
│   │   ├── hooks/        # الخطافات المخصصة (Custom Hooks)
│   │   ├── services/     # خدمات API و AI
│   │   └── types/        # تعريفات TypeScript
│   └── public/           # الملفات الثابتة
│
├── worker/        # تطبيق Hono (الواجهة الخلفية)
│   ├── src/
│   │   └── index.ts      # نقاط نهاية API
│   ├── migrations/       # ملفات SQL لـ D1
│   └── wrangler.toml     # إعدادات Cloudflare Workers
│
└── packages/      # حزم مشتركة
    ├── shared-types/     # أنواع TypeScript مشتركة
    └── shared-utils/     # دوال مساعدة مشتركة
```

🛠️ متطلبات التشغيل المحلي

· Node.js (v22+)
· npm
· Wrangler CLI (npm install -g wrangler)

🚀 البدء في العمل

1. استنساخ المستودع:
   ```bash
   git clone https://github.com/Taqcash/DLILAK-37.git
   cd DLILAK-37
   ```
2. تثبيت الحزم:
   ```bash
   npm install
   ```
3. إعداد متغيرات البيئة:
   · في apps/frontend، أنشئ ملف .env.local وأضف:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8787
     ```
   · في apps/worker، أنشئ ملف .dev.vars وأضف:
     ```
     JWT_SECRET=your-secret-here
     ```
4. تشغيل قاعدة البيانات محلياً (اختياري):
   ```bash
   npx wrangler d1 execute port-sudan-db --local --file=./apps/worker/migrations/0001_init.sql
   ```
5. تشغيل المشروع محلياً:
   ```bash
   npm run dev
   ```
   · الواجهة الأمامية: http://localhost:3000
   · الواجهة الخلفية: http://localhost:8787

🧪 الاختبارات

· Frontend Unit Tests: npm test --workspace=frontend
· Worker Unit Tests: npm test --workspace=worker

☁️ النشر على Cloudflare

يتم النشر تلقائياً عند الدفع إلى فرع main:

· Frontend: Cloudflare Pages يراقب المستودع ويبني مجلد apps/frontend
· Backend: Cloudflare Workers يراقب المستودع وينشر apps/worker

للنشر اليدوي:

```bash
cd apps/worker && npx wrangler deploy
cd ../frontend && npm run build && npx wrangler pages deploy out --project-name=dlilak
```

📄 التراخيص

هذا المشروع مرخص تحت رخصة MIT.
