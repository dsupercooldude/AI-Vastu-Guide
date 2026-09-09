const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const newQuota = `const aiQuota = {
  engines: [
    { name: 'Gemini 3.6 Flash', used: 0, limit: 150, status: 'Active' },
    { name: 'Gemini 3.5 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 3.7 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 3.8 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 2.5 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'OpenAI GPT-4o (Free Tier Proxy)', used: 0, limit: 50, status: 'Standby' },
    { name: 'MS Copilot (Web Grounded)', used: 0, limit: 50, status: 'Standby' }
  ]
};`;

content = content.replace(/const aiQuota = \{[\s\S]*?\};\n/, newQuota + '\n');
fs.writeFileSync('server.ts', content);
