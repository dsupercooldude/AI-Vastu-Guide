const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  for (const m of models) {
    try {
      await ai.models.generateContent({ 
        model: m, 
        contents: [
          { role: 'user', parts: [
            { text: 'Describe this image' },
            { inlineData: { mimeType: 'image/jpeg', data: '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAQDAwQDAwQEAwQFBAQFBgoHBgYGBg0JCggKDw0QEA8NDw4RExgUERIXEg4PFRwVFxkZGxsbEBQdHx0aHx8aGxv/2wBDAQQFBQYFBgwHBwwbEQ8RGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxsbGxv/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AD//Z' } }
          ] }
        ]
      });
      console.log(`Model ${m} SUCCEEDED!`);
    } catch (e) {
      console.log(`Model ${m} FAILED:`, e.message);
    }
  }
}
test();
