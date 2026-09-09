const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
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

content = content.replace(/\$\{checklistInstruction\}/, replacement);

fs.writeFileSync('server.ts', content);
