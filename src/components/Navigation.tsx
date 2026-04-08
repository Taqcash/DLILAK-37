import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  User, 
  MessageSquare, 
  Info, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  Search,
  Briefcase,
  LayoutDashboard
} from 'lucide-react';
import { useSupabase } from '@/app/providers';
import Image from 'next/image';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';

import { Profile, Notification } from '../types';

export const NavigationHeader = ({ userProfile, notifications, onShowNotifications }: { userProfile: Profile | null, notifications: Notification[], onShowNotifications: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const navLinks = [
    { href: '/', icon: <Home size={20} />, label: 'الرئيسية' },
    { href: '/forum', icon: <MessageSquare size={20} />, label: 'المنتدى' },
    { href: '/about', icon: <Info size={20} />, label: 'عن بورتسودان' }
  ];

  if (userProfile?.role === 'admin') {
    navLinks.push({ href: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 px-4 py-4 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size="sm" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter group-hover:text-burgundy transition-colors dark:text-white">دليل خدمتك</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Port Sudan Hub</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-2 font-bold text-sm transition-all hover:text-burgundy ${pathname === link.href ? 'text-burgundy' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <button 
                onClick={onShowNotifications}
                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all relative group"
              >
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {notifications.length}
                  </span>
                )}
              </button>
              <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black group-hover:text-burgundy transition-colors dark:text-white">{userProfile?.full_name || user?.email}</p>
                  <p className="text-[10px] text-gray-400 font-bold">ملفي الشخصي</p>
                </div>
                <div className="w-10 h-10 relative bg-white dark:bg-gray-700 rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600">
                  {userProfile?.avatar_url ? <Image src={userProfile.avatar_url} className="object-cover" alt={userProfile?.full_name || 'User'} fill /> : <User size={20} className="text-gray-300" />}
                </div>
              </Link>
              <button onClick={handleLogout} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-burgundy text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-burgundy/90 transition-all">دخول / تسجيل</Link>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-900 dark:text-white"><Menu size={20} /></button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 shadow-2xl">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-bold text-gray-700 dark:text-gray-300">
                  {link.icon} {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const NotificationsModal = ({ notifications, onClose }: { notifications: Notification[], onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-gray-900 rounded-[40px] w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black dark:text-white">التنبيهات</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white"><X /></button>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {notifications.length > 0 ? (
          notifications.map((n: any) => (
            <div key={n.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0"><Bell size={20} /></div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{n.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 font-bold">لا توجد تنبيهات جديدة.</div>
        )}
      </div>
    </motion.div>
  </div>
);
