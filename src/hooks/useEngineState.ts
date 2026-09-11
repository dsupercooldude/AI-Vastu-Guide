import { useState, useEffect } from 'react';

export function useEngineState() {
  const [confidence, setConfidence] = useState(65);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latestInsight, setLatestInsight] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedConf = localStorage.getItem('vastu_confidence');
      const savedTime = localStorage.getItem('vastu_last_updated');
      if (savedConf) setConfidence(Number(savedConf));
      if (savedTime) setLastUpdated(Number(savedTime));
      const savedInsight = localStorage.getItem('vastu_latest_insight');
      if (savedInsight) setLatestInsight(savedInsight);
    } catch(e) {
      console.error(e);
    }
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
      
      localStorage.setItem('vastu_confidence', newConf.toString());
      localStorage.setItem('vastu_last_updated', now.toString());
      const responseText = await res.json().then(data => data.result);
      if (responseText) {
        setLatestInsight(responseText);
        localStorage.setItem('vastu_latest_insight', responseText);
      }
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

  return { confidence, lastUpdated, isRefreshing, latestInsight, refreshBaseline, setConfidence };
}
