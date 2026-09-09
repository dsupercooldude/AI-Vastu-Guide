import { useState, useEffect } from 'react';
import { House } from '../types';

export function useHouses(profileId: string | null) {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentHouseId, setCurrentHouseId] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setHouses([]);
      setCurrentHouseId(null);
      return;
    }
    const saved = localStorage.getItem(`vastu_houses_\${profileId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHouses(parsed);
        if (parsed.length > 0) {
          setCurrentHouseId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse houses', e);
      }
    } else {
      setHouses([]);
      setCurrentHouseId(null);
    }
  }, [profileId]);

  const addHouse = (name: string) => {
    if (!profileId) return;
    const newHouse: House = {
      id: crypto.randomUUID(),
      profileId,
      name,
      createdAt: Date.now()
    };
    const updated = [...houses, newHouse];
    setHouses(updated);
    localStorage.setItem(`vastu_houses_\${profileId}`, JSON.stringify(updated));
    setCurrentHouseId(newHouse.id);
  };

  const switchHouse = (id: string) => {
    setCurrentHouseId(id);
  };

  const deleteHouse = (id: string) => {
    if (!profileId) return;
    const updated = houses.filter(h => h.id !== id);
    setHouses(updated);
    localStorage.setItem(`vastu_houses_\${profileId}`, JSON.stringify(updated));
    localStorage.removeItem(`vastu_analysis_house_\${id}`);
    if (currentHouseId === id) {
      setCurrentHouseId(updated.length > 0 ? updated[0].id : null);
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
