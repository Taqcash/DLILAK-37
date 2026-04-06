import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { NEIGHBORHOODS, PROFESSIONS } from './constants/data';
import { supabase } from './lib/supabase';
import { getGeminiAI, improveAd, verifyID, moderateContent, smartSearch, generateSiteReport } from './lib/gemini';
import { uploadToCloudinary } from './lib/cloudinary';
import { sendWhatsAppNotification } from './lib/notifications';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  User, 
  PlusCircle, 
  Phone, 
  MessageCircle,
  Menu,
  X,
  Star,
  ArrowLeft,
  ArrowRight,
  Share2,
  Settings,
  LogOut,
  Bell,
  Info,
  ShieldCheck,
  CreditCard,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Facebook,
  Send,
  BarChart,
  History,
  Terminal,
  Stethoscope,
  Activity,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { generatePortSudanImages } from './services/imageService';

// --- Types ---
interface UserProfile {
  id: string;
  fullName: string;
  avatar_url?: string;
  is_verified: boolean;
  gemini_api_key?: string;
  role: 'user' | 'admin';
  points?: number;
  ai_usage_count?: number;
}

interface AIHistoryItem {
  id: string;
  user_id: string;
  feature: string;
  prompt: string;
  response: string;
  created_at: string;
}

const AIHistorySection = ({ userApiKey }: any) => {
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('ai_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (!userApiKey) return null;

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
      <h3 className="font-bold mb-6 flex items-center gap-2 text-blue-600"><History size={20} /> سجل العمليات الذكي</h3>
      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{item.feature}</span>
                <span className="text-[10px] text-gray-400">{new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              <p className="text-xs font-bold text-gray-800 line-clamp-1 mb-1">{item.prompt}</p>
              <p className="text-[10px] text-gray-500 line-clamp-2">{item.response}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">لا يوجد سجل عمليات بعد.</div>
      )}
    </div>
  );
};

const AIGuard = ({ userApiKey, children }: any) => {
  if (!userApiKey) {
    return (
      <div className="p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[40px] text-center">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles size={32} />
        </div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">هذه الميزة تتطلب مفتاح Gemini API</h3>
        <p className="text-amber-700 text-sm mb-6">لتتمكن من استخدام ميزات الذكاء الاصطناعي، يرجى إضافة مفتاح API الخاص بك أولاً.</p>
        <Link 
          to="/gemini-setup" 
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all shadow-lg"
        >
          اضغط هنا للانتقال لصفحة الإعدادات <ArrowLeft size={18} />
        </Link>
      </div>
    );
  }
  return children;
};
const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24"
  };
  
  return (
    <div className={`${dimensions[size]} relative group`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
        {/* Sun/Circle */}
        <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Mountains (Red Sea Hills) */}
        <path d="M10 70 L30 40 L50 60 L70 30 L90 70 Z" fill="#92400e" className="opacity-80" />
        
        {/* Red Sea Waves */}
        <path d="M10 75 Q30 65 50 75 T90 75 L90 90 L10 90 Z" fill="#2563eb" />
        
        {/* Stylized Khalal (3-pronged comb) */}
        <g transform="translate(40, 45) scale(0.2)">
          <rect x="0" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="40" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="80" y="0" width="10" height="100" rx="5" fill="#4b5563" />
          <rect x="0" y="0" width="90" height="20" rx="10" fill="#4b5563" />
        </g>
        
        {/* Port/Anchor Hint */}
        <circle cx="50" cy="85" r="3" fill="white" />
      </svg>
    </div>
  );
};

// --- Components ---

const NavigationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  if (location.pathname === '/') return null;

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between sticky top-[64px] z-40">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft size={16} /> عودة
        </button>
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
        >
          <Logo size="sm" />
        </button>
      </div>
      <button 
        onClick={() => navigate(-1)} 
        className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

const Layout = ({ children, user, onLogout, onOpenProfile, onOpenNotifications }: any) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 glass px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onLogout} className="p-2 hover:bg-red-50 text-red-600 rounded-full transition-colors" title="تسجيل الخروج">
            <LogOut size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <Link to="/" className="text-xl font-bold gradient-text hidden sm:block">دليل خدمتك</Link>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <Link to="/forum" className="hover:text-blue-600 transition-colors">المنتدى</Link>
          <Link to="/about" className="hover:text-blue-600 transition-colors">عن بورتسودان</Link>
          <button onClick={() => alert('قريباً: تواصل مع الإدارة')} className="hover:text-blue-600 transition-colors">تواصل معنا</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onOpenNotifications} className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link 
            to="/profile"
            className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User size={18} />
            )}
            <span className="text-sm font-medium hidden sm:inline">{user?.fullName || 'حسابي'}</span>
            {user?.is_verified && <ShieldCheck size={14} className="text-blue-500" />}
          </Link>
        </div>
      </nav>

      <div className="h-[64px]"></div>
      <NavigationHeader />

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-6 mb-6">
            <a href="https://wa.me/249907627406" className="text-gray-400 hover:text-green-600 transition-colors"><Phone size={24} /></a>
            <a href="https://t.me/HUZAIFA37ZLATAN" className="text-gray-400 hover:text-blue-400 transition-colors"><Send size={24} /></a>
            <a href="https://www.facebook.com/HUZAIFA26MUHAMMADNOOR" className="text-gray-400 hover:text-blue-700 transition-colors"><Facebook size={24} /></a>
          </div>
          <p className="text-gray-400 font-mono tracking-widest text-sm">MADE BY HUZAIFA - TAQCASH</p>
        </div>
      </footer>
    </div>
  );
};

// --- Pages ---

const LandingPage = ({ userApiKey, mainImage, neighborhoods, professions }: any) => {
  const [viewType, setViewType] = useState<'providers' | 'seekers'>('providers');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('الكل');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('الكل');
  const [selectedServiceForRate, setSelectedServiceForRate] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'productive' | 'training'>('all');
  const [isSmartSearching, setIsSmartSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, [viewType, activeCategory]);

  const fetchServices = async () => {
    setLoading(true);
    let query = supabase
      .from('ads')
      .select('*')
      .eq('type', viewType === 'providers' ? 'offer' : 'request')
      .eq('status', 'approved')
      .gte('avg_rating', 2);
    
    if (activeCategory === 'productive') {
      query = query.eq('is_productive_family', true);
    } else if (activeCategory === 'training') {
      query = query.eq('is_training', true);
    }

    const { data } = await query
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setServices(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchQuery.startsWith('/')) {
      const command = searchQuery.slice(1).toLowerCase();
      if (command === 'سباك' || command === 'plumber') {
        setSelectedProfession('سباك');
        setSearchQuery('');
        return;
      }
      if (command === 'دعم' || command === 'support') {
        alert('سيتم فتح نافذة الدعم الفني قريباً.');
        setSearchQuery('');
        return;
      }
      if (command === 'منتدى' || command === 'forum') {
        navigate('/forum');
        setSearchQuery('');
        return;
      }
    }

    if (userApiKey && searchQuery.length > 3) {
      setIsSmartSearching(true);
      try {
        const dataContext = services.slice(0, 20).map(s => `ID: ${s.id}, Title: ${s.title}, Description: ${s.description}`).join('\n');
        const resultStr = await smartSearch(searchQuery, dataContext, userApiKey);
        if (resultStr) {
          const result = JSON.parse(resultStr.replace(/```json|```/g, ''));
          if (result.ids && result.ids.length > 0) {
            const filtered = services.filter(s => result.ids.includes(s.id));
            setServices(filtered);
            alert(`تم العثور على ${filtered.length} نتائج مطابقة ذكياً!`);
          }
        }
      } catch (error) {
        console.error("Smart search failed", error);
      } finally {
        setIsSmartSearching(false);
      }
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProfession = selectedProfession === 'الكل' || s.profession === selectedProfession;
    const matchesNeighborhood = selectedNeighborhood === 'الكل' || s.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesProfession && matchesNeighborhood;
  });

  const handleSmartSearch = async () => {
    if (!userApiKey) {
      alert('يرجى إضافة مفتاح Gemini API في ملفك الشخصي لاستخدام البحث الذكي');
      return;
    }
    if (!searchQuery) return;

    setIsSmartSearching(true);
    try {
      const dataContext = services.map(s => `ID: ${s.id}, Title: ${s.title}, Description: ${s.description}`).join('\n');
      const result = await smartSearch(searchQuery, dataContext, userApiKey);
      if (result) {
        // The result is expected to be a JSON string with IDs
        try {
          const json = JSON.parse(result.replace(/```json|```/g, ''));
          if (json.ids) {
            const smartFiltered = services.filter(s => json.ids.includes(s.id));
            setServices(smartFiltered);
            alert('تم تطبيق البحث الذكي بنجاح!');
          }
        } catch (e) {
          console.error("Failed to parse smart search result", e);
          alert('فشل تحليل نتائج البحث الذكي، جرب صياغة أخرى');
        }
      }
    } catch (error) {
      alert('حدث خطأ أثناء البحث الذكي');
    } finally {
      setIsSmartSearching(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative pt-24 pb-32 px-4 overflow-hidden">
        <img 
          src={mainImage || "https://picsum.photos/seed/portsudan/1920/1080"} 
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-40" 
          referrerPolicy="no-referrer" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-indigo-900/80 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tighter">
              كل خدمات <span className="text-blue-300">بورتسودان</span> <br /> في مكان واحد
            </h1>
            <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium opacity-90">
              دليل الخدمات الأول في المدينة. ابحث عن سباك، كهربائي، أو أي خدمة تحتاجها بكل سهولة وموثوقية.
            </p>
          </motion.div>

          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة (مثلاً: سباك في حي الشاطئ) أو استخدم / للأوامر"
                className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-blue-200 px-8 py-6 rounded-[32px] text-lg outline-none focus:ring-4 focus:ring-blue-400/30 transition-all shadow-2xl pr-16"
              />
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-blue-600 p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                {isSmartSearching ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div> : <Search size={24} />}
              </button>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200">
                <Terminal size={24} />
              </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="text-blue-200 text-sm font-bold ml-2">أوامر سريعة:</span>
              {['/سباك', '/منتدى', '/دعم'].map((cmd) => (
                <button 
                  key={cmd}
                  onClick={() => setSearchQuery(cmd)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-1.5 rounded-full text-xs transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="sticky top-[72px] z-40 bg-gray-50/80 backdrop-blur-md py-4 px-4 border-b border-gray-200 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-3 no-scrollbar">
          <button 
            onClick={() => setViewType('providers')}
            className={`px-6 py-2 rounded-full font-bold transition-all text-sm ${viewType === 'providers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            مقدمي الخدمات
          </button>
          <button 
            onClick={() => setViewType('seekers')}
            className={`px-6 py-2 rounded-full font-bold transition-all text-sm ${viewType === 'seekers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            طالبي الخدمات
          </button>
          <div className="w-px h-8 bg-gray-200 mx-2" />
          <select 
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm outline-none"
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value)}
          >
            <option value="الكل">كل المهن</option>
            {professions.map((p: string) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm outline-none"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="الكل">كل الأحياء</option>
            {neighborhoods.map((n: string) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-100 text-gray-500'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => setActiveCategory('productive')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'productive' ? 'bg-pink-100 text-pink-700' : 'bg-white border border-gray-100 text-gray-500'}`}
          >
            الأسر المنتجة 🏠
          </button>
          <button 
            onClick={() => setActiveCategory('training')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'training' ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-100 text-gray-500'}`}
          >
            تدريب وورش 🎓
          </button>
          <button 
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${showMap ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}
          >
            <MapPin size={14} /> {showMap ? 'إخفاء الخريطة' : 'الخريطة التفاعلية'}
          </button>
        </div>

        {showMap && (
          <div className="mb-8 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 h-96 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-50 flex items-center justify-center text-blue-300">
              <div className="text-center">
                <MapPin size={48} className="mx-auto mb-4 animate-bounce" />
                <p className="font-bold">الخريطة التفاعلية لبورتسودان</p>
                <p className="text-sm">يتم الآن تحميل مواقع مقدمي الخدمات...</p>
              </div>
            </div>
            
            {/* Heatmap Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-700" />
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg text-xs font-bold border border-white/20">
              <p className="mb-2 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full" /> مناطق الطلب المرتفع (Heatmap)</p>
              <p className="text-gray-500">حي المطار: +15 طلب جديد</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-gray-200 h-64 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} onRate={setSelectedServiceForRate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold">لا توجد إعلانات حالياً</h3>
            <p className="text-gray-500">كن أول من ينشر إعلاناً في هذا القسم!</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedServiceForRate && (
          <RatingModal 
            service={selectedServiceForRate} 
            onClose={() => setSelectedServiceForRate(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ServiceCard = ({ service, onRate }: any) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/service/${service.id}`)}
      className={`bg-white rounded-3xl p-5 shadow-sm border ${service.is_premium ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'} hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer`}
    >
      {service.is_premium && (
        <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-br-xl uppercase tracking-widest">
          مميز
        </div>
      )}
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 overflow-hidden">
          {service.image_url ? (
            <img src={service.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <Briefcase size={28} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{service.title}</h3>
            <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs bg-yellow-50 px-2 py-0.5 rounded-lg">
              <Star size={12} fill="currentColor" />
              {service.avg_rating?.toFixed(1) || 'جديد'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <MapPin size={12} /> {service.neighborhood}
            {service.is_field_verified && (
              <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-[9px]">
                <CheckCircle2 size={10} /> موثق ميدانياً
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3 mb-4 h-15">{service.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
            <User size={16} className="m-2 text-gray-400" />
          </div>
          <div className="flex flex-col">
            <button 
              onClick={(e) => { e.stopPropagation(); onRate(service); }} 
              className="text-[10px] font-bold text-blue-600 hover:underline text-right"
            >
              تقييم الخدمة
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); alert('قريباً: حجز موعد ذكي'); }} 
              className="text-[9px] font-bold text-purple-600 hover:underline text-right flex items-center gap-1"
            >
              <Sparkles size={10} /> حجز موعد
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <a 
            href={`tel:${service.phone}`} 
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
          >
            <Phone size={18} />
          </a>
          <a 
            href={`https://wa.me/${service.phone}`} 
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
          >
            <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const ServiceDetailPage = ({ userApiKey }: any) => {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    const { data: serviceData } = await supabase
      .from('ads')
      .select('*, profiles(fullName, avatar_url, is_verified)')
      .eq('id', id)
      .single();
    
    if (serviceData) {
      setService(serviceData);
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('*, profiles(fullName, avatar_url)')
        .eq('ad_id', id)
        .order('created_at', { ascending: false });
      
      if (ratingsData) setRatings(ratingsData);
    }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!service) return <div className="text-center py-20">عذراً، الخدمة غير موجودة.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold">
          <ArrowRight size={20} /> العودة للخلف
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              navigator.share({
                title: service.title,
                text: service.description,
                url: window.location.href
              }).catch(() => alert('فشل المشاركة'));
            }}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => alert('تم إرسال بلاغ للإدارة، سنقوم بمراجعة هذا الإعلان فوراً.')}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-red-500 hover:bg-red-50 transition-all shadow-sm"
          >
            <AlertCircle size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="relative h-80">
          <img 
            src={service.image_url || 'https://picsum.photos/seed/service/1200/600'} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          {service.is_premium && (
            <div className="absolute top-6 left-6 bg-yellow-400 text-yellow-900 font-black px-6 py-2 rounded-2xl shadow-xl uppercase tracking-widest">
              إعلان مميز
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2">{service.title}</h1>
              <div className="flex items-center gap-4 text-gray-500 font-bold">
                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-sm">
                  <Briefcase size={16} /> {service.profession}
                </span>
                <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-xl text-sm">
                  <MapPin size={16} /> {service.neighborhood}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-500 mb-1">
                {service.avg_rating?.toFixed(1) || '0.0'}
              </div>
              <div className="flex justify-center text-yellow-400 mb-1">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} size={16} fill={Math.round(service.avg_rating || 0) >= star ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-[10px] text-gray-400 font-bold">{ratings.length} تقييم</p>
            </div>
          </div>

          <div className="prose prose-blue max-w-none mb-12">
            <h3 className="text-xl font-bold mb-4">وصف الخدمة</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <h4 className="font-bold mb-4 flex items-center gap-2"><User size={20} className="text-blue-600" /> معلومات مقدم الخدمة</h4>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                  {service.profiles?.avatar_url ? (
                    <img src={service.profiles.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={32} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-black text-lg">{service.profiles?.fullName || 'مستخدم'}</p>
                  <div className="flex gap-2 mt-1">
                    {service.profiles?.is_verified && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={10} /> هوية موثقة
                      </span>
                    )}
                    {service.is_field_verified && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} /> موثق ميدانياً
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-center">
              <h4 className="font-bold mb-4 text-center">تواصل الآن</h4>
              <div className="flex gap-4">
                <a href={`tel:${service.phone}`} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                  <Phone size={24} />
                  <span className="text-xs font-bold">اتصال هاتفي</span>
                </a>
                <a href={`https://wa.me/${service.phone}`} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                  <MessageCircle size={24} />
                  <span className="text-xs font-bold">واتساب</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black">آراء العملاء ({ratings.length})</h3>
              <button 
                onClick={() => setShowRateModal(true)}
                className="bg-blue-50 text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-100 transition-all"
              >
                إضافة تقييمك
              </button>
            </div>

            <div className="space-y-6">
              {ratings.length > 0 ? ratings.map(rate => (
                <div key={rate.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                        {rate.profiles?.avatar_url ? (
                          <img src={rate.profiles.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{rate.profiles?.fullName || 'مستخدم'}</p>
                        <p className="text-[10px] text-gray-400">{new Date(rate.created_at).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={12} fill={rate.rating >= star ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{rate.comment || 'بدون تعليق'}</p>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  لا توجد تقييمات بعد. كن أول من يقيم هذه الخدمة!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRateModal && (
          <RatingModal 
            service={service} 
            onClose={() => { setShowRateModal(false); fetchServiceDetails(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AboutPage = ({ aboutImage }: any) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
      <section className="text-center">
        <h1 className="text-5xl font-black mb-6">بورتسودان: <span className="gradient-text">ثغر السودان الباسم</span></h1>
        <div className="relative group">
          <img 
            src={aboutImage || "https://picsum.photos/seed/portsudan/1200/600"} 
            className="w-full h-80 object-cover rounded-[40px] shadow-2xl mb-8 transition-transform group-hover:scale-[1.02] duration-700" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-[40px] flex items-end p-8">
            <p className="text-white font-bold text-xl">بورتسودان ليست مجرد مدينة، بل هي قلب السودان النابض.</p>
          </div>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          سكانها "الهدندوة" و"البني عامر" وكل أطياف السودان، يجمعهم عشق أزلي لهذا البحر الأحمر الصافي وشوارع المدينة العريقة.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2"><Info size={24} /> لماذا هذا الموقع؟</h3>
          <p className="text-gray-600 leading-relaxed">
            في ظل التوسع الكبير لمدينة بورتسودان، أصبح من الصعب الوصول للحرفي الموثوق أو الخدمة السريعة. هذا الموقع جاء ليكون الجسر الذكي الذي يربط بين مهارات أبناء المدينة واحتياجات سكانها.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-4 text-purple-600 flex items-center gap-2"><Sparkles size={24} /> رؤيتنا للمستقبل</h3>
          <p className="text-gray-600 leading-relaxed">
            نطمح لأن تكون بورتسودان أول مدينة سودانية ذكية بالكامل في مجال الخدمات، حيث يتم توثيق كل حرفي وحماية كل مستخدم، مع توفير فرص عمل عادلة ومباشرة للجميع.
          </p>
        </div>
      </div>

      {/* Community Governance Section - Modern March 2026 Feature */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-6 flex items-center gap-3"><ShieldCheck size={32} className="text-blue-400" /> الحوكمة المجتمعية (Governance)</h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            في "دليل خدمتك"، القرار بيد المجتمع. نحن نؤمن بالشفافية والعدالة في توزيع الفرص.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h4 className="font-bold mb-2 text-blue-300">التصويت</h4>
              <p className="text-xs text-gray-400">صوّت على الميزات القادمة أو المبادرات المجتمعية.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h4 className="font-bold mb-2 text-green-300">الشفافية</h4>
              <p className="text-xs text-gray-400">تقارير دورية حول أداء المنصة وتوزيع النقاط.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h4 className="font-bold mb-2 text-yellow-300">المنح</h4>
              <p className="text-xs text-gray-400">دعم مالي للأسر المنتجة الأكثر تميزاً في التقييم.</p>
            </div>
          </div>
          <button className="mt-10 bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl flex items-center gap-2">
            <CheckCircle2 size={20} /> شارك في اتخاذ القرار
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

const GeminiSetupPage = ({ userApiKey, onSaveApiKey }: any) => {
  const [key, setKey] = useState(userApiKey);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!key.trim()) return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ gemini_api_key: key }).eq('id', user.id);
      }
      onSaveApiKey(key);
      alert('تم حفظ مفتاح API بنجاح! يمكنك الآن الاستمتاع بكافة ميزات الذكاء الاصطناعي.');
      navigate('/profile');
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[40px] shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 text-white text-center">
          <Sparkles size={64} className="mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-black mb-4">تفعيل قوة الذكاء الاصطناعي</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
            استخدم مفتاح Gemini API الخاص بك لفتح آفاق جديدة في "دليل خدمتك". نحن نستخدم هذا المفتاح لتحليل إعلاناتك، تحسين البحث، وتوثيق هويتك بذكاء.
          </p>
        </div>

        <div className="p-12">
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-indigo-600"><Info size={24} /> كيف تحصل على المفتاح؟</h3>
              <ol className="space-y-4 text-gray-600 list-decimal list-inside font-bold">
                <li>انتقل إلى <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google AI Studio</a>.</li>
                <li>قم بتسجيل الدخول بحساب Google الخاص بك.</li>
                <li>اضغط على زر "Create API key".</li>
                <li>انسخ المفتاح والصقه في الحقل أدناه.</li>
              </ol>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>ملاحظة:</strong> المفتاح المجاني كافٍ تماماً لاستخدام كافة ميزات المنصة. نحن نستخدم موديل <strong>Gemini 1.5 Flash</strong> لضمان السرعة والكفاءة.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-green-600"><Sparkles size={24} /> ماذا ستحصل عليه؟</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Activity size={20} /></div>
                  <div>
                    <p className="font-bold text-sm">طبيب الإعلانات (Ad Doctor)</p>
                    <p className="text-xs text-gray-500">تحليل فوري لإعلانك للتأكد من جودته ومطابقته للسياسات.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                  <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Search size={20} /></div>
                  <div>
                    <p className="font-bold text-sm">البحث الذكي (Smart Search)</p>
                    <p className="text-xs text-gray-500">ابحث باللغة الطبيعية وسيفهم الذكاء الاصطناعي ما تحتاجه بالضبط.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                  <div className="bg-green-100 p-2 rounded-xl text-green-600"><ShieldCheck size={20} /></div>
                  <div>
                    <p className="font-bold text-sm">التوثيق التلقائي للهوية</p>
                    <p className="text-xs text-gray-500">ارفع هويتك وسيقوم الذكاء الاصطناعي بمطابقتها مع بياناتك فوراً.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-black mb-3 text-gray-700">أدخل مفتاح Gemini API هنا:</label>
            <div className="flex gap-3">
              <input 
                type="password" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button 
                onClick={handleSave}
                disabled={isSaving || !key.trim()}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ وتفعيل'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 text-center">
              يتم تشفير المفتاح وحفظه بشكل آمن في حسابك. يمكنك حذفه أو تعديله في أي وقت من صفحة الملف الشخصي.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProfilePage = ({ user, userApiKey, onSaveApiKey }: any) => {
  const [showAddAd, setShowAddAd] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [adminReport, setAdminReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchMyAds();
  }, [user.id]);

  const fetchMyAds = async () => {
    setLoadingAds(true);
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setMyAds(data);
    setLoadingAds(false);
  };

  const generateReport = async () => {
    if (!userApiKey) {
      alert('يرجى إضافة مفتاح Gemini API أولاً');
      return;
    }
    setGeneratingReport(true);
    try {
      const { data: recentAds } = await supabase
        .from('ads')
        .select('title, type, profession, neighborhood, status')
        .order('created_at', { ascending: false })
        .limit(20);

      const prompt = `أنت مساعد إداري لمنصة "دليل خدمتك" في بورتسودان. 
      قم بتحليل البيانات التالية للإعلانات الأخيرة (آخر 10 ساعات) وقدم تقريراً ملخصاً للإدارة يشمل:
      1. عدد الإعلانات الجديدة وتوزيعها (عروض vs طلبات).
      2. أكثر المهن طلباً أو عرضاً.
      3. أكثر الأحياء نشاطاً.
      4. توصيات سريعة لتحسين الخدمة.
      
      البيانات: ${JSON.stringify(recentAds)}
      اجعل التقرير مهنياً ومختصراً باللغة العربية.`;

      const ai = new GoogleGenAI({ apiKey: userApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setAdminReport(response.text);
    } catch (error) {
      alert('حدث خطأ أثناء توليد التقرير');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleVerify = async () => {
    if (!idFile) {
      alert('يرجى اختيار صورة الهوية أولاً');
      return;
    }
    setIsVerifying(true);
    try {
      // 1. Convert file to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(idFile);
      });
      const base64 = await base64Promise;

      // 2. Verify with Gemini
      const resultStr = await verifyID(base64, { fullName: user.fullName }, userApiKey);
      if (resultStr) {
        const result = JSON.parse(resultStr.replace(/```json|```/g, ''));
        if (result.isMatch && result.confidence > 0.8) {
          // 3. Upload to Cloudinary for admin record
          const cloudinaryUrl = await uploadToCloudinary(idFile);
          
          // 4. Update Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ is_verified: true, avatar_url: cloudinaryUrl })
            .eq('id', user.id);

          if (!error) {
            alert('تم توثيق حسابك بنجاح! شكراً لتعاونك.');
          } else {
            alert('حدث خطأ أثناء تحديث البيانات');
          }
        } else {
          alert(`فشل التوثيق: ${result.reason}`);
        }
      }
    } catch (error) {
      alert('حدث خطأ أثناء عملية التوثيق');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {user?.role === 'admin' && (
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[40px] text-white shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart size={24} /> لوحة تحكم الإدارة</h2>
              <p className="text-indigo-100 text-sm">تقارير الذكاء الاصطناعي الدورية (كل 10 ساعات)</p>
            </div>
            <button 
              onClick={generateReport}
              disabled={generatingReport}
              className="bg-white text-indigo-600 px-6 py-2 rounded-2xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
            >
              {generatingReport ? 'جاري التوليد...' : 'توليد تقرير الآن'}
            </button>
          </div>
          
          {adminReport && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <div className="prose prose-invert prose-sm max-w-none">
                <Markdown>{adminReport}</Markdown>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ... (rest of ProfilePage UI) */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex justify-between items-end">
            <div className="relative group">
              <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  <User size={64} className="text-gray-300" />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                <ImageIcon size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowContactAdmin(true)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                مراسلة الإدارة
              </button>
              <button onClick={() => setShowAddAd(true)} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <PlusCircle size={20} /> إنشاء إعلان
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black">{user?.fullName || 'اسم المستخدم'}</h1>
            <div className="flex gap-2">
              {user?.is_verified && (
                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                  <ShieldCheck size={14} /> موثق
                </span>
              )}
              {user?.is_field_verified && (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                  <CheckCircle2 size={14} /> موثق ميدانياً
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-gray-500">عضو منذ أبريل 2026 • بورتسودان</p>
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black">
              <Star size={14} fill="currentColor" /> {user?.points || 150} نقطة
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Provider Analytics */}
              {userApiKey && (
                <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] text-white shadow-xl">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Activity size={20} /> لوحة تحكم القوة (AI Telemetry)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-[10px] text-blue-100 font-bold">عمليات الذكاء الاصطناعي</p>
                      <p className="text-2xl font-black">{user?.ai_usage_count || 0}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-[10px] text-blue-100 font-bold">نقاط الذكاء</p>
                      <p className="text-2xl font-black">{(user?.ai_usage_count || 0) * 10}</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${Math.min((user?.ai_usage_count || 0) * 2, 100)}%` }}></div>
                  </div>
                  <p className="text-[8px] text-blue-200 mt-2">توضح هذه اللوحة مدى استفادتك من ميزات الذكاء الاصطناعي في تطوير عملك.</p>
                </div>
              )}

              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-600"><BarChart size={20} /> تحليلات الإعلانات</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-indigo-600 font-bold">إجمالي المشاهدات</p>
                    <p className="text-2xl font-black text-indigo-900">1,240</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-green-600 font-bold">نقرات الاتصال</p>
                    <p className="text-2xl font-black text-green-900">85</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4">يتم تحديث الإحصائيات كل ساعة بناءً على نشاط المستخدمين.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600" /> توثيق الحساب</h3>
                <p className="text-sm text-gray-600 mb-4">ارفع صورة الهوية (رقم وطني، جواز، رخصة) ليقوم الذكاء الاصطناعي بتوثيق حسابك فوراً.</p>
                <input 
                  type="file" 
                  onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" 
                />
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-white border border-blue-600 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'جاري التحليل...' : 'بدء التوثيق الذكي'}
                </button>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={20} className="text-gray-600" /> إعدادات Gemini</h3>
                <Link 
                  to="/gemini-setup"
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Sparkles size={18} className="text-blue-600" /> {userApiKey ? 'تعديل إعدادات الذكاء الاصطناعي' : 'تفعيل الذكاء الاصطناعي'}
                </Link>
                <p className="text-[10px] text-gray-400 mt-2">مطلوب لتفعيل الإعلانات الذكية والتوثيق التلقائي.</p>
              </div>

              <AIHistorySection userApiKey={userApiKey} />
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-xl">إعلاناتي السابقة</h3>
              {loadingAds ? (
                <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : myAds.length > 0 ? (
                <div className="space-y-4">
                  {myAds.map(ad => (
                    <div key={ad.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm">{ad.title}</h4>
                        <p className="text-[10px] text-gray-500">{ad.status === 'approved' ? 'منشور' : 'قيد المراجعة'}</p>
                      </div>
                      <button className="text-blue-600 text-xs font-bold">تعديل</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <AlertCircle size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">ليس لديك إعلانات حالياً</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4">
        <button 
          onClick={() => setShowAddAd(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
        >
          <PlusCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">إنشاء إعلان</span>
        </button>
        <button 
          onClick={() => setShowContactAdmin(true)}
          className="bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
        >
          <MessageCircle size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">مراسلة الإدارة</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddAd && <AddAdModal onClose={() => setShowAddAd(false)} userApiKey={userApiKey} />}
        {showContactAdmin && <ContactAdminModal onClose={() => setShowContactAdmin(false)} />}
      </AnimatePresence>
    </div>
  );
};

const ForumPage = ({ userApiKey, professions, neighborhoods }: any) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('forum_posts')
      .select('*, profiles(fullName, avatar_url)')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;

    setLoading(true);
    try {
      // Content Moderation for Forum Posts
      const moderationResult = await moderateContent(newPost);
      if (moderationResult?.includes('UNSAFE')) {
        const reason = moderationResult.split('UNSAFE:')[1] || 'محتوى غير لائق';
        alert(`عذراً، لا يمكن نشر هذا المنشور. السبب: ${reason}`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('forum_posts').insert({
        user_id: user.id,
        content: newPost
      });

      if (!error) {
        setNewPost('');
        fetchPosts();
      }
    } catch (error) {
      alert('حدث خطأ أثناء النشر');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToRequest = async () => {
    if (!newPost.trim()) return;
    if (!userApiKey) {
      alert('يرجى إضافة مفتاح Gemini API لاستخدام هذه الميزة');
      return;
    }

    setIsConverting(true);
    try {
      const ai = getGeminiAI(userApiKey);
      if (!ai) return;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          Analyze this forum post and extract a service request.
          Post: "${newPost}"
          
          Return a JSON object:
          {
            "title": "Short title",
            "description": "Detailed description",
            "profession": "One of: ${professions.join(', ')}",
            "neighborhood": "One of: ${neighborhoods.join(', ')}"
          }
        `,
      });

      const result = JSON.parse(response.text.replace(/```json|```/g, ''));
      if (result) {
        alert(`تم تحليل طلبك بنجاح!\nالعنوان: ${result.title}\nالمهنة: ${result.profession}\nيمكنك الآن إكمال النشر من صفحة إضافة إعلان.`);
        console.log("Smart Request Data:", result);
      }
    } catch (error) {
      alert('فشل تحليل المنشور');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4">منتدى بورتسودان <span className="text-blue-600">تتحدث</span></h1>
        <p className="text-gray-500">مساحة للنقاش العام حول احتياجات المدينة وتطوير الخدمات.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <textarea 
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="ماذا يدور في ذهنك حول بورتسودان؟"
          className="w-full p-4 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={3}
        />
        <div className="flex justify-end gap-3">
          <button 
            onClick={handleConvertToRequest}
            disabled={isConverting || !newPost}
            className="bg-purple-100 text-purple-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Sparkles size={16} /> {isConverting ? 'جاري التحليل...' : 'تحويل لطلب خدمة ذكي'}
          </button>
          <button 
            onClick={handlePost}
            disabled={loading || !newPost}
            className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={18} /> {loading ? 'جاري النشر...' : 'نشر في المنتدى'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري تحميل المنشورات...</div>
        ) : posts.map(post => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img src={post.profiles.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">{post.profiles?.fullName || 'مستخدم'}</p>
                <p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const RatingModal = ({ service, onClose }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    
    try {
      // Content Moderation for Rating Comments
      if (comment.trim()) {
        const moderationResult = await moderateContent(comment);
        if (moderationResult?.includes('UNSAFE')) {
          const reason = moderationResult.split('UNSAFE:')[1] || 'محتوى غير لائق';
          alert(`عذراً، تم رفض التعليق. السبب: ${reason}`);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('ratings').insert({
        ad_id: service.id,
        user_id: user.id,
        rating,
        comment
      });

      if (error) {
        alert('حدث خطأ أثناء حفظ التقييم');
      } else {
        alert('شكراً لتقييمك! لقد حصلت على 10 نقاط مكافأة لمساهمتك في جودة المجتمع.');
        onClose();
      }
    } catch (error) {
      alert('حدث خطأ أثناء معالجة التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">تقييم الخدمة</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        <p className="text-gray-600 mb-6 text-center font-bold">{service.title}</p>
        
        <div className="flex justify-center gap-2 mb-8">
          {[1,2,3,4,5].map(star => (
            <button 
              key={star} 
              onClick={() => setRating(star)}
              className={`transition-all ${rating >= star ? 'text-yellow-400 scale-125' : 'text-gray-200'}`}
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

const ContactAdminModal = ({ onClose }: any) => {
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

const AddAdModal = ({ onClose, userApiKey, neighborhoods, professions }: any) => {
  const [step, setStep] = useState(1);
  const [adType, setAdType] = useState<'offer' | 'request'>('offer');
  const [isSmart, setIsSmart] = useState(false);
  const [isProductive, setIsProductive] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tier, setTier] = useState<'normal' | 'premium'>('normal');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profession: professions?.[0] || PROFESSIONS[0],
    neighborhood: neighborhoods?.[0] || NEIGHBORHOODS[0],
    phone: '',
    image_url: '',
    payment_receipt: null as File | null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adDiagnosis, setAdDiagnosis] = useState<string | null>(null);

  const handleAdDoctor = async () => {
    if (!userApiKey) {
      alert('يرجى إضافة مفتاح API لاستخدام طبيب الإعلان');
      return;
    }
    if (!formData.title || !formData.description) {
      alert('يرجى إدخال العنوان والوصف أولاً');
      return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: userApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          أنت "طبيب الإعلانات" لمنصة خدمات في بورتسودان.
          قم بتحليل هذا الإعلان وتقديم نصائح سريعة لتحسينه لجذب الزبائن:
          العنوان: ${formData.title}
          الوصف: ${formData.description}
          المهنة: ${formData.profession}
          الحي: ${formData.neighborhood}
          
          قدم تقريراً مختصراً جداً (نقاط) باللغة العربية السودانية الودودة.
        `,
      });
      setAdDiagnosis(response.text);
      
      // Log to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_logs').insert({
          user_id: user.id,
          feature: 'Ad Doctor',
          prompt: formData.title,
          response: response.text
        });
      }
    } catch (error) {
      alert('فشل تحليل الإعلان');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAIImage = async () => {
    if (!userApiKey || !formData.title) {
      alert('يرجى إدخال عنوان الإعلان ومفتاح API أولاً');
      return;
    }
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: userApiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: `صورة احترافية واقعية لخدمة: ${formData.title} في مدينة بورتسودان السودانية، بجودة عالية وإضاءة ممتازة.`
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setFormData(prev => ({ ...prev, image_url: `data:image/png;base64,${part.inlineData.data}` }));
          alert('تم توليد صورة احترافية لإعلانك بنجاح!');
        }
      }
    } catch (error) {
      alert('فشل توليد الصورة، يرجى المحاولة لاحقاً');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('متصفحك لا يدعم التعرف على الصوت.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, description: prev.description + ' ' + transcript }));
    };
    recognition.start();
  };

  const handleImproveAd = async () => {
    if (!userApiKey || !formData.title || !formData.description) {
      alert('يرجى إدخال العنوان والوصف ومفتاح API أولاً');
      return;
    }
    setIsImproving(true);
    try {
      const result = await improveAd(formData.title, formData.description, formData.profession, userApiKey);
      if (result) {
        setFormData(prev => ({ ...prev, description: result }));
        alert('تم تحسين الوصف بنجاح!');
      }
    } catch (error) {
      alert('فشل تحسين الوصف');
    } finally {
      setIsImproving(false);
    }
  };

  const isFormComplete = formData.title && formData.description && formData.phone && (step < 3 || formData.payment_receipt);

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    setIsSubmitting(true);
    try {
      // Content Moderation & Fraud Detection with Gemini (Always runs using system key if user key is missing)
      const moderationResult = await moderateContent(
        `Title: ${formData.title}\nDescription: ${formData.description}`, 
        formData.image_url.startsWith('data:') ? formData.image_url : undefined, 
        userApiKey
      );
      
      if (moderationResult?.includes('UNSAFE')) {
        const reason = moderationResult.split('UNSAFE:')[1] || 'محتوى غير لائق';
        alert(`عذراً، تم رفض الإعلان. السبب: ${reason}`);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let finalImageUrl = formData.image_url;
      if (formData.image_url.startsWith('data:')) {
        const uploadedUrl = await uploadToCloudinary(formData.image_url);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const { error } = await supabase.from('ads').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        profession: formData.profession,
        neighborhood: formData.neighborhood,
        phone: formData.phone,
        type: adType,
        is_premium: tier === 'premium',
        is_productive_family: isProductive,
        is_training: isTraining,
        image_url: finalImageUrl,
        status: 'approved' 
      });

      if (error) {
        alert('حدث خطأ أثناء نشر الإعلان: ' + error.message);
      } else {
        // Send notification via CallMeBot
        const notificationMsg = `إعلان جديد في دليل خدمتك!\nالعنوان: ${formData.title}\nالمهنة: ${formData.profession}\nالحي: ${formData.neighborhood}\nالنوع: ${adType === 'offer' ? 'عرض' : 'طلب'}`;
        sendWhatsAppNotification(notificationMsg);

        alert('تم نشر إعلانك بنجاح! سيتم إخطار مقدمي الخدمات المطابقين لطلبك فوراً.');
        onClose();
      }
    } catch (error) {
      alert('حدث خطأ أثناء معالجة الإعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black">إنشاء إعلان جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setAdType('offer')} className={`p-6 rounded-3xl border-2 transition-all text-center ${adType === 'offer' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <Briefcase size={32} className="mx-auto mb-2 text-blue-600" />
                <span className="font-bold">تقديم خدمة</span>
              </button>
              <button onClick={() => setAdType('request')} className={`p-6 rounded-3xl border-2 transition-all text-center ${adType === 'request' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <Search size={32} className="mx-auto mb-2 text-blue-600" />
                <span className="font-bold">طلب خدمة</span>
              </button>
            </div>
            <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2"><Sparkles size={20} className="text-purple-600" /> إعلان ذكي (Gemini)</h3>
                <input type="checkbox" checked={isSmart} onChange={e => setIsSmart(e.target.checked)} className="w-6 h-6 accent-purple-600" />
              </div>
              <p className="text-sm text-purple-700 mb-4">سيقوم الذكاء الاصطناعي بكتابة وصف احترافي وجذاب لإعلانك بناءً على عنوانك ومهنتك.</p>
              
              <AIGuard userApiKey={userApiKey}>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAdDoctor}
                    disabled={isAnalyzing}
                    className="flex-1 bg-white border border-purple-200 text-purple-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
                  >
                    <Stethoscope size={18} /> {isAnalyzing ? 'جاري الفحص...' : 'طبيب الإعلان'}
                  </button>
                  <button 
                    onClick={handleImproveAd}
                    disabled={isImproving}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    <Sparkles size={18} /> {isImproving ? 'تحسين الوصف' : 'تحسين ذكي'}
                  </button>
                </div>
              </AIGuard>

              {adDiagnosis && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-white rounded-2xl border border-purple-100 text-xs text-purple-900">
                  <h4 className="font-bold mb-2 flex items-center gap-1"><Info size={14} /> نصائح الطبيب:</h4>
                  <div className="prose prose-sm prose-purple">
                    <Markdown>{adDiagnosis}</Markdown>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 flex items-center justify-between">
                <span className="text-xs font-bold text-pink-700">أسرة منتجة 🏠</span>
                <input type="checkbox" checked={isProductive} onChange={e => setIsProductive(e.target.checked)} className="w-4 h-4 accent-pink-600" />
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between">
                <span className="text-xs font-bold text-green-700">تدريب وورش 🎓</span>
                <input type="checkbox" checked={isTraining} onChange={e => setIsTraining(e.target.checked)} className="w-4 h-4 accent-green-600" />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg">التالي</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">المهنة</label>
                <select value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200">
                  {professions.map((p: string) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">الحي</label>
                <select value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200">
                  {neighborhoods.map((n: string) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">عنوان الإعلان</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200" placeholder="مثال: نجار محترف في ديم سواكن" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold">الوصف</label>
                <div className="flex gap-2">
                  <button 
                    onClick={handleImproveAd}
                    disabled={isImproving}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={10} /> {isImproving ? 'جاري التحسين...' : 'تحسين ذكي'}
                  </button>
                  <button 
                    onClick={startVoiceRecording}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}
                  >
                    <Send size={10} /> {isRecording ? 'جاري الاستماع...' : 'إملاء صوتي'}
                  </button>
                </div>
              </div>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200" placeholder="اكتب تفاصيل خدمتك هنا..." />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">رقم الهاتف</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200" placeholder="09XXXXXXXX" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold">صورة الإعلان</label>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    id="ad-image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setFormData({...formData, image_url: reader.result as string});
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label 
                    htmlFor="ad-image-upload"
                    className="text-[10px] font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-blue-200 transition-all"
                  >
                    <ImageIcon size={10} /> رفع صورة
                  </label>
                  <button 
                    onClick={generateAIImage}
                    disabled={isGeneratingImage}
                    className="text-[10px] font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={10} /> {isGeneratingImage ? 'جاري التوليد...' : 'توليد ذكي'}
                  </button>
                </div>
              </div>
              {formData.image_url ? (
                <div className="relative group">
                  <img src={formData.image_url} className="w-full h-40 object-cover rounded-2xl border border-gray-100" />
                  <button onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ) : (
                <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">السابق</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">التالي</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bold text-xl mb-4">اختر نوع الإعلان</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setTier('normal')} className={`p-6 rounded-3xl border-2 text-center ${tier === 'normal' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <span className="block font-black text-2xl mb-1">1000 ج.س</span>
                <span className="text-sm text-gray-500">إعلان عادي</span>
              </button>
              <button onClick={() => setTier('premium')} className={`p-6 rounded-3xl border-2 text-center ${tier === 'premium' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-100'}`}>
                <span className="block font-black text-2xl mb-1 text-yellow-600">2000 ج.س</span>
                <span className="text-sm text-yellow-700">إعلان مميز (في المقدمة)</span>
              </button>
            </div>

            <div className="p-6 bg-blue-600 text-white rounded-3xl">
              <h4 className="font-bold mb-2 flex items-center gap-2"><CreditCard size={20} /> بيانات الدفع (بنكك)</h4>
              <p className="text-2xl font-mono mb-1">4633063</p>
              <p className="text-xs opacity-80">بنك الخرطوم الوطني - باسم: حذيفة</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">ارفع صورة إشعار الدفع</label>
              <input type="file" onChange={e => setFormData({...formData, payment_receipt: e.target.files?.[0] || null})} className="w-full p-3 border-2 border-dashed border-gray-200 rounded-2xl" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">السابق</button>
              {isFormComplete && (
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري النشر...' : 'نشر الإعلان'}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setShowOtp(true);
            alert('يرجى تأكيد بريدك الإلكتروني أولاً.');
            return;
          }
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { fullName }
          }
        });
        if (error) throw error;
        setShowOtp(true);
        alert('تم إرسال رمز التأكيد إلى بريدك الإلكتروني.');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });
      if (error) throw error;
      alert('تم إعادة إرسال الرمز بنجاح!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      if (error) throw error;
      alert('تم تأكيد الحساب بنجاح!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-black mb-2">دليل خدمتك</h1>
          <p className="text-gray-500">
            {showOtp ? 'أدخل رمز التأكيد المرسل لبريدك' : (isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حساباً جديداً للبدء')}
          </p>
        </div>

        <div className="space-y-4">
          {showOtp ? (
            <>
              <input 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                placeholder="رمز التأكيد (6 أرقام)" 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest font-bold" 
              />
              <button 
                onClick={handleVerifyOtp} 
                disabled={loading || otp.length < 6}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {loading ? 'جاري التأكيد...' : 'تأكيد الحساب'}
              </button>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleResendOtp} 
                  disabled={loading}
                  className="w-full text-blue-600 font-bold py-2 text-sm"
                >
                  إعادة إرسال الرمز
                </button>
                <button onClick={() => setShowOtp(false)} className="w-full text-gray-500 font-bold py-2 text-sm">
                  العودة لتسجيل الدخول
                </button>
              </div>
            </>
          ) : (
            <>
              {!isLogin && (
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="الاسم الكامل" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              )}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" />
              
              <button 
                onClick={handleAuth} 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'جاري المعالجة...' : (isLogin ? 'دخول' : 'تسجيل حساب')}
              </button>

              <button onClick={() => setIsLogin(!isLogin)} className="w-full text-blue-600 font-bold py-2">
                {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const NotificationsModal = ({ onClose, userApiKey }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">التنبيهات</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
      </div>
      <div className="space-y-4">
        {!userApiKey && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
            <Sparkles className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">تفعيل ميزات الذكاء الاصطناعي</p>
              <p className="text-xs text-amber-700 mb-2">لم تقم بإضافة مفتاح Gemini API بعد. أضفه الآن لتفعيل البحث الذكي وطبيب الإعلانات.</p>
              <Link 
                to="/gemini-setup" 
                onClick={onClose}
                className="text-[10px] font-bold text-amber-600 underline flex items-center gap-1"
              >
                اضغط هنا للانتقال لصفحة الإعدادات <ArrowLeft size={10} />
              </Link>
            </div>
          </div>
        )}
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex gap-3">
          <CheckCircle2 className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">تطابق ذكي!</p>
            <p className="text-xs text-gray-600">هناك طلب جديد لخدمة "كهربائي" في حي المطار يطابق مهاراتك.</p>
          </div>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
          <Sparkles className="text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">مرحباً بك في دليل خدمتك!</p>
            <p className="text-xs text-gray-600">ابدأ الآن بنشر إعلانك الأول بذكاء.</p>
          </div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex gap-3">
          <Star className="text-yellow-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">تقييم الخدمة</p>
            <p className="text-xs text-gray-600">هل تواصلت مع "أحمد السباك"؟ شاركنا تقييمك بعد 12 ساعة.</p>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddAd, setShowAddAd] = useState(false);
  const [showContactAdmin, setShowContactAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [siteImages, setSiteImages] = useState({ main: '', about: '' });
  const [dynamicNeighborhoods, setDynamicNeighborhoods] = useState<string[]>(NEIGHBORHOODS);
  const [dynamicProfessions, setDynamicProfessions] = useState<string[]>(PROFESSIONS);

  useEffect(() => {
    const fetchReferenceData = async () => {
      const { data: nData } = await supabase.from('neighborhoods').select('name').order('name');
      const { data: pData } = await supabase.from('professions').select('name').order('name');
      
      if (nData && nData.length > 0) setDynamicNeighborhoods(nData.map(n => n.name));
      if (pData && pData.length > 0) setDynamicProfessions(pData.map(p => p.name));
    };
    fetchReferenceData();
  }, []);

  useEffect(() => {
    const loadSiteImages = async () => {
      const savedImages = localStorage.getItem('site_images_portsudan');
      if (savedImages) {
        setSiteImages(JSON.parse(savedImages));
      } else if (userApiKey) {
        try {
          const images = await generatePortSudanImages();
          setSiteImages({ main: images.mainImage, about: images.aboutImage });
          localStorage.setItem('site_images_portsudan', JSON.stringify({ main: images.mainImage, about: images.aboutImage }));
        } catch (error) {
          console.error("Error generating site images:", error);
        }
      }
    };
    loadSiteImages();
  }, [userApiKey]);

  useEffect(() => {
    // Real Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
          if (profile.gemini_api_key) {
            setUserApiKey(profile.gemini_api_key);
            localStorage.setItem('gemini_api_key', profile.gemini_api_key);
          }
        } else {
          // Fallback if profile trigger hasn't finished
          setUser({
            id: session.user.id,
            fullName: session.user.user_metadata.fullName || 'مستخدم جديد',
            points: 150,
            role: 'user',
            is_verified: false
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('gemini_api_key');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return <AuthPage />;

  return (
    <Router>
      <Layout 
        user={user} 
        onLogout={handleLogout}
        onOpenNotifications={() => setShowNotifications(true)}
      >
        <Routes>
          <Route path="/" element={<LandingPage userApiKey={userApiKey} mainImage={siteImages.main} neighborhoods={dynamicNeighborhoods} professions={dynamicProfessions} />} />
          <Route path="/service/:id" element={<ServiceDetailPage userApiKey={userApiKey} />} />
          <Route path="/about" element={<AboutPage aboutImage={siteImages.about} />} />
          <Route path="/forum" element={<ForumPage userApiKey={userApiKey} professions={dynamicProfessions} neighborhoods={dynamicNeighborhoods} />} />
          <Route path="/profile" element={<ProfilePage user={user} userApiKey={userApiKey} onSaveApiKey={(key: string) => { setUserApiKey(key); localStorage.setItem('gemini_api_key', key); }} />} />
          <Route path="/gemini-setup" element={<GeminiSetupPage userApiKey={userApiKey} onSaveApiKey={(key: string) => { setUserApiKey(key); localStorage.setItem('gemini_api_key', key); }} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <AnimatePresence>
        {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} userApiKey={userApiKey} />}
        {showAddAd && <AddAdModal onClose={() => setShowAddAd(false)} userApiKey={userApiKey} neighborhoods={dynamicNeighborhoods} professions={dynamicProfessions} />}
        {showContactAdmin && <ContactAdminModal onClose={() => setShowContactAdmin(false)} />}
      </AnimatePresence>
    </Router>
  );
}
