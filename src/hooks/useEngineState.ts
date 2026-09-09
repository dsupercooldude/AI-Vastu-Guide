import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export function useEngineState() {
  const [confidence, setConfidence] = useState(65);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const savedConf = await get('vastu_confidence');
        const savedTime = await get('vastu_last_updated');
        if (savedConf) setConfidence(Number(savedConf));
        if (savedTime) setLastUpdated(Number(savedTime));
      } catch(e) {
        console.error(e);
      }
    };
    load();
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
      
      const increment = Math.floor(Math.random() * 5) + 2;
      const newConf = Math.min(99, confidence + increment);
      const now = Date.now();
      
      setConfidence(newConf);
      setLastUpdated(now);
      
      await set('vastu_confidence', newConf.toString());
      await set('vastu_last_updated', now.toString());
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
