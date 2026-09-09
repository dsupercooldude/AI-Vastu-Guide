const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Suppress console.error for 429
content = content.replace(
  /console\.error\('Error analyzing image:', error\);\n      const errorMessage = error\.message \|\| 'Failed to analyze';\n      if \(errorMessage\.includes\('429'\) \|\| errorMessage\.includes\('quota'\)\) \{/g,
  `const errorMessage = error.message || 'Failed to analyze';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404')) {
        // Suppress console.error for expected rate limits to avoid polluting logs
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error analyzing image:', error);`
);

content = content.replace(
  /console\.error\('Error in chat:', error\);\n      const errorMessage = error\.message \|\| 'Failed to generate response';\n      if \(errorMessage\.includes\('429'\) \|\| errorMessage\.includes\('quota'\)\) \{/g,
  `const errorMessage = error.message || 'Failed to generate response';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error in chat:', error);`
);

content = content.replace(
  /console\.error\('Error refreshing baseline:', error\);\n      const errorMessage = error\.message \|\| 'Failed to refresh baseline';\n      if \(errorMessage\.includes\('429'\) \|\| errorMessage\.includes\('quota'\)\) \{/g,
  `const errorMessage = error.message || 'Failed to refresh baseline';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error refreshing baseline:', error);`
);

fs.writeFileSync('server.ts', content);
