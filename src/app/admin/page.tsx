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
  Sparkles
} from 'lucide-react';
import { DBService } from '@/services/dbService';
import { AIService } from '@/services/aiService';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

const COLORS = ['#800020', '#A52A2A', '#D2691E', '#8B4513', '#5D0017'];

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [smartReport, setSmartReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [userApiKey] = useState(typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null);

  useEffect(() => {
    const fetchData = async () => {
      const analytics = await DBService.getAnalyticsData();
      setData(analytics);
      setLoading(false);
    };
    fetchData();
  }, []);

  const generateSmartReport = async () => {
    if (!data || !userApiKey) return;
    setIsGeneratingReport(true);
    try {
      const ai = new AIService(userApiKey);
      const prompt = `بصفتك محلل بيانات ذكي لمنصة "دليل خدمتك" في بورتسودان، قم بتحليل البيانات التالية وقدم تقريراً استراتيجياً مختصراً (Smart Report) يتضمن:
      1. تحليل لنمو المستخدمين والنشاط.
      2. توزيع الخدمات وأكثرها طلباً.
      3. توصيات لتحسين التفاعل وزيادة الإيرادات.
      
      البيانات:
      - عدد المستخدمين: ${data.stats.users}
      - عدد الإعلانات: ${data.stats.ads}
      - عدد مشاركات المنتدى: ${data.stats.posts}
      - الإيرادات التقديرية: ${data.stats.revenue} ريال
      
      اجعل التقرير احترافياً وملهماً بلهجة سودانية مهذبة وراقية.`;
      
      const report = await ai.analyzeGeneral(prompt);
      setSmartReport(report);
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
                <button 
                  onClick={generateSmartReport}
                  disabled={isGeneratingReport || !userApiKey}
                  className="bg-white text-burgundy px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isGeneratingReport ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-burgundy border-t-transparent rounded-full" />
                  ) : (
                    <><FileText size={24} /> إنشاء تقرير ذكي الآن</>
                  )}
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-10 border border-white/10 min-h-[400px] flex flex-col">
                {smartReport ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{smartReport}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                      <Sparkles size={48} />
                    </div>
                    <p className="text-xl font-bold">اضغط على الزر لإنشاء تقرير تحليلي شامل للمنصة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
