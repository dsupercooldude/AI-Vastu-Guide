const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function list() {
  try {
    const res = await ai.models.list();
    let items = [];
    if (res.data && res.data.models) items = res.data.models;
    else if (res.models) items = res.models;
    else if (Array.isArray(res)) items = res;
    else {
      // maybe we iterate keys
      for (const key of Object.keys(res)) {
         if (Array.isArray(res[key])) {
             items = res[key];
             break;
         }
      }
    }
    for (const m of items) {
      console.log(m.name);
    }
  } catch (e) {
    console.error(e);
  }
}
list();
