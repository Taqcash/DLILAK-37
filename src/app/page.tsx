import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Search, Sparkles, MapPin, Briefcase } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-burgundy rounded-xl flex items-center justify-center text-white font-black">د</div>
          <h1 className="text-xl font-black text-burgundy">دليل خدمتك</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-sm font-bold text-gray-custom hover:text-burgundy">دخول</Link>
            <Link href="/sign-up" className="btn-burgundy text-sm">ابدأ الآن</Link>
          </SignedOut>
        </div>
      </nav>

      <main className="flex-1">
        <section className="py-20 px-6 text-center space-y-8 bg-gradient-to-b from-burgundy/5 to-white">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
              خدمات <span className="text-burgundy">بورتسودان</span> <br /> في متناول يدك
            </h2>
            <p className="text-xl text-gray-custom font-medium max-w-2xl mx-auto">
              المنصة الموحدة لربط المهنيين، الأسر المنتجة، وطالبي الخدمات في ثغر السودان الباسم.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="ابحث بذكاء.. (مثلاً: سباك في حي المطار)" 
                className="w-full pr-12 pl-4 py-4 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-burgundy outline-none font-bold"
              />
            </div>
            <button className="bg-burgundy text-white px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <Sparkles size={20} />
              بحث ذكي
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:border-burgundy transition-all group">
            <div className="w-14 h-14 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4">مهنيين موثقين</h3>
            <p className="text-gray-custom font-medium">نخبة من أفضل الصناع والمهنيين في بورتسودان، تم التحقق من هويتهم وكفاءتهم.</p>
          </div>
          
          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:border-burgundy transition-all group">
            <div className="w-14 h-14 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4">تغطية شاملة</h3>
            <p className="text-gray-custom font-medium">نغطي كافة أحياء المدينة، من حي المطار إلى وسط المدينة، لضمان سرعة الوصول.</p>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-xl hover:border-burgundy transition-all group">
            <div className="w-14 h-14 bg-burgundy/10 text-burgundy rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4">ذكاء اصطناعي</h3>
            <p className="text-gray-custom font-medium">نستخدم تقنيات Gemini لتحليل طلباتك وتقديم أفضل التوصيات بدقة متناهية.</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-6 text-center">
        <p className="font-black text-xl mb-4">دليل خدمتك</p>
        <p className="text-gray-400 text-sm">© ٢٠٢٦ ثغر السودان الباسم. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
