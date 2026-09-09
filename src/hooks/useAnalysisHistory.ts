import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!houseId) {
      setHistory([]);
      return;
    }
    const saved = localStorage.getItem(`vastu_analysis_house_\${houseId}`);
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
      localStorage.setItem(`vastu_analysis_house_\${houseId}`, JSON.stringify(newHistory));
    }
  };

  const analyzeHouse = async (
    images: { data: string, mimeType: string }[],
    floorPlan: { data: string, mimeType: string } | null,
    description: string,
    houseName: string
  ) => {
    if (!houseId) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, floorPlan, description, houseName })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newAnalysis: AnalysisHistory = {
        id: crypto.randomUUID(),
        houseId,
        images: images.map(img => `data:\${img.mimeType};base64,\${img.data}`),
        floorPlan: floorPlan ? `data:\${floorPlan.mimeType};base64,\${floorPlan.data}` : undefined,
        description,
        report: data.result,
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

  return { history, analyzeHouse, loading };
}
