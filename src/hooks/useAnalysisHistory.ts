import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';
import { get, set, keys } from 'idb-keyval';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      const all: AnalysisHistory[] = [];
      try {
        const storeKeys = await keys();
        for (const key of storeKeys) {
          if (typeof key === 'string' && key.startsWith('vastu_analysis_house_')) {
            const data = await get(key);
            if (data && Array.isArray(data)) {
              all.push(...data);
            }
          }
        }
        all.sort((a, b) => b.timestamp - a.timestamp);
        setAllHistory(all);
      } catch (e) {
        console.error('Failed to load all history from indexedDB', e);
      }
    };
    
    loadAll();

    if (!houseId) {
      setHistory([]);
      return;
    }
    
    const loadHouseHistory = async () => {
      try {
        const saved = await get(`vastu_analysis_house_${houseId}`);
        if (saved) {
          setHistory(saved);
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error('Failed to parse analysis history', e);
        setHistory([]);
      }
    };
    
    loadHouseHistory();
  }, [houseId]);

  const saveHistory = async (newHistory: AnalysisHistory[]) => {
    setHistory(newHistory);
    if (houseId) {
      try {
        await set(`vastu_analysis_house_${houseId}`, newHistory);
        
        setAllHistory(prev => {
          const others = prev.filter(h => h.houseId !== houseId);
          const merged = [...others, ...newHistory];
          merged.sort((a, b) => b.timestamp - a.timestamp);
          return merged;
        });
      } catch (e) {
        console.error('Failed to save to IndexedDB', e);
      }
    }
  };

  const analyzeHouse = async (
    images: { data: string, mimeType: string }[],
    floorPlans: { data: string, mimeType: string }[],
    description: string,
    houseName: string
  ) => {
    if (!houseId) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, floorPlans, description, houseName })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newAnalysis: AnalysisHistory = {
        id: crypto.randomUUID(),
        houseId,
        images: images.map(img => `data:${img.mimeType};base64,${img.data}`),
        floorPlans: floorPlans.length > 0 ? floorPlans.map(fp => `data:${fp.mimeType};base64,${fp.data}`) : undefined,
        description,
        report: data.result,
        score: data.score,
        houseName: houseName,
        timestamp: Date.now()
      };
      
      saveHistory([newAnalysis, ...history]);
      return newAnalysis;
    } catch (e: any) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { history, allHistory, analyzeHouse, loading };
}
