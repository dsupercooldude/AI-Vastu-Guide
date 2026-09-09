const fs = require('fs');
let content = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

const target = `import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!houseId) {
      setHistory([]);
      return;
    }
    const saved = localStorage.getItem(\`vastu_analysis_house_\${houseId}\`);
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
      localStorage.setItem(\`vastu_analysis_house_\${houseId}\`, JSON.stringify(newHistory));
    }
  };`;

const replacement = `import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAll = () => {
      const all = [];
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
    const saved = localStorage.getItem(\`vastu_analysis_house_\${houseId}\`);
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

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    if (houseId) {
      localStorage.setItem(\`vastu_analysis_house_\${houseId}\`, JSON.stringify(newHistory));
      
      setAllHistory(prev => {
        const others = prev.filter(h => h.houseId !== houseId);
        const merged = [...others, ...newHistory];
        merged.sort((a, b) => b.timestamp - a.timestamp);
        return merged;
      });
    }
  };`;

content = content.replace(target, replacement);

// Return allHistory
content = content.replace(
  'return { history, analyzeHouse, loading };',
  'return { history, allHistory, analyzeHouse, loading };'
);

fs.writeFileSync('src/hooks/useAnalysisHistory.ts', content);
