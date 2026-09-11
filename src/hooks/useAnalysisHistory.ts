import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';

export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      setAllHistory([]);
      return;
    }
    
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/history`;
    
    // Load all history for search
    const unsubscribeAll = onSnapshot(collection(db, path), (snapshot) => {
      const all: AnalysisHistory[] = [];
      snapshot.forEach(doc => {
        all.push(doc.data() as AnalysisHistory);
      });
      all.sort((a, b) => b.timestamp - a.timestamp);
      setAllHistory(all);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribeAll;
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !houseId) {
      setHistory([]);
      return;
    }
    
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/history`;
    
    const q = query(collection(db, path), where("houseId", "==", houseId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: AnalysisHistory[] = [];
      snapshot.forEach(doc => {
        loaded.push(doc.data() as AnalysisHistory);
      });
      loaded.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(loaded);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribe;
  }, [houseId]);

  const analyzeHouse = async (
    images: { data: string, mimeType: string }[],
    floorPlans: { data: string, mimeType: string }[],
    description: string,
    houseName: string
  ) => {
    if (!houseId || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, floorPlans, description, houseName })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const id = crypto.randomUUID();
      const newAnalysis: any = {
        id,
        houseId,
        
        description,
        report: data.result,
        score: data.score,
        houseName: houseName,
        timestamp: Date.now(),
        verifiedChecklistItems: data.verifiedChecklistItems,
        remedies: data.remedies,
        userId
      };
      
      
      
      Object.keys(newAnalysis).forEach(key => newAnalysis[key] === undefined && delete newAnalysis[key]);

      
      await setDoc(doc(db, `users/${userId}/history/${id}`), newAnalysis);
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
