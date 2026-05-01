import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const CHAT_MODEL = "gemini-3-flash-preview";

export async function chatWithAi(message: string, history: any[] = []) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please check your environment settings.");
  }

  const systemInstruction = "You are a helpful, intelligent AI assistant inside a productivity SaaS platform called Lumina Toolkit. You help users with writing, coding, learning, and general questions. Keep responses clear, practical, and human-like.";

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: [
      ...history,
      { role: "user", parts: [{ text: message }] }
    ],
    config: {
      systemInstruction
    }
  });

  return response.text;
}

export async function generateAiContent(prompt: string, systemInstruction: string = "You are a helpful AI assistant.") {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please check your environment settings.");
  }

  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents: prompt,
    config: {
      systemInstruction
    }
  });

  return response.text;
}
