import React, { useEffect, useState } from 'react';
import { get, keys } from 'idb-keyval';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export function DataMigrator({ children }: { children: React.ReactNode }) {
  const [migrating, setMigrating] = useState(true);

  useEffect(() => {
    const stripUndefined = (obj: any) => {
      const newObj = { ...obj };
      Object.keys(newObj).forEach(key => newObj[key] === undefined && delete newObj[key]);
      return newObj;
    };
    
    const migrate = async () => {
      const migratedFlag = localStorage.getItem('vastu_migration_done');
      if (migratedFlag === 'true' || !auth.currentUser) {
        setMigrating(false);
        return;
      }
      
      try {
        const userId = auth.currentUser.uid;
        
        // Profiles
        const profiles = await get('vastu_profiles');
        if (profiles && Array.isArray(profiles)) {
          for (const p of profiles) {
            const enriched = { ...p, userId };
            await setDoc(doc(db, `users/${userId}/profiles/${p.id}`), stripUndefined(enriched));
            
            // Houses for this profile
            const houses = await get(`vastu_houses_${p.id}`);
            if (houses && Array.isArray(houses)) {
              for (const h of houses) {
                const enrichedHouse = { ...h, userId };
                await setDoc(doc(db, `users/${userId}/houses/${h.id}`), stripUndefined(enrichedHouse));
                
                // History for this house
                const history = await get(`vastu_analysis_house_${h.id}`);
                if (history && Array.isArray(history)) {
                  for (const hist of history) {
                    const enrichedHist = { ...hist, userId };
                    // Handle case where history doesn't have houseName
                    if(!enrichedHist.houseName) enrichedHist.houseName = h.name;
                    await setDoc(doc(db, `users/${userId}/history/${hist.id}`), stripUndefined(enrichedHist));
                  }
                }
                
                // Checklist
                const checklist = await get(`vastu_checklist_${h.id}`);
                if (checklist && Array.isArray(checklist)) {
                  await setDoc(doc(db, `users/${userId}/checklist/${h.id}`), { items: checklist, userId });
                }
              }
            }
            
            // Chat for this profile
            const chats = await get(`vastu_chat_${p.id}`);
            if (chats && Array.isArray(chats)) {
              for (const c of chats) {
                const enrichedChat = { ...c, profileId: p.id, userId };
                await setDoc(doc(db, `users/${userId}/chat/${c.id}`), stripUndefined(enrichedChat));
              }
            }
          }
        }
        
        localStorage.setItem('vastu_migration_done', 'true');
      } catch (e) {
        console.error('Migration failed:', e);
      } finally {
        setMigrating(false);
      }
    };
    
    migrate();
  }, []);
  
  if (migrating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 text-stone-600 gap-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">Migrating your local Vastu data to the secure cloud...</p>
      </div>
    );
  }
  
  return <>{children}</>;
}
