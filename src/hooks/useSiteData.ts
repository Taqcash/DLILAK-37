import { useState, useEffect } from 'react';
import { DBService } from '../services/dbService';

export const useSiteData = () => {
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [siteImages, setSiteImages] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nData, pData, iData] = await Promise.all([
          DBService.getNeighborhoods(),
          DBService.getProfessions(),
          DBService.getSiteImages()
        ]);
        
        if (nData.data) setNeighborhoods(nData.data.map(n => n.name));
        if (pData.data) setProfessions(pData.data.map(p => p.name));
        if (iData.data) {
          const images: any = {};
          iData.data.forEach(img => images[img.key] = img.url);
          setSiteImages(images);
        }
      } catch (e) {
        console.error("Error fetching site data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { neighborhoods, professions, siteImages, loading };
};
