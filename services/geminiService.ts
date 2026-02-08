
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function analyzeForensicData(
  dbType: string,
  analysisType: AnalysisType,
  description: string,
  logSnippet: string,
  artifactHash?: string
): Promise<AnalysisResult> {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are a world-class Cyber Forensics Examiner and Data Scientist. 
    Analyze the following database logs/information for signs of ${analysisType} in a ${dbType} system.
    
    Database Type: ${dbType}
    Context: ${description}
    Chain of Custody (SHA-256): ${artifactHash || 'Not provided'}
    
    Data Snippet:
    ---
    ${logSnippet}
    ---
    
    Provide a detailed forensic analysis including summary, risk score (0-100), key findings, and suggested queries for the investigator.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 20000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["severity", "description", "impact"]
              }
            },
            suggestedQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "riskScore", "findings", "suggestedQueries"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}') as AnalysisResult;
    return result;
  } catch (error) {
    console.error("Forensic analysis failed:", error);
    throw error;
  }
}

export async function getForensicCopilotResponse(
  query: string, 
  context: string
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model: model,
    contents: `Forensic Context: ${context}\n\nUser Question: ${query}`,
    config: {
      systemInstruction: "You are a cyber forensics assistant. Answer questions about database security, attack vectors, and investigation techniques."
    }
  });

  return response.text || "No response received.";
}
