import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-12 rtl">
      <h1 className="text-4xl font-black text-burgundy">شروط الخدمة</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p>باستخدامك لمنصة &quot;دليل خدمتك&quot;، فإنك توافق على الالتزام بالشروط التالية:</p>
        
        <h2 className="text-2xl font-bold">1. الاستخدام المقبول</h2>
        <p>يجب استخدام المنصة لأغراض قانونية فقط وفي إطار تبادل الخدمات المهنية.</p>
        
        <h2 className="text-2xl font-bold">2. مسؤولية المحتوى</h2>
        <p>المستخدم مسؤول مسؤولية كاملة عن دقة المعلومات التي ينشرها في إعلاناته.</p>
        
        <h2 className="text-2xl font-bold">3. إخلاء المسؤولية</h2>
        <p>المنصة هي وسيط فقط ولا تضمن جودة الخدمات المقدمة من قبل المهنيين.</p>
      </div>
    </div>
  );
}
