import { useState, useEffect } from 'react';
import { Profile } from '../types';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vastu_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfiles(parsed);
        if (parsed.length > 0) {
          const lastActive = localStorage.getItem('vastu_active_profile');
          if (lastActive && parsed.some((p: Profile) => p.id === lastActive)) {
            setCurrentProfileId(lastActive);
          } else {
            setCurrentProfileId(parsed[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to parse profiles', e);
      }
    }
  }, []);

  const addProfile = (name: string, password?: string) => {
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      password: password || undefined,
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('vastu_profiles', JSON.stringify(updated));
    switchProfile(newProfile.id, true);
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
    if (prof && prof.password === password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const deleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem('vastu_profiles', JSON.stringify(updated));
    // Clean up local data for this profile
    localStorage.removeItem(`vastu_chat_\${id}`);
    localStorage.removeItem(`vastu_houses_\${id}`);
    if (currentProfileId === id) {
      setIsAuthenticated(false);
      if (updated.length > 0) {
        switchProfile(updated[0].id);
      } else {
        setCurrentProfileId(null);
        localStorage.removeItem('vastu_active_profile');
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
