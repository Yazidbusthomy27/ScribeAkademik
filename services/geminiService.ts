
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Inisialisasi SDK menggunakan process.env.API_KEY.
  // Platform (seperti preview ini) akan menangani pengisian nilainya.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isDeep = input.mode === 'deep';
  
  const prompt = `Buatkan makalah akademik Bahasa Indonesia lengkap.
    Judul: ${input.title}
    Penulis: ${input.author}
    Instansi: ${input.institution}
    Tingkat: ${input.educationLevel}
    Gaya: ${input.languageStyle}
    
    Struktur: Kata Pengantar, BAB I (Latar Belakang, Rumusan, Tujuan), BAB II (Pembahasan mendalam minimal 3 sub-bab), BAB III (Kesimpulan, Saran), Daftar Pustaka.
    Bahasa: Indonesia Formal (PUEBI).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
              items: { type: Type.STRING },
            },
          },
          required: ["introduction", "chapters", "closing", "bibliography"],
        },
        thinkingConfig: { thinkingBudget: isDeep ? 15000 : 0 }
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI tidak memberikan respon teks.");
    
    return JSON.parse(result);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
