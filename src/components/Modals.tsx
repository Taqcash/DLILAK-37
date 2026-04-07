import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const RatingModal = ({ service, onClose }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('يجب تسجيل الدخول للتقييم');

      const { error } = await supabase.from('ratings').insert({
        ad_id: service.id,
        user_id: user.id,
        rating,
        comment
      });

      if (error) throw error;
      alert('شكراً لتقييمك!');
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black">تقييم الخدمة</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className={`p-2 transition-all ${rating >= star ? 'text-yellow-400 scale-125' : 'text-gray-200'}`}
            >
              <Star size={40} fill={rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>

        <textarea 
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تعليقك (اختياري)..."
          className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button 
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {submitting ? 'جاري الإرسال...' : 'تأكيد التقييم'}
        </button>
      </motion.div>
    </div>
  );
};

export const ContactAdminModal = ({ onClose }: any) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message) return;
    setSending(true);
    // Simulate sending to admin
    setTimeout(() => {
      alert('تم إرسال رسالتك للإدارة بنجاح. سنقوم بالرد عليك قريباً.');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">مراسلة الإدارة</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        <textarea 
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
          className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSend}
          disabled={sending || !message}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
        </button>
      </motion.div>
    </div>
  );
};
