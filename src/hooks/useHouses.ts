import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { House } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

export function useHouses(profileId: string | null) {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouseId, setCurrentHouseId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeDb = () => {};
    
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !profileId) {
        setHouses([]);
        setCurrentHouseId(null);
        return;
      }
      
      const userId = user.uid;
      const path = `users/${userId}/houses`;
      
      const q = query(collection(db, path), where("profileId", "==", profileId));
      
      if (unsubscribeDb) unsubscribeDb();
      unsubscribeDb = onSnapshot(q, (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach(d => {
          const data = d.data();
          loaded.push({
            id: data.id,
            profileId: data.profileId,
            name: data.name,
            createdAt: data.createdAt
          });
        });
        loaded.sort((a, b) => b.createdAt - a.createdAt);
        setHouses(loaded);
        
        setCurrentHouseId(prev => {
          if (loaded.length > 0 && !prev) return loaded[0].id;
          if (loaded.length === 0) return null;
          return prev;
        });
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, [profileId]); // removed currentHouseId to prevent infinite re-renders/unsubs

  const addHouse = async (name: string) => {
    if (!profileId || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    const id = crypto.randomUUID();
    const newHouse = {
      id,
      profileId,
      name,
      createdAt: Date.now(),
      userId
    };
    
    try {
      await setDoc(doc(db, `users/${userId}/houses/${id}`), newHouse);
      setCurrentHouseId(id);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/houses/${id}`);
    }
  };

  const switchHouse = (id: string) => {
    setCurrentHouseId(id);
  };

  const deleteHouse = async (id: string) => {
    if (!profileId || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    try {
      await deleteDoc(doc(db, `users/${userId}/houses/${id}`));
      if (currentHouseId === id) {
        const remaining = houses.filter(h => h.id !== id);
        setCurrentHouseId(remaining.length > 0 ? remaining[0].id : null);
      }
      
      // Ideally we would delete associated history and chat here via cloud function
      // but for client-side we'll leave it orphaned or do a query-delete
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/houses/${id}`);
    }
  };

  return {
    houses,
    currentHouseId,
    currentHouse: houses.find(h => h.id === currentHouseId) || null,
    addHouse,
    switchHouse,
    deleteHouse
  };
}
