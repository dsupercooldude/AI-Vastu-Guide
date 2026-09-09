const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const regex = /promptText \+\= \`Task: If floor plans are provided.*?Detail the compliance, reasons, and fixes.\`;/s;
if (regex.test(content)) {
    content = content.replace(regex, "promptText += JSON_PROMPT_INSTRUCTION;");
    fs.writeFileSync('server.ts', content);
    console.log("Replaced multi-line task string!");
} else {
    console.log("Could not find multi-line task string.");
}
