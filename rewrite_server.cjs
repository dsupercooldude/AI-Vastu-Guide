const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Add Quota object
const quotaCode = `
const aiQuota = {
  engines: [
    { name: 'Gemini 3.6 Flash', used: 0, limit: 1500, status: 'Active (Load Balanced)' },
    { name: 'OpenAI GPT-4o', used: 0, limit: 0, status: 'Requires API Key' },
    { name: 'Claude 3.5 Sonnet', used: 0, limit: 0, status: 'Requires API Key' }
  ]
};

app.get('/api/quota', (req, res) => {
  res.json(aiQuota);
});
`;

content = content.replace('// Analyze Image Route', quotaCode + '\n  // Analyze Image Route');

// Add SCORE format to instruction
content = content.replace('For chat, act as the Vastu Expert assisting the user. Be respectful, wise, and practical.', 'For chat, act as the Vastu Expert assisting the user. Be respectful, wise, and practical.\n\nCRITICAL: At the very end of your "Vastu Report", you MUST output a numerical compliance score out of 100 on a new line in this exact format:\nSCORE: 85');

// Update /api/analyze to increment quota and extract score
content = content.replace('res.json({ result: response.text });', `
      aiQuota.engines[0].used++;
      const match = response.text.match(/SCORE:\\s*(\\d+)/i);
      const score = match ? parseInt(match[1]) : 50;
      res.json({ result: response.text, score });
`);

content = content.replace('const groundingMetadata = response.candidates?.[0]?.groundingMetadata;', `
      aiQuota.engines[0].used++;
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
`);

fs.writeFileSync('server.ts', content);
