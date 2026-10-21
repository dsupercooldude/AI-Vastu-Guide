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
        if (!user && profileId) {
          try {
            const key = `vastu_local_houses_${profileId}`;
            const raw = localStorage.getItem(key);
            let local = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(local) || local.length === 0) {
              local = [{
                id: 'default-house',
                profileId,
                name: 'Main Residence',
                createdAt: Date.now()
              }];
              localStorage.setItem(key, JSON.stringify(local));
            }
            setHouses(local);
            setCurrentHouseId(prev => prev || local[0].id);
          } catch {
            const fallback = [{
              id: 'default-house',
              profileId,
              name: 'Main Residence',
              createdAt: Date.now()
            }];
            setHouses(fallback);
            setCurrentHouseId('default-house');
          }
          return;
        }
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
    if (!profileId) return;
    const id = crypto.randomUUID();
    const newHouse = {
      id,
      profileId,
      name,
      createdAt: Date.now()
    };
    
    if (!auth.currentUser) {
      const key = `vastu_local_houses_${profileId}`;
      const updated = [newHouse, ...houses];
      setHouses(updated);
      localStorage.setItem(key, JSON.stringify(updated));
      setCurrentHouseId(id);
      return;
    }

    const userId = auth.currentUser.uid;
    try {
      await setDoc(doc(db, `users/${userId}/houses/${id}`), { ...newHouse, userId });
      setCurrentHouseId(id);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/houses/${id}`);
    }
  };

  const switchHouse = (id: string) => {
    setCurrentHouseId(id);
  };

  const deleteHouse = async (id: string) => {
    if (!profileId) return;

    if (!auth.currentUser) {
      const key = `vastu_local_houses_${profileId}`;
      const remaining = houses.filter(h => h.id !== id);
      setHouses(remaining);
      localStorage.setItem(key, JSON.stringify(remaining));
      if (currentHouseId === id) {
        setCurrentHouseId(remaining.length > 0 ? remaining[0].id : null);
      }
      return;
    }

    const userId = auth.currentUser.uid;
    try {
      await deleteDoc(doc(db, `users/${userId}/houses/${id}`));
      if (currentHouseId === id) {
        const remaining = houses.filter(h => h.id !== id);
        setCurrentHouseId(remaining.length > 0 ? remaining[0].id : null);
      }
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
