import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput, customApiKey: string): Promise<PaperContent> => {
  const apiKey = customApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Kunci API tidak ditemukan. Silakan masukkan API Key Gemini Anda di form input.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  /**
   * MENGAPA MENGGUNAKAN FLASH?
   * Model 'gemini-3-flash-preview' memiliki kuota (Rate Limit) yang jauh lebih tinggi pada Free Tier 
   * dibandingkan model Pro. Ini mencegah error 'Resource Exhausted' atau 'Quota Exceeded' 
   * yang sering dialami pengguna akun gratis.
   */
  const modelName = 'gemini-3-flash-preview';

  const systemInstruction = `Anda adalah seorang Penulis Akademik Senior dan Profesor di Indonesia yang ahli dalam menyusun draf makalah ilmiah tingkat tinggi.
Tugas Anda adalah menulis makalah yang SANGAT PANJANG, DETAIL, dan KOMPREHENSIF.

ATURAN KETAT PENULISAN:
1. PANJANG KONTEN (WAJIB):
   - Latar Belakang (Bab I): Tulis minimal 8-10 paragraf panjang. Uraikan fenomena secara makro ke mikro.
   - Pembahasan (Bab II): Harus terdiri dari minimal 4 sub-bab utama. Setiap sub-bab WAJIB memiliki penjelasan minimal 5-7 paragraf analitis yang panjang.
   - Penutup (Bab III): Kesimpulan harus merangkum seluruh esensi materi secara mendalam.
2. BAHASA: Gunakan Bahasa Indonesia Baku (PUEBI/EYD) dengan diksi akademik tingkat tinggi.
3. KUALITAS: Berikan argumen yang logis dan analisis kritis. Jangan hanya memberikan definisi dasar.
4. FORMAT: Output harus JSON murni tanpa narasi tambahan.

Struktur JSON:
- preface: Kata pengantar formal.
- introduction: { background, problemFormulation, objectives }.
- chapters: Array of { title, subChapters: array of { title, content } }.
- closing: { conclusion, suggestions }.
- bibliography: Minimal 10 referensi format APA Style.`;

  const prompt = `Buatkan MAKALAH AKADEMIK LENGKAP DAN SANGAT PANJANG dengan judul: "${input.title}".
Tingkat Pendidikan: ${input.educationLevel}.
Mode: ${input.mode === 'deep' ? 'Mendalam/Komprehensif (Prioritaskan detail dan jumlah kata yang banyak)' : 'Standar'}.

Instruksi Khusus:
- Perbanyak narasi pada setiap sub-bab.
- Berikan analisis yang tajam dan mendalam untuk setiap poin pembahasan.
- Pastikan draf ini terasa seperti karya tulis mahasiswa tingkat akhir atau peneliti profesional.`;

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
        // Tetap gunakan thinking budget agar model Flash berpikir lebih dalam sebelum menulis
        thinkingConfig: { thinkingBudget: input.mode === 'deep' ? 24576 : 12000 }
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI tidak mengembalikan data yang valid.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Batas penggunaan API (Quota) tercapai. Hal ini biasa terjadi pada API Key gratis. Silakan tunggu 1-2 menit sebelum mencoba lagi, atau gunakan API Key yang sudah terhubung dengan penagihan (Pay-as-you-go) untuk batas yang lebih besar.");
    }
    throw new Error(errorMsg || "Gagal berkomunikasi dengan layanan AI.");
  }
};