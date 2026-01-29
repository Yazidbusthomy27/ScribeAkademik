
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
    if (!formData.title || !formData.author) {
      alert("Mohon isi judul dan nama penulis.");
      return;
    }
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400";

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Section */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Makalah <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Contoh: Dampak Perubahan Iklim terhadap Ekosistem Pesisir"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Penulis <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Nama Lengkap Anda"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Institusi / Kampus / Sekolah</label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            placeholder="Nama Universitas atau Sekolah"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Kuliah / Pelajaran</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Contoh: Ilmu Pengetahuan Alam"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Dosen / Guru (Opsional)</label>
          <input
            type="text"
            name="lecturer"
            value={formData.lecturer}
            onChange={handleChange}
            placeholder="Nama Pembimbing"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat Pendidikan</label>
          <select
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
            className={`${inputClass} appearance-none`}
          >
            {Object.values(EducationLevel).map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Gaya Bahasa</label>
          <select
            name="languageStyle"
            value={formData.languageStyle}
            onChange={handleChange}
            className={`${inputClass} appearance-none`}
          >
            {Object.values(LanguageStyle).map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Opsi Makalah</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="includePreface" 
                checked={formData.includePreface} 
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Kata Pengantar</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="includeClosing" 
                checked={formData.includeClosing} 
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Penutup</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input 
                type="checkbox" 
                name="includeBibliography" 
                checked={formData.includeBibliography} 
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white"
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">Daftar Pustaka</span>
            </label>
          </div>
        </div>

        <div className="md:col-span-2 bg-blue-50 p-6 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-blue-900 mb-1">Mode Penulisan</label>
              <div className="flex p-1 bg-white rounded-lg border border-blue-100 w-full md:w-fit">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, mode: 'quick' }))}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.mode === 'quick' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  Cepat
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, mode: 'deep' }))}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.mode === 'deep' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-blue-600'}`}
                >
                  Mendalam
                </button>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-right">
              <p className="text-xs text-blue-700 mb-1 font-medium italic">Estimasi Makalah:</p>
              <p className="text-xl font-bold text-blue-900">
                {formData.mode === 'deep' ? '~15-20 Halaman' : '~5-8 Halaman'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3 text-lg"
        >
          <i className="fas fa-magic"></i>
          <span>Buat Makalah Sekarang</span>
        </button>
      </div>
    </form>
  );
};

export default PaperForm;
