'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="text-center space-y-8 max-w-md">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 bg-burgundy/10 rounded-full flex items-center justify-center text-burgundy">
            <AlertCircle size={64} />
          </div>
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-burgundy">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">عذراً، الصفحة غير موجودة</h2>
          <p className="text-gray-500 dark:text-gray-400">
            يبدو أنك سلكت طريقاً خاطئاً في شوارع بورتسودان. دعنا نعدك إلى الطريق الصحيح.
          </p>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-burgundy text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all"
        >
          <Home size={20} />
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
