import { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
      if (!houseId || !auth.currentUser) {
        setCheckedItems([]);
        return;
      }
      try {
        const userId = auth.currentUser.uid;
        const d = await getDoc(doc(db, `users/${userId}/checklist/${houseId}`));
        if (d.exists()) {
          setCheckedItems(d.data().items || []);
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

  const save = async (next: number[]) => {
    if (!houseId || !auth.currentUser) return;
    const userId = auth.currentUser.uid;
    try {
      await setDoc(doc(db, `users/${userId}/checklist/${houseId}`), { items: next, userId });
    } catch(e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/checklist/${houseId}`);
    }
  }

  const toggleCheck = async (id: number) => {
    if (!houseId) return;
    const next = checkedItems.includes(id) ? checkedItems.filter(i => i !== id) : [...checkedItems, id];
    setCheckedItems(next);
    await save(next);
  };

  const setVerified = async (ids: number[]) => {
    if (!houseId) return;
    const safeIds = Array.isArray(ids) ? ids : [];
    const next = [...new Set([...checkedItems, ...safeIds])];
    setCheckedItems(next);
    await save(next);
  };

  return { checkedItems, toggleCheck, setVerified };
}
