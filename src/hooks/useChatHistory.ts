import { useState, useEffect } from 'react';
import { ChatMessage } from '../types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useChatHistory(profileId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setMessages([]);
      return;
    }

    const saved = localStorage.getItem(`vastu_chat_\${profileId}`);
    if (saved) {
      try {
        const parsed: ChatMessage[] = JSON.parse(saved);
        const now = Date.now();
        // Filter messages older than 7 days
        const filtered = parsed.filter(m => now - m.timestamp < SEVEN_DAYS_MS);
        setMessages(filtered);
        if (parsed.length !== filtered.length) {
          localStorage.setItem(`vastu_chat_\${profileId}`, JSON.stringify(filtered));
        }
      } catch (e) {
        console.error('Failed to parse chat', e);
      }
    } else {
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Hello! I am your Vastu Shastra expert. How can I help you today?',
        timestamp: Date.now()
      }]);
    }
  }, [profileId]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    if (profileId) {
      localStorage.setItem(`vastu_chat_\${profileId}`, JSON.stringify(newMessages));
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
    saveMessages(updatedWithUser);
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
        
        // Deduplicate sources
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
      
      saveMessages([...updatedWithUser, aiMsg]);
    } catch (e: any) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error communicating with the expert.',
        timestamp: Date.now()
      };
      saveMessages([...updatedWithUser, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
