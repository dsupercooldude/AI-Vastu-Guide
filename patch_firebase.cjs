const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = code.replace(
  "import { getFirestore",
  "import { getStorage } from 'firebase/storage';\nimport { getFirestore"
);

code = code.replace(
  "export const auth = getAuth(app);",
  "export const auth = getAuth(app);\nexport const storage = getStorage(app);"
);

fs.writeFileSync('src/firebase.ts', code);
