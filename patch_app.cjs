const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { Home, History, MessageSquare, Plus, AlignLeft, RefreshCw, Clock, Lock, Download } from 'lucide-react';",
  "import { Home, History, MessageSquare, Plus, AlignLeft, RefreshCw, Clock, Lock, Download, ShieldAlert } from 'lucide-react';"
);

const remedyCode = `
                            <div id={\`report-\${item.id}\`} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">
                              <Markdown>{item.report}</Markdown>
                              
                              {item.remedies && item.remedies.length > 0 && (
                                <div className="mt-6 border-t border-stone-100 pt-6">
                                  <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                                    Dosha Corrections & Remedies
                                  </h4>
                                  <div className="grid gap-3">
                                    {item.remedies.map((remedy, i) => (
                                      <div key={i} className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                                          <div className="flex items-start gap-2">
                                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">
                                              {remedy.zone}
                                            </span>
                                            <p className="font-semibold text-stone-800 text-sm leading-tight">{remedy.defect}</p>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider \${remedy.cost === 'Low' ? 'bg-green-100 text-green-700' : remedy.cost === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}\`}>
                                              Cost: {remedy.cost}
                                            </span>
                                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider \${remedy.effort === 'Low' ? 'bg-blue-100 text-blue-700' : remedy.effort === 'Medium' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}\`}>
                                              Effort: {remedy.effort}
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-sm text-stone-600 mt-2 pl-1">
                                          <span className="font-semibold text-amber-800">Action:</span> {remedy.remedy}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
`;

code = code.replace(
  /<div id=\{\`report-\$\{item\.id\}\`\} className="prose prose-sm prose-stone max-w-none max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-white p-2">\s*<Markdown>\{item\.report\}<\/Markdown>\s*<\/div>/g,
  remedyCode
);

fs.writeFileSync('src/App.tsx', code);
