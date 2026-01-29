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

  const systemInstruction = `Anda adalah seorang Penulis Akademik Senior dan Profesor di Indonesia yang ahli dalam menyusun draf makalah ilmiah tingkat tinggi.
Tugas Anda adalah menulis makalah yang SANGAT PANJANG, DETAIL, dan KOMPREHENSIF.

ATURAN KETAT PENULISAN:
1. PANJANG KONTEN (WAJIB):
   - Latar Belakang (Bab I): Minimal 800-1000 kata. Harus mencakup latar belakang masalah secara makro, meso, dan mikro. Sertakan urgensi penelitian secara mendalam.
   - Pembahasan (Bab II): Harus terdiri dari minimal 3-5 sub-bab utama. Setiap sub-bab WAJIB memiliki penjelasan minimal 600-800 kata. Berikan analisis kritis, bukan sekadar teori dasar.
   - Kesimpulan (Bab III): Harus komprehensif, merangkum seluruh hasil pembahasan secara sistematis.
2. BAHASA: Gunakan Bahasa Indonesia Baku (PUEBI/EYD) dengan diksi akademik tingkat tinggi. Hindari kalimat retoris atau pengulangan ide.
3. KUALITAS: Berikan argumen yang logis, koheren, dan berbasis data/teori kuat.
4. FORMAT: Output harus JSON murni tanpa narasi tambahan di luar JSON.

Struktur JSON:
- preface: Kata pengantar yang menyentuh dan formal.
- introduction: background (panjang), problemFormulation (3-5 poin), objectives (3-5 poin).
- chapters: Array of objects (title, subChapters: array of {title, content}).
- closing: conclusion (panjang), suggestions.
- bibliography: Minimal 10 referensi akademik format APA Style.`;

  const prompt = `Buatkan MAKALAH AKADEMIK LENGKAP yang SANGAT PANJANG dengan judul: "${input.title}".
Tingkat Pendidikan: ${input.educationLevel}.
Mode: ${input.mode === 'deep' ? 'Mendalam/Komprehensif (Tulis seberapa panjang mungkin)' : 'Standar'}.

Instruksi Khusus:
- Perluas setiap paragraf. Jangan hanya memberikan poin-poin.
- Gunakan transisi antar paragraf yang halus.
- Untuk tingkat Mahasiswa, sertakan tinjauan teoritis yang sangat kuat di Bab II.
- Pastikan setiap sub-bab di Bab II membahas sudut pandang yang berbeda namun tetap relevan dengan judul.`;

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
        // Memberikan thinking budget maksimal untuk model Pro agar hasil lebih matang dan panjang
        ...(modelName === 'gemini-3-pro-preview' ? { thinkingConfig: { thinkingBudget: 32768 } } : { thinkingConfig: { thinkingBudget: 16000 } })
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI tidak mengembalikan data yang valid.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Kuota API Key Anda telah habis atau limit harian tercapai. Silakan coba lagi nanti atau gunakan API Key dengan project/penagihan yang berbeda.");
    }
    throw new Error(error.message || "Gagal berkomunikasi dengan layanan AI.");
  }
};