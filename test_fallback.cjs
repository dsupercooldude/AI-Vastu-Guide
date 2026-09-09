const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const models = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.1-pro-preview', 'gemini-3.5-flash-lite'];
  for (const m of models) {
    try {
      await ai.models.generateContent({ model: m, contents: 'hello' });
      console.log(`Model ${m} SUCCEEDED!`);
    } catch (e) {
      console.log(`Model ${m} FAILED:`, e.message);
    }
  }
}
test();
