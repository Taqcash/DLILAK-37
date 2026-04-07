import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const AIGuard = ({ userApiKey, children }: any) => {
  if (!userApiKey) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 bg-burgundy/5 rounded-[40px] border-2 border-dashed border-burgundy/20 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-white rounded-full shadow-xl flex items-center justify-center mx-auto text-burgundy">
          <Sparkles size={40} />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-burgundy">ميزات الذكاء الاصطناعي معطلة</h3>
          <p className="text-burgundy/70 font-medium max-w-md mx-auto leading-relaxed">
            للاستمتاع بالبحث الذكي، &quot;طبيب الإعلانات&quot;، والتقارير الإدارية، يرجى إعداد مفتاح Gemini API الخاص بك أولاً.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/setup-ai" 
            className="bg-burgundy text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-3"
          >
            <Zap size={20} /> إعداد الآن
          </Link>
          <Link 
            href="/about" 
            className="bg-white text-burgundy px-10 py-4 rounded-2xl font-black shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <ShieldCheck size={20} /> لماذا نحتاج هذا؟
          </Link>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
};
