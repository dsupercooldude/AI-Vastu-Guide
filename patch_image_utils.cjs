const fs = require('fs');
let code = fs.readFileSync('src/utils/imageUtils.ts', 'utf8');

const target = `import { ref, uploadString, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase';`;

const replacement = `import { auth, db } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';`;

code = code.replace(target, replacement);

const targetSave = `export const saveHouseImages = async (houseId: string, type: 'photos' | 'floorPlans', images: ImageItem[]) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  
  const folderRef = ref(storage, \`users/\${userId}/houses/\${houseId}/\${type}\`);
  
  // To keep it simple, we'll just upload the new ones or replace them.
  // Actually, standard behavior: if images array is passed, we probably want to sync it.
  // A simple way is to delete all existing and re-upload, OR just upload them if they have a base64 (meaning they are new).
  // But wait, if they were loaded from storage, they have \`preview\` as the downloadURL and NO base64 (we can just set base64 to empty string).
  
  for (const img of images) {
    if (img.base64) {
      // It's a new image
      const imgRef = ref(storage, \`users/\${userId}/houses/\${houseId}/\${type}/\${img.id}.jpg\`);
      await uploadString(imgRef, \`data:\${img.mimeType};base64,\${img.base64}\`, 'data_url');
      // Once uploaded, clear the base64 so we don't re-upload it next time
      img.base64 = ''; 
    }
  }
};`;

const replacementSave = `export const saveHouseImages = async (houseId: string, type: 'photos' | 'floorPlans', images: ImageItem[]) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  
  for (const img of images) {
    if (img.base64) {
      // It's a new image
      const docRef = doc(db, \`users/\${userId}/houses/\${houseId}/\${type}\`, img.id);
      await setDoc(docRef, {
        id: img.id,
        base64: img.base64,
        mimeType: img.mimeType,
        createdAt: Date.now()
      });
      // Do not clear base64 so UI still shows it, but we can set a flag if we want.
      // We will actually keep the base64 in memory, because preview is used.
      // If we need to clear it, we'd have to update preview to data URI.
      img.preview = \`data:\${img.mimeType};base64,\${img.base64}\`;
      img.base64 = ''; 
    }
  }
};`;

code = code.replace(targetSave, replacementSave);

const targetGet = `export const getHouseImages = async (houseId: string, type: 'photos' | 'floorPlans'): Promise<ImageItem[]> => {
  if (!houseId || !auth.currentUser) return [];
  const userId = auth.currentUser.uid;
  
  const folderRef = ref(storage, \`users/\${userId}/houses/\${houseId}/\${type}\`);
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
};`;

const replacementGet = `export const getHouseImages = async (houseId: string, type: 'photos' | 'floorPlans'): Promise<ImageItem[]> => {
  if (!houseId || !auth.currentUser) return [];
  const userId = auth.currentUser.uid;
  
  try {
    const colRef = collection(db, \`users/\${userId}/houses/\${houseId}/\${type}\`);
    const snapshot = await getDocs(colRef);
    const images: ImageItem[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      images.push({
        id: doc.id,
        preview: \`data:\${data.mimeType || 'image/jpeg'};base64,\${data.base64}\`,
        base64: '', // already uploaded, keep it empty to prevent re-upload
        mimeType: data.mimeType || 'image/jpeg'
      });
    });
    return images;
  } catch (e) {
    console.error('Error loading images from Firestore', e);
    return [];
  }
};`;

code = code.replace(targetGet, replacementGet);

const targetDelete = `export const deleteImage = async (houseId: string, type: 'photos' | 'floorPlans', imageId: string) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const imgRef = ref(storage, \`users/\${userId}/houses/\${houseId}/\${type}/\${imageId}.jpg\`);
  try {
    await deleteObject(imgRef);
  } catch (e) {
    console.error('Error deleting image', e);
  }
};`;

const replacementDelete = `export const deleteImage = async (houseId: string, type: 'photos' | 'floorPlans', imageId: string) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const docRef = doc(db, \`users/\${userId}/houses/\${houseId}/\${type}\`, imageId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error('Error deleting image from Firestore', e);
  }
};`;

code = code.replace(targetDelete, replacementDelete);

fs.writeFileSync('src/utils/imageUtils.ts', code);
