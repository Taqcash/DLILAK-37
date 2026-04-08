'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowRight, 
  Share2, 
  AlertCircle, 
  Briefcase, 
  MapPin, 
  Star, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MessageSquare, 
  Zap, 
  TrendingUp, 
  Activity, 
  Sparkles,
  X,
  Send,
  Plus,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { AdService } from '@/services/adService';
import { RatingService } from '@/services/ratingService';
import { AIService } from '@/services/aiService';
import { ContactAdminModal } from '@/components/Modals';
import ReactMarkdown from 'react-markdown';

/**
 * ServiceDetailPage - صفحة تفاصيل الخدمة
 * تم تقسيم المنطق إلى AdService و RatingService بنمط Claw
 */
export default function ServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [ad, setAd] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [adRes, ratingsRes] = await Promise.all([
        AdService.getAd(id),
        RatingService.fetchRatings(id)
      ]);
      
      if (adRes.data) setAd(adRes.data);
      if (ratingsRes.data) setRatings(ratingsRes.data);
    } catch (e) {
      console.error("Error fetching service detail:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleAddRating = async () => {
    if (!user || !id) return;
    setIsSubmittingRating(true);
    try {
      await RatingService.addRating(id, user.id, rating, comment);
      alert('تم إضافة تقييمك بنجاح!');
      setShowRatingModal(false);
      fetchData(); // Refresh
    } catch (e: any) {
      alert('فشل إضافة التقييم: ' + e.message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.description,
          url: window.location.href
        });
      } catch (e) {
        console.error("Share failed:", e);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-6">
        <AlertCircle size={64} className="text-rose-500" />
        <h2 className="text-3xl font-black">الإعلان غير موجود</h2>
        <button onClick={() => router.push('/')} className="bg-burgundy text-white px-8 py-3 rounded-2xl font-black shadow-lg">العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 font-bold hover:text-burgundy transition-all">
          <ArrowRight size={20} /> العودة للنتائج
        </button>
        <div className="flex gap-3">
          <button onClick={handleShare} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-burgundy transition-all group">
            <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-rose-600 transition-all group">
            <AlertCircle size={20} className="group-hover:shake transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-8 space-y-12">
          <section className="bg-white rounded-[60px] overflow-hidden shadow-2xl border border-gray-100">
            <div className="h-[500px] relative">
              <Image src={ad.image_url || "https://picsum.photos/seed/service/1200/800"} className="object-cover" referrerPolicy="no-referrer" alt={ad.title} fill priority />
              <div className="absolute top-8 right-8 z-10 flex gap-3">
                {ad.is_premium && (
                  <span className="bg-amber-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                    <Sparkles size={16} /> إعلان مميز
                  </span>
                )}
                <span className="bg-white/90 backdrop-blur-md text-gray-900 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">
                  {ad.profession}
                </span>
              </div>
            </div>

            <div className="p-12 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black leading-tight tracking-tighter">{ad.title}</h1>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-gray-400 font-bold text-sm"><MapPin size={16} /> {ad.neighborhood}</span>
                    <span className="flex items-center gap-1 text-gray-400 font-bold text-sm"><Briefcase size={16} /> {ad.profession}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-4xl font-black text-burgundy">{ad.price} <span className="text-sm text-gray-400">ج.س</span></p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">سعر تقديري</p>
                </div>
              </div>

              <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 text-gray-900"><Info size={24} className="text-burgundy" /> تفاصيل الخدمة</h3>
                <p className="text-lg font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ad.description}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-4">
                {ad.is_productive && (
                  <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-black text-sm">
                    <Zap size={18} /> أسرة منتجة
                  </div>
                )}
                {ad.is_training && (
                  <div className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 flex items-center gap-3 font-black text-sm">
                    <TrendingUp size={18} /> فرصة تدريب
                  </div>
                )}
                <div className="px-6 py-3 bg-burgundy/5 text-burgundy rounded-2xl border border-burgundy/10 flex items-center gap-3 font-black text-sm">
                  <ShieldCheck size={18} /> خدمة موثقة
                </div>
              </div>
            </div>
          </section>

          {/* Ratings Section */}
          <section className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-12">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black flex items-center gap-4"><Star className="text-amber-400" /> التقييمات والآراء</h2>
              <button 
                onClick={() => setShowRatingModal(true)}
                className="bg-burgundy text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center gap-3"
              >
                <Plus size={20} /> أضف تقييمك
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-10 bg-gray-50 rounded-[40px] text-center space-y-4 border border-gray-100">
                <p className="text-6xl font-black text-gray-900">{ad.avg_rating?.toFixed(1) || '0.0'}</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={s <= (ad.avg_rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">بناءً على {ratings.length} تقييم</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} className="flex items-center gap-4">
                    <span className="text-xs font-black text-gray-400 w-4">{s}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${(ratings.filter(r => r.rating === s).length / (ratings.length || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-black text-gray-400 w-8">{Math.round((ratings.filter(r => r.rating === s).length / (ratings.length || 1)) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {ratings.map(r => (
                <div key={r.id} className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4 group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image src={r.profiles?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="rounded-2xl object-cover border-2 border-white shadow-md" alt={r.profiles?.full_name || 'User'} fill />
                      </div>
                      <div>
                        <p className="text-sm font-black group-hover:text-burgundy transition-colors">{r.profiles?.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{new Date(r.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed">{r.comment}</p>
                </div>
              ))}
              {ratings.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-bold">لا توجد تقييمات بعد. كن أول من يقيم!</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Profile & Contact */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 space-y-8 sticky top-28">
            <div className="text-center space-y-6">
              <div className="relative inline-block group">
                <div className="w-32 h-32 relative rounded-[32px] overflow-hidden border-8 border-gray-50 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <Image src={ad.profiles?.avatar_url || "https://picsum.photos/seed/user/200/200"} className="object-cover" alt={ad.profiles?.full_name || 'Provider'} fill />
                </div>
                {ad.profiles?.is_verified && (
                  <div className="absolute -top-3 -right-3 bg-burgundy text-white p-2.5 rounded-2xl shadow-xl border-4 border-white">
                    <ShieldCheck size={20} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black">{ad.profiles?.full_name}</h3>
                <p className="text-gray-400 font-bold flex items-center justify-center gap-2 mt-1">
                  <MapPin size={14} /> {ad.neighborhood}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-3xl text-center border border-gray-100">
                <p className="text-xl font-black text-gray-900">٤.٩</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">تقييم البائع</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-3xl text-center border border-gray-100">
                <p className="text-xl font-black text-gray-900">١٢</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">إعلان نشط</p>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href={`tel:${ad.profiles?.phone || '+249'}`}
                className="w-full bg-burgundy text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-4"
              >
                <Phone size={24} /> اتصل الآن
              </a>
              <button 
                onClick={() => router.push(`/chat/${ad.user_id}`)}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4"
              >
                <MessageSquare size={24} /> مراسلة فورية
              </button>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
              <AlertCircle className="text-amber-600 shrink-0" size={24} />
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                نصيحة: لا تقم بتحويل أي مبالغ مالية قبل معاينة الخدمة أو المنتج على أرض الواقع.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRatingModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[50px] w-full max-w-md p-10 shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">أضف تقييمك</h2>
                <button onClick={() => setShowRatingModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
              </div>
              
              <div className="space-y-8">
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)}
                      className={`p-2 transition-all hover:scale-125 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      <Star size={48} fill={s <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">تعليقك</label>
                  <textarea 
                    rows={4}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="اكتب تجربتك مع هذه الخدمة.." 
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold resize-none"
                  />
                </div>

                <button 
                  onClick={handleAddRating}
                  disabled={isSubmittingRating || !comment.trim()}
                  className="w-full bg-burgundy text-white py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmittingRating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Send size={24} /> إرسال التقييم</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showContactModal && <ContactAdminModal onClose={() => setShowContactModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
