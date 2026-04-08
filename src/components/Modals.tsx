import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Star, Send, Save, Trash2, Camera } from 'lucide-react';
import { useSupabase } from '@/app/providers';
import { AdService } from '../services/adService';
import { RatingService } from '../services/ratingService';
import { AdminService } from '../services/adminService';
import { Ad, Profile } from '../types';
import { PROFESSIONS, NEIGHBORHOODS } from '../lib/constants';

/**
 * Modals - مجموعة النوافذ المنبثقة
 * تم تقسيم المنطق إلى خدمات متخصصة بنمط Claw
 */
export const EditAdModal = ({ ad, onClose, onUpdate }: { ad: Ad, onClose: () => void, onUpdate: (ad: Ad | null) => void }) => {
  const [formData, setFormData] = useState({ ...ad });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data, error } = await AdService.updateAd(ad.id, formData);
      if (error) throw error;
      onUpdate(data);
      onClose();
    } catch (e: any) {
      alert('فشل التحديث: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    setDeleting(true);
    try {
      const { error } = await AdService.deleteAd(ad.id);
      if (error) throw error;
      onUpdate(null); // Signal deletion
      onClose();
    } catch (e: any) {
      alert('فشل الحذف');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-2xl p-10 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black">تعديل <span className="text-burgundy">الإعلان</span></h2>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">عنوان الإعلان</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">السعر (ج.س)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الوصف التفصيلي</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">المهنة</label>
              <select 
                value={formData.profession}
                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
              >
                {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الحي</label>
              <select 
                value={formData.neighborhood}
                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
              >
                {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-burgundy text-white py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Save size={24} /> حفظ التعديلات</>}
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="px-8 bg-red-50 text-red-500 rounded-2xl font-black hover:bg-red-100 transition-all flex items-center justify-center"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const RatingModal = ({ service, onClose }: { service: Ad, onClose: () => void }) => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleSubmit = async () => {
    if (rating === 0 || !user) return;
    setSubmitting(true);
    try {
      await RatingService.addRating(service.id, user.id, rating, comment);
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

export const ContactAdminModal = ({ onClose }: { onClose: () => void }) => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleSend = async () => {
    if (!message || !user) return;
    setSending(true);
    try {
      const { error } = await AdminService.createAdminMessage(user.id, message);
      if (error) throw error;
      alert('تم إرسال رسالتك للإدارة بنجاح. سنقوم بالرد عليك قريباً.');
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSending(false);
    }
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
