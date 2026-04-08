import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-12 rtl">
      <h1 className="text-4xl font-black text-burgundy">سياسة الخصوصية</h1>
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <p>نحن في &quot;دليل خدمتك&quot; نلتزم بحماية خصوصيتك وبياناتك الشخصية.</p>
        
        <h2 className="text-2xl font-bold">1. البيانات التي نجمعها</h2>
        <p>نجمع البيانات التي تقدمها لنا عند التسجيل، مثل الاسم، رقم الهاتف، والبريد الإلكتروني.</p>
        
        <h2 className="text-2xl font-bold">2. كيف نستخدم بياناتك</h2>
        <p>نستخدم بياناتك لتحسين خدماتنا، وتسهيل التواصل بين مقدمي الخدمات وطالبيها في بورتسودان.</p>
        
        <h2 className="text-2xl font-bold">3. حماية البيانات</h2>
        <p>نستخدم تقنيات متقدمة لحماية بياناتك من الوصول غير المصرح به.</p>
      </div>
    </div>
  );
}
