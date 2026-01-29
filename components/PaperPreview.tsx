
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
      console.error(err);
      alert("Gagal mengunduh file DOCX. Silakan coba lagi. Pastikan koneksi internet stabil.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4 no-print">
        <button 
          onClick={onReset}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Buat Makalah Baru</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
          >
            <i className="fas fa-print"></i>
            <span>Cetak PDF</span>
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isDownloading ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                <span>Menyiapkan Dokumen...</span>
              </>
            ) : (
              <>
                <i className="fas fa-file-word"></i>
                <span>Download DOCX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Paper Container */}
      <div className="bg-white paper-shadow min-h-[11in] w-full p-[1in] font-serif-academic leading-[1.5] text-[#111] overflow-x-auto">
        
        {/* COVER */}
        <div className="text-center mb-[200px]">
          <h1 className="text-2xl font-bold mb-4">MAKALAH</h1>
          <h2 className="text-3xl font-bold mb-20 uppercase px-12">{input.title}</h2>
          
          <div className="mb-20">
            <p className="text-lg">Disusun Oleh:</p>
            <p className="text-xl font-bold uppercase">{input.author}</p>
          </div>

          <div className="mt-auto pt-[200px]">
            <p className="text-xl font-bold uppercase">{input.institution}</p>
            <p className="text-lg">{input.subject}</p>
            {input.lecturer && <p className="text-lg">Dosen Pengampu: {input.lecturer}</p>}
            <p className="text-lg mt-4">{input.academicYear}</p>
          </div>
        </div>

        {/* PREFACE */}
        {input.includePreface && content.preface && (
          <div className="page-break-before py-12">
            <h3 className="text-center text-xl font-bold mb-8 uppercase">KATA PENGANTAR</h3>
            <div className="text-justify whitespace-pre-wrap">{content.preface}</div>
          </div>
        )}

        {/* TABLE OF CONTENTS - MOCKED UI */}
        <div className="page-break-before py-12">
          <h3 className="text-center text-xl font-bold mb-8 uppercase">DAFTAR ISI</h3>
          <div className="space-y-2">
            {input.includePreface && <div className="flex justify-between border-b border-dotted border-gray-400"><span>KATA PENGANTAR</span><span>i</span></div>}
            <div className="flex justify-between border-b border-dotted border-gray-400"><span>DAFTAR ISI</span><span>ii</span></div>
            <div className="font-bold pt-4">BAB I PENDAHULUAN</div>
            <div className="pl-6 flex justify-between"><span>1.1 Latar Belakang</span><span>1</span></div>
            <div className="pl-6 flex justify-between"><span>1.2 Rumusan Masalah</span><span>3</span></div>
            <div className="pl-6 flex justify-between"><span>1.3 Tujuan</span><span>3</span></div>
            {content.chapters.map((ch, i) => (
              <React.Fragment key={i}>
                <div className="font-bold pt-4 uppercase">{ch.title}</div>
                {ch.subChapters.map((sub, j) => (
                   <div key={j} className="pl-6 flex justify-between"><span>2.{j+1} {sub.title}</span><span>{4 + j * 2}</span></div>
                ))}
              </React.Fragment>
            ))}
            <div className="font-bold pt-4">BAB III PENUTUP</div>
            <div className="pl-6 flex justify-between"><span>3.1 Kesimpulan</span><span>15</span></div>
            <div className="pl-6 flex justify-between"><span>3.2 Saran</span><span>16</span></div>
            {input.includeBibliography && <div className="flex justify-between pt-4 font-bold uppercase"><span>DAFTAR PUSTAKA</span><span>17</span></div>}
          </div>
        </div>

        {/* BAB I */}
        <div className="page-break-before py-12">
          <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB I</h3>
          <h3 className="text-center text-xl font-bold mb-8 uppercase">PENDAHULUAN</h3>
          
          <h4 className="font-bold text-lg mb-4">1.1 Latar Belakang</h4>
          <div className="text-justify whitespace-pre-wrap mb-8">{content.introduction.background}</div>

          <h4 className="font-bold text-lg mb-4">1.2 Rumusan Masalah</h4>
          <ul className="list-decimal pl-8 mb-8">
            {content.introduction.problemFormulation.map((p, i) => (
              <li key={i} className="mb-2">{p}</li>
            ))}
          </ul>

          <h4 className="font-bold text-lg mb-4">1.3 Tujuan</h4>
          <ul className="list-decimal pl-8">
            {content.introduction.objectives.map((p, i) => (
              <li key={i} className="mb-2">{p}</li>
            ))}
          </ul>
        </div>

        {/* CHAPTERS */}
        {content.chapters.map((chapter, idx) => (
          <div key={idx} className="page-break-before py-12">
             <h3 className="text-center text-xl font-bold mb-2 uppercase">{chapter.title.split(' ')[0]} {chapter.title.split(' ')[1]}</h3>
             <h3 className="text-center text-xl font-bold mb-8 uppercase">{chapter.title.split(' ').slice(2).join(' ')}</h3>
             {chapter.subChapters.map((sub, sIdx) => (
               <div key={sIdx} className="mb-10">
                 <h4 className="font-bold text-lg mb-4">2.{sIdx+1} {sub.title}</h4>
                 <div className="text-justify whitespace-pre-wrap">{sub.content}</div>
               </div>
             ))}
          </div>
        ))}

        {/* CLOSING */}
        {input.includeClosing && content.closing && (
          <div className="page-break-before py-12">
            <h3 className="text-center text-xl font-bold mb-2 uppercase">BAB III</h3>
            <h3 className="text-center text-xl font-bold mb-8 uppercase">PENUTUP</h3>
            
            <h4 className="font-bold text-lg mb-4">3.1 Kesimpulan</h4>
            <div className="text-justify whitespace-pre-wrap mb-8">{content.closing.conclusion}</div>

            <h4 className="font-bold text-lg mb-4">3.2 Saran</h4>
            <div className="text-justify whitespace-pre-wrap">{content.closing.suggestions}</div>
          </div>
        )}

        {/* BIBLIOGRAPHY */}
        {input.includeBibliography && content.bibliography && (
          <div className="page-break-before py-12">
            <h3 className="text-center text-xl font-bold mb-8 uppercase">DAFTAR PUSTAKA</h3>
            <ul className="space-y-4">
              {content.bibliography.map((item, i) => (
                <li key={i} className="text-justify pl-8 -indent-8">{item}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
      
      {/* Floating Buttons Mobile */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2 md:hidden no-print">
         <button 
           onClick={handleDownload}
           disabled={isDownloading}
           className={`bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center ${isDownloading ? 'opacity-50 animate-pulse' : ''}`}
         >
           <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-file-word'} text-xl`}></i>
         </button>
      </div>
    </div>
  );
};

export default PaperPreview;
