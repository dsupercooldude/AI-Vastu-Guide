import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Globe } from 'lucide-react';
import { ChatMessage } from '../types';
import Markdown from 'react-markdown';

interface AIChatProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  loading: boolean;
}

export function AIChat({ messages, onSendMessage, loading }: AIChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input);
    setInput('');
  };

  const fetchLiveInsight = () => {
    if (loading) return;
    onSendMessage("Please search the live internet for a new, recent Vastu Shastra insight or guideline to build our knowledge baseline, and cite your sources.");
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-100 bg-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Vastu Expert</h2>
            <p className="text-xs text-amber-700 font-medium">AI Assistant & Live Search</p>
          </div>
        </div>
        <button 
          onClick={fetchLiveInsight}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-xs font-medium rounded-lg transition-colors"
          title="Manually fetch a new source to build confidence"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Fetch Live Insight</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-700'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-amber-700 text-white rounded-tr-none' 
                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
            }`}>
              <div className="prose prose-sm prose-stone max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-500 mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Sources Consulted:
                  </p>
                  <ul className="space-y-1">
                    {msg.sources.map((src, i) => (
                      <li key={i} className="text-xs">
                        <a href={src.uri} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline flex items-center gap-1">
                          • {src.title || new URL(src.uri).hostname}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-amber-200/80 text-right' : 'text-stone-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about Vastu Shastra..."
            disabled={loading}
            className="w-full pl-5 pr-12 py-4 bg-stone-100 border-transparent focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-full outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
