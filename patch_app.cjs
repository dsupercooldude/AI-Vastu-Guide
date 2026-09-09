const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const { history, analyzeHouse, loading: analysisLoading } = useAnalysisHistory(currentHouseId);',
  'const { history, allHistory, analyzeHouse, loading: analysisLoading } = useAnalysisHistory(currentHouseId);\n  const [searchQuery, setSearchQuery] = useState("");\n  const [dateRange, setDateRange] = useState({ start: "", end: "" });\n  const [minScore, setMinScore] = useState(0);'
);

const historyTabContentOld = `{activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-stone-900">Analysis History</h2>
                  <p className="text-stone-500 mt-2">Past Vastu reports for {currentHouse?.name || 'this house'}.</p>
                </div>

                {history.length > 0 && (
                  <div className="h-64 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <h3 className="font-bold text-stone-800 mb-4">Compliance Score Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...history].reverse().map(h => ({ date: new Date(h.timestamp).toLocaleDateString(), score: h.score || 0 }))}>
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
                          {item.floorPlans && item.floorPlans.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">{item.floorPlans.map((fp, i) => (<img key={\`fp-\${i}\`} src={fp} alt={\`Floor Plan \${i}\`} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-stone-200" />))}</div>
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
                            {item.score !== undefined && (
                              <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs">
                                Score: {item.score}/100
                              </div>
                            )}
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
            )}`;

const historyTabContentNew = \`{activeTab === 'history' && (() => {
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            {item.houseName && <h4 className="font-bold text-stone-800 mb-1">{item.houseName}</h4>}
                            {item.floorPlans && item.floorPlans.length > 0 && (
                              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">{item.floorPlans.map((fp, i) => (<img key={\`fp-\${i}\`} src={fp} alt={\`Floor Plan \${i}\`} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-stone-200" />))}</div>
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
                              {item.score !== undefined && (
                                <div className="mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs">
                                  Score: {item.score}/100
                                </div>
                              )}
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
              );
            })()}\`;

content = content.replace(historyTabContentOld, historyTabContentNew);

fs.writeFileSync('src/App.tsx', content);
