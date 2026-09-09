import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAll = () => {
      const all: AnalysisHistory[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('vastu_analysis_house_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            all.push(...data);
          } catch (e) {
            console.error(e);
          }
        }
      }
      all.sort((a, b) => b.timestamp - a.timestamp);
      setAllHistory(all);
    };
    
    loadAll();

    if (!houseId) {
      setHistory([]);
      return;
    }
    const saved = localStorage.getItem(`vastu_analysis_house_${houseId}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse analysis history', e);
      }
    } else {
      setHistory([]);
    }
  }, [houseId]);

  const saveHistory = (newHistory: AnalysisHistory[]) => {
    setHistory(newHistory);
    if (houseId) {
      localStorage.setItem(`vastu_analysis_house_${houseId}`, JSON.stringify(newHistory));
      
      setAllHistory(prev => {
        const others = prev.filter(h => h.houseId !== houseId);
        const merged = [...others, ...newHistory];
        merged.sort((a, b) => b.timestamp - a.timestamp);
        return merged;
      });
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
