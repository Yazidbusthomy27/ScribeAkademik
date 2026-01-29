
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput, customApiKey: string): Promise<PaperContent> => {
  const apiKey = customApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Kunci API tidak ditemukan. Silakan masukkan API Key Gemini Anda di form input.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Mahasiswa atau mode 'deep' menggunakan model yang lebih cerdas (Pro)
  const modelName = (input.educationLevel === 'Mahasiswa' || input.mode === 'deep') 
    ? 'gemini-3-pro-preview' 
    : 'gemini-3-flash-preview';

  const systemInstruction = `Anda adalah seorang Penulis Akademik Profesional Indonesia yang ahli dalam menyusun makalah, jurnal, dan karya ilmiah.
Tugas Anda adalah membuat makalah LENGKAP DAN SANGAT MENDALAM berdasarkan input pengguna.

KRITERIA UTAMA:
1. PANJANG KONTEN: Hasil harus sangat mendetail. 
   - Latar Belakang (Bab I) harus minimal 5-7 paragraf yang menguraikan fenomena, data, dan urgensi masalah.
   - Pembahasan (Bab II) harus memiliki minimal 3-4 sub-bab besar, di mana setiap sub-bab memiliki minimal 4-6 paragraf analitis yang panjang.
2. BAHASA: Gunakan Bahasa Indonesia Formal (PUEBI/EYD) yang sangat kaku, objektif, dan akademis. Hindari pengulangan kata yang tidak perlu.
3. ANALISIS: Berikan analisis teoritis yang kuat, kutipan ahli (simulasi), dan pembahasan yang komprehensif. Jangan hanya memberikan definisi.
4. STRUKTUR: Ikuti struktur: Kata Pengantar, Pendahuluan, Pembahasan (dinamis), Penutup, dan Daftar Pustaka.
5. DAFTAR PUSTAKA: Minimal 7-10 referensi akademik terbaru (5 tahun terakhir) dalam format APA Style.

Format keluaran HARUS JSON murni tanpa teks pembuka/penutup.`;

  const prompt = `Buatkan makalah akademik yang SANGAT PANJANG DAN MENDALAM dalam format JSON.
Informasi Dasar:
- Judul: ${input.title}
- Penulis: ${input.author}
- Institusi: ${input.institution}
- Mata Kuliah: ${input.subject}
- Tingkat Pendidikan: ${input.educationLevel}
- Gaya Bahasa: ${input.languageStyle}
- Mode: ${input.mode === 'deep' ? 'Mendalam/Komprehensif (Prioritaskan kedalaman materi)' : 'Standar'}

Pastikan Bab II Pembahasan mencakup aspek teori, implementasi, dan analisis kritis yang luas.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
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
        // Memberikan thinking budget maksimal untuk kualitas tertinggi
        ...(input.mode === 'deep' ? { thinkingConfig: { thinkingBudget: 32768 } } : { thinkingConfig: { thinkingBudget: 16000 } })
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI tidak mengembalikan data yang valid.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Gagal berkomunikasi dengan layanan AI.");
  }
};
