const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace global mutex with model-specific mutexes
const modelMutexCode = `class ModelMutexes {
  constructor() {
    this.mutexes = {};
  }
  async lock(model) {
    if (!this.mutexes[model]) {
      this.mutexes[model] = { locked: false, queue: [] };
    }
    return new Promise(resolve => {
      if (!this.mutexes[model].locked) {
        this.mutexes[model].locked = true;
        resolve();
      } else {
        this.mutexes[model].queue.push(resolve);
      }
    });
  }
  unlock(model) {
    if (this.mutexes[model].queue.length > 0) {
      const resolve = this.mutexes[model].queue.shift();
      resolve();
    } else {
      this.mutexes[model].locked = false;
    }
  }
}
const modelMutexes = new ModelMutexes();
const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function generateWithFallback(options, preferredModel = null) {
  let lastError;
  const MAX_RETRIES = 3;
  let retryDelay = 2000;

  let modelsToTry = [...FALLBACK_MODELS];
  if (preferredModel && modelsToTry.includes(preferredModel)) {
    modelsToTry = [preferredModel, ...modelsToTry.filter(m => m !== preferredModel)];
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    for (const model of modelsToTry) {
      await modelMutexes.lock(model);
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
          continue; 
        }
        throw error;
      } finally {
        modelMutexes.unlock(model);
      }
    }
    console.log(\`All models rate limited. Retrying in \${retryDelay}ms... (Attempt \${attempt + 1}/\${MAX_RETRIES})\`);
    await delay(retryDelay);
    retryDelay *= 2; 
  }
  throw lastError; 
}`;

content = content.replace(/class Mutex \{[\s\S]*?throw lastError; \/\/ if all failed after max retries\n  \} finally \{\n    aiMutex\.unlock\(\);\n  \}\n\}/, modelMutexCode);

// Replace /api/analyze to support batching
const analyzeCode = `
  app.post('/api/analyze', async (req, res) => {
    try {
      const { images, floorPlans, description, houseName } = req.body;
      
      const allVisuals = [];
      if (floorPlans) {
        floorPlans.forEach((fp, i) => allVisuals.push({ type: 'Floor Plan', idx: i+1, data: fp.data, mimeType: fp.mimeType }));
      }
      if (images) {
        images.forEach((img, i) => allVisuals.push({ type: 'Photo', idx: i+1, data: img.data, mimeType: img.mimeType }));
      }
      
      const MAX_IMAGES_PER_REQUEST = 8;
      
      if (allVisuals.length <= MAX_IMAGES_PER_REQUEST) {
        const parts = [];
        let promptText = \`Analyze this house: \${houseName || 'Unknown'}\n\`;
        if (description) promptText += \`User Description: \${description}\n\`;
        
        promptText += \`\nTask: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.\`;
        
        parts.push({ text: promptText });
        
        allVisuals.forEach(vis => {
          parts.push({ text: \`\${vis.type} \${vis.idx}:\` });
          parts.push({ inlineData: { data: vis.data, mimeType: vis.mimeType } });
        });
        
        const { response, model } = await generateWithFallback({
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            tools: [{ googleSearch: {} }]
          }
        });
        console.log(\`Successfully generated analysis with \${model}\`);
        
        incrementQuota(model);

        const match = response.text.match(/SCORE:\\s*(\\d+)/i);
        const score = match ? parseInt(match[1]) : 50;

        res.json({ result: response.text, score });
      } else {
        console.log(\`Processing \${allVisuals.length} images in parallel batches...\`);
        const chunks = [];
        for (let i = 0; i < allVisuals.length; i += MAX_IMAGES_PER_REQUEST) {
          chunks.push(allVisuals.slice(i, i + MAX_IMAGES_PER_REQUEST));
        }
        
        const chunkPromises = chunks.map(async (chunk, chunkIdx) => {
          const parts = [];
          parts.push({ text: \`Analyze these images (Batch \${chunkIdx + 1} of \${chunks.length}) for house: \${houseName || 'Unknown'}. User description: \${description}\nTask: Describe the spatial layout, defects, and orientations found in these images specifically for Vastu analysis. Be very detailed. Note that this is a partial set of images.\` });
          
          chunk.forEach(vis => {
            parts.push({ text: \`\${vis.type} \${vis.idx}:\` });
            parts.push({ inlineData: { data: vis.data, mimeType: vis.mimeType } });
          });
          
          const preferredModel = FALLBACK_MODELS[chunkIdx % FALLBACK_MODELS.length];
          
          const { response, model } = await generateWithFallback({
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction: VASTU_SYSTEM_INSTRUCTION,
              temperature: 0.2
            }
          }, preferredModel);
          
          incrementQuota(model);
          return \`Batch \${chunkIdx + 1} Observations:\\n\${response.text}\`;
        });
        
        const batchResults = await Promise.all(chunkPromises);
        
        const finalParts = [];
        finalParts.push({ text: \`Analyze this house: \${houseName || 'Unknown'}\\nUser Description: \${description}\\n\\nTask: We had to process the images in batches. Below are the detailed Vastu observations extracted from all batches of photos and floor plans. Synthesize these observations and calculate the overall Vastu compliance for the entire house. Detail the compliance, reasons, and fixes.\\n\\n\${batchResults.join('\\n\\n')}\\n\\nCalculate the final SCORE at the very end in format SCORE: [number].\` });
        
        const { response: finalResponse, model: finalModel } = await generateWithFallback({
          contents: [{ role: 'user', parts: finalParts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            tools: [{ googleSearch: {} }]
          }
        });
        
        incrementQuota(finalModel);
        
        const match = finalResponse.text.match(/SCORE:\\s*(\\d+)/i);
        const score = match ? parseInt(match[1]) : 50;

        res.json({ result: finalResponse.text, score });
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to analyze';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });`;

content = content.replace(/app\.post\('\/api\/analyze', async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: errorMessage \}\);\n      \}\n    \}\n  \}\);/, analyzeCode.trim());

fs.writeFileSync('server.ts', content);
