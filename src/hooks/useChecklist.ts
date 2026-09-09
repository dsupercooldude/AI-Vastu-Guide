import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export const CHECKLIST_ITEMS = [
  { id: 1, text: 'Main entrance is located in North, East, or North-East.' },
  { id: 2, text: 'Master bedroom is in the South-West.' },
  { id: 3, text: 'Kitchen is in the South-East or North-West.' },
  { id: 4, text: 'Pooja room is in the North-East.' },
  { id: 5, text: 'No toilets are located in the North-East.' },
  { id: 6, text: 'Center of the house (Brahmasthan) is empty and clutter-free.' },
  { id: 7, text: 'Staircase is in the South, West, or South-West.' },
  { id: 8, text: 'Mirrors do not directly face the bed.' },
];

export function useChecklist(houseId: string | null) {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!houseId) {
        setCheckedItems([]);
        return;
      }
      try {
        const saved = await get(`vastu_checklist_${houseId}`);
        if (saved && Array.isArray(saved)) {
          setCheckedItems(saved);
        } else {
          setCheckedItems([]);
        }
      } catch (e) {
        console.error('Failed to load checklist', e);
        setCheckedItems([]);
      }
    };
    load();
  }, [houseId]);

  const toggleCheck = async (id: number) => {
    if (!houseId) return;
    const next = checkedItems.includes(id) ? checkedItems.filter(i => i !== id) : [...checkedItems, id];
    setCheckedItems(next);
    await set(`vastu_checklist_${houseId}`, next);
  };

  const setVerified = async (ids: number[]) => {
    if (!houseId) return;
    // We only Auto-Check if they are not already checked
    // We don't uncheck things they've manually checked.
    const safeIds = Array.isArray(ids) ? ids : [];
    const next = [...new Set([...checkedItems, ...safeIds])];
    setCheckedItems(next);
    await set(`vastu_checklist_${houseId}`, next);
  };

  return { checkedItems, toggleCheck, setVerified };
}
