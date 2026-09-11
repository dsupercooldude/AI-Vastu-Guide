import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { ChatMessage } from '../types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useChatHistory(profileId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeDb = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !profileId) {
        setMessages([]);
        return;
      }
      const userId = user.uid;
      const path = `users/${userId}/chat`;
      const q = query(collection(db, path), where("profileId", "==", profileId));
      
      if (unsubscribeDb) unsubscribeDb();
      unsubscribeDb = onSnapshot(q, async (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach(doc => {
          loaded.push(doc.data());
        });
        
        const now = Date.now();
        const filtered = loaded.filter(m => now - m.timestamp < SEVEN_DAYS_MS);
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        
        if (filtered.length === 0 && snapshot.docs.length === 0) {
          const id = crypto.randomUUID();
          const initMsg = {
            id,
            profileId,
            role: 'assistant',
            content: 'Hello! I am your Vastu Shastra expert. How can I help you today?',
            timestamp: Date.now(),
            userId
          };
          try {
            await setDoc(doc(db, `users/${userId}/chat/${id}`), initMsg);
          } catch(e) {
            console.error(e);
          }
        } else {
          setMessages(filtered);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeDb) unsubscribeDb();
    };
  }, [profileId]);

  const saveMessage = async (msg: ChatMessage) => {
    if (!auth.currentUser || !profileId) return;
    const userId = auth.currentUser.uid;
    const enrichedMsg: any = { ...msg, profileId, userId };
    Object.keys(enrichedMsg).forEach(key => enrichedMsg[key] === undefined && delete enrichedMsg[key]);
    try {
      await setDoc(doc(db, `users/${userId}/chat/${msg.id}`), enrichedMsg);
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/chat/${msg.id}`);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !profileId || !auth.currentUser) return;
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    // Add locally to feel responsive
    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    
    await saveMessage(userMsg);
    
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
      
      await saveMessage(aiMsg);
    } catch (e: any) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error communicating with the expert.',
        timestamp: Date.now()
      };
      await saveMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
}
