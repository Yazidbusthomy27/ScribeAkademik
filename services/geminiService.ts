import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Ambil API_KEY dari environment variable
  const apiKey = process.env.API_KEY;

  // Jika kunci tidak ada, berikan pesan error yang membantu pengguna melakukan debug di Vercel
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "API_KEY tidak terdeteksi. Pastikan Anda telah menambahkan Environment Variable 'API_KEY' di dasbor Vercel dan melakukan 'Redeploy' agar kunci tersebut dapat diakses oleh aplikasi."
    );
  }

  // Inisialisasi AI dengan kunci yang sudah tervalidasi
  const ai = new GoogleGenAI({ apiKey });
  
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
        thinkingConfig: { thinkingBudget: input.mode === 'deep' ? 10000 : 0 }
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI tidak memberikan respon teks.");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Kunci API tidak valid. Periksa kembali API_KEY yang Anda masukkan di Vercel.");
    }
    throw new Error(`Gagal membuat makalah: ${error.message || "Kesalahan tidak dikenal"}`);
  }
};