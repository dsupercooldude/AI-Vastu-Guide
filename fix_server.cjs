const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const prefix = content.substring(0, content.indexOf('  // Analyze Image Route'));

const suffix = `  // Analyze Image Route
  app.post('/api/analyze', async (req, res) => {
    try {
      const { images, floorPlans, description, houseName } = req.body;
      
      const parts = [];
      
      let promptText = \`Analyze this house: \${houseName || 'Unknown'}\\n\`;
      if (description) promptText += \`User Description: \${description}\\n\`;
      
      promptText += \`\\nTask: If floor plans are provided (there may be multiple for different floors), calculate the cardinal directions and spatial layout from them. Map the provided room/angle photos to the floor plans. Then, calculate the overall Vastu compliance for the entire house or the provided scenario based on the rules. Detail the compliance, reasons, and fixes.\`;
      
      parts.push({ text: promptText });
      
      if (floorPlans && floorPlans.length > 0) {
        parts.push({ text: 'Floor Plan Images:' });
        floorPlans.forEach((fp, idx) => {
          parts.push({ text: \`Floor Plan \${idx + 1}:\` });
          parts.push({ inlineData: { data: fp.data, mimeType: fp.mimeType } });
        });
      }
      
      if (images && images.length > 0) {
        parts.push({ text: 'Room/Angle Photos:' });
        images.forEach((img, idx) => {
          parts.push({ text: \`Photo \${idx + 1}:\` });
          parts.push({ inlineData: { data: img.data, mimeType: img.mimeType } });
        });
      }

      const { response, model } = await generateWithFallback({
        contents: [
          { role: 'user', parts }
        ],
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
    } catch (error) {
      const errorMessage = error.message || 'Failed to analyze';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({ error: 'AI Quota Exceeded. Please wait a moment and try again.' });
      } else {
        console.error('Error analyzing image:', error);
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
          tools: [{ googleSearch: {} }]
        }
      });
      console.log(\`Successfully generated chat with \${model}\`);
      
      incrementQuota(model);

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      res.json({ 
        result: response.text,
        groundingMetadata 
      });
    } catch (error) {
      const errorMessage = error.message || 'Failed to generate response';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
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
          tools: [{ googleSearch: {} }]
        }
      });
      console.log(\`Successfully generated baseline with \${model}\`);
      res.json({ success: true, result: response.text });
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh baseline';
      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('404') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(\`Server running on port \${port}\`);
  });
}

createServer();
`;

fs.writeFileSync('server.ts', prefix + suffix);
