import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtime = (table: string, callback: (payload: any) => void, filter?: string) => {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback, filter]);
};
