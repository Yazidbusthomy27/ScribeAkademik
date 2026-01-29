
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Inisialisasi GoogleGenAI baru tepat sebelum pemanggilan untuk memastikan kunci terbaru digunakan
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Pilih model berdasarkan mode (Mendalam vs Cepat)
  const modelName = input.mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const prompt = `Buatkan makalah akademik Bahasa Indonesia lengkap dengan format JSON.
    Judul: ${input.title}
    Penulis: ${input.author}
    Instansi: ${input.institution}
    Tingkat: ${input.educationLevel}
    
    Makalah harus memiliki: Kata Pengantar, BAB I (Latar Belakang, Rumusan, Tujuan), BAB II (Pembahasan mendalam), BAB III (Kesimpulan & Saran), dan Daftar Pustaka.
    Bahasa: Formal Indonesia (PUEBI).`;

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
        // Alokasikan thinkingBudget untuk model Pro agar hasil lebih berkualitas
        thinkingConfig: { thinkingBudget: input.mode === 'deep' ? 10000 : 0 }
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI tidak memberikan respon teks.");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error; // Biarkan komponen UI menangani error dengan informasi yang sesuai
  }
};
