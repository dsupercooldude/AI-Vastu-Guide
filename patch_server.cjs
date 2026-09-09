const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const promptStr = `
const JSON_PROMPT_INSTRUCTION = \`
Task: Based on the provided floor plans and photos, calculate the cardinal directions. Map the provided photos to the floor plans if possible.
Synthesize all observations into a comprehensive Vastu analysis.
Identify defects and strictly provide practical remedies.

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
  "report": "<your full detailed markdown string including zone-by-zone breakdown, image references, and recommended remedies>"
}\`;
`;

// Insert the instruction const after __dirname
content = content.replace(/const __dirname = [^\n]+\n/, match => match + promptStr + '\n');

// Replace standard single-batch logic
content = content.replace(
  /promptText \+\= \`Task:[^\`]+\`;/g,
  `promptText += JSON_PROMPT_INSTRUCTION;`
);

content = content.replace(
  /const match = response\.text\.match[\s\S]+?res\.json\(\{ result: response\.text, score \}\);/,
  `        let jsonResponse;
        try {
           const cleanedText = response.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
           jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
           console.error("Failed to parse JSON", e);
           const match = response.text.match(/SCORE:\\s*(\\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: response.text, zoneScores: [] };
        }
        res.json({ result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores });`
);

// Replace multi-batch logic
content = content.replace(
  /finalParts\.push\(\{ text: \`Analyze this house:[^\`]+\` \}\);/g,
  `finalParts.push({ text: \`Analyze this house: \${houseName || 'Unknown'}\\nUser Description: \${description}\\n\\nTask: We had to process the images in batches. Below are the detailed Vastu observations extracted from all batches of photos and floor plans.\\n\\n\${batchResults.join('\\n\\n')}\\n\\n\${JSON_PROMPT_INSTRUCTION}\` });`
);

content = content.replace(
  /const match = finalResponse\.text\.match[\s\S]+?res\.json\(\{ result: finalResponse\.text, score \}\);/,
  `        let jsonResponse;
        try {
           const cleanedText = finalResponse.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
           jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
           console.error("Failed to parse JSON", e);
           const match = finalResponse.text.match(/SCORE:\\s*(\\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: finalResponse.text, zoneScores: [] };
        }
        res.json({ result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores });`
);

fs.writeFileSync('server.ts', content);
