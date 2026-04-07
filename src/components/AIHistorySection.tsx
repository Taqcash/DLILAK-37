import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '../lib/supabase';

interface AIHistoryItem {
  id: string;
  user_id: string;
  feature: string;
  prompt: string;
  response: string;
  created_at: string;
}

export const AIHistorySection = ({ userApiKey }: { userApiKey: string }) => {
  const { user } = useUser();
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
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
  }, [user]);

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
