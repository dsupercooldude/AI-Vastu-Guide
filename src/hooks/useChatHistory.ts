import { useState, useEffect } from 'react';
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
        const saved = await get(`vastu_chat_${profileId}`);
        if (saved && Array.isArray(saved)) {
          const now = Date.now();
          const filtered = saved.filter(m => now - m.timestamp < SEVEN_DAYS_MS);
          setMessages(filtered);
          if (saved.length !== filtered.length) {
            await set(`vastu_chat_${profileId}`, filtered);
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
        await set(`vastu_chat_${profileId}`, newMessages);
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
