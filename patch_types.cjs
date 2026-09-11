const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code += `
export interface VastuRemedy {
  defect: string;
  zone: string;
  remedy: string;
  cost: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
}
`;

code = code.replace(
  "verifiedChecklistItems?: number[];",
  "verifiedChecklistItems?: number[];\n  remedies?: VastuRemedy[];"
);

fs.writeFileSync('src/types.ts', code);
