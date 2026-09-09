const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex1 = /let jsonResponse;\s*try\s*\{\s*const cleanedText = response\.text\.replace[^\}]+\}\s*catch\s*\(e\)\s*\{\s*console\.error\("Failed to parse JSON", e\);\s*const match = response\.text\.match[^\}]+jsonResponse = \{ score, report: response\.text, zoneScores: \[\] \};\s*\}/s;

const newLogic1 = `        let jsonResponse;
        try {
           let cleanedText = response.text.replace(/\\x60\\x60\\x60json/gi, '').replace(/\\x60\\x60\\x60/g, '').trim();
           const firstBrace = cleanedText.indexOf('{');
           const lastBrace = cleanedText.lastIndexOf('}');
           if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
               cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
           }
           jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
           console.error("Failed to parse JSON", e);
           const match = response.text.match(/SCORE:\\s*(\\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: response.text, zoneScores: [] };
        }`;

content = content.replace(regex1, newLogic1);

const regex2 = /let jsonResponse;\s*try\s*\{\s*const cleanedText = finalResponse\.text\.replace[^\}]+\}\s*catch\s*\(e\)\s*\{\s*console\.error\("Failed to parse JSON", e\);\s*const match = finalResponse\.text\.match[^\}]+jsonResponse = \{ score, report: finalResponse\.text, zoneScores: \[\] \};\s*\}/s;

const newLogic2 = `        let jsonResponse;
        try {
           let cleanedText = finalResponse.text.replace(/\\x60\\x60\\x60json/gi, '').replace(/\\x60\\x60\\x60/g, '').trim();
           const firstBrace = cleanedText.indexOf('{');
           const lastBrace = cleanedText.lastIndexOf('}');
           if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
               cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
           }
           jsonResponse = JSON.parse(cleanedText);
        } catch (e) {
           console.error("Failed to parse JSON", e);
           const match = finalResponse.text.match(/SCORE:\\s*(\\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: finalResponse.text, zoneScores: [] };
        }`;

content = content.replace(regex2, newLogic2);

fs.writeFileSync('server.ts', content);
