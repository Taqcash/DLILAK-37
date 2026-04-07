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
import { useUser, useClerk, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { Logo } from './Logo';

import { Profile, Notification } from '../types';

export const NavigationHeader = ({ userProfile, notifications, onShowNotifications }: { userProfile: Profile | null, notifications: Notification[], onShowNotifications: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const { user } = useUser();

  const navLinks = [
    { href: '/', icon: <Home size={20} />, label: 'الرئيسية' },
    { href: '/forum', icon: <MessageSquare size={20} />, label: 'المنتدى' },
    { href: '/about', icon: <Info size={20} />, label: 'عن بورتسودان' }
  ];

  if (userProfile?.role === 'admin') {
    navLinks.push({ href: '/admin', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' });
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 px-4 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size="sm" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tighter group-hover:text-burgundy transition-colors">دليل خدمتك</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Port Sudan Hub</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`flex items-center gap-2 font-bold text-sm transition-all hover:text-burgundy ${pathname === link.href ? 'text-burgundy' : 'text-gray-500'}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <SignedIn>
            <button 
              onClick={onShowNotifications}
              className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all relative group"
            >
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifications.length}
                </span>
              )}
            </button>
            <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black group-hover:text-burgundy transition-colors">{userProfile?.fullName || user?.fullName}</p>
                <p className="text-[10px] text-gray-400 font-bold">ملفي الشخصي</p>
              </div>
              <div className="w-10 h-10 relative bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
                {user?.imageUrl ? <Image src={user.imageUrl} className="object-cover" alt={user?.fullName || 'User'} fill /> : <User size={20} className="text-gray-300" />}
              </div>
            </Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="bg-burgundy text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-burgundy/90 transition-all">دخول / تسجيل</Link>
          </SignedOut>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-3 bg-gray-50 rounded-2xl"><Menu size={20} /></button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 shadow-2xl">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl font-bold text-gray-700">
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
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black">التنبيهات</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {notifications.length > 0 ? (
          notifications.map((n: any) => (
            <div key={n.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0"><Bell size={20} /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
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
