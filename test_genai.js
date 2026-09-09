import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      model: 'gemini-2.5-flash',
      config: { tools: [{ googleSearch: {} }] }
    });
    console.log(response.text);
  } catch (e) {
    console.error("Error with gemini-2.5-flash:", e.message);
  }
  
  try {
    const response = await ai.models.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
      model: 'gemini-2.0-flash',
      config: { tools: [{ googleSearch: {} }] }
    });
    console.log(response.text);
  } catch (e) {
    console.error("Error with gemini-2.0-flash:", e.message);
  }
}
test();
