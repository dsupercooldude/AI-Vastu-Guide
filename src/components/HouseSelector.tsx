import { useState } from 'react';
import { Home, Plus, Trash2, Check } from 'lucide-react';
import { House } from '../types';

interface HouseSelectorProps {
  houses: House[];
  currentHouseId: string | null;
  onAddHouse: (name: string) => void;
  onSwitchHouse: (id: string) => void;
  onDeleteHouse: (id: string) => void;
}

export function HouseSelector({ 
  houses, 
  currentHouseId, 
  onAddHouse, 
  onSwitchHouse, 
  onDeleteHouse 
}: HouseSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddHouse(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-stone-800 rounded-xl border border-stone-700 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-stone-300 flex items-center gap-2">
          <Home className="w-4 h-4 text-amber-500" />
          My Houses
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] font-medium text-stone-400 hover:text-white flex items-center gap-1 bg-stone-700 px-1.5 py-0.5 rounded"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-3 flex gap-2">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="House Name"
            autoFocus
            className="flex-1 px-2 py-1 text-xs border border-stone-600 bg-stone-900 text-white rounded outline-none focus:border-amber-500"
          />
          <button 
            type="submit"
            disabled={!newName.trim()}
            className="p-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 text-white rounded transition-colors"
          >
            <Check className="w-3 h-3" />
          </button>
        </form>
      )}

      <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
        {houses.map(house => (
          <div 
            key={house.id}
            className={`group flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer \${
              house.id === currentHouseId 
                ? 'bg-amber-900/30 border border-amber-800/50 text-amber-100' 
                : 'bg-stone-900/50 text-stone-400 hover:bg-stone-700 hover:text-white border border-transparent'
            }`}
            onClick={() => onSwitchHouse(house.id)}
          >
            <span className="text-sm truncate pr-2 font-medium">{house.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteHouse(house.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-400 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {houses.length === 0 && !isAdding && (
          <p className="text-xs text-stone-500 text-center py-2">No houses added yet.</p>
        )}
      </div>
    </div>
  );
}
