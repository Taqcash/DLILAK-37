import { useState, useCallback } from 'react';
import { AIService } from '@/services/aiService';
import { AdService } from '@/services/adService';
import { PROFESSIONS, NEIGHBORHOODS } from '@/lib/constants';
import { Ad } from '@/types';

/**
 * useSmartSearch - هوك مخصص للبحث الذكي
 * يربط بين Gemini و AdService
 */
export function useSmartSearch(apiKey: string | null) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setLoading(true);

    try {
      let filters = { profession: 'الكل', neighborhood: 'الكل', type: 'offer' };

      // إذا توفر مفتاح AI، نستخدم البحث الذكي
      if (apiKey) {
        const ai = new AIService(apiKey);
        filters = await ai.smartSearch(query, PROFESSIONS, NEIGHBORHOODS);
      }

      // جلب الإعلانات بناءً على الفلاتر
      const { data } = await AdService.fetchAds({ 
        ...filters, 
        status: 'active',
        limit: 10 
      });

      if (data) setAds(data);
      return filters;
    } catch (e) {
      console.error("Smart search failed:", e);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, [apiKey]);

  return { ads, loading, isSearching, search, setAds };
}
