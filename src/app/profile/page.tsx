'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  History, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  Activity, 
  Zap,
  ArrowRight,
  ChevronRight,
  LogOut,
  FileText
} from 'lucide-react';
import { useSupabase } from '@/app/providers';
import Image from 'next/image';
import { ProfileService } from '@/services/profileService';
import { AdService } from '@/services/adService';
import { StorageService } from '@/services/storageService';
import { AIService } from '@/services/aiService';
import { EditAdModal } from '@/components/Modals';
import ReactMarkdown from 'react-markdown';

/**
 * ProfilePage - صفحة الملف الشخصي
 * تم تقسيم المنطق إلى خدمات متخصصة بنمط Claw
 */
export default function ProfilePage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('ads');
  const [userAds, setUserAds] = useState<any[]>([]);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [adminReport, setAdminReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userApiKey, setUserApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  const [settings, setSettings] = useState({
    full_name: '',
    phone: '',
    bio: '',
    neighborhood: ''
  });

  const fetchUserData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [profileRes, adsRes, logsRes] = await Promise.all([
        ProfileService.getProfile(userId),
        AdService.fetchAds({ status: 'active' }),
        supabase.from('ai_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);
      
      if (profileRes.data) {
        setUserProfile(profileRes.data);
        setSettings({
          full_name: profileRes.data.full_name || '',
          phone: profileRes.data.phone || '',
          bio: profileRes.data.bio || '',
          neighborhood: profileRes.data.neighborhood || ''
        });
      }
      if (adsRes.data) setUserAds(adsRes.data.filter((ad: any) => ad.user_id === userId));
      if (logsRes.data) setAiLogs(logsRes.data);
    } catch (e) {
      console.error("Error fetching user data:", e);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        fetchUserData(user.id);
      }
      setIsAuthReady(true);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router, fetchUserData]);

  const handleSaveSettings = async () => {
    if (!user) return;
    try {
      const { error } = await ProfileService.updateProfile(user.id, settings);
      if (error) throw error;
      alert('تم حفظ الإعدادات بنجاح');
      setUserProfile((prev: any) => ({ ...prev, ...settings }));
    } catch (e: any) {
      alert('خطأ في حفظ الإعدادات: ' + e.message);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    try {
      const { error } = await AdService.deleteAd(adId);
      if (error) throw error;
      setUserAds(prev => prev.filter(a => a.id !== adId));
    } catch (e: any) {
      alert('خطأ في حذف الإعلان: ' + e.message);
    }
  };

  const handleVerificationUpload = async () => {
    if (!user || !verificationFile) return;
    setIsVerifying(true);
    try {
      const { data, error } = await StorageService.uploadFile('verifications', verificationFile);
      if (error) throw error;
      // Update profile with verification status or file URL
      alert('تم رفع ملف التوثيق بنجاح، سيتم مراجعته قريباً');
    } catch (e: any) {
      alert('خطأ في رفع الملف: ' + e.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestFieldVisit = () => {
    alert('تم استلام طلبك، سيتواصل معك مندوبنا قريباً لتحديد موعد الزيارة.');
  };

  const generateAdminReport = async () => {
    if (!userApiKey) {
      alert('يرجى إعداد مفتاح Gemini أولاً');
      return;
    }
    setIsGeneratingReport(true);
    try {
      const report = await AIService.generatePlatformReport(userAds, aiLogs);
      setAdminReport(report);
    } catch (e: any) {
      alert('خطأ في توليد التقرير: ' + e.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header Profile Card */}
      <section className="bg-white rounded-[60px] p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-right">
          <div className="relative group">
            <div className="w-48 h-48 relative rounded-[40px] overflow-hidden border-8 border-gray-50 shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <Image src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || "https://picsum.photos/seed/user/200/200"} className="object-cover" alt={userProfile?.full_name || user?.user_metadata?.full_name || 'User Profile'} fill />
            </div>
            <button className="absolute bottom-4 left-4 p-4 bg-burgundy text-white rounded-2xl shadow-xl hover:bg-burgundy/90 transition-all">
              <Camera size={20} />
            </button>
            {userProfile?.is_verified && (
              <div className="absolute -top-4 -right-4 bg-emerald-600 text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                <ShieldCheck size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h1 className="text-4xl font-black">{userProfile?.full_name || user?.user_metadata?.full_name}</h1>
                <span className="px-4 py-1.5 bg-burgundy/10 text-burgundy rounded-full text-xs font-black uppercase tracking-widest">
                  {userProfile?.role === 'admin' ? 'مدير المنصة' : 'عضو نشط'}
                </span>
              </div>
              <p className="text-gray-400 font-bold flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} /> {userProfile?.neighborhood || 'لم يحدد الحي'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="px-8 py-4 bg-gray-50 rounded-[24px] border border-gray-100">
                <p className="text-2xl font-black text-burgundy">{userProfile?.points || 0}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">نقاط التفاعل</p>
              </div>
              <div className="px-8 py-4 bg-gray-50 rounded-[24px] border border-gray-100">
                <p className="text-2xl font-black text-gray-900">{userAds.length}</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">إعلانات نشطة</p>
              </div>
              <div className="px-8 py-4 bg-gray-50 rounded-[24px] border border-gray-100">
                <p className="text-2xl font-black text-emerald-600">١٠٠٪</p>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">معدل الرد</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/setup-ai')} className="bg-burgundy text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center justify-center gap-3">
              <Sparkles size={20} /> إعدادات الذكاء الاصطناعي
            </button>
            <button onClick={handleLogout} className="bg-rose-50 text-rose-600 px-8 py-4 rounded-2xl font-black hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3">
              <LogOut size={20} /> تسجيل الخروج
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex bg-white p-2 rounded-[32px] shadow-xl border border-gray-100 sticky top-24 z-30 overflow-x-auto">
        {[
          { id: 'ads', label: 'إعلاناتي', icon: <Briefcase size={20} /> },
          { id: 'verify', label: 'التوثيق', icon: <ShieldCheck size={20} /> },
          { id: 'history', label: 'سجل النشاط', icon: <History size={20} /> },
          { id: 'settings', label: 'الإعدادات', icon: <User size={20} /> },
          ...(userProfile?.role === 'admin' ? [{ id: 'admin', label: 'لوحة الإدارة', icon: <Activity size={20} /> }] : [])
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] py-4 rounded-[24px] font-black text-sm flex items-center justify-center gap-3 transition-all ${activeTab === tab.id ? 'bg-burgundy text-white shadow-xl scale-105' : 'text-gray-400 hover:text-burgundy'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-[400px]"
        >
          {activeTab === 'ads' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userAds.map(ad => (
                <div key={ad.id} className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100 group">
                  <div className="h-48 relative">
                    <Image src={ad.image_url || "https://picsum.photos/seed/ad/400/300"} className="object-cover" alt={ad.title} fill />
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button onClick={() => handleDeleteAd(ad.id)} className="p-3 bg-white/90 backdrop-blur-md text-rose-600 rounded-2xl shadow-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                      <button 
                        onClick={() => setEditingAd(ad)}
                        className="p-3 bg-white/90 backdrop-blur-md text-burgundy rounded-2xl shadow-lg hover:bg-burgundy hover:text-white transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-xl font-black">{ad.title}</h3>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-burgundy font-black">{ad.price} ج.س</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black">{ad.status === 'active' ? 'نشط' : 'مسودة'}</span>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => router.push('/')}
                className="bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 gap-4 group hover:border-burgundy transition-all"
              >
                <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-300 group-hover:text-burgundy transition-colors">
                  <Zap size={32} />
                </div>
                <p className="text-xl font-black text-gray-400 group-hover:text-burgundy">أضف إعلان جديد</p>
              </button>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="max-w-3xl mx-auto bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-12">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-burgundy/10 text-burgundy rounded-[32px] flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck size={48} />
                </div>
                <h2 className="text-3xl font-black">توثيق الحساب</h2>
                <p className="text-gray-500 font-medium">التوثيق يزيد من ثقة العملاء ويمنحك شارة التوثيق الزرقاء في إعلاناتك.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-3 text-burgundy"><CheckCircle2 /> التوثيق الرقمي</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">رفع صورة الهوية الوطنية أو جواز السفر للتأكد من الشخصية.</p>
                  <div className="pt-4">
                    <input 
                      type="file" 
                      id="id-upload" 
                      className="hidden" 
                      onChange={e => setVerificationFile(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="id-upload" 
                      className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-burgundy transition-all"
                    >
                      {verificationFile ? <span className="text-burgundy font-bold">{verificationFile.name}</span> : <><Camera size={24} className="text-gray-300" /><span className="text-xs font-bold text-gray-400">اختر صورة الهوية</span></>}
                    </label>
                  </div>
                </div>
                <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-3 text-emerald-600"><MapPin /> التوثيق الميداني</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">زيارة مندوبنا لموقع عملك للتأكد من جودة الخدمة والموقع.</p>
                  <button 
                    onClick={handleRequestFieldVisit}
                    className="w-full py-4 bg-white rounded-2xl font-black text-sm shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    طلب زيارة ميدانية
                  </button>
                </div>
              </div>

              <button 
                onClick={handleVerificationUpload}
                disabled={!verificationFile || isVerifying}
                className="w-full bg-burgundy text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-burgundy/90 transition-all disabled:opacity-50"
              >
                {isVerifying ? 'جاري الرفع...' : 'إرسال طلب التوثيق'}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {aiLogs.length > 0 ? (
                aiLogs.map(log => (
                  <div key={log.id} className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-burgundy/10 text-burgundy rounded-2xl"><Sparkles size={20} /></div>
                        <div>
                          <p className="text-sm font-black">{log.feature}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(log.created_at).toLocaleString('ar-EG')}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">الطلب:</p>
                      <p className="text-sm font-medium text-gray-700">{log.prompt}</p>
                    </div>
                    <div className="p-6 bg-burgundy/5 rounded-3xl space-y-4 border border-burgundy/10">
                      <p className="text-xs font-black text-burgundy uppercase tracking-widest">رد الذكاء الاصطناعي:</p>
                      <div className="prose prose-sm max-w-none text-gray-800 font-medium leading-relaxed">
                        <ReactMarkdown>{log.response}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[60px] border border-dashed border-gray-200">
                  <History size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-xl font-black text-gray-400">لا يوجد سجل نشاط حتى الآن</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={settings.full_name} 
                    onChange={e => setSettings(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    value={settings.phone} 
                    onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+249..."
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
                  />
                </div>
                <div className="space-y-4 md:col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">نبذة عنك</label>
                  <textarea 
                    rows={4}
                    value={settings.bio}
                    onChange={e => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-burgundy outline-none font-bold resize-none"
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveSettings}
                className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-black transition-all"
              >
                حفظ التغييرات
              </button>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'إجمالي المستخدمين', val: '١,٢٤٠', icon: <User />, color: 'bg-burgundy' },
                  { label: 'إعلانات اليوم', val: '٤٥', icon: <FileText />, color: 'bg-emerald-600' },
                  { label: 'تقارير معلقة', val: '١٢', icon: <AlertCircle />, color: 'bg-amber-600' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex items-center gap-6">
                    <div className={`${s.color} text-white p-4 rounded-2xl shadow-lg`}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{s.val}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-12 rounded-[60px] shadow-2xl border border-gray-100 space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black flex items-center gap-4"><Sparkles className="text-burgundy" /> تقرير الإدارة الذكي</h2>
                  <button 
                    onClick={generateAdminReport}
                    disabled={isGeneratingReport || !userApiKey}
                    className="bg-burgundy text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-burgundy/90 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isGeneratingReport ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><Activity size={20} /> توليد تقرير جديد</>}
                  </button>
                </div>

                {adminReport ? (
                  <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 prose prose-lg max-w-none font-medium text-gray-800 leading-relaxed">
                    <ReactMarkdown>{adminReport}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-20 text-center space-y-4 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                    <Zap size={48} className="mx-auto text-gray-200" />
                    <p className="text-xl font-black text-gray-400">اضغط على الزر أعلاه لتحليل نشاط المنصة بذكاء</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {editingAd && (
        <EditAdModal 
          ad={editingAd} 
          onClose={() => setEditingAd(null)} 
          onUpdate={(updatedAd: any) => {
            if (updatedAd) {
              setUserAds(prev => prev.map(a => a.id === updatedAd.id ? updatedAd : a));
            } else {
              setUserAds(prev => prev.filter(a => a.id !== editingAd.id));
            }
          }} 
        />
      )}
    </div>
  );
}
