const fs = require('fs');

fs.writeFileSync('src/hooks/useChatHistory.ts', `import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { ChatMessage } from '../types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useChatHistory(profileId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!profileId) {
        setMessages([]);
        return;
      }
      try {
        const saved = await get(\`vastu_chat_\${profileId}\`);
        if (saved && Array.isArray(saved)) {
          const now = Date.now();
          const filtered = saved.filter(m => now - m.timestamp < SEVEN_DAYS_MS);
          setMessages(filtered);
          if (saved.length !== filtered.length) {
            await set(\`vastu_chat_\${profileId}\`, filtered);
          }
        } else {
          setMessages([{
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Hello! I am your Vastu Shastra expert. How can I help you today?',
            timestamp: Date.now()
          }]);
        }
      } catch (e) {
        console.error('Failed to load chat from indexedDB', e);
      }
    };
    load();
  }, [profileId]);

  const saveMessages = async (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    if (profileId) {
      try {
        await set(\`vastu_chat_\${profileId}\`, newMessages);
      } catch (e) {
        console.error('Failed to save chat to indexedDB', e);
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !profileId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    const updatedWithUser = [...messages, userMsg];
    await saveMessages(updatedWithUser);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedWithUser })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      let sources = undefined;
      if (data.groundingMetadata?.groundingChunks) {
        sources = data.groundingMetadata.groundingChunks
          .map((chunk: any) => chunk.web?.uri ? { title: chunk.web.title, uri: chunk.web.uri } : null)
          .filter(Boolean);
          
        if (sources) {
          const uniqueUris = new Set();
          sources = sources.filter((s: any) => {
            if (uniqueUris.has(s.uri)) return false;
            uniqueUris.add(s.uri);
            return true;
          });
        }
      }

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.result,
        timestamp: Date.now(),
        sources: sources?.length ? sources : undefined
      };
      
      await saveMessages([...updatedWithUser, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error communicating with the expert.',
        timestamp: Date.now()
      };
      await saveMessages([...updatedWithUser, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
`);

// Same cleanup for useEngineState
fs.writeFileSync('src/hooks/useEngineState.ts', `import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export function useEngineState() {
  const [confidence, setConfidence] = useState(65);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const savedConf = await get('vastu_confidence');
        const savedTime = await get('vastu_last_updated');
        if (savedConf) setConfidence(Number(savedConf));
        if (savedTime) setLastUpdated(Number(savedTime));
      } catch(e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const refreshBaseline = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/refresh-baseline', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to refresh baseline');
      }
      
      const increment = Math.floor(Math.random() * 5) + 2;
      const newConf = Math.min(99, confidence + increment);
      const now = Date.now();
      
      setConfidence(newConf);
      setLastUpdated(now);
      
      await set('vastu_confidence', newConf.toString());
      await set('vastu_last_updated', now.toString());
    } catch (e) {
      if (e instanceof Error && e.message.includes('Quota')) {
        console.warn('AI Quota exceeded while refreshing baseline, will try again later.');
      } else {
        console.error('Error refreshing baseline', e);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return { confidence, lastUpdated, isRefreshing, refreshBaseline, setConfidence };
}
`);

// Same cleanup for useHouses
fs.writeFileSync('src/hooks/useHouses.ts', `import { useState, useEffect } from 'react';
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
        const saved = await get(\`vastu_houses_\${profileId}\`);
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
    await set(\`vastu_houses_\${profileId}\`, updated);
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
    
    await set(\`vastu_houses_\${profileId}\`, updated);
    await del(\`vastu_analysis_house_\${id}\`);
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
`);

// Same cleanup for useProfiles
fs.writeFileSync('src/hooks/useProfiles.ts', `import { useState, useEffect } from 'react';
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
    await del(\`vastu_chat_\${id}\`);
    await del(\`vastu_houses_\${id}\`);
    
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
`);

