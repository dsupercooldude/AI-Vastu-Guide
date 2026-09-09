const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const checklistInstruction = `
Evaluate these 8 standard checklist items. If you are 100% absolutely certain that an item is compliant based ONLY on the provided images/plans, include its ID in the verifiedChecklistItems array. If you have even 1% doubt, or if there is not enough information to verify it, do NOT include its ID.
1: Main entrance is located in North, East, or North-East.
2: Master bedroom is in the South-West.
3: Kitchen is in the South-East or North-West.
4: Pooja room is in the North-East.
5: No toilets are located in the North-East.
6: Center of the house (Brahmasthan) is empty and clutter-free.
7: Staircase is in the South, West, or South-West.
8: Mirrors do not directly face the bed.
`;

const newJsonInstruction = `const JSON_PROMPT_INSTRUCTION = \`Task: Based on the provided floor plans and photos, calculate the cardinal directions. Map the provided photos to the floor plans if possible.
Synthesize all observations into a comprehensive Vastu analysis.
Identify defects and strictly provide practical remedies.

\${checklistInstruction}

You MUST respond with a pure JSON string (NO markdown backticks, NO \\\`\\\`\\\`json wrappers, JUST the raw JSON object) matching exactly this format:
{
  "score": <number 0-100>,
  "zoneScores": [
    { "zone": "North", "score": <number 0-100> },
    { "zone": "North-East", "score": <number 0-100> },
    { "zone": "East", "score": <number 0-100> },
    { "zone": "South-East", "score": <number 0-100> },
    { "zone": "South", "score": <number 0-100> },
    { "zone": "South-West", "score": <number 0-100> },
    { "zone": "West", "score": <number 0-100> },
    { "zone": "North-West", "score": <number 0-100> },
    { "zone": "Center", "score": <number 0-100> }
  ],
  "verifiedChecklistItems": [<array of numbers 1-8 for items you are 100% certain are compliant>],
  "report": "<your full detailed markdown string including zone-by-zone breakdown, image references, and recommended remedies>"
}\`;`;

// Replace the old JSON_PROMPT_INSTRUCTION
content = content.replace(/const JSON_PROMPT_INSTRUCTION = `[\s\S]*?}`;/, newJsonInstruction);

// Also need to make sure verifiedChecklistItems is passed to the client
content = content.replace(
  /jsonResponse = \{ score, report: \(response\.text \|\| ""\), zoneScores: \[\] \};/,
  'jsonResponse = { score, report: (response.text || ""), zoneScores: [], verifiedChecklistItems: [] };'
);
content = content.replace(
  /jsonResponse = \{ score, report: \(finalResponse\.text \|\| ""\), zoneScores: \[\] \};/,
  'jsonResponse = { score, report: (finalResponse.text || ""), zoneScores: [], verifiedChecklistItems: [] };'
);
content = content.replace(
  /res\.json\(\{ result: response\.text \|\| "", score: jsonResponse\.score, zoneScores: jsonResponse\.zoneScores \}\);/g,
  'res.json({ result: jsonResponse.report || response.text || "", score: jsonResponse.score, zoneScores: jsonResponse.zoneScores, verifiedChecklistItems: jsonResponse.verifiedChecklistItems || [] });'
);
content = content.replace(
  /res\.json\(\{ result: jsonResponse\.report, score: jsonResponse\.score, zoneScores: jsonResponse\.zoneScores \}\);/g,
  'res.json({ result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores, verifiedChecklistItems: jsonResponse.verifiedChecklistItems || [] });'
);

fs.writeFileSync('server.ts', content);
