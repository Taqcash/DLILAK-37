'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Sparkles, 
  Briefcase, 
  MapPin, 
  Send, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  TrendingUp,
  Activity,
  Zap,
  Filter,
  X,
  Search
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { ForumService } from '@/services/forumService';
import { ProfileService } from '@/services/profileService';
import { AIService } from '@/services/aiService';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@/hooks/useRealtime';
import ReactMarkdown from 'react-markdown';
import { PROFESSIONS, NEIGHBORHOODS } from '@/lib/constants';

/**
 * ForumPage - صفحة المنتدى
 * تم تقسيم المنطق إلى ForumService و ProfileService بنمط Claw
 */
export default function ForumPage() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [filter, setFilter] = useState('الكل');
  const [userApiKey, setUserApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await ForumService.fetchForumPosts();
    if (data) setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time updates
  useRealtime('forum_posts', (payload) => {
    if (payload.eventType === 'INSERT') {
      fetchPosts();
    }
  });

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setIsPosting(true);
    try {
      // 1. Analyze post with AI for smart tagging
      let aiTags = null;
      try {
        const aiResponse = await fetch('/api/ai/analyze-forum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newPost })
        });
        if (aiResponse.ok) {
          const result = await aiResponse.json();
          aiTags = result.analysis;
        }
      } catch (e) {
        console.warn("AI Tagging failed, proceeding without tags.");
      }

      // 2. Create post with AI tags
      const { data: post, error } = await ForumService.createForumPost(user.id, newPost);
      
      if (error) throw error;

      // 3. Award points (Atomic)
      await ProfileService.incrementPoints(user.id, 10);

      setNewPost('');
      alert('تم نشر مشاركتك بنجاح! حصلت على 10 نقاط.');
    } catch (e: any) {
      alert('فشل النشر: ' + e.message);
    } finally {
      setIsPosting(false);
    }
  };

  const filteredPosts = filter === 'الكل' ? posts : posts.filter(p => p.content.includes(filter));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Forum Header */}
      <section className="text-center space-y-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <span className="px-4 py-2 bg-burgundy/10 text-burgundy rounded-full text-xs font-black uppercase tracking-widest border border-burgundy/10">
            مجتمع بورتسودان التفاعلي 🇸🇩
          </span>
          <h1 className="text-5xl font-black leading-tight tracking-tighter">منتدى <span className="text-burgundy">الخدمات</span> والطلبات</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            اطرح أسئلتك، اطلب خدمات عاجلة، أو شارك خبراتك مع أهل بورتسودان.
          </p>
        </motion.div>

        {/* Post Input */}
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex gap-4 items-start relative z-10">
            <div className="w-14 h-14 relative bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden shadow-sm">
              {user?.imageUrl ? <Image src={user.imageUrl} className="object-cover" alt={user.fullName || 'User'} fill /> : <User size={24} className="text-gray-300" />}
            </div>
            <div className="flex-1 space-y-4">
              <textarea 
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="ماذا يدور في ذهنك؟ اطلب خدمة أو شارك معلومة.." 
                className="w-full p-6 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold text-lg resize-none min-h-[120px]"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-burgundy/10 hover:text-burgundy transition-all"><MapPin size={20} /></button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-burgundy/10 hover:text-burgundy transition-all"><Briefcase size={20} /></button>
                </div>
                <button 
                  onClick={handlePost}
                  disabled={isPosting || !newPost.trim() || !user}
                  className="bg-burgundy text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {isPosting ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Send size={20} /> نشر المشاركة</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 space-y-8">
            <h3 className="text-xl font-black flex items-center gap-2"><Filter size={20} /> تصنيفات</h3>
            <div className="space-y-4">
              {['الكل', 'طلب خدمة', 'عرض خدمة', 'سؤال', 'تنبيه'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`w-full p-4 rounded-2xl text-right font-black text-sm transition-all flex justify-between items-center group ${filter === cat ? 'bg-burgundy text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                >
                  {cat}
                  <ArrowRight size={16} className={`transition-transform ${filter === cat ? 'translate-x-[-4px]' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-burgundy p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden">
            <Sparkles className="absolute -top-4 -right-4 opacity-20" size={80} />
            <h4 className="text-xl font-black">نظام النقاط</h4>
            <p className="text-sm font-bold leading-relaxed opacity-90">احصل على ١٠ نقاط مقابل كل مشاركة مفيدة و٥ نقاط مقابل كل رد.</p>
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs font-black uppercase tracking-widest opacity-60">رصيدك الحالي</p>
              <p className="text-3xl font-black mt-1">١٢٠ <span className="text-xs opacity-60">نقطة</span></p>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-9 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">آخر المشاركات</h2>
            <div className="flex gap-2">
              <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-burgundy"><TrendingUp size={20} /></button>
              <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-burgundy"><Activity size={20} /></button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-white rounded-[40px] animate-pulse shadow-sm border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 space-y-6 group hover:shadow-2xl transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14">
                          <Image src={post.profiles?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="rounded-2xl object-cover border-2 border-white shadow-md" alt={post.profiles?.full_name || 'User'} fill />
                          {post.profiles?.is_verified && (
                            <div className="absolute -top-1 -right-1 z-10 bg-burgundy text-white p-0.5 rounded-full border-2 border-white">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-black group-hover:text-burgundy transition-colors">{post.profiles?.full_name}</p>
                          <p className="text-xs text-gray-400 font-bold">{new Date(post.created_at).toLocaleString('ar-EG')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {post.is_urgent && (
                          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1 animate-pulse">
                            <Zap size={10} /> عاجل جداً
                          </span>
                        )}
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-burgundy/10 hover:text-burgundy transition-all"><Plus size={20} /></button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-8 bg-gray-50 rounded-[40px] font-medium text-gray-800 leading-relaxed text-xl border border-gray-100/50 shadow-inner">
                        {post.content}
                      </div>
                      
                      {/* Smart Tags */}
                      <div className="flex flex-wrap gap-2">
                        {post.profession && (
                          <span className="px-4 py-1.5 bg-burgundy/5 text-burgundy rounded-xl text-xs font-black border border-burgundy/10 flex items-center gap-2">
                            <Briefcase size={12} /> {post.profession}
                          </span>
                        )}
                        {post.neighborhood && (
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black border border-blue-100 flex items-center gap-2">
                            <MapPin size={12} /> {post.neighborhood}
                          </span>
                        )}
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black border border-emerald-100 flex items-center gap-2">
                          <Activity size={12} /> نشط الآن
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                      <button className="flex items-center gap-2 text-gray-400 hover:text-burgundy transition-all font-black text-sm">
                        <MessageSquare size={18} /> ١٢ رد
                      </button>
                      <button className="flex items-center gap-2 text-gray-400 hover:text-rose-600 transition-all font-black text-sm">
                        <Zap size={18} /> ٤٥ تفاعل
                      </button>
                      <button className="mr-auto flex items-center gap-2 text-burgundy font-black text-sm hover:underline">
                        عرض الردود <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredPosts.length === 0 && (
                <div className="bg-white p-20 rounded-[40px] text-center space-y-4 border border-dashed border-gray-200">
                  <MessageSquare size={48} className="mx-auto text-gray-200" />
                  <p className="text-xl font-black text-gray-400">لا توجد مشاركات في هذا التصنيف بعد</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
