const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add Recharts and Checklist imports
content = content.replace(
  "import { VastuAnalyzer } from './components/VastuAnalyzer';",
  "import { VastuAnalyzer } from './components/VastuAnalyzer';\nimport { VastuChecklist } from './components/VastuChecklist';\nimport { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';"
);

// Add server Quota fetching logic
const quotaLogic = `
  const [aiQuota, setAiQuota] = useState<any>(null);

  useEffect(() => {
    fetch('/api/quota')
      .then(res => res.json())
      .then(data => setAiQuota(data))
      .catch(console.error);
  }, [history]); // refresh quota when history changes (i.e. analysis run)
`;

content = content.replace(
  "const [authError, setAuthError] = useState(false);",
  "const [authError, setAuthError] = useState(false);" + quotaLogic
);

// Replace "AI Baseline Engine" section with Quota Tracker
const newSidebarSection = `
          <div className="mt-8 mb-6 bg-stone-800/50 rounded-xl p-4 border border-stone-800">
            <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">AI Engine Load Balancer</h4>
            
            {aiQuota && aiQuota.engines.map((engine: any, i: number) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={\`text-xs font-medium \${engine.limit > 0 ? 'text-amber-500' : 'text-stone-500'}\`}>{engine.name}</span>
                  <span className="text-[10px] text-stone-500">{engine.used} {engine.limit > 0 ? \`/ \${engine.limit}\` : ''}</span>
                </div>
                {engine.limit > 0 ? (
                  <div className="w-full h-1.5 bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: \`\${(engine.used / engine.limit) * 100}%\` }}></div>
                  </div>
                ) : (
                   <p className="text-[10px] text-stone-600">{engine.status}</p>
                )}
              </div>
            ))}
            
            <hr className="border-stone-700 my-3" />
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-stone-300">
                <RefreshCw className={\`w-4 h-4 shrink-0 mt-0.5 text-amber-500 \${isRefreshing ? 'animate-spin' : ''}\`} />
                <div>
                  <p className="text-stone-200 font-medium text-xs">Baseline Updated</p>
                  <p className="text-xs text-stone-500">{timeAgo}</p>
                </div>
              </div>
            </div>
          </div>
`;

content = content.replace(
  /<div className="mt-8 mb-6 bg-stone-800\/50 rounded-xl p-4 border border-stone-800">[\s\S]*?<\/div>[\s]*<\/div>[\s]*<\/div>/m,
  newSidebarSection + "\n        </div>\n      </div>"
);

// Add Checklist to Analyzer tab
content = content.replace(
  "<h2 className=\"text-3xl font-bold text-stone-900\">Map Your Household</h2>",
  "<div className=\"flex justify-between items-end mb-8\">\n                  <div>\n                    <h2 className=\"text-3xl font-bold text-stone-900\">Map Your Household</h2>"
);
content = content.replace(
  "<p className=\"text-stone-500 mt-2\">Upload floor plans and photos to check Vastu compliance for {currentHouse?.name}.</p>\n                </div>",
  "<p className=\"text-stone-500 mt-2\">Upload floor plans and photos to check Vastu compliance for {currentHouse?.name}.</p>\n                  </div>\n                </div>\n                <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-8\">\n                  <div className=\"lg:col-span-2\">\n"
);

content = content.replace(
  "isRefreshing={isRefreshing}\n                  houseName={currentHouse?.name || ''}\n                />",
  "isRefreshing={isRefreshing}\n                  houseName={currentHouse?.name || ''}\n                />\n                  </div>\n                  <div>\n                    <VastuChecklist houseId={currentHouseId} />\n                  </div>\n                </div>"
);

// Add Chart to History tab
const chartLogic = `
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
`;

content = content.replace(
  "<p className=\"text-stone-500 mt-2\">Past Vastu reports for {currentHouse?.name || 'this house'}.</p>\n                </div>",
  "<p className=\"text-stone-500 mt-2\">Past Vastu reports for {currentHouse?.name || 'this house'}.</p>\n                </div>\n" + chartLogic
);

// Display Score in History list
content = content.replace(
  "<p className=\"text-xs text-stone-400\">{new Date(item.timestamp).toLocaleDateString()}</p>",
  "<p className=\"text-xs text-stone-400\">{new Date(item.timestamp).toLocaleDateString()}</p>\n                            {item.score !== undefined && (\n                              <div className=\"mt-2 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold text-xs\">\n                                Score: {item.score}/100\n                              </div>\n                            )}"
);

fs.writeFileSync('src/App.tsx', content);
