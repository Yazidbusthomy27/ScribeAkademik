
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
 * Pembersihan karakter ilegal XML secara total.
 * Word akan menolak file jika mengandung karakter kontrol atau karakter yang tidak dikenal XML 1.0.
 */
const cleanStringForDocx = (input: any): string => {
  if (input === null || input === undefined) return "";
  const str = String(input);
  // Regex ini menghapus semua karakter kontrol kecuali tab, newline, dan carriage return.
  // Dan membatasi karakter pada rentang yang aman bagi XML.
  return str.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, "");
};

const sanitizeFilename = (name: string): string => {
  const clean = name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  return clean || 'Makalah_Akademik';
};

/**
 * Fungsi pembantu untuk membuat Page Break yang valid.
 * PageBreak HARUS dibungkus dalam Paragraph agar XML valid.
 */
const createPageBreak = () => new Paragraph({ children: [new PageBreak()] });

/**
 * Membuat paragraf teks yang aman.
 */
const createTextParagraphs = (text: string | undefined, isBold: boolean = false) => {
  if (!text) return [];
  return text.split('\n')
    .map(line => cleanStringForDocx(line.trim()))
    .filter(line => line.length > 0)
    .map(line => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, before: 120, after: 120 },
      children: [
        new TextRun({
          text: line,
          font: "Times New Roman",
          size: 24, // 12pt
          bold: isBold
        }),
      ],
    }));
};

export const downloadAsDocx = async (data: PaperData) => {
  const { input, content } = data;

  try {
    const children: Paragraph[] = [];

    // --- COVER PAGE ---
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "MAKALAH", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 800 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStringForDocx(input.title).toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Disusun Oleh:", font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStringForDocx(input.author), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({ spacing: { before: 2500 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStringForDocx(input.institution).toUpperCase(), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStringForDocx(input.subject), font: "Times New Roman", size: 24 })],
      })
    );

    if (input.lecturer) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Dosen Pengampu: ${cleanStringForDocx(input.lecturer)}`, font: "Times New Roman", size: 24 })],
        })
      );
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: cleanStringForDocx(input.academicYear), font: "Times New Roman", size: 24 })],
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
        new Paragraph({ spacing: { before: 400 } }),
        ...createTextParagraphs(content.preface),
        createPageBreak()
      );
    }

    // --- BAB I PENDAHULUAN ---
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "BAB I", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "PENDAHULUAN", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ 
        children: [new TextRun({ text: "1.1 Latar Belakang", bold: true, font: "Times New Roman", size: 24 })]
      }),
      ...createTextParagraphs(content.introduction.background),
      new Paragraph({ 
        children: [new TextRun({ text: "1.2 Rumusan Masalah", bold: true, font: "Times New Roman", size: 24 })]
      }),
      ...(content.introduction.problemFormulation || []).map((q, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360 },
        children: [new TextRun({ text: `${i+1}. ${cleanStringForDocx(q)}`, font: "Times New Roman", size: 24 })]
      })),
      new Paragraph({ 
        children: [new TextRun({ text: "1.3 Tujuan", bold: true, font: "Times New Roman", size: 24 })]
      }),
      ...(content.introduction.objectives || []).map((o, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 360 },
        children: [new TextRun({ text: `${i+1}. ${cleanStringForDocx(o)}`, font: "Times New Roman", size: 24 })]
      })),
      createPageBreak()
    );

    // --- BAB II PEMBAHASAN ---
    if (content.chapters && content.chapters.length > 0) {
      content.chapters.forEach((chapter) => {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: cleanStringForDocx(chapter.title).toUpperCase(), bold: true, size: 28, font: "Times New Roman" })],
          }),
          new Paragraph({ spacing: { before: 400 } })
        );

        if (chapter.subChapters) {
          chapter.subChapters.forEach((sub, subIdx) => {
            children.push(
              new Paragraph({ 
                children: [new TextRun({ text: `2.${subIdx + 1} ${cleanStringForDocx(sub.title)}`, bold: true, font: "Times New Roman", size: 24 })]
              }),
              ...createTextParagraphs(sub.content)
            );
          });
        }
        children.push(createPageBreak());
      });
    }

    // --- BAB III PENUTUP ---
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
        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({ 
          children: [new TextRun({ text: "3.1 Kesimpulan", bold: true, font: "Times New Roman", size: 24 })]
        }),
        ...createTextParagraphs(content.closing.conclusion),
        new Paragraph({ 
          children: [new TextRun({ text: "3.2 Saran", bold: true, font: "Times New Roman", size: 24 })]
        }),
        ...createTextParagraphs(content.closing.suggestions)
      );
      if (input.includeBibliography && content.bibliography) {
        children.push(createPageBreak());
      }
    }

    // --- DAFTAR PUSTAKA ---
    if (input.includeBibliography && content.bibliography) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DAFTAR PUSTAKA", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({ spacing: { before: 400 } }),
        ...(content.bibliography || []).map(item => new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [new TextRun({ text: cleanStringForDocx(item), font: "Times New Roman", size: 24 })]
        }))
      );
    }

    // Buat Dokumen
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1701,    // 3cm
              right: 1701,  // 3cm
              bottom: 1701, // 3cm
              left: 2268,   // 4cm
            },
          },
        },
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = sanitizeFilename(input.title);
    link.download = `${safeTitle}_ScribeAkademik.docx`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);
    
  } catch (err) {
    console.error("Kesalahan Fatal DOCX Generator:", err);
    throw new Error("Gagal menyusun dokumen Word. Terjadi kesalahan pada proses pengemasan XML.");
  }
};
