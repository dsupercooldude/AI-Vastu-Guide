import { useState, useEffect } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { id: 1, text: 'Main entrance is located in North, East, or North-East.' },
  { id: 2, text: 'Master bedroom is in the South-West.' },
  { id: 3, text: 'Kitchen is in the South-East or North-West.' },
  { id: 4, text: 'Pooja room is in the North-East.' },
  { id: 5, text: 'No toilets are located in the North-East.' },
  { id: 6, text: 'Center of the house (Brahmasthan) is empty and clutter-free.' },
  { id: 7, text: 'Staircase is in the South, West, or South-West.' },
  { id: 8, text: 'Mirrors do not directly face the bed.' },
];

export function VastuChecklist({ houseId }: { houseId: string }) {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`vastu_checklist_\${houseId}`);
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    } else {
      setCheckedItems([]);
    }
  }, [houseId]);

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem(`vastu_checklist_\${houseId}`, JSON.stringify(next));
      return next;
    });
  };

  const progress = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-stone-800">Manual Vastu Checklist</h2>
          <span className="text-sm font-bold text-amber-600">{progress}% Verified</span>
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-500" 
            style={{ width: `\${progress}%` }} 
          />
        </div>
      </div>
      <div className="p-4 space-y-1">
        {CHECKLIST_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-stone-50 rounded-xl transition-colors"
          >
            {checkedItems.includes(item.id) ? (
              <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-stone-300 shrink-0 mt-0.5" />
            )}
            <span className={`text-sm \${checkedItems.includes(item.id) ? 'text-stone-800' : 'text-stone-600'}`}>
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
