import { useState, useCallback } from 'react';
import { AIService } from '@/services/aiService';
import { AdService } from '@/services/adService';
import { PROFESSIONS, NEIGHBORHOODS } from '@/lib/constants';
import { Ad } from '@/types';

/**
 * useSmartSearch - هوك مخصص للبحث الذكي
 * يربط بين Gemini و AdService
 */
export function useSmartSearch() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setLoading(true);

    try {
      let filters = { profession: 'الكل', neighborhood: 'الكل', type: 'offer' };

      // Call the API route for smart search
      const response = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        filters = await response.json();
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
  }, []);

  return { ads, loading, isSearching, search, setAds };
}
