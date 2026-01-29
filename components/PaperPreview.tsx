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
        <button onClick={onReset} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
          <i className="fas fa-arrow-left"></i>
          <span>Buat Baru</span>
        </button>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-200 font-bold transition-all hover:-translate-y-0.5"
        >
          <i className={`fas ${isDownloading ? 'fa-spinner animate-spin' : 'fa-file-word'}`}></i>
          <span>{isDownloading ? 'Menyiapkan Makalah...' : 'Download File Word (.docx)'}</span>
        </button>
      </div>

      <div className="bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] min-h-[11in] w-full p-12 sm:p-24 font-serif-academic leading-[1.8] text-[#1a1a1a] overflow-x-auto rounded-3xl border border-slate-100">
        {/* COVER PAGE */}
        <div className="text-center flex flex-col min-h-[9in] justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-4 tracking-widest">MAKALAH</h1>
            <h2 className="text-3xl font-bold mb-20 uppercase tracking-tight leading-tight max-w-2xl mx-auto">{input.title}</h2>
          </div>
          
          <div className="mb-20">
            <p className="text-lg mb-4">Disusun Oleh:</p>
            <p className="text-2xl font-bold uppercase tracking-wide">{input.author}</p>
          </div>

          <div className="mt-auto">
            <p className="text-xl font-bold uppercase mb-2">{input.institution}</p>
            <p className="text-lg">{input.subject}</p>
            <p className="text-lg mt-4">{input.academicYear}</p>
          </div>
        </div>

        {/* KATA PENGANTAR */}
        {input.includePreface && content.preface && (
          <div className="py-24 border-t border-slate-100 mt-24">
            <h3 className="text-center text-xl font-bold mb-12 uppercase tracking-widest">KATA PENGANTAR</h3>
            <div className="text-justify whitespace-pre-wrap text-lg indent-12">{content.preface}</div>
          </div>
        )}

        {/* BAB I PENDAHULUAN */}
        <div className="py-24 border-t border-slate-100">
          <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB I</h3>
          <h3 className="text-center text-xl font-bold mb-12 uppercase tracking-widest">PENDAHULUAN</h3>
          
          <h4 className="font-bold text-lg mb-6">1.1 Latar Belakang</h4>
          <div className="text-justify whitespace-pre-wrap mb-10 text-lg indent-12">{content.introduction.background}</div>
          
          <h4 className="font-bold text-lg mb-6">1.2 Rumusan Masalah</h4>
          <ul className="list-decimal pl-12 mb-10 text-lg space-y-2">
            {content.introduction.problemFormulation.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          
          <h4 className="font-bold text-lg mb-6">1.3 Tujuan</h4>
          <ul className="list-decimal pl-12 mb-10 text-lg space-y-2">
            {content.introduction.objectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>

        {/* BAB II PEMBAHASAN */}
        <div className="py-24 border-t border-slate-100">
          <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB II</h3>
          <h3 className="text-center text-xl font-bold mb-12 uppercase tracking-widest">PEMBAHASAN</h3>
          
          {content.chapters.map((chapter, idx) => (
            <div key={idx} className="mb-12">
               {/* Menampilkan judul bab besar jika ada banyak bab */}
               {content.chapters.length > 1 && (
                 <h4 className="font-bold text-lg mb-6 underline">2.{idx+1} {chapter.title}</h4>
               )}
               {chapter.subChapters.map((sub, sIdx) => (
                 <div key={sIdx} className="mb-10">
                   <h4 className="font-bold text-lg mb-6">2.{idx+1}.{sIdx+1} {sub.title}</h4>
                   <div className="text-justify whitespace-pre-wrap text-lg indent-12">{sub.content}</div>
                 </div>
               ))}
            </div>
          ))}
        </div>

        {/* BAB III PENUTUP */}
        {input.includeClosing && content.closing && (
          <div className="py-24 border-t border-slate-100">
            <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB III</h3>
            <h3 className="text-center text-xl font-bold mb-12 uppercase tracking-widest">PENUTUP</h3>
            
            <h4 className="font-bold text-lg mb-6">3.1 Kesimpulan</h4>
            <div className="text-justify whitespace-pre-wrap mb-10 text-lg indent-12">{content.closing.conclusion}</div>
            
            <h4 className="font-bold text-lg mb-6">3.2 Saran</h4>
            <div className="text-justify whitespace-pre-wrap text-lg indent-12">{content.closing.suggestions}</div>
          </div>
        )}

        {/* DAFTAR PUSTAKA */}
        {input.includeBibliography && content.bibliography && (
          <div className="py-24 border-t border-slate-100">
            <h3 className="text-center text-xl font-bold mb-12 uppercase tracking-widest">DAFTAR PUSTAKA</h3>
            <ul className="space-y-6 text-lg">
              {content.bibliography.map((item, i) => (
                <li key={i} className="text-justify pl-12 -indent-12 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center no-print">
        <p className="text-slate-400 text-sm italic">Pratinjau di atas hanya simulasi tampilan akademik. Gunakan tombol download untuk mendapatkan format Word (.docx) yang sempurna.</p>
      </div>
    </div>
  );
};

export default PaperPreview;