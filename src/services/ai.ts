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
  message: string,
  useThinking: boolean,
  useFast: boolean
) => {
  const ai = getAI();
  const model = useFast
    ? "gemini-3.1-flash-lite-preview"
    : "gemini-3.1-pro-preview";
  
  const config: any = {};
  if (useThinking && !useFast) {
    config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  const response = await ai.models.generateContent({
    model,
    contents: message,
    config,
  });
  return response.text;
};
