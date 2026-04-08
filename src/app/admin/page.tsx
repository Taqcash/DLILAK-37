'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ArrowUpRight, 
  PieChart as PieChartIcon,
  LayoutDashboard,
  FileText,
  Settings,
  Bell,
  Search,
  Sparkles,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Phone
} from 'lucide-react';
import { AnalyticsService } from '@/services/analyticsService';
import { ProfileService } from '@/services/profileService';
import { AIService } from '@/services/aiService';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

const COLORS = ['#800020', '#A52A2A', '#D2691E', '#8B4513', '#5D0017'];

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'verifications' | 'visits'>('analytics');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [visitRequests, setVisitRequests] = useState<any[]>([]);
  const [smartReport, setSmartReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  useEffect(() => {
    const fetchData = async () => {
      const [analytics, verifs, visits] = await Promise.all([
        AnalyticsService.getAnalyticsData(),
        ProfileService.fetchVerificationRequests(),
        ProfileService.fetchFieldVisitRequests()
      ]);
      setData(analytics);
      setVerifications(verifs.data || []);
      setVisitRequests(visits.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleApproveVerification = async (userId: string) => {
    try {
      await ProfileService.approveVerification(userId);
      setVerifications(prev => prev.filter(v => v.id !== userId));
      alert('تم توثيق الحساب بنجاح');
    } catch (e) {
      alert('فشل التوثيق');
    }
  };

  const handleUpdateVisitStatus = async (requestId: string, userId: string, status: 'approved' | 'rejected') => {
    try {
      await ProfileService.updateFieldVisitStatus(requestId, userId, status);
      setVisitRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
      alert(status === 'approved' ? 'تمت الموافقة على الزيارة' : 'تم رفض الزيارة');
    } catch (e) {
      alert('فشل تحديث الحالة');
    }
  };

  const [deepInsights, setDeepInsights] = useState<string>('');
  const [isGeneratingDeep, setIsGeneratingDeep] = useState(false);

  const generateDeepInsights = async () => {
    if (!data) return;
    setIsGeneratingDeep(true);
    try {
      const response = await fetch('/api/v1/analytics/deep-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.stats),
      });
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setDeepInsights(result.insights);
    } catch (e: any) {
      setDeepInsights('فشل إنشاء التقارير العميقة: ' + e.message);
    } finally {
      setIsGeneratingDeep(false);
    }
  };

  const generateSmartReport = async () => {
    if (!data) return;
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: data.stats })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      setSmartReport(result.report);
    } catch (e) {
      setSmartReport('فشل إنشاء التقرير الذكي. تأكد من إعداد مفتاح Gemini.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data) return [];
    // Group user growth by month (simplified)
    const months: any = {};
    data.userGrowth.forEach((u: any) => {
      const date = new Date(u.created_at);
      const month = date.toLocaleString('ar-EG', { month: 'short' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const counts: any = {};
    data.adsByCategory.forEach((ad: any) => {
      counts[ad.profession] = (counts[ad.profession] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans rtl">
      <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <LayoutDashboard className="text-burgundy" size={36} />
              لوحة <span className="text-burgundy">التحكم</span> الإدارية
            </h1>
            <p className="text-gray-500 font-bold">مرحباً بك مجدداً، إليك نظرة شاملة على أداء المنصة اليوم.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="بحث في التقارير..." className="pr-12 pl-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-burgundy outline-none w-64 font-bold" />
            </div>
            <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-burgundy transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy rounded-full border-2 border-white" />
            </button>
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden border-2 border-white shadow-lg">
              <Image src={user?.imageUrl || "https://picsum.photos/seed/user/100/100"} className="object-cover" alt="Admin" fill />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 pb-4">
          {[
            { id: 'analytics', label: 'التحليلات', icon: <Activity size={20} /> },
            { id: 'verifications', label: 'توثيق الهوية', icon: <ShieldCheck size={20} />, count: verifications.length },
            { id: 'visits', label: 'الزيارات الميدانية', icon: <MapPin size={20} />, count: visitRequests.filter(r => r.status === 'pending').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-burgundy text-white shadow-lg' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-white text-burgundy px-2 py-0.5 rounded-full text-[10px]">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'إجمالي المستخدمين', value: data.stats.users, icon: <Users />, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
            { label: 'الإعلانات النشطة', value: data.stats.ads, icon: <Briefcase />, color: 'bg-burgundy/5 text-burgundy', trend: '+5%' },
            { label: 'مشاركات المنتدى', value: data.stats.posts, icon: <MessageSquare />, color: 'bg-emerald-50 text-emerald-600', trend: '+18%' },
            { label: 'الإيرادات التقديرية', value: `${data.stats.revenue} ج.س`, icon: <TrendingUp />, color: 'bg-amber-50 text-amber-600', trend: '+24%' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100 flex items-center justify-between group hover:shadow-2xl transition-all"
            >
              <div className="space-y-4">
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black flex items-center gap-1">
                  <ArrowUpRight size={12} /> {stat.trend}
                </span>
                <Activity className="text-gray-100" size={48} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & AI Report */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <Activity className="text-burgundy" size={24} />
                  نمو المنصة
                </h3>
                <p className="text-sm text-gray-400 font-bold">تحليل شهري لعدد المستخدمين الجدد</p>
              </div>
              <select className="bg-gray-50 border-none rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-burgundy">
                <option>آخر ٦ أشهر</option>
                <option>آخر سنة</option>
              </select>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#800020" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#800020" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#999' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#999' }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                    itemStyle={{ fontWeight: 900, color: '#800020' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#800020" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-4 bg-white p-10 rounded-[50px] shadow-2xl border border-gray-100 space-y-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <PieChartIcon className="text-burgundy" size={24} />
                توزيع الخدمات
              </h3>
              <p className="text-sm text-gray-400 font-bold">أكثر المهن نشاطاً على المنصة</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-6 border-t border-gray-50 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">الأكثر طلباً</span>
                <span className="text-sm font-black text-burgundy">السباكة والكهرباء</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-burgundy h-full w-[75%]" />
              </div>
            </div>
          </div>

          {/* Smart AI Report Section */}
          <div className="lg:col-span-12 bg-burgundy p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden">
            <Sparkles className="absolute -top-12 -right-12 opacity-10" size={300} />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">
                    <Zap size={14} /> ميزة حصرية للمدراء
                  </div>
                  <h2 className="text-5xl font-black leading-tight">التقارير <br /> <span className="text-white/60">الذكية (AI)</span></h2>
                  <p className="text-xl font-medium leading-relaxed opacity-80">
                    استخدم قوة الذكاء الاصطناعي لتحليل بيانات منصتك والحصول على رؤى استراتيجية فورية تساعدك في اتخاذ القرارات.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={generateSmartReport}
                    disabled={isGeneratingReport || !userApiKey}
                    className="bg-white text-burgundy px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isGeneratingReport ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-burgundy border-t-transparent rounded-full" />
                    ) : (
                      <><Sparkles size={20} /> تقرير Gemini الذكي</>
                    )}
                  </button>
                  <button 
                    onClick={generateDeepInsights}
                    disabled={isGeneratingDeep}
                    className="bg-black text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isGeneratingDeep ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <><Zap size={20} /> رؤى DeepSeek العميقة</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 min-h-[400px] flex flex-col">
                {(smartReport || deepInsights) ? (
                  <div className="prose prose-invert max-w-none space-y-8">
                    {smartReport && (
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                        <h4 className="text-burgundy-light font-black mb-4 flex items-center gap-2"><Sparkles size={18} /> تقرير Gemini:</h4>
                        <ReactMarkdown>{smartReport}</ReactMarkdown>
                      </div>
                    )}
                    {deepInsights && (
                      <div className="p-6 bg-burgundy-dark/30 rounded-2xl border border-white/10">
                        <h4 className="text-blue-300 font-black mb-4 flex items-center gap-2"><Zap size={18} /> رؤى DeepSeek:</h4>
                        <ReactMarkdown>{deepInsights}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                      <Sparkles size={48} />
                    </div>
                    <p className="text-xl font-bold">اضغط على الأزرار لإنشاء تقارير تحليلي شاملة للمنصة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

            </div>
          </>
        )}

        {activeTab === 'verifications' && (
          <div className="bg-white rounded-[50px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-black">طلبات توثيق الهوية</h3>
              <span className="bg-burgundy/10 text-burgundy px-4 py-2 rounded-full text-xs font-black">{verifications.length} طلب معلق</span>
            </div>
            <div className="divide-y divide-gray-50">
              {verifications.length > 0 ? verifications.map((v) => (
                <div key={v.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-gray-100">
                      <Image src={v.avatar_url || "https://picsum.photos/seed/user/100/100"} className="object-cover" alt={v.fullName} fill />
                    </div>
                    <div>
                      <h4 className="text-lg font-black">{v.fullName}</h4>
                      <p className="text-sm text-gray-400 font-bold">{v.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href={v.verification_image} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                      <Eye size={18} /> عرض المستند
                    </a>
                    <button 
                      onClick={() => handleApproveVerification(v.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-burgundy text-white rounded-2xl font-black shadow-lg hover:bg-burgundy/90 transition-all"
                    >
                      <CheckCircle size={18} /> اعتماد التوثيق
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center text-gray-400 font-bold">لا توجد طلبات توثيق معلقة.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="bg-white rounded-[50px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-2xl font-black">طلبات الزيارات الميدانية</h3>
              <span className="bg-burgundy/10 text-burgundy px-4 py-2 rounded-full text-xs font-black">{visitRequests.filter(r => r.status === 'pending').length} طلب جديد</span>
            </div>
            <div className="divide-y divide-gray-50">
              {visitRequests.length > 0 ? visitRequests.map((r) => (
                <div key={r.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-gray-100">
                      <Image src={r.profiles?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="object-cover" alt={r.profiles?.fullName} fill />
                    </div>
                    <div>
                      <h4 className="text-lg font-black">{r.profiles?.fullName}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1"><MapPin size={12} /> {r.profiles?.neighborhood}</p>
                        <p className="text-xs text-gray-400 font-bold flex items-center gap-1"><Phone size={12} /> {r.profiles?.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleUpdateVisitStatus(r.id, r.user_id, 'approved')}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition-all"
                        >
                          <CheckCircle size={18} /> تم التحقق
                        </button>
                        <button 
                          onClick={() => handleUpdateVisitStatus(r.id, r.user_id, 'rejected')}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-black shadow-lg hover:bg-red-600 transition-all"
                        >
                          <XCircle size={18} /> رفض الطلب
                        </button>
                      </>
                    ) : (
                      <span className={`px-6 py-3 rounded-2xl font-black text-sm ${
                        r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {r.status === 'approved' ? 'تمت الموافقة' : 'تم الرفض'}
                      </span>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-20 text-center text-gray-400 font-bold">لا توجد طلبات زيارة ميدانية.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
