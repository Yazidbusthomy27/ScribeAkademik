
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
 * Pembersihan karakter ilegal untuk standar OOXML (Open Office XML).
 * Menghapus karakter kontrol non-ASCII yang sering merusak struktur file Word.
 */
const safeXmlStr = (input: any): string => {
  if (!input) return "";
  const str = String(input);
  // Filter karakter kontrol (00-1F) kecuali tab(09), LF(0A), CR(0D)
  // Dan hapus karakter di luar rentang valid XML 1.0
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g, "")
            .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]/g, "");
};

const sanitizeFile = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').substring(0, 40) || 'Makalah';
};

const makePageBreak = () => new Paragraph({ children: [new PageBreak()] });

const buildParagraphs = (text: string | undefined, isBold = false) => {
  if (!text) return [];
  return text.split('\n')
    .map(t => safeXmlStr(t.trim()))
    .filter(t => t.length > 0)
    .map(t => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360, before: 100, after: 100 },
      children: [
        new TextRun({
          text: t,
          font: "Times New Roman",
          size: 24,
          bold: isBold
        }),
      ],
    }));
};

export const downloadAsDocx = async (data: PaperData) => {
  const { input, content } = data;

  try {
    const nodes: Paragraph[] = [];

    // --- COVER ---
    nodes.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "MAKALAH", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.title).toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 1800 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Disusun Oleh:", font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.author), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.institution).toUpperCase(), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `${safeXmlStr(input.subject)} - ${safeXmlStr(input.academicYear)}`, font: "Times New Roman", size: 24 })],
      }),
      makePageBreak()
    );

    // --- KATA PENGANTAR ---
    if (input.includePreface && content.preface) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "KATA PENGANTAR", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...buildParagraphs(content.preface),
        makePageBreak()
      );
    }

    // --- BAB I ---
    nodes.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "BAB I: PENDAHULUAN", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ children: [new TextRun({ text: "1.1 Latar Belakang", bold: true, font: "Times New Roman", size: 24 })] }),
      ...buildParagraphs(content.introduction.background),
      new Paragraph({ children: [new TextRun({ text: "1.2 Rumusan Masalah", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.problemFormulation || []).map((q, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${i+1}. ${safeXmlStr(q)}`, font: "Times New Roman", size: 24 })]
      })),
      new Paragraph({ children: [new TextRun({ text: "1.3 Tujuan", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.objectives || []).map((o, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: `${i+1}. ${safeXmlStr(o)}`, font: "Times New Roman", size: 24 })]
      })),
      makePageBreak()
    );

    // --- BAB II ---
    if (content.chapters) {
      content.chapters.forEach((ch, idx) => {
        nodes.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `BAB II: ${safeXmlStr(ch.title).toUpperCase()}`, bold: true, size: 28, font: "Times New Roman" })],
          })
        );
        ch.subChapters?.forEach((sub, sIdx) => {
          nodes.push(
            new Paragraph({ children: [new TextRun({ text: `2.${sIdx + 1} ${safeXmlStr(sub.title)}`, bold: true, font: "Times New Roman", size: 24 })] }),
            ...buildParagraphs(sub.content)
          );
        });
        nodes.push(makePageBreak());
      });
    }

    // --- BAB III ---
    if (input.includeClosing && content.closing) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "BAB III: PENUTUP", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({ children: [new TextRun({ text: "3.1 Kesimpulan", bold: true, font: "Times New Roman", size: 24 })] }),
        ...buildParagraphs(content.closing.conclusion),
        new Paragraph({ children: [new TextRun({ text: "3.2 Saran", bold: true, font: "Times New Roman", size: 24 })] }),
        ...buildParagraphs(content.closing.suggestions)
      );
      if (input.includeBibliography) nodes.push(makePageBreak());
    }

    // --- DAFTAR PUSTAKA ---
    if (input.includeBibliography && content.bibliography) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DAFTAR PUSTAKA", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...(content.bibliography || []).map(item => new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [new TextRun({ text: safeXmlStr(item), font: "Times New Roman", size: 24 })]
        }))
      );
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1701, right: 1701, bottom: 1701, left: 2268 } },
        },
        children: nodes,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFile(input.title)}_ScribeAkademik.docx`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);
  } catch (err) {
    console.error("DOCX Error:", err);
    throw new Error("Gagal menyusun file Word.");
  }
};
