const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
import { useProfiles } from './hooks/useProfiles';
import { useHouses } from './hooks/useHouses';
import { useChatHistory } from './hooks/useChatHistory';
import { useAnalysisHistory } from './hooks/useAnalysisHistory';
import { useEngineState } from './hooks/useEngineState';
import { ProfileSelector } from './components/ProfileSelector';
import { HouseSelector } from './components/HouseSelector';
import { VastuAnalyzer } from './components/VastuAnalyzer';
import { AIChat } from './components/AIChat';
import Markdown from 'react-markdown';
import { Home, History, MessageSquare, Plus, AlignLeft, RefreshCw, Clock, Lock } from 'lucide-react';

export default function App() {
  const { profiles, currentProfileId, currentProfile, isAuthenticated, addProfile, switchProfile, authenticate, logout, deleteProfile } = useProfiles();
  const { houses, currentHouseId, currentHouse, addHouse, switchHouse, deleteHouse } = useHouses(currentProfileId);
  const { messages, sendMessage, loading: chatLoading } = useChatHistory(currentProfileId);
  const { history, analyzeHouse, loading: analysisLoading } = useAnalysisHistory(currentHouseId);
  const { confidence, lastUpdated, isRefreshing, refreshBaseline, setConfidence } = useEngineState();

  const [activeTab, setActiveTab] = useState<'analyzer' | 'chat' | 'history'>('analyzer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const mins = Math.floor((Date.now() - lastUpdated) / 60000);
      if (mins < 1) setTimeAgo('Just now');
      else if (mins === 1) setTimeAgo('1 min ago');
      else if (mins < 60) setTimeAgo(\`\${mins} mins ago\`);
      else {
        const hrs = Math.floor(mins / 60);
        setTimeAgo(\`\${hrs} hr\${hrs > 1 ? 's' : ''} ago\`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleAnalyzeWrapper = async (images: {data:string, mimeType:string}[], floorPlan: {data:string, mimeType:string} | null, desc: string, houseName: string) => {
    const result = await analyzeHouse(images, floorPlan, desc, houseName);
    setConfidence(prev => Math.min(99, prev + 1));
    return result;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticate(authPassword)) {
      setAuthError(false);
      setAuthPassword('');
    } else {
      setAuthError(true);
    }
  };

  if (!currentProfileId) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Welcome to Vastu AI</h1>
          <p className="text-stone-500 mb-8">Select or create a profile to start mapping your households.</p>
          <ProfileSelector 
            profiles={profiles}
            currentProfileId={currentProfileId}
            onAddProfile={addProfile}
            onSwitchProfile={switchProfile}
            onDeleteProfile={deleteProfile}
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-stone-100 text-stone-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">{currentProfile?.name} is locked</h1>
          <p className="text-stone-500 mb-8">Enter your PIN or password to continue.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setAuthError(false); }}
              placeholder="Enter Password"
              autoFocus
              className={\`w-full px-4 py-3 text-center border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 \${authError ? 'border-red-500 text-red-600 focus:border-red-500' : 'border-stone-300'}\`}
            />
            {authError && <p className="text-xs text-red-500 font-medium">Incorrect password. Please try again.</p>}
            <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors">
              Unlock Profile
            </button>
            <button type="button" onClick={() => switchProfile('', true)} className="text-sm text-stone-500 hover:text-stone-800 mt-4 underline">
              Switch Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className={\`\${mobileMenuOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all\`}>
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        <div className="relative w-3/4 md:w-full h-full bg-stone-900 flex flex-col border-r border-stone-800 p-6 z-10 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10 text-amber-500">
            <Home className="w-6 h-6" />
            <h1 className="text-xl font-bold text-white tracking-wide">Vastu AI</h1>
          </div>
          
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-500 uppercase mb-2">Profile</p>
            <div className="flex items-center justify-between bg-stone-800 p-3 rounded-xl border border-stone-700">
              <span className="text-stone-200 font-medium">{currentProfile?.name}</span>
              <button onClick={logout} className="text-xs text-stone-400 hover:text-white bg-stone-700 px-2 py-1 rounded">Lock</button>
            </div>
          </div>

          <div className="mb-8">
            <HouseSelector 
              houses={houses}
              currentHouseId={currentHouseId}
              onAddHouse={addHouse}
              onSwitchHouse={switchHouse}
              onDeleteHouse={deleteHouse}
            />
          </div>

          <nav className="flex-1 space-y-2">
            <button 
              onClick={() => { setActiveTab('analyzer'); setMobileMenuOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'analyzer' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}\`}
            >
              <Plus className="w-5 h-5" />
              New Analysis
            </button>
            <button 
              onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'chat' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}\`}
            >
              <MessageSquare className="w-5 h-5" />
              AI Expert Chat
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
              className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'history' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}\`}
            >
              <History className="w-5 h-5" />
              My History
            </button>
          </nav>

          <div className="mt-8 mb-6 bg-stone-800/50 rounded-xl p-4 border border-stone-800">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">AI Baseline Engine</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-stone-300">
                <RefreshCw className={\`w-4 h-4 shrink-0 mt-0.5 text-amber-500 \${isRefreshing ? 'animate-spin' : ''}\`} />
                <div>
                  <p className="text-stone-200 font-medium">Last Updated</p>
                  <p className="text-xs text-stone-500">{timeAgo}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-stone-300">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <p className="text-stone-200 font-medium">Next Refresh</p>
                  <p className="text-xs text-stone-500">Scheduled in 15m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-4 py-3 border-b border-stone-200 flex items-center justify-between shadow-sm z-40">
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <Home className="w-5 h-5" />
            Vastu AI
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-stone-600">
            <AlignLeft className="w-6 h-6" />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'analyzer' && currentHouseId && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-stone-900">Map Your Household</h2>
                  <p className="text-stone-500 mt-2">Upload floor plans and photos to check Vastu compliance for {currentHouse?.name}.</p>
                </div>
                <VastuAnalyzer 
                  onAnalyze={handleAnalyzeWrapper} 
                  loading={analysisLoading} 
                  confidence={confidence}
                  onRefreshBaseline={refreshBaseline}
                  isRefreshing={isRefreshing}
                  houseName={currentHouse?.name || ''}
                />
                
                {history.length > 0 && history[0].timestamp > Date.now() - 5000 && (
                  <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 border-l-4 border-l-amber-500">
                    <h3 className="text-lg font-bold text-stone-800 mb-4">Latest Analysis Report</h3>
                    <div className="prose prose-stone max-w-none">
                      <Markdown>{history[0].report}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'analyzer' && !currentHouseId && (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
                <Home className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 font-medium">Please select or create a house from the sidebar first.</p>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-stone-900">Ask the Expert</h2>
                  <p className="text-stone-500 mt-2">Chat with our AI Vastu Expert for personalized advice.</p>
                </div>
                <AIChat messages={messages} onSendMessage={sendMessage} loading={chatLoading} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-stone-900">Analysis History</h2>
                  <p className="text-stone-500 mt-2">Past Vastu reports for {currentHouse?.name || 'this house'}.</p>
                </div>
                
                {history.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
                    <History className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500 font-medium">No history found</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {history.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                          {item.floorPlan && (
                            <img src={item.floorPlan} alt="Floor Plan" className="w-full h-32 object-cover rounded-xl border border-stone-200" />
                          )}
                          {item.images && item.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                              {item.images.map((img, i) => (
                                <img key={i} src={img} alt={\`Room \${i}\`} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-stone-200" />
                              ))}
                            </div>
                          )}
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-stone-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <Markdown>{item.report}</Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
\`;

fs.writeFileSync('src/App.tsx', content);
