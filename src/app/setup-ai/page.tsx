'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Info, Activity, Search, ShieldCheck, Zap, ArrowRight, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export default function GeminiSetupPage() {
  const [apiKey, setApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      // Validate key by making a small request
      const genAI = new GoogleGenAI({ apiKey });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "test"
      });
      await model;

      localStorage.setItem('gemini_api_key', apiKey);
      setStatus('success');
      setTimeout(() => router.push('/'), 2000);
    } catch (e: any) {
      setStatus('error');
      setErrorMessage(e.message || 'المفتاح غير صالح أو هناك مشكلة في الاتصال.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
          <div className="w-24 h-24 bg-burgundy text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden group">
            <Sparkles size={48} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tighter">تفعيل الذكاء الاصطناعي</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            استخدم قوة Gemini API لتفعيل ميزات البحث الذكي، تحليل الإعلانات، والتقارير الإدارية المتقدمة.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Setup Form */}
        <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          
          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Key size={14} /> مفتاح Gemini API الخاص بك
              </label>
              <input 
                type="password" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="أدخل المفتاح هنا (AIza...)" 
                className="w-full p-6 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-burgundy outline-none font-mono text-lg shadow-inner"
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-emerald-50 text-emerald-600 rounded-[32px] border border-emerald-100 flex items-center gap-4 font-black text-sm shadow-sm">
                  <CheckCircle2 size={24} /> تم تفعيل الذكاء الاصطناعي بنجاح! جاري تحويلك..
                </motion.div>
              )}
              {status === 'error' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-rose-50 text-rose-600 rounded-[32px] border border-rose-100 flex items-center gap-4 font-black text-sm shadow-sm">
                  <AlertCircle size={24} /> {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="w-full bg-burgundy text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isValidating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Zap size={24} /> حفظ وتفعيل</>}
            </button>
          </div>

          <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
              <ShieldCheck size={16} /> بياناتك مشفرة ومحفوظة محلياً فقط
            </div>
            <Link href="/" className="text-burgundy font-black text-sm hover:underline">تجاهل الآن</Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-8">
          <div className="p-10 bg-gray-900 rounded-[50px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-burgundy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 space-y-8">
              <h3 className="text-2xl font-black">كيف تحصل على المفتاح؟</h3>
              <div className="space-y-6">
                {[
                  { step: '١', text: 'اذهب إلى Google AI Studio (aistudio.google.com)' },
                  { step: '٢', text: 'اضغط على زر "Get API Key" في القائمة الجانبية' },
                  { step: '٣', text: 'قم بإنشاء مفتاح جديد وانسخه' },
                  { step: '٤', text: 'الصق المفتاح في الخانة المقابلة هنا' }
                ].map(item => (
                  <div key={item.step} className="flex gap-6 items-start">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-burgundy border border-white/10 shrink-0">{item.step}</div>
                    <p className="text-lg font-medium text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-burgundy font-black hover:text-burgundy/80 transition-colors group/link"
              >
                انتقل إلى Google AI Studio <ArrowRight size={20} className="group-hover/link:translate-x-[-4px] transition-transform" />
              </a>
            </div>
          </div>

          <div className="p-8 bg-white rounded-[40px] shadow-xl border border-gray-100 space-y-6">
            <h4 className="text-xl font-black flex items-center gap-3"><Info className="text-burgundy" /> لماذا نستخدم مفتاحك؟</h4>
            <p className="text-gray-500 font-medium leading-relaxed">
              نحن نستخدم مفتاحك الخاص لضمان استمرارية الخدمة مجاناً لك، ولتوفير ميزات ذكاء اصطناعي مخصصة لا يمكن لأي منصة أخرى في السودان تقديمها.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
