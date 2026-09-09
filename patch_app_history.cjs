const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const historyReportUI = `
                            <div id={\`report-\${item.id}\`} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">
                              {item.zoneScores && item.zoneScores.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-2">Zone Compliance Breakdown</h4>
                                  <div className="h-40 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={item.zoneScores.map(z => ({ name: z.zone, score: z.score }))}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c' }} width={30} />
                                        <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                                        <Bar dataKey="score" fill="#d97706" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              )}
                              <Markdown>{item.report}</Markdown>
                            </div>
`;

content = content.replace(
  /<div id={\`report-\\\${item\.id}\`\} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">.*?<\/Markdown>\s*<\/div>/s,
  historyReportUI
);

fs.writeFileSync('src/App.tsx', content);
