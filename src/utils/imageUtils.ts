import { auth, db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

export interface ImageItem {
  id: string;
  preview: string;
  base64: string;
  mimeType: string;
}

// Compress image to max 1200x1200 and low quality JPEG
export const compressImage = (file: File): Promise<ImageItem> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to JPEG with 0.6 quality to drastically reduce size
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const base64 = compressedDataUrl.split(',')[1];
        
        resolve({
          id: crypto.randomUUID(),
          preview: compressedDataUrl,
          base64,
          mimeType: 'image/jpeg'
        });
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export const saveHouseImages = async (houseId: string, type: 'photos' | 'floorPlans', images: ImageItem[]) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  
  for (const img of images) {
    if (img.base64) {
      // It's a new image
      const docRef = doc(db, `users/${userId}/houses/${houseId}/${type}`, img.id);
      await setDoc(docRef, {
        id: img.id,
        base64: img.base64,
        mimeType: img.mimeType,
        createdAt: Date.now()
      });
      // Do not clear base64 so UI still shows it, but we can set a flag if we want.
      // We will actually keep the base64 in memory, because preview is used.
      // If we need to clear it, we'd have to update preview to data URI.
      img.preview = `data:${img.mimeType};base64,${img.base64}`;
      img.base64 = ''; 
    }
  }
};

export const getHouseImages = async (houseId: string, type: 'photos' | 'floorPlans'): Promise<ImageItem[]> => {
  if (!houseId || !auth.currentUser) return [];
  const userId = auth.currentUser.uid;
  
  try {
    const colRef = collection(db, `users/${userId}/houses/${houseId}/${type}`);
    const snapshot = await getDocs(colRef);
    const images: ImageItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      images.push({
        id: doc.id,
        preview: `data:${data.mimeType || 'image/jpeg'};base64,${data.base64}`,
        base64: '', // already uploaded, keep it empty to prevent re-upload
        mimeType: data.mimeType || 'image/jpeg'
      });
    });
    return images;
  } catch (e) {
    console.error('Error loading images from Firestore', e);
    return [];
  }
};

export const deleteImage = async (houseId: string, type: 'photos' | 'floorPlans', imageId: string) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const docRef = doc(db, `users/${userId}/houses/${houseId}/${type}`, imageId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Error deleting image from Firestore', e);
  }
};
