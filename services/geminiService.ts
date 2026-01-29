
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput, customApiKey: string): Promise<PaperContent> => {
  const apiKey = customApiKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Kunci API tidak ditemukan. Silakan masukkan API Key Gemini Anda di form input.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Menggunakan model Flash untuk kecepatan dan kuota yang lebih stabil
  const modelName = 'gemini-3-flash-preview';

  const isDeepMode = input.mode === 'deep';

  const systemInstruction = `Anda adalah seorang Profesor Senior dan Penulis Akademik Terkemuka di Indonesia. 
Tugas Anda adalah menulis draf makalah ilmiah yang SANGAT DETAIL, LUAS, dan MENDALAM.

ATURAN KETAT PENULISAN (WAJIB):
1. VOLUME KONTEN: 
   - Latar Belakang: Harus sangat luas. Minimal 800-1000 kata. Uraikan dari sejarah, fenomena global, hingga kondisi spesifik di Indonesia.
   - Pembahasan (Bab II): Harus terdiri dari minimal 4 sub-bab utama yang komprehensif. 
   - Tiap Sub-Bab: Minimal 600-800 kata per sub-bab. Jangan gunakan poin-poin (bullet points), gunakan paragraf analitis yang panjang dan mengalir.
2. KUALITAS BAHASA: Gunakan Bahasa Indonesia Baku (PUEBI/EYD) tingkat tinggi. Hindari pengulangan kalimat.
3. ANALISIS: Jangan hanya memberikan definisi. Berikan sintesis, komparasi teori, dan analisis kritis yang tajam.
4. PERSONA: Bertindaklah seolah-olah Anda sedang menyusun skripsi atau tesis yang sangat berkualitas.
5. FORMAT: Output harus JSON murni. Jangan tambahkan teks apapun di luar blok JSON.

TINGKAT PENDIDIKAN: ${input.educationLevel}. Sesuaikan kedalaman teori dengan level ini.`;

  const prompt = `Buatkan MAKALAH LENGKAP dengan judul: "${input.title}".
MODE: ${isDeepMode ? 'MENDALAM & SANGAT PANJANG (WAJIB LEBIH DARI 3000 KATA)' : 'STANDAR'}.

Instruksi Khusus untuk Bab II:
- Jangan meringkas materi. 
- Jabarkan setiap sub-topik secara ekstensif.
- Masukkan pandangan ahli dan data-data pendukung dalam bentuk narasi paragraf.
- Pastikan setiap paragraf berisi minimal 4-6 kalimat kompleks.`;

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
            preface: { 
              type: Type.STRING, 
              description: "Kata pengantar formal yang panjang dan menyentuh (min 200 kata)." 
            },
            introduction: {
              type: Type.OBJECT,
              properties: {
                background: { 
                  type: Type.STRING, 
                  description: "Latar belakang masalah yang sangat panjang, luas, dan mendalam (min 1000 kata)." 
                },
                problemFormulation: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "3-5 rumusan masalah yang tajam."
                },
                objectives: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Tujuan penulisan yang sinkron dengan rumusan masalah."
                },
              },
              required: ["background", "problemFormulation", "objectives"],
            },
            chapters: {
              type: Type.ARRAY,
              description: "Minimal 4 sub-bab pembahasan yang sangat detail.",
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
                        content: { 
                          type: Type.STRING, 
                          description: "Konten analisis yang sangat panjang, minimal 600 kata per sub-bab." 
                        },
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
                conclusion: { 
                  type: Type.STRING, 
                  description: "Kesimpulan komprehensif yang panjang (min 400 kata)." 
                },
                suggestions: { 
                  type: Type.STRING, 
                  description: "Saran praktis dan akademis yang mendetail." 
                },
              },
              required: ["conclusion", "suggestions"]
            },
            bibliography: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar pustaka minimal 10 referensi akademik terbaru format APA."
            },
          },
          required: ["introduction", "chapters", "closing", "bibliography"],
        },
        // Memberikan thinking budget menengah agar model tidak 503 tapi tetap berencana menulis panjang
        thinkingConfig: { 
          thinkingBudget: isDeepMode ? 16000 : 0 
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI tidak mengembalikan data yang valid.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("503") || errorMsg.includes("overloaded")) {
      throw new Error("Layanan AI sedang sangat sibuk karena permintaan penulisan panjang. Silakan coba lagi dalam 30 detik atau gunakan mode 'Kilat'.");
    }
    if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Kuota API tercapai. Mohon tunggu sejenak atau gunakan API Key lain.");
    }
    throw new Error(errorMsg || "Gagal menyusun makalah panjang. Periksa koneksi Anda.");
  }
};
