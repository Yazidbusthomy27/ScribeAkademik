
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const isDeep = input.mode === 'deep';
  
  const prompt = `
    Buatkan konten makalah akademik yang SANGAT KOMPREHENSIF, EKSTENSIF, dan MENDALAM dalam Bahasa Indonesia.
    Makalah ini harus memenuhi standar tesis atau jurnal ilmiah tingkat tinggi dengan analisis kritis yang tajam dan data pendukung yang kuat.
    
    DATA MAKALAH:
    - Judul: ${input.title}
    - Tingkat Pendidikan: ${input.educationLevel}
    - Gaya Bahasa: ${input.languageStyle}
    - Mode: ${isDeep ? 'EKSTRA MENDALAM (Target minimal 5000 kata)' : 'STANDAR (Target 2000-3000 kata)'}
    
    INSTRUKSI KHUSUS UNTUK VOLUME & KEDALAMAN KONTEN:
    1. BAB I PENDAHULUAN: Latar belakang harus mencakup tinjauan makro (global), meso (regional/nasional), dan mikro (spesifik topik). Minimal 10-12 paragraf panjang yang berbobot.
    2. BAB II PEMBAHASAN: Wajib terdiri dari minimal 8 sampai 10 sub-bab yang sistematis, logis, dan progresif.
    3. SETIAP SUB-BAB: Harus berisi pembahasan mendalam minimal 10-15 paragraf. Fokus pada elaborasi teori, analisis fenomena, data statistik (jika relevan), studi kasus, dan perdebatan akademik yang ada.
    4. ANALISIS KRITIS: Jangan hanya merangkum. Lakukan dekonstruksi masalah, evaluasi kelebihan/kekurangan, dan tawarkan sintesis baru.
    5. KOSA KATA: Gunakan terminologi akademik tingkat lanjut yang menunjukkan keahlian (expertise) di bidang tersebut.
    6. REFERENSI: Daftar pustaka harus mencakup sumber-sumber mutakhir (5 tahun terakhir) dan literatur klasik yang fundamental.
    
    STRUKTUR WAJIB:
    - Kata Pengantar: Mencerminkan kerangka pemikiran penulis.
    - Pendahuluan: Membangun urgensi masalah secara kuat.
    - Pembahasan: Inti makalah yang sangat kaya akan informasi dan analisis.
    - Penutup: Kesimpulan yang merangkum esensi analisis dan saran yang bersifat futuristik/strategis.
    - Daftar Pustaka: Minimal 20-30 sumber ilmiah berkualitas.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      preface: { type: Type.STRING, description: "Kata Pengantar formal yang sangat lengkap (minimal 4-5 paragraf)." },
      introduction: {
        type: Type.OBJECT,
        properties: {
          background: { type: Type.STRING, description: "Latar belakang masalah yang sangat luas, mendalam, dan sangat panjang (minimum 1500 kata untuk mode mendalam)." },
          problemFormulation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar minimal 6-8 rumusan masalah yang kompleks." },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Daftar minimal 6-8 tujuan penelitian yang selaras." },
        },
        required: ["background", "problemFormulation", "objectives"],
      },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Judul Bab Utama (Contoh: BAB II PEMBAHASAN)" },
            subChapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Judul sub-bab yang sangat spesifik dan teknis." },
                  content: { type: Type.STRING, description: "Isi materi yang SANGAT MASIF, detail, analitis, dan sangat panjang (minimal 15 paragraf per sub-bab dengan kedalaman teknis tinggi)." },
                },
                required: ["title", "content"],
              },
            },
          },
          required: ["title", "subChapters"],
        },
      },
      closing: {
        type: Type.OBJECT,
        properties: {
          conclusion: { type: Type.STRING, description: "Kesimpulan holistik yang merupakan hasil sintesis pemikiran (minimal 6 paragraf)." },
          suggestions: { type: Type.STRING, description: "Saran akademik, praktis, dan kebijakan yang sangat detail (minimal 4 paragraf)." },
        },
        required: ["conclusion", "suggestions"],
      },
      bibliography: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Daftar pustaka masif minimal 20-30 sumber ilmiah primer (jurnal, buku, laporan penelitian).",
      },
    },
    required: ["introduction", "chapters", "closing", "bibliography"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        thinkingConfig: { thinkingBudget: isDeep ? 32768 : 20000 }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Gagal menghasilkan konten makalah yang ekstensif. Mohon coba lagi dengan topik yang lebih spesifik agar AI dapat memberikan detail maksimal.");
  }
};
