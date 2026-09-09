import { useState, useEffect } from 'react';
import { useProfiles } from './hooks/useProfiles';
import { useHouses } from './hooks/useHouses';
import { useChatHistory } from './hooks/useChatHistory';
import { useAnalysisHistory } from './hooks/useAnalysisHistory';
import { useEngineState } from './hooks/useEngineState';
import { ProfileSelector } from './components/ProfileSelector';
import { HouseSelector } from './components/HouseSelector';
import { VastuAnalyzer } from './components/VastuAnalyzer';
import { VastuChecklist } from './components/VastuChecklist';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AIChat } from './components/AIChat';
import Markdown from 'react-markdown';
import { Home, History, MessageSquare, Plus, AlignLeft, RefreshCw, Clock, Lock, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportToPDF } from './utils/pdfExport';

export default function App() {
  const { profiles, currentProfileId, currentProfile, isAuthenticated, addProfile, switchProfile, authenticate, logout, deleteProfile } = useProfiles();
  const { houses, currentHouseId, currentHouse, addHouse, switchHouse, deleteHouse } = useHouses(currentProfileId);
  const { messages, sendMessage, loading: chatLoading } = useChatHistory(currentProfileId);
  const { history, allHistory, analyzeHouse, loading: analysisLoading } = useAnalysisHistory(currentHouseId);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [minScore, setMinScore] = useState(0);
  const { confidence, lastUpdated, isRefreshing, refreshBaseline, setConfidence } = useEngineState();

  const [activeTab, setActiveTab] = useState<'analyzer' | 'chat' | 'history'>('analyzer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);
  const [aiQuota, setAiQuota] = useState<any>(null);

  useEffect(() => {
    fetch('/api/quota')
      .then(res => res.json())
      .then(data => setAiQuota(data))
      .catch(() => {});
  }, [history]); // refresh quota when history changes (i.e. analysis run)


  useEffect(() => {
    const updateTime = () => {
      const mins = Math.floor((Date.now() - lastUpdated) / 60000);
      if (mins < 1) setTimeAgo('Just now');
      else if (mins === 1) setTimeAgo('1 min ago');
      else if (mins < 60) setTimeAgo(`\${mins} mins ago`);
      else {
        const hrs = Math.floor(mins / 60);
        setTimeAgo(`\${hrs} hr\${hrs > 1 ? 's' : ''} ago`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleAnalyzeWrapper = async (images: {data:string, mimeType:string}[], floorPlans: {data:string, mimeType:string}[], desc: string, houseName: string) => {
    const result = await analyzeHouse(images, floorPlans, desc, houseName);
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
              className={`w-full px-4 py-3 text-center border rounded-xl outline-none focus:ring-2 focus:ring-amber-500 \${authError ? 'border-red-500 text-red-600 focus:border-red-500' : 'border-stone-300'}`}
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
      <div className={`\${mobileMenuOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex md:w-80 flex-col bg-stone-900 text-stone-300 transition-all`}>
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'analyzer' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}`}
            >
              <Plus className="w-5 h-5" />
              New Analysis
            </button>
            <button 
              onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'chat' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}`}
            >
              <MessageSquare className="w-5 h-5" />
              AI Expert Chat
            </button>
            <button 
              onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors \${activeTab === 'history' ? 'bg-amber-600/10 text-amber-500 font-medium' : 'hover:bg-stone-800'}`}
            >
              <History className="w-5 h-5" />
              My History
            </button>
          </nav>

          
          <div className="mt-8 mb-6 bg-stone-800/50 rounded-xl p-4 border border-stone-800">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">AI Engine Load Balancer</h4>
            
            {aiQuota && aiQuota.engines.map((engine: any, i: number) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${engine.limit > 0 ? 'text-amber-500' : 'text-stone-500'}`}>{engine.name}</span>
                  <span className="text-[10px] text-stone-500">{engine.used} {engine.limit > 0 ? `/ ${engine.limit}` : ''}</span>
                </div>
                {engine.limit > 0 ? (
                  <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(engine.used / engine.limit) * 100}%` }}></div>
                  </div>
                ) : (
                   <p className="text-[10px] text-stone-600">{engine.status}</p>
                )}
              </div>
            ))}
            
            <hr className="border-stone-700 my-3" />
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-stone-300">
                <RefreshCw className={`w-4 h-4 shrink-0 mt-0.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <div>
                  <p className="text-stone-200 font-medium text-xs">Baseline Updated</p>
                  <p className="text-xs text-stone-500">{timeAgo}</p>
                </div>
              </div>
            </div>
          
          <div className="pt-6 border-t border-stone-800 text-xs text-stone-500 text-center">
            Logged in as <span className="text-stone-300">{currentProfile?.name}</span>
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
            <AnimatePresence mode="wait">
            {activeTab === 'analyzer' && currentHouseId && (
              <motion.div 
                key="analyzer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-stone-900">Map Your Household</h2>
                    <p className="text-stone-500 mt-2">Upload floor plans and photos to check Vastu compliance for {currentHouse?.name}.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">

                <VastuAnalyzer 
                  onAnalyze={handleAnalyzeWrapper} 
                  loading={analysisLoading} 
                  confidence={confidence}
                  onRefreshBaseline={refreshBaseline}
                  isRefreshing={isRefreshing}
                  houseName={currentHouse?.name || ''}
                />
                  </div>
                  <div>
                    <VastuChecklist houseId={currentHouseId} />
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-stone-800">Latest Analysis Report</h3>
                      <button onClick={() => exportToPDF('latest-report', `Vastu_Report_${currentHouse?.name}.pdf`)} className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4"/> Export PDF</button>
                    </div>
                    <div id="latest-report" className="prose prose-stone max-w-none bg-white p-4 rounded-xl">
                      <Markdown>{history[0].report}</Markdown>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'analyzer' && !currentHouseId && (
              <motion.div 
                key="analyzer-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12 bg-white rounded-2xl border border-stone-200"
              >
                <Home className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 font-medium">Please select or create a house from the sidebar first.</p>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full max-w-3xl mx-auto"
              >
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-stone-900">Ask the Expert</h2>
                  <p className="text-stone-500 mt-2">Chat with our AI Vastu Expert for personalized advice.</p>
                </div>
                <AIChat messages={messages} onSendMessage={sendMessage} loading={chatLoading} />
              </motion.div>
            )}

            {activeTab === 'history' && (() => {
              // Filter logic
              const filteredHistory = allHistory.filter(item => {
                // House name match
                const hName = item.houseName?.toLowerCase() || '';
                const q = searchQuery.toLowerCase();
                if (q && !hName.includes(q)) return false;

                // Score threshold
                if (item.score !== undefined && item.score < minScore) return false;

                // Date range
                if (dateRange.start) {
                  if (new Date(item.timestamp) < new Date(dateRange.start)) return false;
                }
                if (dateRange.end) {
                  // +1 day to include the end date fully
                  const end = new Date(dateRange.end);
                  end.setDate(end.getDate() + 1);
                  if (new Date(item.timestamp) >= end) return false;
                }

                return true;
              });

              return (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-bold text-stone-900">Global Analysis History</h2>
                      <p className="text-stone-500 mt-2">Past Vastu reports across all your households.</p>
                    </div>
                  </div>

                  <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">House Name</label>
                      <input 
                        type="text" 
                        placeholder="Search by name..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="w-full md:w-auto flex gap-2">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Start Date</label>
                        <input 
                          type="date"
                          value={dateRange.start}
                          onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full md:w-32 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">End Date</label>
                        <input 
                          type="date"
                          value={dateRange.end}
                          onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full md:w-32 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Min Score: {minScore}</label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={minScore}
                        onChange={e => setMinScore(parseInt(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {filteredHistory.length > 0 && (
                    <div className="h-64 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                      <h3 className="font-bold text-stone-800 mb-4">Compliance Score Trend</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...filteredHistory].reverse().map(h => ({ date: new Date(h.timestamp).toLocaleDateString(), score: h.score || 0 }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#d97706" strokeWidth={3} dot={{ r: 4, fill: '#d97706' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
                      <History className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 font-medium">No reports match your filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredHistory.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 overflow-hidden flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                            {item.houseName && (
                              <>
                                <h4 className="font-bold text-stone-800 mb-1">{item.houseName}</h4>
                                <button onClick={() => exportToPDF(`report-${item.id}`, `Vastu_Report_${item.houseName}_${new Date(item.timestamp).getTime()}.pdf`)} className="flex items-center justify-center gap-2 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded text-xs font-medium transition-colors mt-1 w-fit"><Download className="w-3 h-3"/> PDF</button>
                              </>
                            )}
                            {item.floorPlans && item.floorPlans.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">{item.floorPlans.map((fp, i) => (<img key={`fp-${i}`} src={fp} alt={`Floor Plan ${i}`} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-stone-200" />))}</div>
                            )}
                            {item.images && item.images.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                {item.images.map((img, i) => (
                                  <img key={i} src={img} alt={`Room ${i}`} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-stone-200" />
                                ))}
                              </div>
                            )}
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-stone-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                              {item.score !== undefined && (
                                <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs">
                                  Score: {item.score}/100
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div id={`report-${item.id}`} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">
                              <Markdown>{item.report}</Markdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })()}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
    </div>
  );
}
