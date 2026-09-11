const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');
code = code.replace("import { getStorage } from 'firebase/storage';\n", "");
code = code.replace("export const storage = getStorage(app);\n", "");
fs.writeFileSync('src/firebase.ts', code);
