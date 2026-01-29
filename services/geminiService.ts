import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Menginisialisasi client secara langsung menggunakan process.env.API_KEY.
  // Sesuai pedoman, API Key harus diambil eksklusif dari environment variable.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = input.mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const prompt = `Buatkan makalah akademik Bahasa Indonesia lengkap dengan format JSON.
Judul: ${input.title}
Penulis: ${input.author}
Instansi: ${input.institution}
Tingkat: ${input.educationLevel}
Gaya: ${input.languageStyle}

Struktur JSON harus mencakup:
1. preface (Kata Pengantar)
2. introduction (background, problemFormulation[], objectives[])
3. chapters (ARRAY of {title, subChapters: ARRAY of {title, content}})
4. closing (conclusion, suggestions)
5. bibliography (ARRAY of references)`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
                      required: ["title", "content"]
                    },
                  },
                },
                required: ["title", "subChapters"]
              },
            },
            closing: {
              type: Type.OBJECT,
              properties: {
                conclusion: { type: Type.STRING },
                suggestions: { type: Type.STRING },
              },
              required: ["conclusion", "suggestions"]
            },
            bibliography: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["introduction", "chapters", "closing", "bibliography"],
        },
        // Menambahkan thinkingBudget hanya untuk mode 'deep' (Gemini 3 Pro)
        ...(input.mode === 'deep' ? { thinkingConfig: { thinkingBudget: 15000 } } : {})
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI tidak memberikan respon teks.");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};