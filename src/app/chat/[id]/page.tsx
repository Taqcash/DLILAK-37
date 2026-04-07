'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowRight, User, ShieldCheck, MoreVertical, Phone } from 'lucide-react';
import Image from 'next/image';
import { DBService } from '@/services/dbService';
import { supabase } from '@/lib/supabase';
import { Message, Profile } from '@/types';

export default function ChatPage() {
  const params = useParams();
  const otherId = params.id as string;
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    if (!user) return;

    const loadChat = async () => {
      setLoading(true);
      // Fetch other user profile
      const { data: profile } = await DBService.getProfile(otherId);
      if (profile) setOtherProfile(profile);

      // Fetch messages
      const { data } = await DBService.fetchMessages(user.id, otherId);
      if (data) setMessages(data);
      setLoading(false);
    };

    loadChat();

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat:${user.id}:${otherId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id}))`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const content = newMessage;
    setNewMessage('');

    try {
      await DBService.sendMessage(user.id, otherId, content);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowRight size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden border border-gray-100">
              <Image src={otherProfile?.avatar_url || "https://picsum.photos/seed/user/100/100"} className="object-cover" alt={otherProfile?.fullName || 'User'} fill />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-black text-lg">{otherProfile?.fullName}</h2>
                {otherProfile?.is_verified && <ShieldCheck size={16} className="text-blue-500" />}
              </div>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">متصل الآن</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {otherProfile?.phone && (
            <a href={`tel:${otherProfile.phone}`} className="p-3 bg-burgundy/10 text-burgundy rounded-2xl hover:bg-burgundy/20 transition-all">
              <Phone size={20} />
            </a>
          )}
          <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        <div className="text-center py-8">
          <span className="px-4 py-2 bg-gray-200/50 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">بداية المحادثة</span>
        </div>

        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-5 rounded-[32px] shadow-sm ${
              msg.sender_id === user?.id 
                ? 'bg-burgundy text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              <p className="font-bold leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-2 font-medium ${msg.sender_id === user?.id ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا.." 
              className="w-full px-8 py-5 rounded-[32px] bg-gray-50 border-none focus:ring-2 focus:ring-burgundy outline-none font-bold text-lg shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-16 h-16 bg-burgundy text-white rounded-[24px] flex items-center justify-center shadow-xl hover:bg-burgundy/90 transition-all disabled:opacity-50 disabled:scale-95"
          >
            <Send size={28} className="rotate-180" />
          </button>
        </form>
      </footer>
    </div>
  );
}
