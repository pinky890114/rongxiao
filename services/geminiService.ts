import { GoogleGenAI } from "@google/genai";
import { Commission } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateClientUpdate = async (commission: Commission): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "錯誤: 缺少 API Key。";

  const prompt = `
    你是一位專業且親切的文字接案創作者（小說家/劇本家）的小幫手。
    請用**繁體中文**為委託人 "${commission.clientName}" 寫一則簡短、有禮貌的進度回報訊息。
    
    委託資訊：
    - 標題: ${commission.title}
    - 目前狀態: ${commission.status}
    - 類型: ${commission.type}
    
    語氣要親切但專業。
    提到目前的 "${commission.status}" 階段（例如：大綱、初稿、潤飾）進展順利。
    如果狀態是 "排單中"，請感謝他們的耐心等待。
    如果狀態是 "結案"，請告知檔案已準備好可供確認。
    字數控制在 100 字以內。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "無法產生回覆。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "產生回覆失敗，請稍後再試。";
  }
};

export const suggestWorkPlan = async (commission: Commission): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "錯誤: 缺少 API Key。";
  
    const prompt = `
      我是一位文字創作者（寫手）。請針對這個委託案，提供我 3 個具體的下一步寫作或工作建議清單。
      請用**繁體中文**回答。
      
      委託類型: ${commission.type}
      描述: ${commission.description}
      目前階段: ${commission.status}
  
      請提供 3 個簡潔、可執行的點列式建議，幫助我推進到下一個寫作階段（例如：搜集資料、梳理大綱、撰寫初稿、修辭潤飾等）。
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "無法產生計畫。";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "產生計畫失敗。";
    }
  };