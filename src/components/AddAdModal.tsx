import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Briefcase, 
  MapPin, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Info,
  Search,
  Zap,
  Star,
  Plus
} from 'lucide-react';
import { useSupabase } from '@/app/providers';
import Image from 'next/image';
import { AdService } from '@/services/adService';
import { ProfileService } from '@/services/profileService';
import { LogService } from '@/services/logService';
import { AIService } from '@/services/aiService';
import { uploadToCloudinary } from '@/services/imageService';
import ReactMarkdown from 'react-markdown';

/**
 * AddAdModal - نافذة إضافة إعلان جديد
 * تم تقسيم المنطق إلى AdService و ProfileService بنمط Claw
 */
export const AddAdModal = ({ onClose, professions, neighborhoods, userApiKey }: any) => {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    profession: professions[0] || '',
    neighborhood: neighborhoods[0] || '',
    type: 'offer',
    is_productive: false,
    is_training: false,
    is_premium: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const runAdDoctor = async () => {
    if (!formData.description) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/analyze-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: formData.description,
          systemPrompt: 'أنت خبير تسويق في بورتسودان. حلل هذا الإعلان وقدم نصائح لتحسينه باللغة العربية.'
        })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      const analysis = result.result;
      setAiAnalysis(analysis);
      // Log AI interaction
      if (user) {
        await LogService.logAIInteraction(user.id, 'طبيب الإعلانات (DeepSeek)', formData.description, analysis);
      }
    } catch (e) {
      alert('فشل تحليل الإعلان.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const { error } = await AdService.createAd({
        ...formData,
        price: Number(formData.price) || 0,
        type: formData.type as 'offer' | 'request',
        user_id: user.id,
        image_url: imageUrl,
        status: 'active',
        avg_rating: 0
      });

      if (error) throw error;

      // Award points for creating an ad
      await ProfileService.incrementPoints(user.id, 50);
      
      alert('تم نشر إعلانك بنجاح! حصلت على 50 نقطة مكافأة.');
      onClose();
    } catch (e: any) {
      alert('خطأ في النشر: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white rounded-[60px] w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden relative"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${(step / 3) * 100}%` }} 
            className="h-full bg-burgundy shadow-[0_0_20px_rgba(128,0,32,0.5)]"
          />
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Sidebar Info */}
          <div className="lg:w-80 bg-gray-50 p-12 border-l border-gray-100 space-y-12 hidden lg:block">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-burgundy text-white rounded-[24px] flex items-center justify-center shadow-xl">
                <Plus size={32} />
              </div>
              <h2 className="text-3xl font-black leading-tight">إضافة <br /> إعلان جديد</h2>
              <p className="text-gray-400 font-bold text-sm leading-relaxed">أكمل الخطوات البسيطة لنشر خدمتك والوصول لآلاف العملاء في بورتسودان.</p>
            </div>

            <div className="space-y-6">
              {[
                { s: 1, l: 'المعلومات الأساسية', i: <Info size={18} /> },
                { s: 2, l: 'طبيب الإعلانات (AI)', i: <Stethoscope size={18} /> },
                { s: 3, l: 'التأكيد والنشر', i: <CheckCircle2 size={18} /> }
              ].map(item => (
                <div key={item.s} className={`flex items-center gap-4 transition-all ${step >= item.s ? 'text-burgundy' : 'text-gray-300'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${step >= item.s ? 'bg-burgundy/5 border-burgundy shadow-lg' : 'border-gray-200'}`}>
                    {item.i}
                  </div>
                  <span className="text-sm font-black">{item.l}</span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-burgundy rounded-[32px] text-white space-y-4 shadow-2xl relative overflow-hidden">
              <Sparkles className="absolute -top-4 -right-4 opacity-20" size={80} />
              <p className="text-xs font-black uppercase tracking-widest opacity-80">نصيحة ذكية</p>
              <p className="text-sm font-bold leading-relaxed">الإعلانات التي تحتوي على صور واضحة ووصف مفصل تحصل على تفاعل أكبر بـ ٥ أضعاف!</p>
            </div>
          </div>

          {/* Main Form */}
          <div className="flex-1 p-12 overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <h3 className="text-2xl font-black">الخطوة {step} من ٣</h3>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                  {step === 1 ? 'المعلومات الأساسية' : step === 2 ? 'تحليل الذكاء الاصطناعي' : 'المراجعة النهائية'}
                </p>
              </div>
              <button onClick={onClose} className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"><X size={24} /></button>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">عنوان الإعلان</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        placeholder="مثلاً: سباك محترف بخبرة ١٠ سنوات" 
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold text-lg"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">المهنة</label>
                      <select 
                        value={formData.profession}
                        onChange={e => setFormData({...formData, profession: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
                      >
                        {professions.map((p: string) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الحي</label>
                      <select 
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
                      >
                        {neighborhoods.map((n: string) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">السعر المتوقع (ج.س)</label>
                      <input 
                        type="number" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="٠.٠٠" 
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">نوع الإعلان</label>
                      <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                        <button 
                          onClick={() => setFormData({...formData, type: 'offer'})}
                          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${formData.type === 'offer' ? 'bg-white text-burgundy shadow-md' : 'text-gray-500'}`}
                        >
                          عرض خدمة
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, type: 'request'})}
                          className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${formData.type === 'request' ? 'bg-white text-burgundy shadow-md' : 'text-gray-500'}`}
                        >
                          طلب خدمة
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">وصف الخدمة بالتفصيل</label>
                      <textarea 
                        rows={5}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="اشرح ما تقدمه، خبراتك، والمميزات التي تجعلك الأفضل.." 
                        className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold resize-none"
                      />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">صورة الإعلان</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          id="ad-image" 
                          className="hidden" 
                          onChange={handleImageChange}
                        />
                        <label 
                          htmlFor="ad-image" 
                          className="w-full h-48 bg-gray-50 border-4 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-burgundy transition-all group-hover:bg-burgundy/5"
                        >
                          {imagePreview ? (
                            <div className="relative w-full h-full">
                              <Image src={imagePreview} className="object-cover rounded-[28px]" alt="Ad Preview" fill />
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-300 group-hover:text-burgundy transition-colors">
                                <ImageIcon size={32} />
                              </div>
                              <p className="text-sm font-black text-gray-400 group-hover:text-burgundy">اضغط لرفع صورة الإعلان</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="bg-burgundy p-12 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                    <Stethoscope className="absolute -top-8 -right-8 opacity-20" size={160} />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                          <Sparkles size={24} />
                        </div>
                        <h4 className="text-2xl font-black">طبيب الإعلانات الذكي</h4>
                      </div>
                      <p className="text-lg font-medium leading-relaxed opacity-90">
                        سيقوم الذكاء الاصطناعي الآن بتحليل إعلانك وتقديم نصائح لجعله أكثر جذباً للعملاء في بورتسودان.
                      </p>
                      <button 
                        onClick={runAdDoctor}
                        disabled={isAnalyzing || !userApiKey}
                        className="bg-white text-burgundy px-10 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-burgundy border-t-transparent rounded-full" /> : 'ابدأ التحليل الآن'}
                      </button>
                    </div>
                  </div>

                  {aiAnalysis && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 space-y-6 shadow-sm">
                      <div className="flex items-center gap-3 text-burgundy">
                        <CheckCircle2 size={24} />
                        <h5 className="text-xl font-black">نتائج التحليل</h5>
                      </div>
                      <div className="prose prose-lg max-w-none font-medium text-gray-800 leading-relaxed">
                        <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="bg-emerald-50 p-10 rounded-[40px] border border-emerald-100 flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shrink-0">
                      <CheckCircle2 size={40} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-emerald-900">إعلانك جاهز للنشر!</h4>
                      <p className="text-emerald-700 font-medium mt-1">راجع المعلومات النهائية واضغط على زر النشر للبدء.</p>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h5 className="text-3xl font-black text-gray-900">{formData.title}</h5>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1 text-gray-400 font-bold text-sm"><MapPin size={14} /> {formData.neighborhood}</span>
                          <span className="flex items-center gap-1 text-gray-400 font-bold text-sm"><Briefcase size={14} /> {formData.profession}</span>
                        </div>
                      </div>
                      <p className="text-3xl font-black text-burgundy">{formData.price} <span className="text-xs text-gray-400">ج.س</span></p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-3xl">
                      <p className="text-gray-600 font-medium leading-relaxed">{formData.description}</p>
                    </div>

                    <div className="space-y-6 pt-6 border-t border-gray-100">
                      <h5 className="text-sm font-black text-gray-400 uppercase tracking-widest">خيارات إضافية</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-burgundy transition-all cursor-pointer flex items-center gap-4 group">
                          <input 
                            type="checkbox" 
                            checked={formData.is_premium}
                            onChange={e => setFormData({...formData, is_premium: e.target.checked})}
                            className="w-6 h-6 rounded-lg border-gray-200 text-burgundy focus:ring-burgundy" 
                          />
                          <div>
                            <p className="font-black text-gray-900 group-hover:text-burgundy transition-colors flex items-center gap-2">
                              <Sparkles size={16} className="text-amber-500" /> تمييز الإعلان
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">يظهر في المقدمة (٥٠٠ نقطة)</p>
                          </div>
                        </label>
                        <label className="p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-emerald-600 transition-all cursor-pointer flex items-center gap-4 group">
                          <input 
                            type="checkbox" 
                            checked={formData.is_productive}
                            onChange={e => setFormData({...formData, is_productive: e.target.checked})}
                            className="w-6 h-6 rounded-lg border-gray-200 text-burgundy focus:ring-burgundy" 
                          />
                          <div>
                            <p className="font-black text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                              <Zap size={16} className="text-emerald-500" /> أسرة منتجة
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold">إدراج في قسم الأسر المنتجة</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
              <button 
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-gray-400 hover:text-burgundy transition-all disabled:opacity-0"
              >
                <ArrowRight size={20} /> السابق
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={step === 1 && (!formData.title || !formData.description)}
                  className="bg-burgundy text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  التالي <ArrowLeft size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" /> : <><Zap size={24} /> انشر الإعلان الآن</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
