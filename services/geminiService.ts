
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

// Helper untuk mendapatkan API KEY dengan aman di browser/Vercel
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key tidak ditemukan. Pastikan Anda telah mengatur environment variable API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isDeep = input.mode === 'deep';
  
  const prompt = `
    Buatkan konten makalah akademik Bahasa Indonesia.
    Judul: ${input.title}
    Tingkat Pendidikan: ${input.educationLevel}
    Gaya Bahasa: ${input.languageStyle}
    Mode: ${isDeep ? 'Mendalam' : 'Standar'}
    
    PENTING: Gunakan Bahasa Indonesia formal (PUEBI). Jangan gunakan opini pribadi.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      preface: { type: Type.STRING },
      introduction: {
        type: Type.OBJECT,
        properties: {
          background: { type: Type.STRING },
          problemFormulation: { type: Type.ARRAY, items: { type: Type.STRING } },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["background", "problemFormulation", "objectives"],
      },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subChapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["title", "subChapters"],
        },
      },
      closing: {
        type: Type.OBJECT,
        properties: {
          conclusion: { type: Type.STRING },
          suggestions: { type: Type.STRING },
        },
        required: ["conclusion", "suggestions"],
      },
      bibliography: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
    required: ["introduction", "chapters", "closing", "bibliography"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        thinkingConfig: { thinkingBudget: isDeep ? 10000 : 0 }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Gagal menghasilkan konten makalah. Silakan coba lagi.");
  }
};
