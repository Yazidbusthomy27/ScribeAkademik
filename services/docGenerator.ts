import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  PageBreak,
  HeadingLevel
} from "docx";
import { PaperData } from "../types";

/**
 * Pembersihan karakter ilegal untuk standar OOXML.
 */
const safeXmlStr = (input: any): string => {
  if (!input) return "";
  const str = String(input);
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g, "")
            .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD]/g, "");
};

const sanitizeFile = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50) || 'Makalah';
};

const makePageBreak = () => new Paragraph({ children: [new PageBreak()] });

// Spasi 1.5 dalam docx library adalah 360 (1 line = 240, 1.5 = 240 * 1.5)
const LINE_SPACING = 360;

const buildParagraphs = (text: string | undefined) => {
  if (!text) return [];
  return text.split('\n')
    .map(t => safeXmlStr(t.trim()))
    .filter(t => t.length > 0)
    .map(t => new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: LINE_SPACING, before: 120, after: 120 },
      indent: { firstLine: 450 }, // Indentasi paragraf pertama
      children: [
        new TextRun({
          text: t,
          font: "Times New Roman",
          size: 24, // 12pt
        }),
      ],
    }));
};

export const downloadAsDocx = async (data: PaperData) => {
  const { input, content } = data;

  try {
    const nodes: Paragraph[] = [];

    // --- COVER (Halaman 1) ---
    nodes.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "MAKALAH", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 1000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.title).toUpperCase(), bold: true, size: 32, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Disusun Oleh:", font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.author), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: safeXmlStr(input.institution).toUpperCase(), bold: true, font: "Times New Roman", size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `${safeXmlStr(input.subject)}`, font: "Times New Roman", size: 24 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `${safeXmlStr(input.academicYear)}`, font: "Times New Roman", size: 24 })],
      }),
      makePageBreak()
    );

    // --- KATA PENGANTAR ---
    if (input.includePreface && content.preface) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: "KATA PENGANTAR", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...buildParagraphs(content.preface),
        makePageBreak()
      );
    }

    // --- BAB I PENDAHULUAN ---
    nodes.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "BAB I", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "PENDAHULUAN", bold: true, size: 28, font: "Times New Roman" })],
      }),
      new Paragraph({ spacing: { line: LINE_SPACING }, children: [new TextRun({ text: "1.1 Latar Belakang", bold: true, font: "Times New Roman", size: 24 })] }),
      ...buildParagraphs(content.introduction.background),
      new Paragraph({ spacing: { line: LINE_SPACING, before: 200 }, children: [new TextRun({ text: "1.2 Rumusan Masalah", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.problemFormulation || []).map((q, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: LINE_SPACING, before: 100 },
        children: [new TextRun({ text: `${i+1}. ${safeXmlStr(q)}`, font: "Times New Roman", size: 24 })]
      })),
      new Paragraph({ spacing: { line: LINE_SPACING, before: 200 }, children: [new TextRun({ text: "1.3 Tujuan", bold: true, font: "Times New Roman", size: 24 })] }),
      ...(content.introduction.objectives || []).map((o, i) => new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: LINE_SPACING, before: 100 },
        children: [new TextRun({ text: `${i+1}. ${safeXmlStr(o)}`, font: "Times New Roman", size: 24 })]
      })),
      makePageBreak()
    );

    // --- BAB II PEMBAHASAN ---
    if (content.chapters && content.chapters.length > 0) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "BAB II", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "PEMBAHASAN", bold: true, size: 28, font: "Times New Roman" })],
        })
      );

      content.chapters.forEach((ch, idx) => {
        // Jika ada sub-bab, judul bab utama tidak perlu ditampilkan berulang jika sudah ada BAB II di atas
        // Namun kita tampilkan judul ch.title sebagai sub-judul utama jika BAB II
        nodes.push(
          new Paragraph({ 
            spacing: { line: LINE_SPACING, before: 200, after: 100 },
            children: [new TextRun({ text: `${2}.${idx+1} ${safeXmlStr(ch.title)}`, bold: true, font: "Times New Roman", size: 24 })] 
          })
        );
        ch.subChapters?.forEach((sub, sIdx) => {
          nodes.push(
            new Paragraph({ 
              spacing: { line: LINE_SPACING, before: 150, after: 80 },
              children: [new TextRun({ text: `${2}.${idx+1}.${sIdx + 1} ${safeXmlStr(sub.title)}`, bold: true, font: "Times New Roman", size: 24 })] 
            }),
            ...buildParagraphs(sub.content)
          );
        });
      });
      nodes.push(makePageBreak());
    }

    // --- BAB III PENUTUP ---
    if (input.includeClosing && content.closing) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "BAB III", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "PENUTUP", bold: true, size: 28, font: "Times New Roman" })],
        }),
        new Paragraph({ spacing: { line: LINE_SPACING }, children: [new TextRun({ text: "3.1 Kesimpulan", bold: true, font: "Times New Roman", size: 24 })] }),
        ...buildParagraphs(content.closing.conclusion),
        new Paragraph({ spacing: { line: LINE_SPACING, before: 200 }, children: [new TextRun({ text: "3.2 Saran", bold: true, font: "Times New Roman", size: 24 })] }),
        ...buildParagraphs(content.closing.suggestions),
        makePageBreak()
      );
    }

    // --- DAFTAR PUSTAKA ---
    if (input.includeBibliography && content.bibliography) {
      nodes.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [new TextRun({ text: "DAFTAR PUSTAKA", bold: true, size: 28, font: "Times New Roman" })],
        }),
        ...(content.bibliography || []).map(item => new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: LINE_SPACING, after: 120 },
          indent: { hanging: 450 }, // Hanging indent standar daftar pustaka
          children: [new TextRun({ text: safeXmlStr(item), font: "Times New Roman", size: 24 })]
        }))
      );
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: { 
            // Margin standar Indonesia: Left 4cm, Top 3cm, Right 3cm, Bottom 3cm
            // Twips: 1cm = 567 twips
            margin: { top: 1701, right: 1701, bottom: 1701, left: 2268 } 
          },
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
    throw new Error("Gagal menyusun file Word. Silakan coba lagi.");
  }
};