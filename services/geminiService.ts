
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Pastikan API_KEY tersedia
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Konfigurasi API_KEY tidak ditemukan. Jika Anda di Vercel, pastikan Environment Variable API_KEY sudah diatur.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isDeep = input.mode === 'deep';
  
  const prompt = `Buatkan konten makalah akademik Bahasa Indonesia yang sangat lengkap dan mendalam.
    Judul: ${input.title}
    Tingkat Pendidikan: ${input.educationLevel}
    Gaya Bahasa: ${input.languageStyle}
    Mode: ${isDeep ? 'Mendalam' : 'Cepat'}
    
    Persyaratan:
    1. Bahasa Indonesia formal sesuai PUEBI.
    2. Struktur makalah standar (Latar Belakang, Rumusan, Tujuan, Pembahasan, Penutup).
    3. Daftar Pustaka minimal 5 sumber kredibel.
    4. Sub-bab di Bab II harus minimal 3 topik berbeda.`;

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
                    },
                  },
                },
              },
            },
            closing: {
              type: Type.OBJECT,
              properties: {
                conclusion: { type: Type.STRING },
                suggestions: { type: Type.STRING },
              },
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

    const text = response.text;
    if (!text) throw new Error("AI mengembalikan respon kosong.");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gagal generate makalah. Silakan cek koneksi atau API Key Anda.");
  }
};
