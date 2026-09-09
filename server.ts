import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VASTU_SYSTEM_INSTRUCTION = `You are an expert in Vastu Shastra.
Use the following principles from the provided Vastu Shastra document:

### Geographic & Plot Qualities
- Best shapes: Square or Rectangular, or Sherdah (wider in front, narrower at rear), Gaumukhi (narrower front, wider rear).
- Avoid: Triangular, diamond, L-shaped, cut corners.
- Extensions on Northeast are good; on Northwest they are bad.
- Slope: Northeast half (solar half) should be lower than Southwest half (lunar half).
- Soil: Yellowish is perfect. Black/clay or crumbly rock is unsuitable.

### Room Placements (The 8 Directions)
1. North (Happiness and Calm): Ideal for study room, aquariums, light things.
2. East (Abundance of wealth): Ideal for main entrance, living room, study, bathroom sinks.
3. South (Shortage of female members/tragedies): Good for female family members bedroom, storage/heavy items.
4. West (Stomach/sexual troubles): Good for male bedroom, dining room, library, overhead tank, staircase, bathroom.
5. Northeast (Positive energy/wealth): PERFECT for: Well/water source, Pooja/Prayer room, Study room, Balcony, Swimming pool, Underground water tank, Children's bedroom, Main entrance. NEVER for: Kitchen, Heavy statues, Toilets, Overhead tanks (unless small & elevated), Large trees.
6. Northwest (Unhealthy rivalry): Parking lot, Children's bedroom, alternative Kitchen.
7. Southeast (Death dreaded): PERFECT for: Kitchen, Heat emitting appliances (TVs, ovens). Also good for female bedroom.
8. Southwest (Conflict with son): PERFECT for: Master Bedroom, Adult married children bedroom, Overhead tank, Staircase, Heavy wardrobes. NEVER for: Kitchen, Basement/Underground water tank.
9. Center (Heavy monetary losses): Keep clear.

### Additional Rules
- Kitchen sink (water) in NE, Stove (fire) in SE. Don't place them together.
- Beds: Point to SW. Sleep with head facing East or South.
- Stairs: Preferably South or West. Total steps should not end in zero. Odd numbers usually preferred (start/end on right foot).
- Colors: 
  - Bedroom: Light rose, dark blue, dark green, pink. No white/light yellow.
  - Dining: Light blue, yellow, saffron, light green.
  - Pooja: White, light blue, light yellow.
  - Avoid Red/Black for wall paints.

When a user uploads a photo of a household scenario and provides the compass direction and description, you will analyze it.
Provide a clear "Vastu Report":
1. **Compliant or Not**: State clearly if the scenario is Vastu compliant.
2. **Reason**: Explain why based on the rules.
3. **Fix/Remedy**: If not compliant, suggest practical fixes (e.g., move object, change color, use mirrors/plants if applicable, though physical relocation is best).

For chat, act as the Vastu Expert assisting the user. Be respectful, wise, and practical.

CRITICAL: At the very end of your "Vastu Report", you MUST output a numerical compliance score out of 100 on a new line in this exact format:
SCORE: 85`;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const FALLBACK_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  
  class ModelMutexes {
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
        console.error(`Error with model ${model}:`, error.message);
        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
          continue; 
        }
        throw error;
      } finally {
        modelMutexes.unlock(model);
      }
    }
    console.log(`All models rate limited. Retrying in ${retryDelay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
    await delay(retryDelay);
    retryDelay *= 2; 
  }
  throw lastError; 
}


  
const aiQuota = {
  engines: [
    { name: 'Gemini 3.6 Flash', used: 0, limit: 150, status: 'Active' },
    { name: 'Gemini 3.5 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 3.7 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 3.8 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'Gemini 2.5 Flash', used: 0, limit: 1500, status: 'Failover Active' },
    { name: 'OpenAI GPT-4o (Free Tier Proxy)', used: 0, limit: 50, status: 'Standby' },
    { name: 'MS Copilot (Web Grounded)', used: 0, limit: 50, status: 'Standby' }
  ]
};

function incrementQuota(modelName) {
  const engine = aiQuota.engines.find(e => e.name.toLowerCase().replace(/ /g, '-') === modelName.replace('models/', ''));
  if (engine) engine.used++;
}


app.get('/api/quota', (req, res) => {
  res.json(aiQuota);
});

  // Analyze Image Route
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
        let promptText = `Analyze this house: ${houseName || 'Unknown'}
`;
        if (description) promptText += `User Description: ${description}
`;
        
        promptText += `
Task: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.`;
        
        parts.push({ text: promptText });
        
        allVisuals.forEach(vis => {
          parts.push({ text: `${vis.type} ${vis.idx}:` });
          parts.push({ inlineData: { data: vis.data, mimeType: vis.mimeType } });
        });
        
        const { response, model } = await generateWithFallback({
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            /* removed googleSearch */
          }
        });
        console.log(`Successfully generated analysis with ${model}`);
        
        incrementQuota(model);

        const match = response.text.match(/SCORE:\s*(\d+)/i);
        const score = match ? parseInt(match[1]) : 50;

        res.json({ result: response.text, score });
      } else {
        console.log(`Processing ${allVisuals.length} images in parallel batches...`);
        const chunks = [];
        for (let i = 0; i < allVisuals.length; i += MAX_IMAGES_PER_REQUEST) {
          chunks.push(allVisuals.slice(i, i + MAX_IMAGES_PER_REQUEST));
        }
        
        const chunkPromises = chunks.map(async (chunk, chunkIdx) => {
          const parts = [];
          parts.push({ text: `Analyze these images (Batch ${chunkIdx + 1} of ${chunks.length}) for house: ${houseName || 'Unknown'}. User description: ${description}
Task: Describe the spatial layout, defects, and orientations found in these images specifically for Vastu analysis. Be very detailed. Note that this is a partial set of images.` });
          
          chunk.forEach(vis => {
            parts.push({ text: `${vis.type} ${vis.idx}:` });
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
          return `Batch ${chunkIdx + 1} Observations:\n${response.text}`;
        });
        
        const batchResults = await Promise.all(chunkPromises);
        
        const finalParts = [];
        finalParts.push({ text: `Analyze this house: ${houseName || 'Unknown'}\nUser Description: ${description}\n\nTask: We had to process the images in batches. Below are the detailed Vastu observations extracted from all batches of photos and floor plans. Synthesize these observations and calculate the overall Vastu compliance for the entire house. Detail the compliance, reasons, and fixes.\n\n${batchResults.join('\n\n')}\n\nCalculate the final SCORE at the very end in format SCORE: [number].` });
        
        const { response: finalResponse, model: finalModel } = await generateWithFallback({
          contents: [{ role: 'user', parts: finalParts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            /* removed googleSearch */
          }
        });
        
        incrementQuota(finalModel);
        
        const match = finalResponse.text.match(/SCORE:\s*(\d+)/i);
        const score = match ? parseInt(match[1]) : 50;

        res.json({ result: finalResponse.text, score });
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to analyze';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  // Chat Route
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      // Map frontend messages to Gemini format
      const formattedMessages = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const { response, model } = await generateWithFallback({
        contents: formattedMessages,
        config: {
          systemInstruction: VASTU_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          /* removed googleSearch */
        }
      });
      console.log(`Successfully generated chat with ${model}`);
      
      incrementQuota(model);

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      res.json({ 
        result: response.text,
        groundingMetadata 
      });
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate response';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error in chat:', error);
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  // Refresh Baseline Route
  app.post('/api/refresh-baseline', async (req, res) => {
    try {
      const { response, model } = await generateWithFallback({
        contents: [
          { role: 'user', parts: [{ text: 'Search the live internet for recent articles, studies, or guidelines on Vastu Shastra. Summarize 3 new insights to update our knowledge baseline.' }] }
        ],
        config: {
          systemInstruction: VASTU_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          /* removed googleSearch */
        }
      });
      console.log(`Successfully generated baseline with ${model}`);
      res.json({ success: true, result: response.text });
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh baseline';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error refreshing baseline:', error);
        res.status(500).json({ error: errorMessage });
      }
    }
  });

  let vite;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '..', 'dist', 'client')));
    app.use('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'dist', 'client', 'index.html'));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });
}

createServer();
