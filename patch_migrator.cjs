const fs = require('fs');
let code = fs.readFileSync('src/components/DataMigrator.tsx', 'utf8');

if (!code.includes('stripUndefined')) {
  code = code.replace(
    "const migrate = async () => {",
    `const stripUndefined = (obj) => {
      const newObj = { ...obj };
      Object.keys(newObj).forEach(key => newObj[key] === undefined && delete newObj[key]);
      return newObj;
    };
    
    const migrate = async () => {`
  );

  code = code.replace(
    /await setDoc\(doc\(db, \`users\/\$\{userId\}\/profiles\/\$\{p\.id\}\`\), enriched\);/g,
    "await setDoc(doc(db, `users/${userId}/profiles/${p.id}`), stripUndefined(enriched));"
  );
  
  code = code.replace(
    /await setDoc\(doc\(db, \`users\/\$\{userId\}\/houses\/\$\{h\.id\}\`\), enrichedHouse\);/g,
    "await setDoc(doc(db, `users/${userId}/houses/${h.id}`), stripUndefined(enrichedHouse));"
  );
  
  code = code.replace(
    /await setDoc\(doc\(db, \`users\/\$\{userId\}\/history\/\$\{hist\.id\}\`\), enrichedHist\);/g,
    "await setDoc(doc(db, `users/${userId}/history/${hist.id}`), stripUndefined(enrichedHist));"
  );
  
  code = code.replace(
    /await setDoc\(doc\(db, \`users\/\$\{userId\}\/chat\/\$\{c\.id\}\`\), enrichedChat\);/g,
    "await setDoc(doc(db, `users/${userId}/chat/${c.id}`), stripUndefined(enrichedChat));"
  );
  
  fs.writeFileSync('src/components/DataMigrator.tsx', code);
}
