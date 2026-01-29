
import React, { useState } from 'react';
import { PaperData } from '../types';
import { downloadAsDocx } from '../services/docGenerator';

interface Props {
  data: PaperData;
  onReset: () => void;
}

const PaperPreview: React.FC<Props> = ({ data, onReset }) => {
  const { input, content } = data;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadAsDocx(data);
    } catch (err) {
      alert("Gagal mengunduh file. Coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 no-print">
        <button onClick={onReset} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium">
          <i className="fas fa-arrow-left"></i>
          <span>Buat Baru</span>
        </button>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md font-medium"
        >
          <i className={`fas ${isDownloading ? 'fa-spinner animate-spin' : 'fa-file-word'}`}></i>
          <span>{isDownloading ? 'Menyiapkan...' : 'Download DOCX'}</span>
        </button>
      </div>

      <div className="bg-white paper-shadow min-h-[11in] w-full p-[1in] font-serif-academic leading-[1.5] text-[#111] overflow-x-auto">
        <div className="text-center mb-[200px]">
          <h1 className="text-2xl font-bold mb-4">MAKALAH</h1>
          <h2 className="text-3xl font-bold mb-20 uppercase">{input.title}</h2>
          <div className="mb-20">
            <p className="text-lg">Disusun Oleh:</p>
            <p className="text-xl font-bold uppercase">{input.author}</p>
          </div>
          <div className="mt-auto pt-[200px]">
            <p className="text-xl font-bold uppercase">{input.institution}</p>
            <p className="text-lg">{input.subject}</p>
            <p className="text-lg mt-4">{input.academicYear}</p>
          </div>
        </div>

        {input.includePreface && content.preface && (
          <div className="py-12 border-t border-gray-100">
            <h3 className="text-center text-xl font-bold mb-8 uppercase">KATA PENGANTAR</h3>
            <div className="text-justify whitespace-pre-wrap">{content.preface}</div>
          </div>
        )}

        <div className="py-12 border-t border-gray-100">
          <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB I</h3>
          <h3 className="text-center text-xl font-bold mb-8 uppercase">PENDAHULUAN</h3>
          <h4 className="font-bold text-lg mb-4">1.1 Latar Belakang</h4>
          <div className="text-justify whitespace-pre-wrap mb-8">{content.introduction.background}</div>
          <h4 className="font-bold text-lg mb-4">1.2 Rumusan Masalah</h4>
          <ul className="list-decimal pl-8 mb-8">
            {content.introduction.problemFormulation.map((p, i) => <li key={i} className="mb-2">{p}</li>)}
          </ul>
        </div>

        {content.chapters.map((chapter, idx) => (
          <div key={idx} className="py-12 border-t border-gray-100">
             <h3 className="text-center text-xl font-bold mb-8 uppercase">{chapter.title}</h3>
             {chapter.subChapters.map((sub, sIdx) => (
               <div key={sIdx} className="mb-10">
                 <h4 className="font-bold text-lg mb-4">2.{sIdx+1} {sub.title}</h4>
                 <div className="text-justify whitespace-pre-wrap">{sub.content}</div>
               </div>
             ))}
          </div>
        ))}

        {input.includeClosing && content.closing && (
          <div className="py-12 border-t border-gray-100">
            <h3 className="text-center text-xl font-bold mb-8 uppercase">PENUTUP</h3>
            <h4 className="font-bold text-lg mb-4">3.1 Kesimpulan</h4>
            <div className="text-justify whitespace-pre-wrap mb-8">{content.closing.conclusion}</div>
            <h4 className="font-bold text-lg mb-4">3.2 Saran</h4>
            <div className="text-justify whitespace-pre-wrap">{content.closing.suggestions}</div>
          </div>
        )}

        {input.includeBibliography && content.bibliography && (
          <div className="py-12 border-t border-gray-100">
            <h3 className="text-center text-xl font-bold mb-8 uppercase">DAFTAR PUSTAKA</h3>
            <ul className="space-y-4">
              {content.bibliography.map((item, i) => <li key={i} className="text-justify">{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperPreview;
