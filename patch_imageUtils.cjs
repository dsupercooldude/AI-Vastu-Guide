const fs = require('fs');
let code = fs.readFileSync('src/utils/imageUtils.ts', 'utf8');

// replace idb-keyval import with firebase storage imports
code = code.replace(
  "import { get, set } from 'idb-keyval';",
  "import { ref, uploadString, getDownloadURL, listAll, deleteObject } from 'firebase/storage';\nimport { storage, auth } from '../firebase';"
);

const firebaseImplementation = `
export const saveHouseImages = async (houseId: string, type: 'photos' | 'floorPlans', images: ImageItem[]) => {
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
};

export const getHouseImages = async (houseId: string, type: 'photos' | 'floorPlans'): Promise<ImageItem[]> => {
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
};

export const deleteImage = async (houseId: string, type: 'photos' | 'floorPlans', imageId: string) => {
  if (!houseId || !auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const imgRef = ref(storage, \`users/\${userId}/houses/\${houseId}/\${type}/\${imageId}.jpg\`);
  try {
    await deleteObject(imgRef);
  } catch (e) {
    console.error('Error deleting image', e);
  }
};
`;

code = code.replace(
  /export const saveHouseImages = async [\s\S]*/,
  firebaseImplementation
);

fs.writeFileSync('src/utils/imageUtils.ts', code);
