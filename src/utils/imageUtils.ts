import { ref, uploadString, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase';

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
  
  const folderRef = ref(storage, `users/${userId}/houses/${houseId}/${type}`);
  
  // To keep it simple, we'll just upload the new ones or replace them.
  // Actually, standard behavior: if images array is passed, we probably want to sync it.
  // A simple way is to delete all existing and re-upload, OR just upload them if they have a base64 (meaning they are new).
  // But wait, if they were loaded from storage, they have `preview` as the downloadURL and NO base64 (we can just set base64 to empty string).
  
  for (const img of images) {
    if (img.base64) {
      // It's a new image
      const imgRef = ref(storage, `users/${userId}/houses/${houseId}/${type}/${img.id}.jpg`);
      await uploadString(imgRef, `data:${img.mimeType};base64,${img.base64}`, 'data_url');
      // Once uploaded, clear the base64 so we don't re-upload it next time
      img.base64 = ''; 
    }
  }
};

export const getHouseImages = async (houseId: string, type: 'photos' | 'floorPlans'): Promise<ImageItem[]> => {
  if (!houseId || !auth.currentUser) return [];
  const userId = auth.currentUser.uid;
  
  const folderRef = ref(storage, `users/${userId}/houses/${houseId}/${type}`);
  try {
    const res = await listAll(folderRef);
    const images: ImageItem[] = [];
    
    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      images.push({
        id: itemRef.name.replace('.jpg', ''),
        preview: url,
        base64: '', // already uploaded
        mimeType: 'image/jpeg'
      });
    }
    return images;
  } catch (e) {
    console.error('Error loading images from storage', e);
    return [];
  }
};

export const deleteImage = async (houseId: string, type: 'photos' | 'floorPlans', imageId: string) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const imgRef = ref(storage, `users/${userId}/houses/${houseId}/${type}/${imageId}.jpg`);
  try {
    await deleteObject(imgRef);
  } catch (e) {
    console.error('Error deleting image', e);
  }
};
