import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Profile } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let unsubscribeDb = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setProfiles([]);
        return;
      }
      const userId = user.uid;
      const path = `users/${userId}/profiles`;
      
      unsubscribeDb = onSnapshot(collection(db, path), (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          loaded.push({ id: data.id, name: data.name, password: data.password });
        });
        setProfiles(loaded);
        
        const lastActive = localStorage.getItem('vastu_active_profile');
        if (loaded.length > 0) {
          if (lastActive && loaded.some(p => p.id === lastActive)) {
            setCurrentProfileId(prev => {
               if (!prev) {
                   const prof = loaded.find(p => p.id === lastActive);
                   if (prof && !prof.password) setIsAuthenticated(true);
                   return lastActive;
               }
               return prev;
            });
          }
        } else {
          setCurrentProfileId(null);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDb();
    };
  }, []); // Only run once on mount

  const addProfile = async (name: string, password?: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newProfile = { id, name, password: password || undefined, userId };
    
    try {
      await setDoc(doc(db, `users/${userId}/profiles/${id}`), newProfile);
      switchProfile(id, true);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/profiles/${id}`);
    }
  };

  const switchProfile = (id: string, forceAuth = false) => {
    setCurrentProfileId(id);
    localStorage.setItem('vastu_active_profile', id);
    
    const prof = profiles.find(p => p.id === id);
    if (prof && !prof.password || forceAuth) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const authenticate = (password: string) => {
    const prof = profiles.find(p => p.id === currentProfileId);
    if (prof && (prof.password === password || (!prof.password && password === ''))) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };
  const switchUser = () => {
    setCurrentProfileId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('vastu_active_profile');
  };

  const deleteProfile = async (id: string) => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    
    try {
      await deleteDoc(doc(db, `users/${userId}/profiles/${id}`));
      
      if (currentProfileId === id) {
        setIsAuthenticated(false);
        const remaining = profiles.filter(p => p.id !== id);
        if (remaining.length > 0) {
          switchProfile(remaining[0].id);
        } else {
          setCurrentProfileId(null);
          localStorage.removeItem('vastu_active_profile');
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${userId}/profiles/${id}`);
    }
  };

  return {
    profiles,
    currentProfileId,
    currentProfile: profiles.find(p => p.id === currentProfileId) || null,
    isAuthenticated,
    addProfile,
    switchProfile,
    authenticate,
    logout,
    switchUser,
    deleteProfile
  };
}
