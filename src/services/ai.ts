import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

// Standard instance using the injected key
const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
};

export const generateMarketScan = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text;
};

export const chatWithGemini = async (
  messages: { role: 'user' | 'ai'; content: string }[],
  useThinking: boolean,
  useFast: boolean
) => {
  const ai = getAI();
  const model = useFast
    ? "gemini-3.1-flash-lite-preview"
    : "gemini-3.1-pro-preview";
  
  const config: any = {};

  // Format history for Gemini
  // Gemini chat expects user/model alternating, and the first message must be from the user.
  let formattedContents = messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  if (formattedContents.length > 0 && formattedContents[0].role === 'model') {
    formattedContents = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      ...formattedContents
    ];
  }

  const response = await ai.models.generateContent({
    model,
    contents: formattedContents,
    config,
  });
  return response.text;
};
