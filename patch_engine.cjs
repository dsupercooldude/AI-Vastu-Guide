const fs = require('fs');
let content = fs.readFileSync('src/hooks/useEngineState.ts', 'utf8');

content = content.replace(
  "if (!res.ok) throw new Error('Failed to refresh baseline');",
  `if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to refresh baseline');
      }`
);

content = content.replace(
  "console.error('Error refreshing baseline', e);",
  `if (e instanceof Error && e.message.includes('Quota')) {
        console.warn('AI Quota exceeded while refreshing baseline, will try again later.');
      } else {
        console.error('Error refreshing baseline', e);
      }`
);

fs.writeFileSync('src/hooks/useEngineState.ts', content);
