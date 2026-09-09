const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = "promptText += `Task: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.`;";

content = content.replace(targetStr, "promptText += JSON_PROMPT_INSTRUCTION;");

fs.writeFileSync('server.ts', content);
