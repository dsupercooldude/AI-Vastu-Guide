const fs = require('fs');
let code = fs.readFileSync('src/hooks/useChatHistory.ts', 'utf8');

code = code.replace(
  /const enrichedMsg = \{ \.\.\.msg, profileId, userId \};/g,
  `const enrichedMsg: any = { ...msg, profileId, userId };
    Object.keys(enrichedMsg).forEach(key => enrichedMsg[key] === undefined && delete enrichedMsg[key]);`
);

fs.writeFileSync('src/hooks/useChatHistory.ts', code);
