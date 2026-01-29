
import { GoogleGenAI, Type } from "@google/genai";
import { PaperInput, PaperContent } from "../types";

export const generateAcademicPaper = async (input: PaperInput): Promise<PaperContent> => {
  // Selalu buat instance baru saat dipanggil agar menggunakan API_KEY terbaru dari dialog
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API key tidak ditemukan. Harap hubungkan API Key melalui tombol di atas form.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Mahasiswa atau mode 'deep' menggunakan Pro, SMP/SMA atau mode 'quick' menggunakan Flash
  const modelName = (input.educationLevel === 'Mahasiswa' || input.mode === 'deep') 
    ? 'gemini-3-pro-preview' 
    : 'gemini-3-flash-preview';
  
  const prompt = `Buatkan makalah akademik Bahasa Indonesia lengkap dalam format JSON murni.
Judul: ${input.title}
Penulis: ${input.author}
Institusi: ${input.institution}
Mata Kuliah: ${input.subject}
Tahun: ${input.academicYear}
Tingkat Pendidikan: ${input.educationLevel}
Gaya Bahasa: ${input.languageStyle}

PENTING:
- Gunakan Bahasa Indonesia formal akademik (PUEBI).
- Jika tingkat pendidikan Mahasiswa, berikan pembahasan yang sangat mendalam dan kritis.
- Struktur JSON harus memiliki:
  1. preface (Kata Pengantar)
  2. introduction (background, problemFormulation[], objectives[])
  3. chapters (Array of {title, subChapters: Array of {title, content}})
  4. closing (conclusion, suggestions)
  5. bibliography (Array of references)
- Jangan berikan teks pembuka/penutup selain JSON.`;

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
        // Alokasikan thinkingBudget lebih besar untuk kualitas akademik yang lebih tinggi
        thinkingConfig: { thinkingBudget: input.mode === 'deep' ? 20000 : 0 }
      },
    });

    const result = response.text;
    if (!result) throw new Error("Model tidak mengembalikan hasil teks.");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
