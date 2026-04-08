import { useState, useEffect } from 'react';
import { SiteService } from '../services/siteService';

/**
 * useSiteData - هوك مخصص لجلب بيانات الموقع العامة
 * تم تحويله لاستخدام SiteService بنمط Claw
 */
export const useSiteData = () => {
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [siteImages, setSiteImages] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nData, pData, iData] = await Promise.all([
          SiteService.getNeighborhoods(),
          SiteService.getProfessions(),
          SiteService.getSiteImages()
        ]);
        
        if (nData.data) setNeighborhoods(nData.data.map((n: any) => n.name));
        if (pData.data) setProfessions(pData.data.map((p: any) => p.name));
        if (iData.data) {
          const images: any = {};
          iData.data.forEach((img: any) => images[img.key] = img.url);
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
