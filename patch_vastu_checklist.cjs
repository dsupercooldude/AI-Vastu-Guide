const fs = require('fs');

const content = `
import { CheckCircle2, Circle } from 'lucide-react';
import { CHECKLIST_ITEMS } from '../hooks/useChecklist';

export function VastuChecklist({ 
  checkedItems, 
  onToggle 
}: { 
  checkedItems: number[], 
  onToggle: (id: number) => void 
}) {
  const progress = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-stone-800">Vastu Checklist</h2>
          <span className="text-sm font-bold text-amber-600">{progress}% Verified</span>
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-500" 
            style={{ width: \`\${progress}%\` }} 
          />
        </div>
      </div>
      <div className="p-4 space-y-1">
        {CHECKLIST_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-stone-50 rounded-xl transition-colors"
          >
            {checkedItems.includes(item.id) ? (
              <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-stone-300 shrink-0 mt-0.5" />
            )}
            <span className={\`text-sm \${checkedItems.includes(item.id) ? 'text-stone-800' : 'text-stone-600'}\`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/VastuChecklist.tsx', content);
