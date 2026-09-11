const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  /&& \( !\('verifiedChecklistItems' in data\) \|\| data\.verifiedChecklistItems is list \);/g,
  `&& ( !('verifiedChecklistItems' in data) || data.verifiedChecklistItems is list )
        && ( !('remedies' in data) || data.remedies is list );`
);

code = code.replace(
  /hasOnly\(\['description', 'report', 'score', 'zoneScores', 'houseName', 'verifiedChecklistItems'\]\);/g,
  `hasOnly(['description', 'report', 'score', 'zoneScores', 'houseName', 'verifiedChecklistItems', 'remedies']);`
);

fs.writeFileSync('firestore.rules', code);
