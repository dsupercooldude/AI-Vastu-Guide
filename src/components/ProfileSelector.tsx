import { useState } from 'react';
import { Users, Plus, Trash2, Check, Lock } from 'lucide-react';
import { Profile } from '../types';

interface ProfileSelectorProps {
  profiles: Profile[];
  currentProfileId: string | null;
  onAddProfile: (name: string, password?: string) => void;
  onSwitchProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
}

export function ProfileSelector({ 
  profiles, 
  currentProfileId, 
  onAddProfile, 
  onSwitchProfile, 
  onDeleteProfile 
}: ProfileSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddProfile(newName.trim(), newPassword.trim() || undefined);
      setNewName('');
      setNewPassword('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600" />
          Profiles
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Profile Name"
            autoFocus
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="PIN / Password (optional)"
            className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <button 
            type="submit"
            disabled={!newName.trim()}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            Create Profile
          </button>
        </form>
      )}

      {profiles.length === 0 && !isAdding ? (
        <p className="text-sm text-stone-500 text-center py-4">No profiles yet. Create one to start.</p>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {profiles.map(p => (
            <div 
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors \${
                p.id === currentProfileId 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-white border-stone-100 hover:border-stone-200 hover:bg-stone-50 cursor-pointer'
              }`}
              onClick={() => onSwitchProfile(p.id)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${
                  p.id === currentProfileId ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
                }`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className={`font-medium text-sm \${p.id === currentProfileId ? 'text-amber-900' : 'text-stone-700'}`}>
                  {p.name}
                </span>
                {p.password && <Lock className="w-3 h-3 text-stone-400" />}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteProfile(p.id); }}
                className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
