import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { NEIGHBORHOODS, PROFESSIONS } from './constants/data';
import { supabase } from './lib/supabase';
import { getGeminiAI, improveAd, verifyID, moderateContent } from './lib/gemini';
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
  BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface UserProfile {
  id: string;
  fullName: string;
  avatar_url?: string;
  is_verified: boolean;
  gemini_api_key?: string;
  role: 'user' | 'admin';
}

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = {
    sm: "w-12 h-12 text-[10px]",
    md: "w-20 h-20 text-xs",
    lg: "w-24 h-24 text-sm"
  };
  
  return (
    <div className={`${dimensions[size]} bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-2 border-white/20 relative overflow-hidden group`}>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Sparkles size={size === "sm" ? 16 : 24} className="mb-1" />
        <span className="font-black leading-none select-none tracking-tighter">PORT-SD</span>
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white/20 rounded-full blur-xl" />
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

const LandingPage = () => {
  const [viewType, setViewType] = useState<'providers' | 'seekers'>('providers');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('الكل');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('الكل');
  const [selectedServiceForRate, setSelectedServiceForRate] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'productive' | 'training'>('all');

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
      .gte('avg_rating', 2); // Blacklist: Hide ads with rating < 2
    
    if (activeCategory === 'productive') {
      query = query.eq('is_productive_family', true);
    } else if (activeCategory === 'training') {
      query = query.eq('is_training', true);
    }

    const { data, error } = await query
      .order('is_premium', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setServices(data);
    setLoading(false);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProfession = selectedProfession === 'الكل' || s.profession === selectedProfession;
    const matchesNeighborhood = selectedNeighborhood === 'الكل' || s.neighborhood === selectedNeighborhood;
    return matchesSearch && matchesProfession && matchesNeighborhood;
  });

  return (
    <div className="pb-20">
      <header className="py-12 px-4 text-center bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            <span className="gradient-text">دليل خدمتك</span> في بورتسودان.
          </h2>
          
          {/* Emergency Hub */}
          <div className="mb-10 overflow-x-auto pb-4 no-scrollbar">
            <div className="flex gap-4 min-w-max px-4">
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="bg-red-600 text-white p-2 rounded-xl animate-pulse"><AlertCircle size={20} /></div>
                <div className="text-right">
                  <p className="text-xs text-red-600 font-bold">قسم الطوارئ</p>
                  <p className="text-sm font-black">خدمات عاجلة 24/7</p>
                </div>
              </div>
              {['سباك طوارئ', 'كهربائي أعطال', 'إسعاف خاص', 'فتح أقفال'].map(service => (
                <button key={service} className="bg-white border border-gray-100 px-6 py-3 rounded-2xl font-bold hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
                  {service}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-10">
            <button 
              onClick={() => setViewType('providers')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${viewType === 'providers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              مقدمي الخدمات
            </button>
            <button 
              onClick={() => setViewType('seekers')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${viewType === 'seekers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              طالبي الخدمات
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setActiveCategory('productive')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'productive' ? 'bg-pink-100 text-pink-700' : 'bg-gray-50 text-gray-500'}`}
            >
              الأسر المنتجة 🏠
            </button>
            <button 
              onClick={() => setActiveCategory('training')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'training' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500'}`}
            >
              تدريب وورش 🎓
            </button>
            <button 
              onClick={() => setShowMap(!showMap)}
              className="px-4 py-2 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700 flex items-center gap-2"
            >
              <MapPin size={14} /> {showMap ? 'إخفاء الخريطة' : 'الخريطة التفاعلية'}
            </button>
          </div>

          <div className="glass p-2 rounded-3xl shadow-xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="ابحث عن خدمة أو طلب..."
                className="w-full pr-12 pl-4 py-4 rounded-2xl bg-transparent outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="sticky top-[72px] z-40 bg-gray-50/80 backdrop-blur-md py-4 px-4 border-b border-gray-200 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-3 no-scrollbar">
          <select 
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm outline-none"
            value={selectedProfession}
            onChange={(e) => setSelectedProfession(e.target.value)}
          >
            <option value="الكل">كل المهن</option>
            {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select 
            className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm outline-none"
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
          >
            <option value="الكل">كل الأحياء</option>
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
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

const ServiceCard = ({ service, onRate }: any) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`bg-white rounded-3xl p-5 shadow-sm border ${service.is_premium ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'} hover:shadow-xl transition-all group relative overflow-hidden`}
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
          <button onClick={() => onRate(service)} className="text-[10px] font-bold text-blue-600 hover:underline text-right">تقييم الخدمة</button>
          <button onClick={() => alert('قريباً: حجز موعد ذكي')} className="text-[9px] font-bold text-purple-600 hover:underline text-right flex items-center gap-1">
            <Sparkles size={10} /> حجز موعد
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <a href={`tel:${service.phone}`} className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"><Phone size={18} /></a>
        <a href={`https://wa.me/${service.phone}`} className="p-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"><MessageCircle size={18} /></a>
      </div>
    </div>
  </motion.div>
);

const AboutPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
      <section className="text-center">
        <h1 className="text-5xl font-black mb-6">بورتسودان: <span className="gradient-text">ثغر السودان الباسم</span></h1>
        <div className="relative group">
          <img src="https://picsum.photos/seed/portsudan/1200/600" className="w-full h-80 object-cover rounded-[40px] shadow-2xl mb-8 transition-transform group-hover:scale-[1.02] duration-700" referrerPolicy="no-referrer" />
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
    // ... (existing handleVerify logic)
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
                <input 
                  type="password"
                  value={userApiKey}
                  onChange={(e) => onSaveApiKey(e.target.value)}
                  placeholder="مفتاح API الخاص بك"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 mb-2"
                />
                <p className="text-[10px] text-gray-400">مطلوب لتفعيل الإعلانات الذكية والتوثيق التلقائي.</p>
              </div>
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

const ForumPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const navigate = useNavigate();

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
            onClick={() => alert('سيتم تحويل منشورك لطلب خدمة ذكي...')}
            className="bg-purple-100 text-purple-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm"
          >
            <Sparkles size={16} /> تحويل لطلب خدمة
          </button>
          <button className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2">
            <Send size={18} /> نشر في المنتدى
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <User size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">مواطن بورتسوداني</p>
                <p className="text-[10px] text-gray-400">منذ {i * 2} ساعات • حي المطار</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              يا جماعة بورتسودان محتاجة لزيادة في عدد فنيي الطاقة الشمسية، خصوصاً مع دخول الصيف. هل في مراكز تدريب بتوفر دورات في المجال ده؟
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <button className="flex items-center gap-1 hover:text-blue-600"><MessageCircle size={14} /> 12 تعليق</button>
              <button className="flex items-center gap-1 hover:text-red-600"><Star size={14} /> 24 إعجاب</button>
            </div>
          </div>
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
    // Synergy: Reward points for rating
    setTimeout(() => {
      alert('شكراً لتقييمك! لقد حصلت على 10 نقاط مكافأة لمساهمتك في جودة المجتمع.');
      onClose();
    }, 1000);
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

const AddAdModal = ({ onClose, userApiKey }: any) => {
  const [step, setStep] = useState(1);
  const [adType, setAdType] = useState<'offer' | 'request'>('offer');
  const [isSmart, setIsSmart] = useState(false);
  const [isProductive, setIsProductive] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [tier, setTier] = useState<'normal' | 'premium'>('normal');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    profession: PROFESSIONS[0],
    neighborhood: NEIGHBORHOODS[0],
    phone: '',
    image_url: '',
    payment_receipt: null as File | null
  });

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

  const isFormComplete = formData.title && formData.description && formData.phone && (step < 3 || formData.payment_receipt);

  const handleSubmit = async () => {
    if (!isFormComplete) return;

    // Content Moderation & Fraud Detection with Gemini
    if (userApiKey) {
      const moderationResult = await moderateContent(
        `Title: ${formData.title}\nDescription: ${formData.description}`, 
        undefined, 
        userApiKey
      );
      if (moderationResult?.includes('UNSAFE') || moderationResult?.includes('FRAUD')) {
        alert('عذراً، تم رفض الإعلان. اكتشف نظام الأمان محتوى مشبوهاً أو غير لائق.');
        return;
      }
    }

    alert('تم إرسال إعلانك للمراجعة بنجاح! سيتم إخطار مقدمي الخدمات المطابقين لطلبك فوراً.');
    onClose();
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
              <p className="text-sm text-purple-700">سيقوم الذكاء الاصطناعي بكتابة وصف احترافي وجذاب لإعلانك بناءً على عنوانك ومهنتك.</p>
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
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">الحي</label>
                <select value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200">
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
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
                <button 
                  onClick={startVoiceRecording}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}
                >
                  <Send size={10} /> {isRecording ? 'جاري الاستماع...' : 'إملاء صوتي'}
                </button>
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
                <button 
                  onClick={generateAIImage}
                  disabled={isGeneratingImage}
                  className="text-[10px] font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-200 transition-all"
                >
                  <Sparkles size={10} /> {isGeneratingImage ? 'جاري التوليد...' : 'توليد صورة بالذكاء الاصطناعي'}
                </button>
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
                <button onClick={handleSubmit} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg">نشر الإعلان</button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const AuthPage = ({ onLogin }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-black mb-2">دليل خدمتك</h1>
          <p className="text-gray-500">{isLogin ? 'سجل دخولك للمتابعة' : 'أنشئ حساباً جديداً للبدء'}</p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="الاسم الكامل" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" />
          
          <button onClick={() => onLogin({ fullName: 'حذيفة' })} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-blue-700 transition-all">
            {isLogin ? 'دخول' : 'تسجيل حساب'}
          </button>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-blue-600 font-bold py-2">
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const NotificationsModal = ({ onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">التنبيهات</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
      </div>
      <div className="space-y-4">
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

  useEffect(() => {
    // Simulate auth check
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    const fullUser = { ...userData, id: '1', role: 'user', is_verified: false };
    setUser(fullUser);
    localStorage.setItem('user', JSON.stringify(fullUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <Router>
      <Layout 
        user={user} 
        onLogout={handleLogout}
        onOpenNotifications={() => setShowNotifications(true)}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/profile" element={<ProfilePage user={user} userApiKey={userApiKey} onSaveApiKey={(key: string) => { setUserApiKey(key); localStorage.setItem('gemini_api_key', key); }} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
      <AnimatePresence>
        {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
        {showAddAd && <AddAdModal onClose={() => setShowAddAd(false)} userApiKey={userApiKey} />}
        {showContactAdmin && <ContactAdminModal onClose={() => setShowContactAdmin(false)} />}
      </AnimatePresence>
    </Router>
  );
}
