'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Info, Sparkles, ShieldCheck, CheckCircle2, MapPin, TrendingUp, Activity, Zap, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { generatePortSudanImages } from '@/services/imageService';

export default function AboutPage() {
  const [aboutImage, setAboutImage] = useState<string | null>(null);

  useEffect(() => {
    const cachedImage = localStorage.getItem('about_ai_image');
    if (cachedImage) {
      setAboutImage(cachedImage);
    } else {
      generatePortSudanImages().then(res => {
        if (res.aboutImage) {
          setAboutImage(res.aboutImage);
          localStorage.setItem('about_ai_image', res.aboutImage);
        }
      });
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-[60px] overflow-hidden shadow-2xl border border-gray-100 group">
        <div className="absolute inset-0 z-0">
          <Image 
            src={aboutImage || "https://picsum.photos/seed/port-sudan-city/1920/1080"} 
            className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-1000" 
            referrerPolicy="no-referrer"
            alt="Port Sudan"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <span className="px-6 py-2 bg-burgundy/20 text-burgundy rounded-full text-xs font-black uppercase tracking-widest border border-burgundy/30 backdrop-blur-md">
              ثغر السودان الباسم 🇸🇩
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter">بورتسودان <br /> <span className="text-burgundy">المدينة والمنصة</span></h1>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl font-black leading-tight tracking-tighter">رؤيتنا لمنصة <br /> <span className="text-burgundy">دليل خدمتك</span></h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              نسعى لأن نكون الجسر الرقمي الذي يربط بين الكفاءات المهنية المبدعة في بورتسودان وبين كل من يحتاج لخدمة موثوقة وعالية الجودة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'الشفافية', desc: 'نظام تقييم حقيقي يعكس جودة الخدمة.', icon: <Activity className="text-burgundy" /> },
              { title: 'الثقة', desc: 'توثيق ميداني ورقمي لجميع المهنيين.', icon: <ShieldCheck className="text-emerald-600" /> },
              { title: 'الابتكار', desc: 'استخدام الذكاء الاصطناعي لتسهيل البحث.', icon: <Sparkles className="text-amber-500" /> },
              { title: 'المجتمع', desc: 'دعم الأسر المنتجة والمشاريع المحلية.', icon: <Heart className="text-rose-500" /> }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-[40px] shadow-xl border border-gray-100 space-y-4 group"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="text-sm text-gray-400 font-bold leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square bg-burgundy rounded-[80px] overflow-hidden shadow-2xl group">
          <Image 
            src="https://picsum.photos/seed/port-sudan-port/1000/1000" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" 
            referrerPolicy="no-referrer"
            alt="Port Sudan Port"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy/90 via-transparent to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 space-y-4">
            <p className="text-4xl font-black text-white leading-tight">بورتسودان: <br /> العاصمة البديلة والقلب النابض</p>
            <p className="text-burgundy/20 font-medium">تعد بورتسودان اليوم المركز الاقتصادي والإداري الأهم في السودان، ومن هنا انطلقت فكرة المنصة لتنظيم سوق العمل المحلي.</p>
          </div>
        </div>
      </section>

      {/* Port Sudan Facts */}
      <section className="bg-gray-900 p-20 rounded-[80px] text-white space-y-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-burgundy/10 to-transparent pointer-events-none" />
        <div className="relative z-10 text-center space-y-4">
          <h2 className="text-4xl font-black">حقائق عن بورتسودان</h2>
          <p className="text-gray-400 font-medium">تعرف أكثر على المدينة التي نخدمها بكل فخر.</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: 'تأسست عام', val: '١٩٠٥', desc: 'بنيت كبديل لميناء سواكن التاريخي.' },
            { label: 'أهم المعالم', val: 'الميناء الأخضر', desc: 'أكبر ميناء في السودان ومنطقة البحر الأحمر.' },
            { label: 'المناخ', val: 'ساحلي', desc: 'تتميز بطقس معتدل شتاءً وحار رطباً صيفاً.' }
          ].map((fact, i) => (
            <div key={i} className="text-center space-y-4 p-8 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-md">
              <p className="text-xs font-black text-burgundy uppercase tracking-[0.2em]">{fact.label}</p>
              <p className="text-5xl font-black text-white">{fact.val}</p>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">{fact.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-burgundy p-20 rounded-[80px] text-white text-center space-y-12 relative overflow-hidden shadow-2xl group">
        <Sparkles className="absolute -top-12 -right-12 opacity-20 group-hover:rotate-45 transition-transform duration-1000" size={240} />
        <div className="relative z-10 space-y-8">
          <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">كن جزءاً من <br /> قصة نجاحنا</h2>
          <p className="text-xl text-burgundy/20 font-medium max-w-2xl mx-auto leading-relaxed">
            سواء كنت صاحب مهنة، أسرة منتجة، أو تبحث عن خدمة، &quot;دليل خدمتك&quot; هو مكانك الأمثل في بورتسودان.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/sign-up" className="bg-white text-burgundy px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4">
              <Zap size={24} /> انضم إلينا الآن
            </Link>
            <Link href="/" className="bg-burgundy/80 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-burgundy transition-all flex items-center justify-center gap-4">
              <ArrowRight size={24} /> تصفح الخدمات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Credits */}
      <footer className="text-center py-12 space-y-4">
        <div className="flex justify-center gap-6">
          <a href="#" className="text-gray-400 hover:text-burgundy transition-colors font-black text-sm">سياسة الخصوصية</a>
          <a href="#" className="text-gray-400 hover:text-burgundy transition-colors font-black text-sm">شروط الاستخدام</a>
          <a href="#" className="text-gray-400 hover:text-burgundy transition-colors font-black text-sm">تواصل معنا</a>
        </div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">© ٢٠٢٦ دليل خدمتك - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}
