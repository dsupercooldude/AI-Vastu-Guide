const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /"verifiedChecklistItems": \[<array of numbers 1-8 for items you are 100% certain are compliant>\],/,
  `"verifiedChecklistItems": [<array of numbers 1-8 for items you are 100% certain are compliant>],
  "remedies": [
    {
      "defect": "<description of the defect/dosha>",
      "zone": "<e.g., North-East>",
      "remedy": "<specific, actionable physical remedy>",
      "cost": "<Low, Medium, or High>",
      "effort": "<Low, Medium, or High>"
    }
  ],`
);

code = code.replace(
  /jsonResponse = \{ score, report: \(finalResponse\.text \|\| ""\), zoneScores: \[\], verifiedChecklistItems: \[\] \};/g,
  `jsonResponse = { score, report: (finalResponse.text || ""), zoneScores: [], verifiedChecklistItems: [], remedies: [] };`
);

code = code.replace(
  /jsonResponse = \{ score, report: \(response\.text \|\| ""\), zoneScores: \[\], verifiedChecklistItems: \[\] \};/g,
  `jsonResponse = { score, report: (response.text || ""), zoneScores: [], verifiedChecklistItems: [], remedies: [] };`
);

code = code.replace(
  /res\.json\(\{ result: jsonResponse\.report, score: jsonResponse\.score, zoneScores: jsonResponse\.zoneScores, verifiedChecklistItems: jsonResponse\.verifiedChecklistItems \|\| \[\] \}\);/g,
  `res.json({ result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores, verifiedChecklistItems: jsonResponse.verifiedChecklistItems || [], remedies: jsonResponse.remedies || [] });`
);

fs.writeFileSync('server.ts', code);
