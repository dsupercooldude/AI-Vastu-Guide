import { useState, useEffect } from 'react';
import { House } from '../types';
import { get, set, del } from 'idb-keyval';

export function useHouses(profileId: string | null) {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouseId, setCurrentHouseId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profileId) {
        setHouses([]);
        setCurrentHouseId(null);
        return;
      }
      try {
        const saved = await get(`vastu_houses_${profileId}`);
        if (saved && Array.isArray(saved)) {
          setHouses(saved);
          if (saved.length > 0) {
            setCurrentHouseId(saved[0].id);
          }
        } else {
          setHouses([]);
          setCurrentHouseId(null);
        }
      } catch (e) {
        console.error('Failed to parse houses', e);
      }
    };
    load();
  }, [profileId]);

  const addHouse = async (name: string) => {
    if (!profileId) return;
    const newHouse: House = {
      id: crypto.randomUUID(),
      profileId,
      name,
      createdAt: Date.now()
    };
    const updated = [...houses, newHouse];
    setHouses(updated);
    setCurrentHouseId(newHouse.id);
    await set(`vastu_houses_${profileId}`, updated);
  };

  const switchHouse = (id: string) => {
    setCurrentHouseId(id);
  };

  const deleteHouse = async (id: string) => {
    if (!profileId) return;
    const updated = houses.filter(h => h.id !== id);
    setHouses(updated);
    if (currentHouseId === id) {
      setCurrentHouseId(updated.length > 0 ? updated[0].id : null);
    }
    
    await set(`vastu_houses_${profileId}`, updated);
    await del(`vastu_analysis_house_${id}`);
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
