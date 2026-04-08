'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/providers';
import Link from "next/link";
import { Search, Sparkles, MapPin, Briefcase, Zap, Star, ArrowRight, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { AdService } from '@/services/adService';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { Ad } from '@/types';

/**
 * LandingPage - الصفحة الرئيسية
 * تم إعادة بنائها بنمط Claw لتكون "Dumb UI" تعتمد على Hooks
 */
import { NavigationHeader } from '@/components/Navigation';
import SEO from '@/components/SEO';
import { Profile } from '@/types';

export default function LandingPage() {
  const [query, setQuery] = useState('');
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  
  const { ads, loading, isSearching, search, setAds } = useSmartSearch();

  const fetchInitialAds = useCallback(async () => {
    const { data } = await AdService.fetchAds({ status: 'active', limit: 6 });
    if (data) setAds(data);
  }, [setAds]);

  useEffect(() => {
    fetchInitialAds();
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchInitialAds, supabase]);

  const handleSmartSearch = async () => {
    const smartFilters = await search(query);
    if (smartFilters) {
      alert(`تم تطبيق الفلاتر الذكية: ${smartFilters.profession} في ${smartFilters.neighborhood}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <SEO />
      <NavigationHeader 
        userProfile={userProfile} 
        notifications={[]} 
        onShowNotifications={() => {}} 
      />

      <main className="flex-1">
        <section className="py-24 px-6 text-center space-y-12 bg-gradient-to-b from-burgundy/5 to-white dark:from-burgundy/10 dark:to-gray-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-burgundy/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-burgundy/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
              <span className="px-4 py-2 bg-burgundy/10 text-burgundy rounded-full text-xs font-black uppercase tracking-widest border border-burgundy/10 mb-6 inline-block">
                ثغر السودان الباسم 🇸🇩
              </span>
              <h2 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">
                خدمات <span className="text-burgundy">بورتسودان</span> <br /> في متناول يدك
              </h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto mt-8">
                المنصة الموحدة لربط المهنيين والأسر المنتجة في قلب البحر الأحمر. ابحث، تواصل، وانجز مهامك بذكاء.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ y: 30, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-3 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3 relative z-10"
          >
            <div className="flex-1 relative">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ابحث بذكاء.. (مثلاً: سباك في حي المطار)" 
                className="w-full pr-16 pl-6 py-5 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-burgundy outline-none font-bold text-lg text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <button 
              onClick={handleSmartSearch}
              disabled={isSearching || !query.trim()}
              className="bg-burgundy text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-burgundy/90 transition-all shadow-xl disabled:opacity-50"
            >
              {isSearching ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Sparkles size={24} /> بحث ذكي</>}
            </button>
          </motion.div>
        </section>

        {/* Featured Ads Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 space-y-12">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">أحدث <span className="text-burgundy">الخدمات</span></h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">اكتشف أفضل العروض والطلبات في مدينتك</p>
            </div>
            <Link href="/forum" className="text-burgundy font-black flex items-center gap-2 hover:underline">
              عرض الكل <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-gray-50 dark:bg-gray-800 rounded-[40px] animate-pulse border border-gray-100 dark:border-gray-700" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {ads.map((ad) => (
                  <motion.div 
                    key={ad.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 group hover:shadow-2xl transition-all"
                  >
                    <Link href={`/services/${ad.id}`}>
                      <div className="h-64 relative overflow-hidden">
                        <Image src={ad.image_url || "https://picsum.photos/seed/service/600/400"} className="object-cover group-hover:scale-110 transition-transform duration-700" alt={ad.title} fill />
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                          {ad.is_premium && (
                            <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                              <Star size={12} fill="currentColor" /> مميز
                            </span>
                          )}
                          <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-gray-900 dark:text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            {ad.profession}
                          </span>
                        </div>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-burgundy transition-colors line-clamp-1">{ad.title}</h3>
                          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm line-clamp-2 leading-relaxed">{ad.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                              <Image src={ad.profiles?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="object-cover" alt={ad.profiles?.full_name || 'User'} fill />
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-900 dark:text-white">{ad.profiles?.full_name}</p>
                              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><MapPin size={10} /> {ad.neighborhood}</p>
                            </div>
                          </div>
                          <p className="text-xl font-black text-burgundy">{ad.price} <span className="text-[10px] text-gray-400">ج.س</span></p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 dark:bg-gray-800/50 py-24 transition-colors">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="p-10 bg-white dark:bg-gray-800 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-700 hover:border-burgundy transition-all group">
              <div className="w-16 h-16 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">مهنيين موثقين</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">نخبة من أفضل الصناع والمهنيين في بورتسودان، تم التحقق من هويتهم وكفاءتهم ميدانياً.</p>
            </div>
            
            <div className="p-10 bg-white dark:bg-gray-800 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-700 hover:border-burgundy transition-all group">
              <div className="w-16 h-16 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">تغطية شاملة</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">نغطي كافة أحياء المدينة، من حي المطار إلى وسط المدينة، لضمان سرعة الوصول وجودة الخدمة.</p>
            </div>

            <div className="p-10 bg-white dark:bg-gray-800 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-700 hover:border-burgundy transition-all group">
              <div className="w-16 h-16 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">ذكاء اصطناعي</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">نستخدم تقنيات Gemini لتحليل طلباتك وتقديم أفضل التوصيات بدقة متناهية لتوفير وقتك وجهدك.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-16 px-6 text-center space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-burgundy rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">د</div>
          <h2 className="text-3xl font-black tracking-tighter">دليل خدمتك</h2>
        </div>
        <div className="flex justify-center gap-8">
          <Link href="/forum" className="text-gray-400 hover:text-white transition-colors font-bold">المنتدى</Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors font-bold">عن بورتسودان</Link>
          <Link href="/profile" className="text-gray-400 hover:text-white transition-colors font-bold">الملف الشخصي</Link>
        </div>
        <p className="text-gray-500 text-sm font-bold">© ٢٠٢٦ ثغر السودان الباسم. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
