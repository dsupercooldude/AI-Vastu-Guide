const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const queueLogic = `
class Mutex {
  constructor() {
    this.queue = [];
    this.locked = false;
  }
  async lock() {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }
  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.locked = false;
    }
  }
}
const aiMutex = new Mutex();
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(options) {
  let lastError;
  const MAX_RETRIES = 3;
  let retryDelay = 2000;

  await aiMutex.lock(); // Process one at a time to prevent rate limits
  try {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      for (const model of FALLBACK_MODELS) {
        try {
          const response = await ai.models.generateContent({
            ...options,
            model: model,
          });
          return { response, model };
        } catch (error) {
          lastError = error;
          const errorMessage = error.message || '';
          if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            continue; // silent fallback to next model
          }
          throw error;
        }
      }
      // If we got here, all models failed (likely 429). Wait and retry.
      console.log(\`All models rate limited. Retrying in \${retryDelay}ms... (Attempt \${attempt + 1}/\${MAX_RETRIES})\`);
      await delay(retryDelay);
      retryDelay *= 2; // exponential backoff
    }
    throw lastError; // if all failed after max retries
  } finally {
    aiMutex.unlock();
  }
}
`;

content = content.replace(/async function generateWithFallback\([\s\S]*?throw lastError; \/\/ if all failed\n  }/, queueLogic.trim());

fs.writeFileSync('server.ts', content);
