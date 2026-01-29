import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Inisialisasi menggunakan API key dari environment variable secara eksklusif.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Pilih model berdasarkan kompleksitas tugas.
  const modelName = input.mode === 'deep' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const prompt = `Buatkan makalah akademik Bahasa Indonesia lengkap dan mendalam.
    Judul: ${input.title}
    Penulis: ${input.author}
    Instansi: ${input.institution}
    Mata Pelajaran/Kuliah: ${input.subject}
    Tingkat: ${input.educationLevel}
    Gaya Bahasa: ${input.languageStyle}
    
    Persyaratan Teknis:
    1. Gunakan Bahasa Indonesia formal sesuai PUEBI.
    2. Struktur harus terdiri dari: Kata Pengantar, BAB I (Latar Belakang, Rumusan, Tujuan), BAB II (Pembahasan komprehensif dengan sub-bab dinamis), BAB III (Kesimpulan & Saran), dan Daftar Pustaka.
    3. Paragraf harus rapi (3-4 kalimat per paragraf).
    4. Konten harus orisinal, ilmiah, dan tanpa opini pribadi.
    
    Output harus dalam format JSON sesuai skema yang diminta.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            preface: { type: Type.STRING, description: "Teks kata pengantar yang formal" },
            introduction: {
              type: Type.OBJECT,
              properties: {
                background: { type: Type.STRING, description: "Latar belakang masalah yang mendalam" },
                problemFormulation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar pertanyaan rumusan masalah" },
                objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar tujuan penulisan" },
              },
              required: ["background", "problemFormulation", "objectives"],
            },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Judul bab pembahasan" },
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
              description: "Minimal berisi 1 bab utama (BAB II) dengan beberapa sub-bab"
            },
            closing: {
              type: Type.OBJECT,
              properties: {
                conclusion: { type: Type.STRING, description: "Kesimpulan menyeluruh" },
                suggestions: { type: Type.STRING, description: "Saran akademik" },
              },
              required: ["conclusion", "suggestions"]
            },
            bibliography: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar pustaka format standar"
            },
          },
          required: ["introduction", "chapters", "closing", "bibliography"],
        },
        // Memberikan budget berpikir untuk model Pro agar hasil lebih berkualitas.
        thinkingConfig: { thinkingBudget: input.mode === 'deep' ? 10000 : 0 }
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI tidak mengembalikan teks konten.");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(`Gagal membuat makalah: ${error.message || "Kesalahan internal AI. Pastikan variabel API_KEY sudah dikonfigurasi dengan benar di dashboard deployment Anda."}`);
  }
};