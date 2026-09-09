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

For chat, act as the Vastu Expert assisting the user. Be respectful, wise, and practical.`;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Analyze Image Route
  app.post('/api/analyze', async (req, res) => {
    try {
      const { images, floorPlan, description, houseName } = req.body;
      
      const parts: any[] = [];
      
      let promptText = `Analyze this house: ${houseName || 'Unknown'}\n`;
      if (description) promptText += `User Description: ${description}\n`;
      
      promptText += `\nTask: If a floor plan is provided, calculate the cardinal directions and spatial layout from it. Map the provided room/angle photos to the floor plan. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.`;
      
      parts.push({ text: promptText });
      
      if (floorPlan && floorPlan.data) {
        parts.push({ text: 'Floor Plan Image:' });
        parts.push({ inlineData: { data: floorPlan.data, mimeType: floorPlan.mimeType } });
      }
      
      if (images && images.length > 0) {
        parts.push({ text: 'Room/Angle Photos:' });
        images.forEach((img: any, idx: number) => {
          parts.push({ text: `Photo ${idx + 1}:` });
          parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts }
        ],
        config: {
          systemInstruction: VASTU_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          tools: [{ googleSearch: {} }]
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze' });
    }
  });

  // Chat Route
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      
      // Map frontend messages to Gemini format
      const formattedMessages = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: formattedMessages,
        config: {
          systemInstruction: VASTU_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      res.json({ 
        result: response.text,
        groundingMetadata 
      });
    } catch (error: any) {
      console.error('Error in chat:', error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  // Refresh Baseline Route
  app.post('/api/refresh-baseline', async (req, res) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: 'Search the live internet for recent articles, studies, or guidelines on Vastu Shastra. Summarize 3 new insights to update our knowledge baseline.' }] }
        ],
        config: {
          systemInstruction: VASTU_SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ googleSearch: {} }]
        }
      });
      res.json({ success: true, result: response.text });
    } catch (error: any) {
      console.error('Error refreshing baseline:', error);
      res.status(500).json({ error: error.message || 'Failed to refresh baseline' });
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

createServer();
