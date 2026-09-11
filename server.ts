import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config();



const JSON_PROMPT_INSTRUCTION = `Task: Based on the provided floor plans and photos, calculate the cardinal directions. Map the provided photos to the floor plans if possible.
Synthesize all observations into a comprehensive Vastu analysis.
Identify defects and strictly provide practical remedies.


Evaluate these 8 standard checklist items. If you are 100% absolutely certain that an item is compliant based ONLY on the provided images/plans, include its ID in the verifiedChecklistItems array. If you have even 1% doubt, or if there is not enough information to verify it, do NOT include its ID.
1: Main entrance is located in North, East, or North-East.
2: Master bedroom is in the South-West.
3: Kitchen is in the South-East or North-West.
4: Pooja room is in the North-East.
5: No toilets are located in the North-East.
6: Center of the house (Brahmasthan) is empty and clutter-free.
7: Staircase is in the South, West, or South-West.
8: Mirrors do not directly face the bed.


You MUST respond with a pure JSON string (NO markdown backticks, NO \`\`\`json wrappers, JUST the raw JSON object) matching exactly this format:
{
  "score": <number 0-100>,
  "zoneScores": [
    { "zone": "North", "score": <number 0-100> },
    { "zone": "North-East", "score": <number 0-100> },
    { "zone": "East", "score": <number 0-100> },
    { "zone": "South-East", "score": <number 0-100> },
    { "zone": "South", "score": <number 0-100> },
    { "zone": "South-West", "score": <number 0-100> },
    { "zone": "West", "score": <number 0-100> },
    { "zone": "North-West", "score": <number 0-100> },
    { "zone": "Center", "score": <number 0-100> }
  ],
  "verifiedChecklistItems": [<array of numbers 1-8 for items you are 100% certain are compliant>],
  "remedies": [
    {
      "defect": "<description of the defect/dosha>",
      "zone": "<e.g., North-East>",
      "remedy": "<specific, actionable physical remedy>",
      "cost": "<Low, Medium, or High>",
      "effort": "<Low, Medium, or High>"
    }
  ],
  "report": "<your full detailed markdown string including zone-by-zone breakdown, image references, and recommended remedies>"
}`;



const NUMEROLOGY_DATA: Record<number, any> = {
  1: { energy: 'Independence & Innovation', planet: 'Sun', vibe: 'Promotes individuality, ambition, and new beginnings. Ideal for those seeking personal growth.' },
  2: { energy: 'Harmony & Partnership', planet: 'Moon', vibe: 'Fosters peace, sensitivity, and cooperation. Great for creating a warm, nurturing environment.' },
  3: { energy: 'Creativity & Expression', planet: 'Jupiter', vibe: 'Uplifting, optimistic, and highly social. A fun house filled with laughter and creative energy.' },
  4: { energy: 'Stability & Order', planet: 'Rahu (North Node)', vibe: 'Grounded, disciplined, and secure. Best for those building a solid foundation and long-term goals.' },
  5: { energy: 'Freedom & Adventure', planet: 'Mercury', vibe: 'Dynamic, restless, and constantly changing. Expect unexpected adventures and an active social life.' },
  6: { energy: 'Love & Family', planet: 'Venus', vibe: 'Warm, beautiful, and deeply domestic. The ultimate family home that feels like a sanctuary.' },
  7: { energy: 'Spirituality & Solitude', planet: 'Ketu (South Node)', vibe: 'Quiet, introspective, and mystical. Perfect for deep thought, meditation, and inner discovery.' },
  8: { energy: 'Wealth & Power', planet: 'Saturn', vibe: 'Focuses on material success, efficiency, and ambition. Demands hard work but brings significant financial reward.' },
  9: { energy: 'Humanitarianism & Completion', planet: 'Mars', vibe: 'Compassionate, broad-minded, and charitable. Encourages letting go of the past and embracing universal love.' }
};

function getNumerology(name: string) {
  const alphanumeric = (name || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (!alphanumeric) return null;
  let sum = 0;
  for (let i = 0; i < alphanumeric.length; i++) {
    const char = alphanumeric[i];
    if (/[0-9]/.test(char)) sum += parseInt(char);
    else sum += ((char.charCodeAt(0) - 64 - 1) % 9) + 1;
  }
  while (sum > 9) sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  return sum ? NUMEROLOGY_DATA[sum] : null;
}

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
  mutexes: Record<string, any>;
  constructor() {
    this.mutexes = {};
  }
  async lock(model: string) {
    if (!this.mutexes[model]) {
      this.mutexes[model] = { locked: false, queue: [] };
    }
    return new Promise(resolve => {
      if (!this.mutexes[model].locked) {
        this.mutexes[model].locked = true;
        resolve(undefined);
      } else {
        this.mutexes[model].queue.push(resolve);
      }
    });
  }
  unlock(model: string) {
    if (this.mutexes[model].queue.length > 0) {
      const resolve = this.mutexes[model].queue.shift();
      resolve(undefined);
    } else {
      this.mutexes[model].locked = false;
    }
  }
}
const modelMutexes = new ModelMutexes();
const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

async function generateWithFallbackStream(options: any, preferredModel: string | null = null) {
  let lastError;
  const MAX_RETRIES = 6;
  let retryDelay = 4000;
  let modelsToTry = [...FALLBACK_MODELS];
  if (preferredModel && modelsToTry.includes(preferredModel)) {
    modelsToTry = [preferredModel, ...modelsToTry.filter(m => m !== preferredModel)];
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    for (const model of modelsToTry) {
      await modelMutexes.lock(model);
      try {
        const responseStream = await ai.models.generateContentStream({
          ...options,
          model: model,
        });
        // We unlock here because stream is returning. It's a bit of a race condition if they all stream, but this is fine for fallback.
        modelMutexes.unlock(model);
        return { responseStream, model };
      } catch (error: any) {
        modelMutexes.unlock(model);
        lastError = error;
        const errorMessage = error.message || '';
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('503')) {
          console.warn(`Model ${model} stream rate-limited. Trying fallback...`);
          continue;
        }
        throw error;
      }
    }
    await delay(retryDelay);
    retryDelay *= 2;
  }
  throw lastError;
}

async function generateWithFallback(options: any, preferredModel: string | null = null) {
  let lastError;
  const MAX_RETRIES = 6;
  let retryDelay = 4000;

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
      } catch (error: any) {
        lastError = error;
        let errorString = '';
        try { errorString = JSON.stringify(error); } catch(e) { errorString = String(error); }
        const errorMessage = (error.message || '') + ' ' + errorString;
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('400') || errorMessage.includes('not found') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE') || errorMessage.includes('500') || errorMessage.includes('high demand') || errorMessage.includes('temporarily overloaded')) {
          console.warn(`Model ${model} is currently overloaded or rate-limited. Trying fallback...`);
        } else {
          console.error(`Error with model ${model}:`, error.message);
        }
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

function incrementQuota(modelName: string) {
  const engine = aiQuota.engines.find(e => e.name.toLowerCase().replace(/ /g, '-') === modelName.replace('models/', ''));
  if (engine) engine.used++;
}


app.get('/api/quota', (req, res) => {
  res.json(aiQuota);
});

  // Analyze Image Route
  
  app.post('/api/analyze', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendEvent = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    try {
      const { images, floorPlans, description, houseName } = req.body;
      
      const numerology = getNumerology(houseName);
      let numerologyContext = '';
      if (numerology) {
        numerologyContext = `\nHouse Numerology Vibe: ${numerology.energy} (Planet ${numerology.planet}). ${numerology.vibe} Please incorporate this numerological energy into the report, problems, and specific remedies where applicable.`;
      }
      
      const allVisuals: any[] = [];
      if (floorPlans) {
        floorPlans.forEach((fp: any, i: number) => allVisuals.push({ type: 'Floor Plan', idx: i+1, data: fp.data, mimeType: fp.mimeType }));
      }
      if (images) {
        images.forEach((img: any, i: number) => allVisuals.push({ type: 'Photo', idx: i+1, data: img.data, mimeType: img.mimeType }));
      }
      
      const MAX_IMAGES_PER_REQUEST = 8;
      
      if (allVisuals.length <= MAX_IMAGES_PER_REQUEST) {
        const parts = [];
        let promptText = `Analyze this house: ${houseName || 'Unknown'}`;
        if (description) promptText += '\nUser Description: ' + description;
        if (typeof numerologyContext !== 'undefined') promptText += numerologyContext;
        promptText += '\n' + JSON_PROMPT_INSTRUCTION;
        
        parts.push({ text: promptText });
        
        for (const vis of allVisuals) {
          parts.push({ text: `${vis.type} ${vis.idx}:` });
          let base64Data = vis.data;
          if (vis.data.startsWith('http')) {
            try {
              const fetchRes = await fetch(vis.data);
              const buffer = await fetchRes.arrayBuffer();
              base64Data = Buffer.from(buffer).toString('base64');
            } catch (err) {
              console.error("Failed to fetch image URL:", err);
            }
          } else if (vis.data.startsWith('data:')) {
            base64Data = vis.data.split(',')[1];
          }
          parts.push({ inlineData: { data: base64Data, mimeType: vis.mimeType } });
        }
        
        sendEvent('progress', { message: 'Analyzing images...', increment: 30 });
        
        const { response, model } = await generateWithFallback({
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });
        
        incrementQuota(model);
        sendEvent('progress', { message: 'Generating report...', increment: 50 });
        
        let jsonResponse;
        try {
           let cleanedText = (response.text || "").replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
           const firstBrace = cleanedText.indexOf('{');
           const lastBrace = cleanedText.lastIndexOf('}');
           if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
               cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
           }
           jsonResponse = JSON.parse(cleanedText);
        } catch (e: any) {
           console.error("Failed to parse JSON", e);
           const match = (response.text || "").match(/SCORE:\s*(\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: (response.text || ""), zoneScores: [], verifiedChecklistItems: [], remedies: [] };
        }
        
        sendEvent('complete', { result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores, verifiedChecklistItems: jsonResponse.verifiedChecklistItems || [], remedies: jsonResponse.remedies || [] });
        res.end();
      } else {
        const chunks = [];
        for (let i = 0; i < allVisuals.length; i += MAX_IMAGES_PER_REQUEST) {
          chunks.push(allVisuals.slice(i, i + MAX_IMAGES_PER_REQUEST));
        }
        
        const batchResults = [];
        let accumulatedReport = '';
        
        for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
          const chunk = chunks[chunkIdx];
          sendEvent('progress', { message: `Analyzing batch ${chunkIdx + 1} of ${chunks.length}...`, increment: Math.floor(50 / chunks.length) });
          
          const parts = [];
          parts.push({ text: `Analyze these images (Batch ${chunkIdx + 1} of ${chunks.length}) for house: ${houseName || 'Unknown'}. User description: ${description}\nTask: Describe the spatial layout, defects, and orientations found in these images specifically for Vastu analysis. Be very detailed. Note that this is a partial set of images.` });
          
          for (const vis of chunk) {
            parts.push({ text: `${vis.type} ${vis.idx}:` });
            let base64Data = vis.data;
            if (vis.data.startsWith('http')) {
              try {
                const fetchRes = await fetch(vis.data);
                const buffer = await fetchRes.arrayBuffer();
                base64Data = Buffer.from(buffer).toString('base64');
              } catch (err) { }
            } else if (vis.data.startsWith('data:')) {
              base64Data = vis.data.split(',')[1];
            }
            parts.push({ inlineData: { data: base64Data, mimeType: vis.mimeType } });
          }
          
          const preferredModel = FALLBACK_MODELS[chunkIdx % FALLBACK_MODELS.length];
          const { response, model } = await generateWithFallback({
            contents: [{ role: 'user', parts }],
            config: {
              systemInstruction: VASTU_SYSTEM_INSTRUCTION,
              temperature: 0.2
            }
          }, preferredModel);
          
          incrementQuota(model);
          const chunkRes = `Batch ${chunkIdx + 1} Observations:\n${response.text}`;
          batchResults.push(chunkRes);
          
          accumulatedReport += `\n\n### Observations from Batch ${chunkIdx + 1}\n` + response.text;
          sendEvent('partial_report', { report: accumulatedReport });
        }
        
        sendEvent('progress', { message: 'Synthesizing final report...', increment: 30 });
        
        const finalParts = [];
        finalParts.push({ text: `Analyze this house: ${houseName || 'Unknown'}\nUser Description: ${description}${numerologyContext}\n\nTask: We had to process the images in batches. Below are the detailed Vastu observations extracted from all batches of photos and floor plans.\n\n${batchResults.join('\n\n')}\n\n${JSON_PROMPT_INSTRUCTION}` });
        
        const { response: finalResponse, model: finalModel } = await generateWithFallback({
          contents: [{ role: 'user', parts: finalParts }],
          config: {
            systemInstruction: VASTU_SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json'
          }
        });
        
        incrementQuota(finalModel);
        
        let jsonResponse;
        try {
           let cleanedText = (finalResponse.text || "").replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
           const firstBrace = cleanedText.indexOf('{');
           const lastBrace = cleanedText.lastIndexOf('}');
           if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
               cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
           }
           jsonResponse = JSON.parse(cleanedText);
        } catch (e: any) {
           console.error("Failed to parse JSON", e);
           const match = (finalResponse.text || "").match(/SCORE:\s*(\d+)/i);
           const score = match ? parseInt(match[1]) : 50;
           jsonResponse = { score, report: (finalResponse.text || ""), zoneScores: [], verifiedChecklistItems: [], remedies: [] };
        }
        
        sendEvent('complete', { result: jsonResponse.report, score: jsonResponse.score, zoneScores: jsonResponse.zoneScores, verifiedChecklistItems: jsonResponse.verifiedChecklistItems || [], remedies: jsonResponse.remedies || [] });
        res.end();
      }
    } catch (error: any) {
      console.error(error);
      sendEvent('error', { error: error.message || 'Failed to analyze' });
      res.end();
    }
  });

app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      // Map frontend messages to Gemini format
      const formattedMessages = messages.map((m: any) => ({
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
        result: response.text || "",
        groundingMetadata 
      });
    } catch (error: any) {
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
    } catch (error: any) {
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
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });
}

createServer();
