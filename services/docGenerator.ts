
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  PageBreak
} from "docx";
import { PaperData } from "../types";

/**
 * Membersihkan karakter ilegal XML secara agresif.
 * Menghapus control characters yang sering menyebabkan file .docx korup (Error document.xml line 1).
 */
const cleanStr = (input: any): string => {
  if (input === null || input === undefined) return "";
  const str = String(input);
  // Hapus karakter kontrol (0x00-0x1F) kecuali tab, newline, carriage return.
  // Juga hapus karakter non-printable lainnya yang tidak didukung XML 1.0.
  return str.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, "");
};

const sanitizeFilename = (name: string): string => {
  const clean = name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  return clean || 'Makalah_Akademik';
};

/**
 * PageBreak HARUS berada di dalam Paragraph agar XML dokumen valid.
 */
const createPageBreak = () => new Paragraph({ children: [new PageBreak()] });

const createTextParagraphs = (text: string | undefined) => {
  if (!text) return [];
  return text.split('\n')
    .map(line => cleanStr(line.trim()))
    .filter(line => line.length > 0)
    .map(line => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, before: 120, after: 120 },
      children: [
        new TextRun({
          text: line,
          font: "Times New Roman",
          size: 24, // 12pt
        }),
      ],
    }));
};

export const downloadAsDocx = async (data: PaperData) => {
  const { input, content } = data;

  try {
    const children: Paragraph[] = [];

    // --- COVER ---
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "MAKALAH", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 800 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStr(input.title).toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Disusun Oleh:", font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStr(input.author), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({ spacing: { before: 2500 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStr(input.institution).toUpperCase(), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStr(input.subject), font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStr(input.academicYear), font: "Times New Roman", size: 24 })],
      }),
      createPageBreak()
    );

    // --- KATA PENGANTAR ---
    if (input.includePreface && content.preface) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "KATA PENGANTAR", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...createTextParagraphs(content.preface),
        createPageBreak()
      );
    }

    // --- BAB I ---
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "BAB I", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PENDAHULUAN", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ children: [new TextRun({ text: "1.1 Latar Belakang", bold: true, font: "Times New Roman", size: 24 })] }),
      ...createTextParagraphs(content.introduction.background),
      new Paragraph({ children: [new TextRun({ text: "1.2 Rumusan Masalah", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.problemFormulation || []).map((q, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${i+1}. ${cleanStr(q)}`, font: "Times New Roman", size: 24 })]
      })),
      new Paragraph({ children: [new TextRun({ text: "1.3 Tujuan", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.objectives || []).map((o, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${i+1}. ${cleanStr(o)}`, font: "Times New Roman", size: 24 })]
      })),
      createPageBreak()
    );

    // --- BAB II ---
    if (content.chapters) {
      content.chapters.forEach((chapter) => {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: cleanStr(chapter.title).toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
          })
        );
        chapter.subChapters.forEach((sub, sIdx) => {
          children.push(
            new Paragraph({ children: [new TextRun({ text: `2.${sIdx + 1} ${cleanStr(sub.title)}`, bold: true, font: "Times New Roman", size: 24 })] }),
            ...createTextParagraphs(sub.content)
          );
        });
        children.push(createPageBreak());
      });
    }

    // --- BAB III ---
    if (input.includeClosing && content.closing) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "BAB III", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "PENUTUP", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({ children: [new TextRun({ text: "3.1 Kesimpulan", bold: true, font: "Times New Roman", size: 24 })] }),
        ...createTextParagraphs(content.closing.conclusion),
        new Paragraph({ children: [new TextRun({ text: "3.2 Saran", bold: true, font: "Times New Roman", size: 24 })] }),
        ...createTextParagraphs(content.closing.suggestions)
      );
      if (input.includeBibliography) children.push(createPageBreak());
    }

    // --- DAFTAR PUSTAKA ---
    if (input.includeBibliography && content.bibliography) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DAFTAR PUSTAKA", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...(content.bibliography || []).map(item => new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: cleanStr(item), font: "Times New Roman", size: 24 })]
        }))
      );
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1701, right: 1701, bottom: 1701, left: 2268 } },
        },
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFilename(input.title)}.docx`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);
  } catch (err) {
    console.error(err);
    throw new Error("Gagal menyusun dokumen Word.");
  }
};
