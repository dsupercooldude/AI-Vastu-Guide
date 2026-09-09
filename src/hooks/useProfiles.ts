import { useState, useEffect } from 'react';
import { Profile } from '../types';
import { get, set, del } from 'idb-keyval';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await get('vastu_profiles');
        if (saved && Array.isArray(saved)) {
          setProfiles(saved);
          if (saved.length > 0) {
            const lastActive = await get('vastu_active_profile');
            if (lastActive && saved.some((p: Profile) => p.id === lastActive)) {
              setCurrentProfileId(lastActive);
            } else {
              setCurrentProfileId(saved[0].id);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load profiles', e);
      }
    };
    load();
  }, []);

  const addProfile = async (name: string, password?: string) => {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      password: password || undefined,
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    await set('vastu_profiles', updated);
    switchProfile(newProfile.id, true);
  };

  const switchProfile = async (id: string, forceAuth = false) => {
    setCurrentProfileId(id);
    await set('vastu_active_profile', id);
    
    const prof = profiles.find(p => p.id === id);
    if (prof && !prof.password || forceAuth) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  };

  const authenticate = (password: string) => {
    const prof = profiles.find(p => p.id === currentProfileId);
    if (prof && prof.password === password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const deleteProfile = async (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    await set('vastu_profiles', updated);
    
    // Clean up local data for this profile
    await del(`vastu_chat_${id}`);
    await del(`vastu_houses_${id}`);
    
    if (currentProfileId === id) {
      setIsAuthenticated(false);
      if (updated.length > 0) {
        switchProfile(updated[0].id);
      } else {
        setCurrentProfileId(null);
        await del('vastu_active_profile');
      }
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
    deleteProfile
  };
}
