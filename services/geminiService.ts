import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLogEntry = async (logData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Senior DevOps Engineer. Analyze the following Kubernetes error log and provide a concise root cause analysis and a suggested fix in Chinese.\n\nLog:\n${logData}`,
    });
    return response.text || "无法分析日志内容。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 服务暂时不可用，请检查 API Key 配置。";
  }
};

export const generateK8sManifest = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a valid Kubernetes YAML manifest based on this request: "${prompt}". 
      Return ONLY the YAML code block without markdown backticks. 
      Includes comments in Chinese explaining key sections.`,
    });
    return response.text?.replace(/```yaml/g, '').replace(/```/g, '') || "# 生成失败";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "# AI 生成服务暂时不可用";
  }
};

export const suggestOptimization = async (metrics: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these cluster metrics and suggest cost or performance optimizations in Chinese: ${JSON.stringify(metrics)}`,
    });
    return response.text || "无优化建议。";
  } catch (error) {
    return "无法获取优化建议。";
  }
};