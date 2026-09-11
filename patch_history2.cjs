const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAnalysisHistory.ts', 'utf8');

const targetUploadImages = `      const uploadImages = async (imgs: { data: string, mimeType: string }[], folder: string) => {
        if (!imgs || imgs.length === 0) return [];
        const urls = [];
        for (let i = 0; i < imgs.length; i++) {
          const img = imgs[i];
          if (img.data.startsWith('http')) { 
            urls.push(img.data);
          } else {
            const imgId = crypto.randomUUID();
            const imgRef = ref(storage, \`users/\${userId}/history/\${id}/\${folder}/\${imgId}.jpg\`);
            let base64Data = img.data;
            if (base64Data.startsWith('data:')) { 
              base64Data = base64Data.split(',')[1];
            }
            await uploadString(imgRef, \`data:\${img.mimeType};base64,\${base64Data}\`, 'data_url');
            const url = await getDownloadURL(imgRef);
            urls.push(url);
          }
        }
        return urls;
      };`;

const replacementUploadImages = `      const uploadImages = async (imgs: { data: string, mimeType: string }[], folder: string) => {
        if (!imgs || imgs.length === 0) return [];
        const urls = [];
        for (let i = 0; i < imgs.length; i++) {
          const img = imgs[i];
          if (img.data.startsWith('http')) { 
            urls.push(img.data);
          } else {
            let base64Data = img.data;
            if (!base64Data.startsWith('data:')) {
               base64Data = \`data:\${img.mimeType || 'image/jpeg'};base64,\${base64Data}\`;
            }
            urls.push(base64Data);
          }
        }
        return urls;
      };`;

code = code.replace(targetUploadImages, replacementUploadImages);
fs.writeFileSync('src/hooks/useAnalysisHistory.ts', code);
