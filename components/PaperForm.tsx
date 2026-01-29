import React, { useState } from 'react';
import { PaperInput, EducationLevel, LanguageStyle } from '../types';

interface Props {
  onSubmit: (input: PaperInput) => void;
}

const PaperForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PaperInput>({
    title: '',
    author: '',
    institution: '',
    subject: '',
    lecturer: '',
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    estimatedPages: 10,
    educationLevel: EducationLevel.MAHASISWA,
    languageStyle: LanguageStyle.FORMAL,
    includePreface: true,
    includeClosing: true,
    includeBibliography: true,
    mode: 'quick',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      alert("Mohon lengkapi judul makalah dan nama penulis.");
      return;
    }
    onSubmit(formData);
  };

  const labelClass = "block text-sm font-bold text-slate-700 mb-2";
  const inputClass = "w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400";

  return (
    <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Informasi Utama</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className={labelClass}>Judul Makalah <span className="text-rose-500">*</span></label>
            <textarea
              name="title"
              value={formData.title}
              onChange={handleChange}
              rows={2}
              placeholder="Contoh: Analisis Yuridis Implementasi Kecerdasan Buatan dalam Sistem Peradilan Pidana Indonesia"
              className={`${inputClass} resize-none`}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Nama Penulis <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Nama Lengkap"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Institusi / Kampus / Sekolah</label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Nama Universitas atau Sekolah"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detail Akademik</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Mata Kuliah / Pelajaran</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Contoh: Pengantar Ilmu Hukum"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tahun Akademik</label>
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              placeholder="Contoh: 2023/2024"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tingkat Pendidikan</label>
            <div className="relative">
              <select
                name="educationLevel"
                value={formData.educationLevel}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10`}
              >
                {Object.values(EducationLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Gaya Bahasa</label>
            <div className="relative">
              <select
                name="languageStyle"
                value={formData.languageStyle}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10`}
              >
                {Object.values(LanguageStyle).map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                <i className="fas fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-1 bg-emerald-600 rounded-full"></div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Opsi Konfigurasi</h2>
        </div>
        <div className="bg-slate-50 p-6 sm:p-8 rounded-[2rem] border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { id: 'includePreface', label: 'Kata Pengantar' },
              { id: 'includeClosing', label: 'Bab Penutup' },
              { id: 'includeBibliography', label: 'Daftar Pustaka' }
            ].map(option => (
              <label key={option.id} className="relative flex items-center p-4 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors group">
                <input 
                  type="checkbox" 
                  name={option.id} 
                  checked={(formData as any)[option.id]} 
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-blue-600">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-white p-6 rounded-2xl border border-slate-200">
            <div className="w-full lg:w-auto">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Mode Penulisan AI</label>
              <div className="inline-flex p-1.5 bg-slate-100 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, mode: 'quick' }))}
                  className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.mode === 'quick' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Kilat
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, mode: 'deep' }))}
                  className={`flex-1 sm:flex-none px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.mode === 'deep' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Mendalam
                </button>
              </div>
            </div>
            
            <div className="w-full lg:w-auto text-center lg:text-right p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Potensi Kedalaman:</p>
              <p className="text-xl font-black text-blue-900">
                {formData.mode === 'deep' ? '≈ 1.500 - 2.500 Kata' : '≈ 600 - 1.000 Kata'}
              </p>
              <p className="text-[10px] text-blue-400 mt-1 italic">Estimasi {formData.mode === 'deep' ? '12-18' : '5-8'} Halaman A4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black py-6 rounded-[1.5rem] shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-4 text-xl tracking-tight"
        >
          <i className="fas fa-wand-magic-sparkles"></i>
          <span>Generate Makalah Sekarang</span>
        </button>
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          Ditenagai oleh Model Bahasa Gemini Generasi Terbaru. Orisinalitas terjamin.
        </p>
      </div>
    </form>
  );
};

export default PaperForm;