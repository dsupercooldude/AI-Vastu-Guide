const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const catchTemplate = (context) => `    } catch (error: any) {
      const errorMessage = error.message || 'Failed to ${context}';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error ${context}:', error);
        res.status(500).json({ error: errorMessage });
      }
    }`;

// Replace each route's catch block.
// First analyze route
content = content.replace(/\} catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: errorMessage \}\);\n\s*\}\n\s*\}/, catchTemplate('analyze image') + '\n  }');

// chat route
content = content.replace(/\} catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: errorMessage \}\);\n\s*\}\n\s*\}/, catchTemplate('generate response') + '\n  }');

// refresh route
content = content.replace(/\} catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: errorMessage \}\);\n\s*\}\n\s*\}/, catchTemplate('refresh baseline') + '\n  }');

fs.writeFileSync('server.ts', content);
