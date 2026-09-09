const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';/,
  "import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';"
);

// We need to inject the BarChart UI into the latest report section.
const latestReportUI = `
                    <div id="latest-report" className="prose prose-stone max-w-none bg-white p-4 rounded-xl">
                      {history[0].zoneScores && history[0].zoneScores.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-sm font-bold text-stone-800 uppercase tracking-wide mb-4">Zone Compliance Breakdown</h4>
                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={history[0].zoneScores.map(z => ({ name: z.zone, score: z.score }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#78716c' }} />
                                <Tooltip cursor={{fill: '#f5f5f4'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="score" fill="#d97706" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {history[0].floorPlans && history[0].floorPlans.map((fp, i) => (
                          <div key={'fp-'+i} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                            <img src={fp} alt="Floor Plan" className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImageSrc(fp)} />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 font-medium">Floor Plan {i+1}</div>
                          </div>
                        ))}
                        {history[0].images && history[0].images.map((img, i) => (
                          <div key={'img-'+i} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                            <img src={img} alt="Property Image" className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImageSrc(img)} />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 font-medium">Photo {i+1}</div>
                          </div>
                        ))}
                      </div>

                      <Markdown>{history[0].report}</Markdown>
                    </div>
`;

content = content.replace(
  /<div id="latest-report" className="prose prose-stone max-w-none bg-white p-4 rounded-xl">.*?<\/Markdown>\s*<\/div>/s,
  latestReportUI
);

fs.writeFileSync('src/App.tsx', content);
