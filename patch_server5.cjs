const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target1 = "promptText += `Task: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.`;";
const target2 = "promptText += `\\nTask: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.`;";

let replaced = false;

if (content.includes(target1)) {
    content = content.replace(target1, "promptText += '\\n' + JSON_PROMPT_INSTRUCTION;");
    replaced = true;
} else if (content.includes(target2)) {
    content = content.replace(target2, "promptText += '\\n' + JSON_PROMPT_INSTRUCTION;");
    replaced = true;
} else {
    // maybe there's a newline between promptText += ` and Task:
    const regex = /promptText \+\= \`[\s\S]*?Task: If floor plans are provided.*?Detail the compliance, reasons, and fixes.\`;/;
    if (regex.test(content)) {
        content = content.replace(regex, "promptText += '\\n' + JSON_PROMPT_INSTRUCTION;");
        replaced = true;
    }
}

if (replaced) {
    fs.writeFileSync('server.ts', content);
    console.log("Successfully replaced!");
} else {
    console.log("Failed to replace. Let me print the exact bytes.");
    const block = content.substring(content.indexOf("promptText +="), content.indexOf("parts.push({ text: promptText });"));
    console.log("Block: " + JSON.stringify(block));
}
