const fs = require('fs');
let code = fs.readFileSync('src/components/GoogleAuth.tsx', 'utf8');

if (!code.includes('DataMigrator')) {
  code = code.replace(
    "import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';",
    "import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';\nimport { DataMigrator } from './DataMigrator';"
  );
  
  code = code.replace(
    "return <>{children}</>;",
    "return <DataMigrator>{children}</DataMigrator>;"
  );
  
  fs.writeFileSync('src/components/GoogleAuth.tsx', code);
}
