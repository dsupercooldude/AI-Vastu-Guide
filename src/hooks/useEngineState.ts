import { useState, useEffect } from 'react';

export function useEngineState() {
  const [confidence, setConfidence] = useState(65);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const savedConf = localStorage.getItem('vastu_confidence');
    const savedTime = localStorage.getItem('vastu_last_updated');
    if (savedConf) setConfidence(Number(savedConf));
    if (savedTime) setLastUpdated(Number(savedTime));
  }, []);

  const refreshBaseline = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh-baseline', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to refresh baseline');
      }
      
      // Increment confidence slightly up to 99%
      const increment = Math.floor(Math.random() * 5) + 2;
      const newConf = Math.min(99, confidence + increment);
      const now = Date.now();
      
      setConfidence(newConf);
      setLastUpdated(now);
      
      localStorage.setItem('vastu_confidence', newConf.toString());
      localStorage.setItem('vastu_last_updated', now.toString());
    } catch (e) {
      if (e instanceof Error && e.message.includes('Quota')) {
        console.warn('AI Quota exceeded while refreshing baseline, will try again later.');
      } else {
        console.error('Error refreshing baseline', e);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return { confidence, lastUpdated, isRefreshing, refreshBaseline, setConfidence };
}
