import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { AnalysisHistory } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';


export function useAnalysisHistory(houseId: string | null) {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [allHistory, setAllHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeAll = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAllHistory([]);
        return;
      }
      const userId = user.uid;
      const path = `users/${userId}/history`;
      
      if (unsubscribeAll) unsubscribeAll();
      unsubscribeAll = onSnapshot(collection(db, path), (snapshot) => {
        const all: any[] = [];
        snapshot.forEach(doc => {
          all.push(doc.data());
        });
        all.sort((a, b) => b.timestamp - a.timestamp);
        setAllHistory(all);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeAll) unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    let unsubscribeDb = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !houseId) {
        setHistory([]);
        return;
      }
      const userId = user.uid;
      const path = `users/${userId}/history`;
      const q = query(collection(db, path), where("houseId", "==", houseId));
      
      if (unsubscribeDb) unsubscribeDb();
      unsubscribeDb = onSnapshot(q, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach(doc => {
          loaded.push(doc.data());
        });
        loaded.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
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
      
      if (!res.body) throw new Error('ReadableStream not yet supported in this browser.');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let finalData = null;
      let accumulatedReport = '';
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === 'progress') {
                   // optional: update loading state
                } else if (event.type === 'partial_report') {
                   accumulatedReport = event.data.report;
                   // dispatch custom event so UI can show it
                   window.dispatchEvent(new CustomEvent('vastu_partial_report', { detail: accumulatedReport }));
                } else if (event.type === 'complete') {
                   finalData = event.data;
                } else if (event.type === 'error') {
                   throw new Error(event.data.error);
                }
              } catch (err) {
                 // ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
      
      if (!finalData) throw new Error('Analysis failed to complete.');
      const data = { result: finalData.result, score: finalData.score, zoneScores: finalData.zoneScores, verifiedChecklistItems: finalData.verifiedChecklistItems, remedies: finalData.remedies };
      window.dispatchEvent(new CustomEvent('vastu_partial_report', { detail: '' })); // clear partial
      

      const id = crypto.randomUUID();
      
      const uploadImages = async (imgs: { data: string, mimeType: string }[], folder: string) => {
        if (!imgs || imgs.length === 0) return [];
        const urls = [];
        for (let i = 0; i < imgs.length; i++) {
          const img = imgs[i];
          if (img.data.startsWith('http')) {
             urls.push(img.data);
          } else {
            let base64Data = img.data;
            if (!base64Data.startsWith('data:')) {
               base64Data = `data:${img.mimeType || 'image/jpeg'};base64,${base64Data}`;
            }
            urls.push(base64Data);
          }
        }
        return urls;
      };

      const imageUrls = await uploadImages(images, 'images');
      const floorPlanUrls = await uploadImages(floorPlans, 'floorPlans');

      const newAnalysis: any = {
        id,
        houseId,
        images: imageUrls,
        floorPlans: floorPlanUrls,
        description,
        report: data.result,
        score: data.score,
        zoneScores: data.zoneScores,
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
